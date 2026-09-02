import { getDb } from '../../db/connection';

export interface AirportRow {
  id: string;
  code: string;
  name: string;
  country: string;
  city: string;
  terminals: string;
}

export interface AirportNodeRow {
  id: string;
  airport_id: string;
  name: string;
  type: string;
  terminal: string | null;
  x: number | null;
  y: number | null;
}

export interface AirportEdgeRow {
  id: string;
  from_node_id: string;
  to_node_id: string;
  distance: number;
  estimated_walking_time: number;
}

export function listAirports(): AirportRow[] {
  return getDb().prepare('SELECT * FROM airports ORDER BY code').all() as AirportRow[];
}

export function findAirportByCode(code: string): AirportRow | undefined {
  return getDb().prepare('SELECT * FROM airports WHERE lower(code) = lower(?)').get(code) as AirportRow | undefined;
}

export function findAirportById(id: string): AirportRow | undefined {
  return getDb().prepare('SELECT * FROM airports WHERE id = ?').get(id) as AirportRow | undefined;
}

export function nodesForAirport(airportId: string): AirportNodeRow[] {
  return getDb().prepare('SELECT * FROM airport_nodes WHERE airport_id = ?').all(airportId) as AirportNodeRow[];
}

export function edgesForAirport(airportId: string): AirportEdgeRow[] {
  const nodes = nodesForAirport(airportId);
  const ids = nodes.map((n) => n.id);
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  return getDb()
    .prepare(`SELECT * FROM airport_edges WHERE from_node_id IN (${placeholders})`)
    .all(...ids) as AirportEdgeRow[];
}

export function nodesByType(airportId: string, type: string): AirportNodeRow[] {
  return getDb()
    .prepare('SELECT * FROM airport_nodes WHERE airport_id = ? AND lower(type) = lower(?)')
    .all(airportId, type) as AirportNodeRow[];
}
