import { findFlightById, findFlightByNumber } from './flight.repo';
import { notFound } from '../../utils/errors';
import { getDb } from '../../db/connection';

export function flightPublic(f: any) {
  return {
    id: f.id,
    flightNumber: f.flight_number,
    airline: f.airline,
    origin: f.origin,
    destination: f.destination,
    departureTime: f.departure_time,
    arrivalTime: f.arrival_time,
    terminal: f.terminal,
    gate: f.gate,
    status: f.status,
    isDemo: !!f.is_demo,
  };
}

export class FlightService {
  getById(id: string) {
    const f = findFlightById(id);
    if (!f) throw notFound('Flight not found');
    return flightPublic(f);
  }

  getByNumber(number: string) {
    const f = findFlightByNumber(number);
    if (!f) throw notFound('Flight not found');
    return flightPublic(f);
  }

  search(origin: string, destination: string, _date: string) {
    const db = getDb();
    // basic search
    const rows = db
      .prepare(
        `SELECT * FROM flights WHERE lower(origin) = lower(?) AND lower(destination) = lower(?) ORDER BY departure_time`
      )
      .all(origin, destination);
    return rows.map(flightPublic);
  }
}
