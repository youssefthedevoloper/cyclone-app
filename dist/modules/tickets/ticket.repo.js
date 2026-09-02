"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTicket = insertTicket;
exports.ticketsForUser = ticketsForUser;
exports.findTicketById = findTicketById;
exports.deleteTicket = deleteTicket;
const connection_1 = require("../../db/connection");
function insertTicket(t) {
    (0, connection_1.getDb)()
        .prepare(`INSERT INTO tickets (id, user_id, flight_id, passenger_name, booking_reference, origin, destination, travel_date, departure_time, terminal, gate, status, verified, is_demo, created_at)
       VALUES (@id, @user_id, @flight_id, @passenger_name, @booking_reference, @origin, @destination, @travel_date, @departure_time, @terminal, @gate, @status, @verified, @is_demo, @created_at)`)
        .run(t);
}
function ticketsForUser(userId) {
    return (0, connection_1.getDb)().prepare('SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC').all(userId);
}
function findTicketById(id) {
    return (0, connection_1.getDb)().prepare('SELECT * FROM tickets WHERE id = ?').get(id);
}
function deleteTicket(id) {
    (0, connection_1.getDb)().prepare('DELETE FROM tickets WHERE id = ?').run(id);
}
//# sourceMappingURL=ticket.repo.js.map