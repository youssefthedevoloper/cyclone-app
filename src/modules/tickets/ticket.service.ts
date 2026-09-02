import { getDb } from '../../db/connection';
import { genId, genBookingReference } from '../../utils/ids';
import { badRequest, conflict, notFound, forbidden } from '../../utils/errors';
import { logger } from '../../utils/logger';
import {
  insertTicket,
  ticketsForUser,
  findTicketById,
  deleteTicket,
  TicketRow,
} from './ticket.repo';
import { findFlightByNumber } from '../flights/flight.repo';
import { config } from '../../config';

export class TicketService {
  list(userId: string) {
    return ticketsForUser(userId).map(ticketPublic);
  }

  get(userId: string, ticketId: string) {
    const t = findTicketById(ticketId);
    if (!t) throw notFound('Ticket not found');
    if (t.user_id !== userId) throw forbidden('You do not own this ticket');
    return ticketPublic(t);
  }

  add({ userId, passengerName, bookingReference, flightNumber, origin, destination, travelDate, departureTime, terminal, gate }: any) {
    if (!passengerName || !bookingReference) {
      throw badRequest('Passenger name and booking reference are required');
    }
    if (!flightNumber && (!origin || !destination)) {
      throw badRequest('Flight number or origin/destination is required');
    }
    const db = getDb();
    let flightId: string | null = null;
    let resolvedOrigin = origin;
    let resolvedDest = destination;
    let resolvedDeparture = departureTime;
    let resolvedTerminal = terminal || '2';
    let resolvedGate = gate || null;
    let status = 'Scheduled';
    let flight = null;

    if (flightNumber) {
      flight = findFlightByNumber(flightNumber);
      if (flight) {
        flightId = flight.id;
        resolvedOrigin = flight.origin;
        resolvedDest = flight.destination;
        resolvedTerminal = flight.terminal || resolvedTerminal;
        resolvedGate = flight.gate;
        status = flight.status;
        resolvedDeparture = resolvedDeparture || flight.departure_time;
      }
    }
    if (!resolvedOrigin || !resolvedDest) throw badRequest('Flight not found. Provide origin and destination.');
    if (!resolvedDeparture) resolvedDeparture = travelDate ? `${travelDate}T23:59:59.000Z` : new Date().toISOString();

    const ticket: TicketRow = {
      id: genId('tkt'),
      user_id: userId,
      flight_id: flightId,
      passenger_name: passengerName,
      booking_reference: bookingReference,
      origin: resolvedOrigin,
      destination: resolvedDest,
      travel_date: travelDate || resolvedDeparture.slice(0, 10),
      departure_time: resolvedDeparture,
      terminal: resolvedTerminal,
      gate: resolvedGate,
      status,
      verified: 1,
      is_demo: 0,
      created_at: new Date().toISOString(),
    };
    insertTicket(ticket);
    // Flight status notification for the new ticket
    db.prepare(
      `INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)`
    ).run(genId('ntf'), userId, 'Ticket added', `Your ticket ${bookingReference} has been added to your journey.`, 'ticket', new Date().toISOString());
    return ticketPublic(ticket);
  }

  addDemo(userId: string, accountNumber: number) {
    const db = getDb();
    const demoFlights = db.prepare(`SELECT * FROM flights WHERE is_demo = 1 ORDER BY departure_time`).all() as any[];
    if (!demoFlights.length) throw notFound('No demo flights available');
    const flight = demoFlights[0];
    const existing = db.prepare('SELECT * FROM tickets WHERE user_id = ? AND is_demo = 1').get(userId) as TicketRow | undefined;
    if (existing) return ticketPublic(existing);
    const passenger = (db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any).name;
    const ticket: TicketRow = {
      id: genId('tkt'),
      user_id: userId,
      flight_id: flight.id,
      passenger_name: passenger,
      booking_reference: `DEMO${accountNumber}`.padEnd(6, '0'),
      origin: flight.origin,
      destination: flight.destination,
      travel_date: flight.departure_time.slice(0, 10),
      departure_time: flight.departure_time,
      terminal: flight.terminal,
      gate: flight.gate,
      status: flight.status,
      verified: 0,
      is_demo: 1,
      created_at: new Date().toISOString(),
    };
    insertTicket(ticket);
    return ticketPublic(ticket);
  }

  remove(userId: string, ticketId: string) {
    const t = findTicketById(ticketId);
    if (!t) throw notFound('Ticket not found');
    if (t.user_id !== userId) throw forbidden('You do not own this ticket');
    deleteTicket(ticketId);
    return { success: true };
  }

  canAddDemo(userId: string, accountNumber: number): boolean {
    const db = getDb();
    const isJudge = db.prepare('SELECT is_demo FROM users WHERE id = ?').get(userId) as any;
    return accountNumber <= config.first20Count || !!isJudge?.is_demo;
  }
}

export function ticketPublic(t: TicketRow) {
  return {
    id: t.id,
    passengerName: t.passenger_name,
    bookingReference: t.booking_reference,
    origin: t.origin,
    destination: t.destination,
    travelDate: t.travel_date,
    departureTime: t.departure_time,
    terminal: t.terminal,
    gate: t.gate,
    status: t.status,
    verified: !!t.verified,
    isDemo: !!t.is_demo,
    isDemoTicket: t.is_demo === 1,
    createdAt: t.created_at,
  };
}