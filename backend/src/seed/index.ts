import bcrypt from 'bcryptjs';
import { getDb } from '../db/connection';
import { migrate, countRows } from '../db/schema';
import { config, LOYALTY_RULES } from '../config';
import { genId, genSecureIdentifier } from '../utils/ids';
import { ALL_AIRPORTS, ALL_NODES, ALL_EDGES } from './airport.seed';
import { FLIGHTS } from './flight.seed';
import { REWARDS, SERVICES } from './rewards.seed';
import { logger } from '../utils/logger';
import { insertUser } from '../modules/users/user.repo';
import { insertFlight } from '../modules/flights/flight.repo';
import { getJourneyAccess } from '../modules/journey/journey.access';
import { JourneyService } from '../modules/journey/journey.service';
import { ItemService } from '../modules/items/item.service';
import { AuthService } from '../modules/auth/auth.service';
import { NotificationService } from '../modules/notifications/notification.service';
import { UserRow } from '../modules/users/user.types';
import { FlightRow } from '../modules/flights/flight.repo';
import { RewardRow } from '../modules/rewards/reward.service';
import { ServiceRow } from '../modules/services/airport-service.service';

async function seedAirports() {
  const db = getDb();
  const ip = db.prepare('INSERT OR IGNORE INTO airports (id, code, name, country, city, terminals) VALUES (?, ?, ?, ?, ?, ?)');
  const inNode = db.prepare('INSERT OR IGNORE INTO airport_nodes (id, airport_id, name, type, terminal, x, y) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const inEdge = db.prepare('INSERT OR IGNORE INTO airport_edges (id, from_node_id, to_node_id, distance, estimated_walking_time) VALUES (?, ?, ?, ?, ?)');
  for (const a of ALL_AIRPORTS) ip.run(a.id, a.code, a.name, a.country, a.city, a.terminals);
  for (const n of ALL_NODES) inNode.run(n.id, n.airport_id, n.name, n.type, n.terminal, n.x, n.y);
  for (const e of ALL_EDGES) inEdge.run(e.id, e.from_node_id, e.to_node_id, e.distance, e.estimated_walking_time);
  logger.info('Airports seeded', { airports: ALL_AIRPORTS.length, nodes: ALL_NODES.length, edges: ALL_EDGES.length });
}

function seedFlights() {
  const db = getDb();
  for (const f of FLIGHTS) {
    const existing = db.prepare('SELECT id FROM flights WHERE flight_number = ?').get(f.flight_number);
    if (!existing) insertFlight(f);
  }
  logger.info('Flights seeded', { count: FLIGHTS.length });
}

function seedRewardsAndServices() {
  const db = getDb();
  const ir = db.prepare(
    'INSERT OR IGNORE INTO rewards (id, title, description, category, points_cost, available, premium_only, inventory) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  for (const r of REWARDS) ir.run(r.id, r.title, r.description, r.category, r.points_cost, r.available ? 1 : 0, r.premium_only ? 1 : 0, r.inventory);
  const isv = db.prepare(
    'INSERT OR IGNORE INTO services (id, name, description, category, price, points_reward, premium_required, available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  for (const s of SERVICES) isv.run(s.id, s.name, s.description, s.category, s.price, s.points_reward, s.premium_required ? 1 : 0, s.available ? 1 : 0);
  logger.info('Rewards & services seeded', { rewards: REWARDS.length, services: SERVICES.length });
}

async function createUser({
  name, email, password, premium = false, points = 0, isDemo = false, itemName = null, demoTicket = false,
}: {
  name: string; email: string; password: string; premium?: boolean; points?: number; isDemo?: boolean; itemName?: string | null; demoTicket?: boolean;
}) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
  if (existing) return existing;
  const accountNumber = (db.prepare('SELECT COALESCE(MAX(account_number),0) AS m FROM users').get() as any).m + 1;
  const hash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const user: UserRow = {
    id: genId('usr'),
    name, email, password_hash: hash, account_number: accountNumber,
    premium_status: premium ? 'premium' : 'free',
    premium_expires_at: premium ? new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString() : null,
    loyalty_points: points,
    is_demo: isDemo ? 1 : 0,
    created_at: now, updated_at: now,
  };
  insertUser(user);

  if (premium) {
    db.prepare(
      'INSERT INTO premium_entitlements (id, user_id, feature, active, expires_at, created_at) VALUES (?, ?, ?, 1, ?, ?)'
    ).run(genId('ent'), user.id, 'Premium navigation', new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(), now);
    db.prepare(
      'INSERT INTO premium_entitlements (id, user_id, feature, active, expires_at, created_at) VALUES (?, ?, ?, 1, ?, ?)'
    ).run(genId('ent'), user.id, 'Priority assistance', new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(), now);
  }

  if (demoTicket) {
    const demo = new AuthService();
    // give a demo ticket to any user that opts in (used for judge/specific demo accounts)
    const db2 = getDb();
    const flight = db2.prepare("SELECT * FROM flights WHERE is_demo = 1 ORDER BY departure_time LIMIT 1").get() as FlightRow;
    if (flight) {
      db2.prepare(
        `INSERT INTO tickets (id, user_id, flight_id, passenger_name, booking_reference, origin, destination, travel_date, departure_time, terminal, gate, status, verified, is_demo, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(genId('tkt'), user.id, flight.id, user.name, `DEMO${String(accountNumber)}`, flight.origin, flight.destination,
        flight.departure_time.slice(0, 10), flight.departure_time, flight.terminal, flight.gate, flight.status, 0, 1, now);
    }
  }

  if (itemName) {
    const items = new ItemService();
    try {
      const created = await items.create(user.id, { name: itemName, category: 'Backpack', description: 'Registered demo item' });
      // re-grant points since item award already included
      void created;
    } catch (e) {
      logger.warn('Could not seed item', String(e));
    }
  }

  return user;
}

async function seedUsers() {
  const db = getDb();
  const first20 = config.first20Count;
  // Seed first 20 accounts with demo access but minimal data
  for (let i = 1; i <= first20; i++) {
    await createUser({
      name: `Demo Traveler ${i}`,
      email: `demo${i}@cyclone.example`,
      password: 'demo1234',
      points: i === 1 ? 1200 : 0,
      premium: i === 1,
      isDemo: true,
      itemName: i === 1 ? 'Black Backpack' : null,
      demoTicket: i === 1,
    });
  }
  // Judge accounts (premium, demo ticket, item, points)
  await createUser({ name: 'Sarah Traveler', email: 'judge@cyclone.example', password: 'demo1234', premium: true, points: 1450, isDemo: true, itemName: 'Black Backpack', demoTicket: true });
  await createUser({ name: 'Omar Hassan', email: 'judge2@cyclone.example', password: 'demo1234', premium: true, points: 950, isDemo: true, itemName: 'Navy Suitcase', demoTicket: true });
  logger.info('Users seeded');
}

async function seedJourneysAndData() {
  const db = getDb();
  const svc = new JourneyService();
  const nsvc = new NotificationService();
  const demoUsers = db.prepare('SELECT * FROM users WHERE is_demo = 1').all() as UserRow[];
  for (const u of demoUsers) {
    try {
      svc.getJourney(u.id, u.account_number);
      // mark a couple of steps complete for realism in the primary judge account
      if (u.email === 'judge@cyclone.example') {
        const journey = db.prepare('SELECT * FROM journeys WHERE user_id = ? ORDER BY started_at DESC LIMIT 1').get(u.id) as any;
        if (journey) {
          const steps = db.prepare('SELECT * FROM journey_steps WHERE journey_id = ? ORDER BY step_order').all(journey.id) as any[];
          if (steps[0]) svc.completeStep(u.id, journey.id, steps[0].id);
          if (steps[1]) svc.completeStep(u.id, journey.id, steps[1].id);
        }
      }
    } catch (e) {
      logger.warn('Could not seed journey', String(e));
    }
  }
  // notifications
  const judge = db.prepare('SELECT id FROM users WHERE email = ?').get('judge@cyclone.example') as any;
  if (judge) {
    nsvc.create(judge.id, 'Your gate has changed', 'Flight EK30 is now boarding at Gate A14.', 'flight');
    nsvc.create(judge.id, 'Boarding begins soon', 'Boarding for flight EK30 begins at 18:15.', 'flight');
    nsvc.create(judge.id, 'Cyclone Points earned', 'You earned +100 Cyclone Points for completing a Journey step.', 'loyalty');
  }
  logger.info('Journeys and demo data seeded');
}

export async function seed() {
  migrate();
  if (countRows('users') > 0 && countRows('users') < config.first20Count + 8) {
    logger.info('Database partially seeded - top-up seeding');
  }
  seedFlights();
  seedAirports();
  seedRewardsAndServices();
  await seedUsers();
  await seedJourneysAndData();
  logger.info('Seed complete');
}

if (require.main === module) {
  seed()
    .then(() => {
      logger.info('Seeding finished');
      process.exit(0);
    })
    .catch((e) => {
      logger.error('Seeding failed', String(e));
      process.exit(1);
    });
}