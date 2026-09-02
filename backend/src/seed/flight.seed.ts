import { FlightRow } from '../modules/flights/flight.repo';

function daysFromNow(days: number): string {
  const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

export const FLIGHTS: FlightRow[] = [
  {
    id: 'fl_eh0030',
    flight_number: 'EK30',
    airline: 'Emirates',
    origin: 'CAI',
    destination: 'DXB',
    departure_time: daysFromNow(1) + 'T17:45:00.000Z',
    arrival_time: daysFromNow(1) + 'T23:20:00.000Z',
    terminal: '2',
    gate: 'A14',
    status: 'Boarding',
    is_demo: 1,
  },
  {
    id: 'fl_ms0776',
    flight_number: 'MS776',
    airline: 'EgyptAir',
    origin: 'CAI',
    destination: 'DXB',
    departure_time: daysFromNow(2) + 'T09:30:00.000Z',
    arrival_time: daysFromNow(2) + 'T14:55:00.000Z',
    terminal: '2',
    gate: 'B07',
    status: 'Scheduled',
    is_demo: 0,
  },
  {
    id: 'fl_qr1302',
    flight_number: 'QR1302',
    airline: 'Qatar Airways',
    origin: 'CAI',
    destination: 'DOH',
    departure_time: daysFromNow(3) + 'T20:15:00.000Z',
    arrival_time: daysFromNow(3) + 'T23:45:00.000Z',
    terminal: '2',
    gate: 'C03',
    status: 'Delayed',
    is_demo: 0,
  },
  {
    id: 'fl_ms0503',
    flight_number: 'MS503',
    airline: 'EgyptAir',
    origin: 'DXB',
    destination: 'CAI',
    departure_time: daysFromNow(4) + 'T11:00:00.000Z',
    arrival_time: daysFromNow(4) + 'T13:30:00.000Z',
    terminal: '3',
    gate: 'B22',
    status: 'Scheduled',
    is_demo: 0,
  },
];