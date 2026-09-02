import { getDb } from '../../db/connection';

export interface ItemRow {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description: string | null;
  qr_identifier: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LostReportRow {
  id: string;
  item_id: string;
  user_id: string;
  airport_id: string | null;
  location: string | null;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function insertItem(i: ItemRow) {
  getDb()
    .prepare(
      `INSERT INTO items (id, user_id, name, category, description, qr_identifier, status, created_at, updated_at)
       VALUES (@id, @user_id, @name, @category, @description, @qr_identifier, @status, @created_at, @updated_at)`
    )
    .run(i);
}

export function updateItem(id: string, patch: Partial<ItemRow>) {
  const db = getDb();
  const cur = db.prepare('SELECT * FROM items WHERE id = ?').get(id) as ItemRow | undefined;
  if (!cur) return;
  const merged = { ...cur, ...patch, updated_at: new Date().toISOString() };
  db.prepare(
    `UPDATE items SET name=@name, category=@category, description=@description, qr_identifier=@qr_identifier, status=@status, updated_at=@updated_at WHERE id=@id`
  ).run(merged);
}

export function findItemById(id: string): ItemRow | undefined {
  return getDb().prepare('SELECT * FROM items WHERE id = ?').get(id) as ItemRow | undefined;
}

export function findItemByIdentifier(identifier: string): ItemRow | undefined {
  return getDb().prepare('SELECT * FROM items WHERE qr_identifier = ?').get(identifier) as ItemRow | undefined;
}

export function itemsForUser(userId: string): ItemRow[] {
  return getDb().prepare('SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC').all(userId) as ItemRow[];
}

export function insertLostReport(r: LostReportRow) {
  getDb()
    .prepare(
      `INSERT INTO lost_reports (id, item_id, user_id, airport_id, location, description, status, created_at, updated_at)
       VALUES (@id, @item_id, @user_id, @airport_id, @location, @description, @status, @created_at, @updated_at)`
    )
    .run(r);
}

export function updateLostReport(itemId: string, patch: Partial<LostReportRow>) {
  const db = getDb();
  const cur = db.prepare('SELECT * FROM lost_reports WHERE item_id = ? ORDER BY created_at DESC LIMIT 1').get(itemId) as LostReportRow | undefined;
  if (!cur) return;
  const merged = { ...cur, ...patch, updated_at: new Date().toISOString() };
  db.prepare(
    `UPDATE lost_reports SET airport_id=@airport_id, location=@location, description=@description, status=@status, updated_at=@updated_at WHERE id=@id`
  ).run(merged);
}

export function lostReportForItem(itemId: string): LostReportRow | undefined {
  return getDb().prepare('SELECT * FROM lost_reports WHERE item_id = ? ORDER BY created_at DESC LIMIT 1').get(itemId) as LostReportRow | undefined;
}