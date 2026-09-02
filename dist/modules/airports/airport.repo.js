"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAirports = listAirports;
exports.findAirportByCode = findAirportByCode;
exports.findAirportById = findAirportById;
exports.nodesForAirport = nodesForAirport;
exports.edgesForAirport = edgesForAirport;
exports.nodesByType = nodesByType;
const connection_1 = require("../../db/connection");
function listAirports() {
    return (0, connection_1.getDb)().prepare('SELECT * FROM airports ORDER BY code').all();
}
function findAirportByCode(code) {
    return (0, connection_1.getDb)().prepare('SELECT * FROM airports WHERE lower(code) = lower(?)').get(code);
}
function findAirportById(id) {
    return (0, connection_1.getDb)().prepare('SELECT * FROM airports WHERE id = ?').get(id);
}
function nodesForAirport(airportId) {
    return (0, connection_1.getDb)().prepare('SELECT * FROM airport_nodes WHERE airport_id = ?').all(airportId);
}
function edgesForAirport(airportId) {
    const nodes = nodesForAirport(airportId);
    const ids = nodes.map((n) => n.id);
    if (ids.length === 0)
        return [];
    const placeholders = ids.map(() => '?').join(',');
    return (0, connection_1.getDb)()
        .prepare(`SELECT * FROM airport_edges WHERE from_node_id IN (${placeholders})`)
        .all(...ids);
}
function nodesByType(airportId, type) {
    return (0, connection_1.getDb)()
        .prepare('SELECT * FROM airport_nodes WHERE airport_id = ? AND lower(type) = lower(?)')
        .all(airportId, type);
}
//# sourceMappingURL=airport.repo.js.map