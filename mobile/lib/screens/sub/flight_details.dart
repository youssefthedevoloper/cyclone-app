import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../state/auth.dart';
import '../../state/data.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';
import 'airport_map.dart';
import 'checkin.dart';
import 'journey_progress.dart';
import 'tickets.dart';

/// Dedicated Flight Details page: full information about the linked flight.
class FlightDetailsScreen extends StatelessWidget {
  const FlightDetailsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final data = context.watch<AppData>();
    final auth = context.watch<AuthController>();
    final journey = data.journey;
    final f = (journey?['journey'] is Map) ? (journey!['journey'] as Map)['flight'] : null;
    final tickets = (data.tickets ?? <dynamic>[]).cast<Map<String, dynamic>>();
    final t = f != null
        ? {...(f as Map), if (tickets.isNotEmpty) ...tickets.first}
        : (tickets.isNotEmpty ? tickets.first : null);

    return Scaffold(
      appBar: AppBar(title: const Text('Flight Details')),
      body: wrapWeb(
        RefreshIndicator(
          onRefresh: data.refresh,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              if (t == null)
                EmptyState(
                  icon: Icons.flight_takeoff,
                  title: 'No flight linked',
                  text: 'Add a ticket to see live flight details.',
                  action: SecondaryBtn(label: 'Go to tickets', icon: Icons.airplane_ticket_outlined, onPressed: () => push(context, const TicketsScreen())),
                )
              else ...[
                CyCard(
                  color: const Color(0xFF0B2545),
                  border: Border.all(color: const Color(0xFF0B2545)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      const Icon(Icons.flight, color: Colors.white, size: 20),
                      const SizedBox(width: 8),
                      Expanded(child: Text('${t['airline'] ?? 'CYCLONE'} · ${t['flightNumber'] ?? t['id'] ?? 'Flight'}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16))),
                      if (t['isDemo'] == true || t['isDemoTicket'] == true) const Padding(padding: EdgeInsets.only(right: 8), child: Text('DEMO', style: TextStyle(color: Colors.white70, fontSize: 10, letterSpacing: 1, fontWeight: FontWeight.w800))),
                      StatusBadge((t['status'] ?? 'Scheduled').toString()),
                    ]),
                    const SizedBox(height: 14),
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      _routeAirport(t['origin'] ?? '—', t['departureTime']?.toString(), left: true),
                      const Column(children: [
                        Icon(Icons.flight_takeoff, color: Colors.white38, size: 24),
                        Icon(Icons.arrow_forward, color: Colors.white70, size: 16),
                      ]),
                      _routeAirport(t['destination'] ?? '—', t['arrivalTime']?.toString()),
                    ]),
                    const SizedBox(height: 12),
                    Text(auth.isPremium ? 'Premium traveler · priority check-in available' : 'Free plan · standard boarding', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                  ]),
                ),
                const SizedBox(height: 14),
                CyCard(
                  padding: EdgeInsets.zero,
                  child: Column(children: [
                    _pair('Passenger', t['passengerName']?.toString() ?? auth.user?['name']?.toString() ?? '—', Icons.person_outline),
                    _pair('Booking reference', t['bookingReference']?.toString() ?? '—', Icons.confirmation_number_outlined),
                    _pair('Travel date', fmtDate(t['travelDate']?.toString() ?? t['departureTime']?.toString() ?? ''), Icons.event_outlined),
                    _pair('Terminal', t['terminal'] != null ? 'Terminal ${t['terminal']}' : '—', Icons.location_on_outlined),
                    _pair('Gate', t['gate'] != null ? 'Gate ${t['gate']}' : '—', Icons.signpost_outlined),
                    _pair('Status', (t['status'] ?? 'Scheduled').toString(), Icons.badge_outlined),
                    _pair('Delay alerts', 'On', Icons.notifications_active_outlined),
                  ]),
                ),
                const SizedBox(height: 16),
                SecondaryBtn(label: 'Check-in', icon: Icons.checklist, onPressed: () => push(context, const CheckinScreen())),
                const SizedBox(height: 10),
                SecondaryBtn(label: 'View journey progress', icon: Icons.route_outlined, onPressed: () => push(context, const JourneyProgressScreen())),
                const SizedBox(height: 10),
                SecondaryBtn(label: 'Find my gate on the map', icon: Icons.map_outlined, onPressed: () => push(context, const AirportMapScreen())),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _routeAirport(String code, String? time, {bool left = false}) {
    return Expanded(
      child: Column(crossAxisAlignment: left ? CrossAxisAlignment.start : CrossAxisAlignment.end, children: [
        Text(code, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
        Text(fmtTime(time ?? ''), style: const TextStyle(color: Colors.white70, fontSize: 12)),
      ]),
    );
  }

  Widget _pair(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(children: [
        Icon(icon, size: 19, color: C.text3),
        const SizedBox(width: 12),
        Text(label, style: const TextStyle(color: C.text3, fontSize: 13)),
        const Spacer(),
        Flexible(child: Text(value, style: const TextStyle(color: C.text, fontWeight: FontWeight.w700, fontSize: 13.5), textAlign: TextAlign.right)),
      ]),
    );
  }
}