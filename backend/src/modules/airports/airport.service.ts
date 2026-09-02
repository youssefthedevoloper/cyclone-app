import { badRequest, notFound } from '../../utils/errors';
import { AirportNodeRow, findAirportByCode, findAirportById, listAirports, nodesForAirport, edgesForAirport, nodesByType } from './airport.repo';
import { findRoute, getAirportNavigation } from './navigation';

export class AirportService {
  list() {
    return listAirports().map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      country: a.country,
      city: a.city,
      terminals: JSON.parse(a.terminals || '[]'),
    }));
  }

  getByCode(code: string) {
    const a = findAirportByCode(code);
    if (!a) throw notFound('Airport not found');
    return {
      id: a.id,
      code: a.code,
      name: a.name,
      country: a.country,
      city: a.city,
      terminals: JSON.parse(a.terminals || '[]'),
    };
  }

  getById(id: string) {
    const a = findAirportById(id);
    if (!a) throw notFound('Airport not found');
    return a;
  }

  getMap(code: string) {
    const a = findAirportByCode(code);
    if (!a) throw notFound('Airport not found');
    const { nodes, edges } = getAirportNavigation(a.id);
    return {
      airport: { id: a.id, code: a.code, name: a.name, city: a.city, country: a.country },
      nodes: nodes.map((n) => ({ id: n.id, name: n.name, type: n.type, terminal: n.terminal, x: n.x, y: n.y })),
      edges: edges.map((e) => ({ id: e.id, fromNodeId: e.from_node_id, toNodeId: e.to_node_id, distance: e.distance, estimatedWalkingTime: e.estimated_walking_time })),
    };
  }

  getLocations(code: string) {
    const a = findAirportByCode(code);
    if (!a) throw notFound('Airport not found');
    const nodes = nodesForAirport(a.id);
    const grouped: Record<string, AirportNodeRow[]> = {};
    for (const n of nodes) {
      const key = n.type;
      if (!grouped[key]) grouped[key] = [];
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

  navigate(code: string, from: string, to: string) {
    const a = findAirportByCode(code);
    if (!a) throw notFound('Airport not found');
    const nodes = nodesForAirport(a.id);
    const fromNode = nodes.find((n) => n.id === from);
    if (!fromNode) throw badRequest('Invalid origin node');
    const toNode = nodes.find((n) => n.id === to);
    if (!toNode) throw badRequest('Invalid destination node');
    const route = findRoute(a.id, fromNode.id, toNode.id, nodes);
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
