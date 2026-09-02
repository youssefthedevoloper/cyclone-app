"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFlightById = findFlightById;
exports.findFlightByNumber = findFlightByNumber;
exports.insertFlight = insertFlight;
const connection_1 = require("../../db/connection");
function findFlightById(id) {
    return (0, connection_1.getDb)().prepare('SELECT * FROM flights WHERE id = ?').get(id);
}
function findFlightByNumber(number) {
    return (0, connection_1.getDb)().prepare('SELECT * FROM flights WHERE lower(flight_number) = lower(?)').get(number);
}
function insertFlight(f) {
    (0, connection_1.getDb)()
        .prepare(`INSERT INTO flights (id, flight_number, airline, origin, destination, departure_time, arrival_time, terminal, gate, status, is_demo)
       VALUES (@id, @flight_number, @airline, @origin, @destination, @departure_time, @arrival_time, @terminal, @gate, @status, @is_demo)`)
        .run(f);
}
//# sourceMappingURL=flight.repo.js.map