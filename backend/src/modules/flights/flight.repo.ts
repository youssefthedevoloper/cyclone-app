import { getDb } from '../../db/connection';

export interface FlightRow {
  id: string;
  flight_number: string;
  airline: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  terminal: string | null;
  gate: string | null;
  status: string;
  is_demo: number;
}

export function findFlightById(id: string): FlightRow | undefined {
  return getDb().prepare('SELECT * FROM flights WHERE id = ?').get(id) as FlightRow | undefined;
}

export function findFlightByNumber(number: string): FlightRow | undefined {
  return getDb().prepare('SELECT * FROM flights WHERE lower(flight_number) = lower(?)').get(number) as FlightRow | undefined;
}

export function insertFlight(f: FlightRow) {
  getDb()
    .prepare(
      `INSERT INTO flights (id, flight_number, airline, origin, destination, departure_time, arrival_time, terminal, gate, status, is_demo)
       VALUES (@id, @flight_number, @airline, @origin, @destination, @departure_time, @arrival_time, @terminal, @gate, @status, @is_demo)`
    )
    .run(f);
}
