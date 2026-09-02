"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightService = void 0;
exports.flightPublic = flightPublic;
const flight_repo_1 = require("./flight.repo");
const errors_1 = require("../../utils/errors");
const connection_1 = require("../../db/connection");
function flightPublic(f) {
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
class FlightService {
    getById(id) {
        const f = (0, flight_repo_1.findFlightById)(id);
        if (!f)
            throw (0, errors_1.notFound)('Flight not found');
        return flightPublic(f);
    }
    getByNumber(number) {
        const f = (0, flight_repo_1.findFlightByNumber)(number);
        if (!f)
            throw (0, errors_1.notFound)('Flight not found');
        return flightPublic(f);
    }
    search(origin, destination, _date) {
        const db = (0, connection_1.getDb)();
        // basic search
        const rows = db
            .prepare(`SELECT * FROM flights WHERE lower(origin) = lower(?) AND lower(destination) = lower(?) ORDER BY departure_time`)
            .all(origin, destination);
        return rows.map(flightPublic);
    }
}
exports.FlightService = FlightService;
//# sourceMappingURL=flight.service.js.map