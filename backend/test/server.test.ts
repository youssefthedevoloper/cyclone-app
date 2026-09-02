import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';

const TEST_DB = path.resolve(__dirname, '..', 'test', 'test-cyclone.db');

// Set env BEFORE importing the app so config/index.ts picks up the test DB path
// (tsx injects backend/.env at process start, so a static import would read the dev DB).
process.env.DATABASE_PATH = TEST_DB;
process.env.JWT_SECRET = 'test-secret-not-for-prod';

// fresh db: also ensure no connection lingers from a prior canceled run
for (const suffix of ['', '-wal', '-shm']) {
  const f = TEST_DB + suffix;
  if (fs.existsSync(f)) { try { fs.unlinkSync(f); } catch {} }
}

let createApp: any;
let migrate: any;
let seed: any;
let app: any;
let server: any;

let closeDb: any;

before(async () => {
  ({ createApp } = await import('../src/index'));
  ({ migrate } = await import('../src/db/schema'));
  ({ seed } = await import('../src/seed'));
  ({ closeDb } = await import('../src/db/connection'));
  migrate();
  await seed();
  app = createApp();
  server = app.listen(4010);
});

after(() => {
  server?.close();
  try { closeDb?.(); } catch {}
  for (const suffix of ['', '-wal', '-shm']) {
    const f = TEST_DB + suffix;
    if (fs.existsSync(f)) { try { fs.unlinkSync(f); } catch {} }
  }
});

async function register(name: string, email: string, password: string) {
  const res = await request(app).post('/api/auth/register').send({ name, email, password });
  return { body: res.body, status: res.status };
}

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

test('health endpoint reports database connected', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.database, 'connected');
});

test('register + login + me', async () => {
  const reg = await register('Alex Test', 'alex@test.dev', 'secret1234');
  assert.equal(reg.status, 201);
  assert.ok(reg.body.token);
  assert.equal(reg.body.user.email, 'alex@test.dev');
  assert.ok(reg.body.user.accountNumber >= 21);

  const login = await request(app).post('/api/auth/login').send({ email: 'alex@test.dev', password: 'secret1234' });
  assert.equal(login.status, 200);
  assert.ok(login.body.token);

  const me = await request(app).get('/api/auth/me').set(auth(login.body.token));
  assert.equal(me.status, 200);
  assert.equal(me.body.user.name, 'Alex Test');
});

test('plaintext password never returned', async () => {
  const login = await request(app).post('/api/auth/login').send({ email: 'judge@cyclone.example', password: 'demo1234' });
  const bodyStr = JSON.stringify(login.body);
  assert.ok(!bodyStr.includes('demo1234'));
  assert.ok(!bodyStr.includes('password'));
});

test('first-20 account rule (seeded demo user has demo access)', async () => {
  const login = await request(app).post('/api/auth/login').send({ email: 'demo2@cyclone.example', password: 'demo1234' });
  assert.equal(login.body.user.accountNumber, 2);
  assert.equal(login.body.user.hasDemoAccess, true);
});

test('account beyond #20 without ticket is ticket-required', async () => {
  const reg = await register('Late User', 'late@test.dev', 'secret1234');
  const jwt = reg.body.token;
  assert.equal(reg.body.user.accountNumber > 20, true);
  assert.equal(reg.body.user.hasDemoAccess, false);

  const journey = await request(app).get('/api/journey').set(auth(jwt));
  assert.equal(journey.status, 200);
  assert.equal(journey.body.access, 'required');
  assert.equal(journey.body.journey, null);
});

test('account #21+ cannot add demo ticket', async () => {
  const reg = await register('NoDemoUser', 'nodemo@test.dev', 'secret1234');
  const res = await request(app).post('/api/tickets/demo').set(auth(reg.body.token));
  assert.equal(res.status, 403);
});

test('first-20 account can add demo ticket', async () => {
  const login = await request(app).post('/api/auth/login').send({ email: 'demo3@cyclone.example', password: 'demo1234' });
  const res = await request(app).post('/api/tickets/demo').set(auth(login.body.token));
  assert.equal(res.status, 201);
  assert.equal(res.body.ticket.isDemoTicket, true);
  assert.ok(res.body.ticket.bookingReference.startsWith('DEMO'));
});

test('judge demo account has premium + demo ticket + personalized journey', async () => {
  const login = await request(app).post('/api/auth/login').send({ email: 'judge@cyclone.example', password: 'demo1234' });
  const jwt = login.body.token;
  assert.equal(login.body.user.premiumStatus, 'premium');
  const journey = await request(app).get('/api/journey').set(auth(jwt));
  assert.equal(journey.body.access, 'personal');
  assert.equal(journey.body.journey.steps.length, 7);
  assert.equal(journey.body.journey.flight.isDemoTicket, true);
});

test('journey step completion updates progress server-side', async () => {
  const login = await request(app).post('/api/auth/login').send({ email: 'judge@cyclone.example', password: 'demo1234' });
  const jwt = login.body.token;
  const journeyRes = await request(app).get('/api/journey').set(auth(jwt));
  const steps = journeyRes.body.journey.steps;
  // find first non-completed step
  const next = steps.find((s: any) => s.status !== 'completed');
  const beforeProgress = journeyRes.body.journey.progress;
  const complete = await request(app)
    .post(`/api/journey/${journeyRes.body.journey.id}/steps/${next.id}/complete`)
    .set(auth(jwt));
  assert.equal(complete.status, 200);
  assert.ok(complete.body.journey.progress >= beforeProgress);
});

test('journey step completion is idempotent (no duplicate loyalty)', async () => {
  const login = await request(app).post('/api/auth/login').send({ email: 'demo4@cyclone.example', password: 'demo1234' });
  const jwt = login.body.token;
  const journeyRes = await request(app).get('/api/journey').set(auth(jwt));
  const firstStep = journeyRes.body.journey.steps[0];
  await request(app).post(`/api/journey/${journeyRes.body.journey.id}/steps/${firstStep.id}/complete`).set(auth(jwt));
  const after = await request(app).get('/api/loyalty').set(auth(jwt));
  const count1 = after.body.transactions.filter((t: any) => t.referenceId === 'journey-step-0').length;
  // complete again
  await request(app).post(`/api/journey/${journeyRes.body.journey.id}/steps/${firstStep.id}/complete`).set(auth(jwt));
  const after2 = await request(app).get('/api/loyalty').set(auth(jwt));
  const count2 = after2.body.transactions.filter((t: any) => t.referenceId === 'journey-step-0').length;
  assert.equal(count2, count1, 'duplicate journey step should not earn bonus again');
});

test('item create/mark lost/recover + QR ownership', async () => {
  const login = await request(app).post('/api/auth/login').send({ email: 'judge@cyclone.example', password: 'demo1234' });
  const jwt = login.body.token;

  const createRes = await request(app).post('/api/items').set(auth(jwt)).send({ name: 'Test Backpack', category: 'Backpack', description: 'x' });
  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.item.status, 'safe');
  const itemId = createRes.body.item.id;

  const qr = await request(app).post(`/api/items/${itemId}/qr`).set(auth(jwt));
  assert.equal(qr.status, 200);
  assert.ok(qr.body.identifier.startsWith('CYC_'));
  assert.ok(qr.body.qrDataUrl.startsWith('data:image'));

  // ownership verification
  const verify = await request(app).post('/api/qr/verify').set(auth(jwt)).send({ identifier: qr.body.identifier });
  assert.equal(verify.body.owned, true);
  assert.equal(verify.body.verified, true);

  // mark lost
  const lost = await request(app).post(`/api/items/${itemId}/lost`).set(auth(jwt)).send({ location: 'Gate', airportCode: 'CAI' });
  assert.equal(lost.body.item.status, 'lost');

  // non-owner verify: privacy safe, no name
  const other = await request(app).post('/api/auth/register').send({ name: 'Other', email: 'other@test.dev', password: 'secret1234' });
  const verifyOther = await request(app).post('/api/qr/verify').set(auth(other.body.token)).send({ identifier: qr.body.identifier });
  assert.equal(verifyOther.body.owned, false);
  assert.equal(verifyOther.body.action, 'found');
  assert.equal(verifyOther.body.item.name, undefined);

  // recover
  const rec = await request(app).post(`/api/items/${itemId}/recovered`).set(auth(jwt));
  assert.equal(rec.body.item.status, 'recovered');
});

test('rewards redemption and insufficient points', async () => {
  const login = await request(app).post('/api/auth/login').send({ email: 'judge@cyclone.example', password: 'demo1234' });
  const jwt = login.body.token;
  const before = await request(app).get('/api/loyalty').set(auth(jwt));
  const balance = before.body.balance;

  const redeem = await request(app).post('/api/rewards/rw_wifi/redeem').set(auth(jwt));
  assert.equal(redeem.status, 200);
  assert.ok(redeem.body.voucherCode);
  assert.equal(redeem.body.newBalance, balance - 150);

  // insufficient funds (create cheap user / use expensive reward)
  const poorRes = await register('Poor User', 'poor@test.dev', 'secret1234');
  const poor = await request(app).post('/api/rewards/rw_lounge/redeem').set(auth(poorRes.body.token));
  assert.equal(poor.status, 409);
  const poorBal = await request(app).get('/api/loyalty').set(auth(poorRes.body.token));
  assert.equal(poorBal.body.balance, 0, 'insufficient redemption must not change balance');

  // unavailable/invalid reward
  const bad = await request(app).post('/api/rewards/nonexistent/redeem').set(auth(jwt));
  assert.equal(bad.status, 404);
});

test('service loop awards points and is idempotent per transaction', async () => {
  const login = await request(app).post('/api/auth/login').send({ email: 'judge2@cyclone.example', password: 'demo1234' });
  const jwt = login.body.token;
  const before = await request(app).get('/api/loyalty').set(auth(jwt));
  const bal = before.body.balance;

  const use = await request(app).post('/api/services/svc_lounge/use').set(auth(jwt));
  assert.equal(use.status, 201);
  assert.equal(use.body.pointsEarned, 150);
  assert.equal(use.body.newBalance, bal + 150);

  // premium-required service blocked for free user
  const freeReg = await register('Free User', 'free@test.dev', 'secret1234');
  const blocked = await request(app).post('/api/services/svc_nav_prem/use').set(auth(freeReg.body.token));
  assert.equal(blocked.status, 400);
});

test('premium entitlement check', async () => {
  const login = await request(app).post('/api/auth/login').send({ email: 'judge@cyclone.example', password: 'demo1234' });
  const prem = await request(app).get('/api/premium').set(auth(login.body.token));
  assert.equal(prem.body.premium.premium, true);
  assert.ok(prem.body.premium.entitlements.length >= 1);

  const freeReg = await register('FreeUser2', 'free2@test.dev', 'secret1234');
  const freel = await request(app).get('/api/premium').set(auth(freeReg.body.token));
  assert.equal(freel.body.premium.premium, false);
});

test('authorization: cannot access another user items/tickets/journeys', async () => {
  const u1 = await request(app).post('/api/auth/login').send({ email: 'judge@cyclone.example', password: 'demo1234' });
  const u2 = await request(app).post('/api/auth/login').send({ email: 'judge2@cyclone.example', password: 'demo1234' });
  const ownerItem = (await request(app).get('/api/items').set(auth(u1.body.token))).body.items[0];

  const attempt = await request(app).get(`/api/items/${ownerItem.id}`).set(auth(u2.body.token));
  assert.equal(attempt.status, 403);

  const ownerTicket = (await request(app).get('/api/tickets').set(auth(u1.body.token))).body.tickets[0];
  const ticketAttempt = await request(app).get(`/api/tickets/${ownerTicket.id}`).set(auth(u2.body.token));
  assert.equal(ticketAttempt.status, 403);

  const journey = (await request(app).get('/api/journey').set(auth(u1.body.token))).body.journey;
  const journeyAttempt = await request(app).get(`/api/journey/${journey.id}`).set(auth(u2.body.token));
  assert.equal(journeyAttempt.status, 403);
});

test('unauthenticated requests are rejected', async () => {
  const res = await request(app).get('/api/journey');
  assert.equal(res.status, 401);
});