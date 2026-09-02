import { getDb } from '../../db/connection';

export interface TicketRow {
  id: string;
  user_id: string;
  flight_id: string | null;
  passenger_name: string;
  booking_reference: string;
  origin: string;
  destination: string;
  travel_date: string;
  departure_time: string;
  terminal: string | null;
  gate: string | null;
  status: string;
  verified: number;
  is_demo: number;
  created_at: string;
}

export function insertTicket(t: TicketRow) {
  getDb()
    .prepare(
      `INSERT INTO tickets (id, user_id, flight_id, passenger_name, booking_reference, origin, destination, travel_date, departure_time, terminal, gate, status, verified, is_demo, created_at)
       VALUES (@id, @user_id, @flight_id, @passenger_name, @booking_reference, @origin, @destination, @travel_date, @departure_time, @terminal, @gate, @status, @verified, @is_demo, @created_at)`
    )
    .run(t);
}

export function ticketsForUser(userId: string): TicketRow[] {
  return getDb().prepare('SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC').all(userId) as TicketRow[];
}

export function findTicketById(id: string): TicketRow | undefined {
  return getDb().prepare('SELECT * FROM tickets WHERE id = ?').get(id) as TicketRow | undefined;
}

export function deleteTicket(id: string) {
  getDb().prepare('DELETE FROM tickets WHERE id = ?').run(id);
}