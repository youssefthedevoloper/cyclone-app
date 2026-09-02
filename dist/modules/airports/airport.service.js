"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirportService = void 0;
const errors_1 = require("../../utils/errors");
const airport_repo_1 = require("./airport.repo");
const navigation_1 = require("./navigation");
class AirportService {
    list() {
        return (0, airport_repo_1.listAirports)().map((a) => ({
            id: a.id,
            code: a.code,
            name: a.name,
            country: a.country,
            city: a.city,
            terminals: JSON.parse(a.terminals || '[]'),
        }));
    }
    getByCode(code) {
        const a = (0, airport_repo_1.findAirportByCode)(code);
        if (!a)
            throw (0, errors_1.notFound)('Airport not found');
        return {
            id: a.id,
            code: a.code,
            name: a.name,
            country: a.country,
            city: a.city,
            terminals: JSON.parse(a.terminals || '[]'),
        };
    }
    getById(id) {
        const a = (0, airport_repo_1.findAirportById)(id);
        if (!a)
            throw (0, errors_1.notFound)('Airport not found');
        return a;
    }
    getMap(code) {
        const a = (0, airport_repo_1.findAirportByCode)(code);
        if (!a)
            throw (0, errors_1.notFound)('Airport not found');
        const { nodes, edges } = (0, navigation_1.getAirportNavigation)(a.id);
        return {
            airport: { id: a.id, code: a.code, name: a.name, city: a.city, country: a.country },
            nodes: nodes.map((n) => ({ id: n.id, name: n.name, type: n.type, terminal: n.terminal, x: n.x, y: n.y })),
            edges: edges.map((e) => ({ id: e.id, fromNodeId: e.from_node_id, toNodeId: e.to_node_id, distance: e.distance, estimatedWalkingTime: e.estimated_walking_time })),
        };
    }
    getLocations(code) {
        const a = (0, airport_repo_1.findAirportByCode)(code);
        if (!a)
            throw (0, errors_1.notFound)('Airport not found');
        const nodes = (0, airport_repo_1.nodesForAirport)(a.id);
        const grouped = {};
        for (const n of nodes) {
            const key = n.type;
            if (!grouped[key])
                grouped[key] = [];
            grouped[key].push(n);
        }
        return {
            airport: { id: a.id, code: a.code, name: a.name },
            locations: Object.entries(grouped).map(([type, items]) => ({
                type,
                items: items.map((n) => ({ id: n.id, name: n.name, type: n.type, terminal: n.terminal })),
            })),
        };
    }
    navigate(code, from, to) {
        const a = (0, airport_repo_1.findAirportByCode)(code);
        if (!a)
            throw (0, errors_1.notFound)('Airport not found');
        const nodes = (0, airport_repo_1.nodesForAirport)(a.id);
        const fromNode = nodes.find((n) => n.id === from);
        if (!fromNode)
            throw (0, errors_1.badRequest)('Invalid origin node');
        const toNode = nodes.find((n) => n.id === to);
        if (!toNode)
            throw (0, errors_1.badRequest)('Invalid destination node');
        const route = (0, navigation_1.findRoute)(a.id, fromNode.id, toNode.id, nodes);
        return {
            found: route.found,
            from: { id: fromNode.id, name: fromNode.name, type: fromNode.type, terminal: fromNode.terminal },
            to: { id: toNode.id, name: toNode.name, type: toNode.type, terminal: toNode.terminal },
            route: route.nodes,
            distance: route.distance,
            walkingTime: route.walkingTime,
        };
    }
}
exports.AirportService = AirportService;
//# sourceMappingURL=airport.service.js.map