import { getDb } from '../../db/connection';
import { config } from '../../config';
import { FlightRow, findFlightByNumber, findFlightById } from '../flights/flight.repo';

export type JourneyAccessType = 'personal' | 'demo' | 'required';

export interface JourneyAccess {
  type: JourneyAccessType;
  reason: string;
  accountNumber: number;
  hasTicket: boolean;
  ticket: any | null;
  flight: FlightRow | null;
  airportCode: string;
}

export function getJourneyAccess(userId: string, accountNumber: number): JourneyAccess {
  const db = getDb();
  const ticketRow = db.prepare('SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId) as any;
  const hasTicket = !!ticketRow;

  if (hasTicket) {
    let flight: FlightRow | null = null;
    if (ticketRow.flight_id) {
      flight = findFlightById(ticketRow.flight_id) || null;
    } else {
      flight = findByRoute(ticketRow.origin, ticketRow.destination) || null;
    }
    return {
      type: 'personal',
      reason: 'Personal journey unlocked by ticket',
      accountNumber,
      hasTicket: true,
      ticket: ticketRow,
      flight,
      airportCode: ticketRow.origin,
    };
  }

  const demoAccess = accountNumber <= config.first20Count;
  if (demoAccess) {
    // demo journey uses a seeded demo airport/flight
    const demoFlight = db.prepare('SELECT * FROM flights WHERE is_demo = 1 AND origin = ? ORDER BY departure_time LIMIT 1').get('CAI') as FlightRow | undefined;
    const demoAirport = 'CAI';
    return {
      type: 'demo',
      reason: 'Demo journey available for early accounts',
      accountNumber,
      hasTicket: false,
      ticket: null,
      flight: demoFlight || null,
      airportCode: demoAirport,
    };
  }

  return {
    type: 'required',
    reason: 'Add your travel ticket to unlock your personalized Journey.',
    accountNumber,
    hasTicket: false,
    ticket: null,
    flight: null,
    airportCode: 'CAI',
  };
}

function findByRoute(origin: string, destination: string): FlightRow | null {
  const db = getDb();
  return (
    (db
      .prepare('SELECT * FROM flights WHERE lower(origin) = lower(?) AND lower(destination) = lower(?) LIMIT 1')
      .get(origin, destination) as FlightRow) || null
  );
}

export function isPremium(user: any): boolean {
  if (user.premiumStatus && user.premiumStatus !== 'free') return true;
  const db = getDb();
  const ent = db
    .prepare(
      `SELECT COUNT(*) AS c FROM premium_entitlements WHERE user_id = ? AND active = 1 AND (expires_at IS NULL OR expires_at > ?)`
    )
    .get(user.id, new Date().toISOString()) as any;
  return !!ent.c && ent.c > 0;
}