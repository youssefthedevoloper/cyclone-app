import { getDb } from '../../db/connection';
import { UserRow } from './user.types';

export function fetchUserById(id: string): UserRow | undefined {
  return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
}

export function fetchUserByEmail(email: string): UserRow | undefined {
  return getDb().prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(email) as UserRow | undefined;
}

export function nextAccountNumber(): number {
  const db = getDb();
  const row = db.prepare('SELECT COALESCE(MAX(account_number), 0) AS m FROM users').get() as any;
  return row.m + 1;
}

export function insertUser(u: UserRow) {
  getDb()
    .prepare(
      `INSERT INTO users (id, name, email, password_hash, account_number, premium_status, premium_expires_at, loyalty_points, is_demo, created_at, updated_at)
       VALUES (@id, @name, @email, @password_hash, @account_number, @premium_status, @premium_expires_at, @loyalty_points, @is_demo, @created_at, @updated_at)`
    )
    .run(u);
}

export function updateUser(id: string, patch: Partial<UserRow>) {
  const db = getDb();
  const current = fetchUserById(id);
  if (!current) return;
  const merged = { ...current, ...patch, updated_at: new Date().toISOString() };
  db.prepare(
    `UPDATE users SET name=@name, email=@email, password_hash=@password_hash, premium_status=@premium_status,
     premium_expires_at=@premium_expires_at, loyalty_points=@loyalty_points, is_demo=@is_demo, updated_at=@updated_at WHERE id=@id`
  ).run(merged);
}

export function setLoyaltyPoints(id: string, points: number) {
  getDb()
    .prepare('UPDATE users SET loyalty_points = ?, updated_at = ? WHERE id = ?')
    .run(points, new Date().toISOString(), id);
}

export function setPremium(id: string, status: string, expiresAt: string | null = null) {
  getDb()
    .prepare('UPDATE users SET premium_status = ?, premium_expires_at = ?, updated_at = ? WHERE id = ?')
    .run(status, expiresAt, new Date().toISOString(), id);
}
