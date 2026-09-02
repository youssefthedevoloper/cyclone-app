"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
exports.ticketPublic = ticketPublic;
const connection_1 = require("../../db/connection");
const ids_1 = require("../../utils/ids");
const errors_1 = require("../../utils/errors");
const ticket_repo_1 = require("./ticket.repo");
const flight_repo_1 = require("../flights/flight.repo");
const config_1 = require("../../config");
class TicketService {
    list(userId) {
        return (0, ticket_repo_1.ticketsForUser)(userId).map(ticketPublic);
    }
    get(userId, ticketId) {
        const t = (0, ticket_repo_1.findTicketById)(ticketId);
        if (!t)
            throw (0, errors_1.notFound)('Ticket not found');
        if (t.user_id !== userId)
            throw (0, errors_1.forbidden)('You do not own this ticket');
        return ticketPublic(t);
    }
    add({ userId, passengerName, bookingReference, flightNumber, origin, destination, travelDate, departureTime, terminal, gate }) {
        if (!passengerName || !bookingReference) {
            throw (0, errors_1.badRequest)('Passenger name and booking reference are required');
        }
        if (!flightNumber && (!origin || !destination)) {
            throw (0, errors_1.badRequest)('Flight number or origin/destination is required');
        }
        const db = (0, connection_1.getDb)();
        let flightId = null;
        let resolvedOrigin = origin;
        let resolvedDest = destination;
        let resolvedDeparture = departureTime;
        let resolvedTerminal = terminal || '2';
        let resolvedGate = gate || null;
        let status = 'Scheduled';
        let flight = null;
        if (flightNumber) {
            flight = (0, flight_repo_1.findFlightByNumber)(flightNumber);
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
        if (!resolvedOrigin || !resolvedDest)
            throw (0, errors_1.badRequest)('Flight not found. Provide origin and destination.');
        if (!resolvedDeparture)
            resolvedDeparture = travelDate ? `${travelDate}T23:59:59.000Z` : new Date().toISOString();
        const ticket = {
            id: (0, ids_1.genId)('tkt'),
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
        (0, ticket_repo_1.insertTicket)(ticket);
        // Flight status notification for the new ticket
        db.prepare(`INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)`).run((0, ids_1.genId)('ntf'), userId, 'Ticket added', `Your ticket ${bookingReference} has been added to your journey.`, 'ticket', new Date().toISOString());
        return ticketPublic(ticket);
    }
    addDemo(userId, accountNumber) {
        const db = (0, connection_1.getDb)();
        const demoFlights = db.prepare(`SELECT * FROM flights WHERE is_demo = 1 ORDER BY departure_time`).all();
        if (!demoFlights.length)
            throw (0, errors_1.notFound)('No demo flights available');
        const flight = demoFlights[0];
        const existing = db.prepare('SELECT * FROM tickets WHERE user_id = ? AND is_demo = 1').get(userId);
        if (existing)
            return ticketPublic(existing);
        const passenger = db.prepare('SELECT * FROM users WHERE id = ?').get(userId).name;
        const ticket = {
            id: (0, ids_1.genId)('tkt'),
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
        (0, ticket_repo_1.insertTicket)(ticket);
        return ticketPublic(ticket);
    }
    remove(userId, ticketId) {
        const t = (0, ticket_repo_1.findTicketById)(ticketId);
        if (!t)
            throw (0, errors_1.notFound)('Ticket not found');
        if (t.user_id !== userId)
            throw (0, errors_1.forbidden)('You do not own this ticket');
        (0, ticket_repo_1.deleteTicket)(ticketId);
        return { success: true };
    }
    canAddDemo(userId, accountNumber) {
        const db = (0, connection_1.getDb)();
        const isJudge = db.prepare('SELECT is_demo FROM users WHERE id = ?').get(userId);
        return accountNumber <= config_1.config.first20Count || !!isJudge?.is_demo;
    }
}
exports.TicketService = TicketService;
function ticketPublic(t) {
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
//# sourceMappingURL=ticket.service.js.map