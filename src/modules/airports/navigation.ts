import { AirportEdgeRow, AirportNodeRow, edgesForAirport, listAirports, nodesForAirport, findAirportByCode } from './airport.repo';

export interface RoutePoint {
  nodeId: string;
  name: string;
  type: string;
}

export interface RouteResult {
  found: boolean;
  nodes: RoutePoint[];
  distance: number;
  walkingTime: number;
  from: string;
  to: string;
}

function dijkstra(airportId: string, startId: string, goalId: string): { path: string[]; distance: number; time: number } | null {
  const edges = edgesForAirport(airportId);
  const adj = new Map<string, { to: string; distance: number; time: number }[]>();
  for (const e of edges) {
    if (!adj.has(e.from_node_id)) adj.set(e.from_node_id, []);
    adj.get(e.from_node_id)!.push({ to: e.to_node_id, distance: e.distance, time: e.estimated_walking_time });
  }
  const dist = new Map<string, number>();
  const time = new Map<string, number>();
  const prev = new Map<string, string>();
  const visited = new Set<string>();
  const pq = new Map<string, number>();
  dist.set(startId, 0);
  time.set(startId, 0);
  pq.set(startId, 0);

  while (pq.size) {
    // get node with min distance
    let cur: string | null = null;
    let best = Infinity;
    for (const [n, d] of pq) {
      if (d < best) {
        best = d;
        cur = n;
      }
    }
    if (!cur) break;
    pq.delete(cur);
    if (cur === goalId) break;
    if (visited.has(cur)) continue;
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

  if (!dist.has(goalId)) return null;
  const path: string[] = [];
  let cursor: string | undefined = goalId;
  while (cursor !== undefined) {
    path.unshift(cursor);
    cursor = prev.get(cursor);
  }
  return { path, distance: dist.get(goalId)!, time: time.get(goalId)! };
}

export function findRoute(airportId: string, startId: string, goalId: string, nodes: AirportNodeRow[]): RouteResult {
  const result = dijkstra(airportId, startId, goalId);
  if (!result) return { found: false, nodes: [], distance: 0, walkingTime: 0, from: startId, to: goalId };
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const routeNodes = result.path
    .map((id) => {
      const n = byId.get(id);
      return n ? { nodeId: n.id, name: n.name, type: n.type } : null;
    })
    .filter((x): x is RoutePoint => !!x);
  return {
    found: true,
    nodes: routeNodes,
    distance: Math.round(result.distance),
    walkingTime: Math.round(result.time),
    from: startId,
    to: goalId,
  };
}

export interface NavigationPoint {
  id: string;
  name: string;
  type: string;
  terminal: string | null;
  distance: number;
  walkingTime: number;
}

export function nearestNode(airportId: string, type: string, nodes: AirportNodeRow[] | null = null): AirportNodeRow | null {
  const all = nodes || nodesForAirport(airportId);
  return all.find((n) => n.type && n.type.toLowerCase() === type.toLowerCase()) || null;
}

export function searchAirport(node: AirportNodeRow | null, keyword: string): boolean {
  if (!node) return false;
  const k = keyword.toLowerCase();
  return node.name.toLowerCase().includes(k) || node.type.toLowerCase().includes(k);
}

export function getAirportNavigation(airportId: string) {
  const nodes = nodesForAirport(airportId);
  const edges = edgesForAirport(airportId);
  return { nodes, edges };
}

export { listAirports, findAirportByCode };
