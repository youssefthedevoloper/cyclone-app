"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJourneyAccess = getJourneyAccess;
exports.isPremium = isPremium;
const connection_1 = require("../../db/connection");
const config_1 = require("../../config");
const flight_repo_1 = require("../flights/flight.repo");
function getJourneyAccess(userId, accountNumber) {
    const db = (0, connection_1.getDb)();
    const ticketRow = db.prepare('SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId);
    const hasTicket = !!ticketRow;
    if (hasTicket) {
        let flight = null;
        if (ticketRow.flight_id) {
            flight = (0, flight_repo_1.findFlightById)(ticketRow.flight_id) || null;
        }
        else {
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
    const demoAccess = accountNumber <= config_1.config.first20Count;
    if (demoAccess) {
        // demo journey uses a seeded demo airport/flight
        const demoFlight = db.prepare('SELECT * FROM flights WHERE is_demo = 1 AND origin = ? ORDER BY departure_time LIMIT 1').get('CAI');
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
function findByRoute(origin, destination) {
    const db = (0, connection_1.getDb)();
    return (db
        .prepare('SELECT * FROM flights WHERE lower(origin) = lower(?) AND lower(destination) = lower(?) LIMIT 1')
        .get(origin, destination) || null);
}
function isPremium(user) {
    if (user.premiumStatus && user.premiumStatus !== 'free')
        return true;
    const db = (0, connection_1.getDb)();
    const ent = db
        .prepare(`SELECT COUNT(*) AS c FROM premium_entitlements WHERE user_id = ? AND active = 1 AND (expires_at IS NULL OR expires_at > ?)`)
        .get(user.id, new Date().toISOString());
    return !!ent.c && ent.c > 0;
}
//# sourceMappingURL=journey.access.js.map