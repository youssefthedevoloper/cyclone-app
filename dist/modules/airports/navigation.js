"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAirportByCode = exports.listAirports = void 0;
exports.findRoute = findRoute;
exports.nearestNode = nearestNode;
exports.searchAirport = searchAirport;
exports.getAirportNavigation = getAirportNavigation;
const airport_repo_1 = require("./airport.repo");
Object.defineProperty(exports, "listAirports", { enumerable: true, get: function () { return airport_repo_1.listAirports; } });
Object.defineProperty(exports, "findAirportByCode", { enumerable: true, get: function () { return airport_repo_1.findAirportByCode; } });
function dijkstra(airportId, startId, goalId) {
    const edges = (0, airport_repo_1.edgesForAirport)(airportId);
    const adj = new Map();
    for (const e of edges) {
        if (!adj.has(e.from_node_id))
            adj.set(e.from_node_id, []);
        adj.get(e.from_node_id).push({ to: e.to_node_id, distance: e.distance, time: e.estimated_walking_time });
    }
    const dist = new Map();
    const time = new Map();
    const prev = new Map();
    const visited = new Set();
    const pq = new Map();
    dist.set(startId, 0);
    time.set(startId, 0);
    pq.set(startId, 0);
    while (pq.size) {
        // get node with min distance
        let cur = null;
        let best = Infinity;
        for (const [n, d] of pq) {
            if (d < best) {
                best = d;
                cur = n;
            }
        }
        if (!cur)
            break;
        pq.delete(cur);
        if (cur === goalId)
            break;
        if (visited.has(cur))
            continue;
        visited.add(cur);
        const neighbors = adj.get(cur) || [];
        for (const n of neighbors) {
            const nd = (dist.get(cur) || 0) + n.distance;
            const nt = (time.get(cur) || 0) + n.time;
            if (nd < (dist.get(n.to) ?? Infinity)) {
                dist.set(n.to, nd);
                time.set(n.to, nt);
                prev.set(n.to, cur);
                pq.set(n.to, nd);
            }
        }
    }
    if (!dist.has(goalId))
        return null;
    const path = [];
    let cursor = goalId;
    while (cursor !== undefined) {
        path.unshift(cursor);
        cursor = prev.get(cursor);
    }
    return { path, distance: dist.get(goalId), time: time.get(goalId) };
}
function findRoute(airportId, startId, goalId, nodes) {
    const result = dijkstra(airportId, startId, goalId);
    if (!result)
        return { found: false, nodes: [], distance: 0, walkingTime: 0, from: startId, to: goalId };
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const routeNodes = result.path
        .map((id) => {
        const n = byId.get(id);
        return n ? { nodeId: n.id, name: n.name, type: n.type } : null;
    })
        .filter((x) => !!x);
    return {
        found: true,
        nodes: routeNodes,
        distance: Math.round(result.distance),
        walkingTime: Math.round(result.time),
        from: startId,
        to: goalId,
    };
}
function nearestNode(airportId, type, nodes = null) {
    const all = nodes || (0, airport_repo_1.nodesForAirport)(airportId);
    return all.find((n) => n.type && n.type.toLowerCase() === type.toLowerCase()) || null;
}
function searchAirport(node, keyword) {
    if (!node)
        return false;
    const k = keyword.toLowerCase();
    return node.name.toLowerCase().includes(k) || node.type.toLowerCase().includes(k);
}
function getAirportNavigation(airportId) {
    const nodes = (0, airport_repo_1.nodesForAirport)(airportId);
    const edges = (0, airport_repo_1.edgesForAirport)(airportId);
    return { nodes, edges };
}
//# sourceMappingURL=navigation.js.map