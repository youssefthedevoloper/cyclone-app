import { AirportNodeRow, AirportEdgeRow, AirportRow } from '../modules/airports/airport.repo';

export const AIRPORTS: AirportRow[] = [
  { id: 'air_cai', code: 'CAI', name: 'Cairo International Airport', country: 'Egypt', city: 'Cairo', terminals: '["Terminal 1","Terminal 2","Terminal 3"]' },
  { id: 'air_dxb', code: 'DXB', name: 'Dubai International Airport', country: 'UAE', city: 'Dubai', terminals: '["Terminal 1","Terminal 2","Terminal 3"]' },
  { id: 'air_doh', code: 'DOH', name: 'Hamad International Airport', country: 'Qatar', city: 'Doha', terminals: '["North Terminal"]' },
];

export const CAI_NODES: AirportNodeRow[] = [
  { id: 'n_cai_arrive', airport_id: 'air_cai', name: 'Arrivals Hall', type: 'entrance', terminal: '2', x: 10, y: 80 },
  { id: 'n_cai_checkin', airport_id: 'air_cai', name: 'Check-in Counters 1-20', type: 'checkin', terminal: '2', x: 30, y: 65 },
  { id: 'n_cai_bagdrop', airport_id: 'air_cai', name: 'Baggage Drop K', type: 'baggage', terminal: '2', x: 45, y: 55 },
  { id: 'n_cai_security', airport_id: 'air_cai', name: 'Security Check', type: 'security', terminal: '2', x: 60, y: 40 },
  { id: 'n_cai_passport', airport_id: 'air_cai', name: 'Passport Control', type: 'passport', terminal: '2', x: 72, y: 30 },
  { id: 'n_cai_gate', airport_id: 'air_cai', name: 'Gate A14', type: 'gate', terminal: '2', x: 85, y: 18 },
  { id: 'n_cai_boarding', airport_id: 'air_cai', name: 'Boarding Gate A14', type: 'boarding', terminal: '2', x: 90, y: 10 },
  { id: 'n_cai_lounge', airport_id: 'air_cai', name: 'CYCLONE Lounge A', type: 'lounge', terminal: '2', x: 80, y: 50 },
  { id: 'n_cai_restaurant', airport_id: 'air_cai', name: 'Sky Bites Restaurant', type: 'restaurant', terminal: '2', x: 70, y: 55 },
  { id: 'n_cai_shop', airport_id: 'air_cai', name: 'Duty Free Shops', type: 'shop', terminal: '2', x: 68, y: 20 },
  { id: 'n_cai_atm', airport_id: 'air_cai', name: 'ATM Lounge', type: 'atm', terminal: '2', x: 25, y: 50 },
  { id: 'n_cai_medical', airport_id: 'air_cai', name: 'Medical Center', type: 'medical', terminal: '2', x: 40, y: 75 },
  { id: 'n_cai_lost', airport_id: 'air_cai', name: 'Lost & Found Office', type: 'lostfound', terminal: '2', x: 50, y: 82 },
  { id: 'n_cai_transport', airport_id: 'air_cai', name: 'Transportation Hub', type: 'transport', terminal: '2', x: 8, y: 60 },
  { id: 'n_cai_parking', airport_id: 'air_cai', name: 'Parking P2', type: 'parking', terminal: '2', x: 5, y: 90 },
  { id: 'n_cai_bathroom', airport_id: 'air_cai', name: 'Bathrooms A', type: 'bathroom', terminal: '2', x: 75, y: 12 },
  { id: 'n_cai_immigration', airport_id: 'air_cai', name: 'Immigration', type: 'immigration', terminal: '2', x: 74, y: 33 },
  { id: 'n_cai_priority', airport_id: 'air_cai', name: 'Priority Line', type: 'priority', terminal: '2', x: 62, y: 42 },
];

export const CAI_EDGES: AirportEdgeRow[] = [
  { id: 'e1', from_node_id: 'n_cai_arrive', to_node_id: 'n_cai_checkin', distance: 120, estimated_walking_time: 2 },
  { id: 'e2', from_node_id: 'n_cai_checkin', to_node_id: 'n_cai_bagdrop', distance: 80, estimated_walking_time: 1 },
  { id: 'e3', from_node_id: 'n_cai_bagdrop', to_node_id: 'n_cai_security', distance: 150, estimated_walking_time: 3 },
  { id: 'e4', from_node_id: 'n_cai_security', to_node_id: 'n_cai_priority', distance: 20, estimated_walking_time: 1 },
  { id: 'e5', from_node_id: 'n_cai_security', to_node_id: 'n_cai_passport', distance: 100, estimated_walking_time: 2 },
  { id: 'e6', from_node_id: 'n_cai_priority', to_node_id: 'n_cai_passport', distance: 80, estimated_walking_time: 1 },
  { id: 'e7', from_node_id: 'n_cai_passport', to_node_id: 'n_cai_immigration', distance: 40, estimated_walking_time: 1 },
  { id: 'e8', from_node_id: 'n_cai_immigration', to_node_id: 'n_cai_gate', distance: 300, estimated_walking_time: 5 },
  { id: 'e9', from_node_id: 'n_cai_passport', to_node_id: 'n_cai_gate', distance: 320, estimated_walking_time: 6 },
  { id: 'e10', from_node_id: 'n_cai_gate', to_node_id: 'n_cai_boarding', distance: 30, estimated_walking_time: 1 },
  { id: 'e11', from_node_id: 'n_cai_security', to_node_id: 'n_cai_lounge', distance: 220, estimated_walking_time: 4 },
  { id: 'e12', from_node_id: 'n_cai_checkin', to_node_id: 'n_cai_restaurant', distance: 200, estimated_walking_time: 4 },
  { id: 'e13', from_node_id: 'n_cai_restaurant', to_node_id: 'n_cai_shop', distance: 90, estimated_walking_time: 2 },
  { id: 'e14', from_node_id: 'n_cai_gate', to_node_id: 'n_cai_shop', distance: 60, estimated_walking_time: 1 },
  { id: 'e15', from_node_id: 'n_cai_arrive', to_node_id: 'n_cai_atm', distance: 90, estimated_walking_time: 2 },
  { id: 'e16', from_node_id: 'n_cai_atm', to_node_id: 'n_cai_medical', distance: 80, estimated_walking_time: 1 },
  { id: 'e17', from_node_id: 'n_cai_arrive', to_node_id: 'n_cai_lost', distance: 60, estimated_walking_time: 1 },
  { id: 'e18', from_node_id: 'n_cai_arrive', to_node_id: 'n_cai_transport', distance: 40, estimated_walking_time: 1 },
  { id: 'e19', from_node_id: 'n_cai_arrive', to_node_id: 'n_cai_parking', distance: 150, estimated_walking_time: 3 },
  { id: 'e20', from_node_id: 'n_cai_boarding', to_node_id: 'n_cai_bathroom', distance: 20, estimated_walking_time: 1 },
  { id: 'e21', from_node_id: 'n_cai_passport', to_node_id: 'n_cai_boarding', distance: 340, estimated_walking_time: 6 },
];

// DXB simplified graph
export const DXB_NODES: AirportNodeRow[] = [
  { id: 'n_dxb_arrive', airport_id: 'air_dxb', name: 'Arrivals Hall', type: 'entrance', terminal: '3', x: 10, y: 80 },
  { id: 'n_dxb_checkin', airport_id: 'air_dxb', name: 'Check-in Counters', type: 'checkin', terminal: '3', x: 30, y: 60 },
  { id: 'n_dxb_security', airport_id: 'air_dxb', name: 'Security Check', type: 'security', terminal: '3', x: 55, y: 40 },
  { id: 'n_dxb_passport', airport_id: 'air_dxb', name: 'Passport Control', type: 'passport', terminal: '3', x: 70, y: 30 },
  { id: 'n_dxb_gate', airport_id: 'air_dxb', name: 'Gate B22', type: 'gate', terminal: '3', x: 85, y: 15 },
  { id: 'n_dxb_boarding', airport_id: 'air_dxb', name: 'Boarding Gate B22', type: 'boarding', terminal: '3', x: 92, y: 8 },
  { id: 'n_dxb_lounge', airport_id: 'air_dxb', name: 'CYCLONE Lounge B', type: 'lounge', terminal: '3', x: 78, y: 45 },
];

export const DXB_EDGES: AirportEdgeRow[] = [
  { id: 'de1', from_node_id: 'n_dxb_arrive', to_node_id: 'n_dxb_checkin', distance: 140, estimated_walking_time: 2 },
  { id: 'de2', from_node_id: 'n_dxb_checkin', to_node_id: 'n_dxb_security', distance: 180, estimated_walking_time: 3 },
  { id: 'de3', from_node_id: 'n_dxb_security', to_node_id: 'n_dxb_passport', distance: 100, estimated_walking_time: 2 },
  { id: 'de4', from_node_id: 'n_dxb_passport', to_node_id: 'n_dxb_gate', distance: 350, estimated_walking_time: 6 },
  { id: 'de5', from_node_id: 'n_dxb_gate', to_node_id: 'n_dxb_boarding', distance: 25, estimated_walking_time: 1 },
  { id: 'de6', from_node_id: 'n_dxb_security', to_node_id: 'n_dxb_lounge', distance: 210, estimated_walking_time: 4 },
];

export const DOH_NODES: AirportNodeRow[] = [
  { id: 'n_doh_arrive', airport_id: 'air_doh', name: 'Arrivals', type: 'entrance', terminal: 'North', x: 10, y: 70 },
  { id: 'n_doh_checkin', airport_id: 'air_doh', name: 'Check-in', type: 'checkin', terminal: 'North', x: 30, y: 50 },
  { id: 'n_doh_security', airport_id: 'air_doh', name: 'Security', type: 'security', terminal: 'North', x: 55, y: 35 },
  { id: 'n_doh_gate', airport_id: 'air_doh', name: 'Gate C12', type: 'gate', terminal: 'North', x: 80, y: 15 },
];

export const DOH_EDGES: AirportEdgeRow[] = [
  { id: 'doe1', from_node_id: 'n_doh_arrive', to_node_id: 'n_doh_checkin', distance: 100, estimated_walking_time: 2 },
  { id: 'doe2', from_node_id: 'n_doh_checkin', to_node_id: 'n_doh_security', distance: 130, estimated_walking_time: 2 },
  { id: 'doe3', from_node_id: 'n_doh_security', to_node_id: 'n_doh_gate', distance: 290, estimated_walking_time: 5 },
];

export const ALL_AIRPORTS = AIRPORTS;
export const ALL_NODES = [...CAI_NODES, ...DXB_NODES, ...DOH_NODES];
export const ALL_EDGES = [...CAI_EDGES, ...DXB_EDGES, ...DOH_EDGES];