"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = migrate;
exports.countRows = countRows;
const connection_1 = require("./connection");
function migrate() {
    const db = (0, connection_1.getDb)();
    db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    account_number INTEGER NOT NULL UNIQUE,
    premium_status TEXT NOT NULL DEFAULT 'free',
    premium_expires_at TEXT,
    loyalty_points INTEGER NOT NULL DEFAULT 0,
    is_demo BOOLEAN NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS airports (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    terminals TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS airport_nodes (
    id TEXT PRIMARY KEY,
    airport_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    terminal TEXT,
    x REAL,
    y REAL,
    FOREIGN KEY (airport_id) REFERENCES airports(id)
  );

  CREATE TABLE IF NOT EXISTS airport_edges (
    id TEXT PRIMARY KEY,
    from_node_id TEXT NOT NULL,
    to_node_id TEXT NOT NULL,
    distance REAL NOT NULL,
    estimated_walking_time INTEGER NOT NULL,
    FOREIGN KEY (from_node_id) REFERENCES airport_nodes(id),
    FOREIGN KEY (to_node_id) REFERENCES airport_nodes(id)
  );

  CREATE TABLE IF NOT EXISTS flights (
    id TEXT PRIMARY KEY,
    flight_number TEXT NOT NULL UNIQUE,
    airline TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    terminal TEXT,
    gate TEXT,
    status TEXT NOT NULL DEFAULT 'Scheduled',
    is_demo BOOLEAN NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    flight_id TEXT,
    passenger_name TEXT NOT NULL,
    booking_reference TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    travel_date TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    terminal TEXT,
    gate TEXT,
    status TEXT NOT NULL DEFAULT 'Scheduled',
    verified BOOLEAN NOT NULL DEFAULT 0,
    is_demo BOOLEAN NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (flight_id) REFERENCES flights(id)
  );

  CREATE TABLE IF NOT EXISTS journeys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    ticket_id TEXT,
    airport_id TEXT NOT NULL,
    current_step INTEGER NOT NULL DEFAULT 0,
    progress REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress',
    is_demo BOOLEAN NOT NULL DEFAULT 0,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (airport_id) REFERENCES airports(id)
  );

  CREATE TABLE IF NOT EXISTS journey_steps (
    id TEXT PRIMARY KEY,
    journey_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    node_id TEXT,
    step_order INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming',
    estimated_duration INTEGER,
    instructions TEXT,
    completed_at TEXT,
    FOREIGN KEY (journey_id) REFERENCES journeys(id)
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    qr_identifier TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'safe',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS lost_reports (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    airport_id TEXT,
    location TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    reason TEXT NOT NULL,
    reference_id TEXT,
    unique_key TEXT UNIQUE,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS rewards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    points_cost INTEGER NOT NULL,
    available BOOLEAN NOT NULL DEFAULT 1,
    premium_only BOOLEAN NOT NULL DEFAULT 0,
    inventory INTEGER NOT NULL DEFAULT 999
  );

  CREATE TABLE IF NOT EXISTS reward_redemptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reward_id TEXT NOT NULL,
    points_spent INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'redeemed',
    voucher_code TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reward_id) REFERENCES rewards(id)
  );

  CREATE TABLE IF NOT EXISTS premium_entitlements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    feature TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT 1,
    expires_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL,
    points_reward INTEGER NOT NULL DEFAULT 0,
    premium_required BOOLEAN NOT NULL DEFAULT 0,
    available BOOLEAN NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS service_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    amount REAL,
    points_earned INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'confirmed',
    unique_key TEXT UNIQUE,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  `);
}
function countRows(table) {
    const db = (0, connection_1.getDb)();
    return db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c;
}
//# sourceMappingURL=schema.js.map