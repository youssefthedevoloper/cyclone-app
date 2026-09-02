import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../state/auth.dart';
import '../../state/data.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';
import 'tickets.dart';

/// Dedicated Boarding Pass page: a visual boarding pass derived from your
/// linked ticket and flight status.
class BoardingPassScreen extends StatelessWidget {
  const BoardingPassScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final data = context.watch<AppData>();
    final auth = context.watch<AuthController>();
    final j = data.journey;
    final f = (j?['journey'] is Map) ? (j!['journey'] as Map)['flight'] : null;
    final tickets = (data.tickets ?? <dynamic>[]).cast<Map<String, dynamic>>();
    final t = f != null
        ? {...Map<String, dynamic>.from(f), if (tickets.isNotEmpty) ...tickets.first}
        : (tickets.isNotEmpty ? tickets.first : null);

    return Scaffold(
      appBar: AppBar(title: const Text('Boarding Pass')),
      body: wrapWeb(
        RefreshIndicator(
          onRefresh: data.refresh,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              if (t == null)
                EmptyState(
                  icon: Icons.airplane_ticket_outlined,
                  title: 'No boarding pass yet',
                  text: 'Add a ticket to generate your boarding pass.',
                  action: SecondaryBtn(label: 'Go to tickets', icon: Icons.airplane_ticket_outlined, onPressed: () => push(context, const TicketsScreen())),
                )
              else ...[
                _pass(context, auth, t),
                const SizedBox(height: 14),
                CyCard(
                  color: const Color(0xFFEAF2FF),
                  border: Border.all(color: const Color(0xFFCFE0FB)),
                  child: Row(children: [
                    const Icon(Icons.info_outline, color: C.primary),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        (t['status'] == 'Boarding' ? 'Boarding in progress — head to your gate now.' : 'Your pass is ready. Keep it handy for boarding.'),
                        style: const TextStyle(color: C.primaryDark, fontSize: 12.5),
                      ),
                    ),
                  ]),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _pass(BuildContext context, AuthController auth, Map<String, dynamic> t) {
    final isDemo = t['isDemo'] == true || t['isDemoTicket'] == true;
    final name = t['passengerName']?.toString() ?? auth.user?['name']?.toString() ?? '—';
    final status = t['status']?.toString() ?? 'Scheduled';

    return CyCard(
      padding: EdgeInsets.zero,
      child: Column(children: [
        Container(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
          decoration: const BoxDecoration(color: Color(0xFF0B2545), borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
          child: Row(children: [
            const Icon(Icons.flight, color: Colors.white, size: 18),
            const SizedBox(width: 8),
            Expanded(child: Text('${t['airline'] ?? 'CYCLONE'} · ${t['flightNumber'] ?? t['id'] ?? 'Flight'}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15))),
            if (isDemo) const Padding(padding: EdgeInsets.only(right: 8), child: Text('DEMO', style: TextStyle(color: Colors.white70, fontSize: 10, letterSpacing: 1, fontWeight: FontWeight.w800))),
            StatusBadge(status),
          ]),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Passenger', style: TextStyle(color: C.text3, fontSize: 11)),
              const SizedBox(height: 2),
              Text(name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
              const SizedBox(height: 6),
              const Text('Booking', style: TextStyle(color: C.text3, fontSize: 11)),
              const SizedBox(height: 2),
              Text(t['bookingReference']?.toString() ?? '—', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, letterSpacing: 0.5)),
            ]),
            Container(
              width: 64, height: 64,
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(color: C.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: C.border)),
              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                const Icon(Icons.airplane_ticket, color: C.primary, size: 20),
                const SizedBox(height: 2),
                Text((t['flightNumber'] ?? 'FLT').toString().length > 7 ? (t['flightNumber'] ?? 'FLT').toString().substring(0, 7) : (t['flightNumber'] ?? 'FLT').toString(),
                    textAlign: TextAlign.center, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.w800, color: C.primaryDark)),
              ]),
            ),
            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
              const Text('Seat', style: TextStyle(color: C.text3, fontSize: 11)),
              const SizedBox(height: 2),
              Text(t['seat']?.toString() ?? '—', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
              const SizedBox(height: 6),
              const Text('Class', style: TextStyle(color: C.text3, fontSize: 11)),
              const SizedBox(height: 2),
              Text(t['class']?.toString() ?? '—', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
            ]),
          ]),
        ),
        const Divider(height: 28, indent: 16, endIndent: 16),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Row(children: [
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(t['origin'] ?? '—', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
                Text(fmtTime(t['departureTime']?.toString() ?? ''), style: const TextStyle(color: C.text3, fontSize: 12)),
              ]),
            ),
            const Icon(Icons.flight_takeoff, color: C.primary, size: 28),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text(t['destination'] ?? '—', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
                Text(fmtDate(t['travelDate']?.toString() ?? t['departureTime']?.toString() ?? ''), style: const TextStyle(color: C.text3, fontSize: 12)),
              ]),
            ),
          ]),
        ),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: const BoxDecoration(color: Color(0xFFF3F6FB), borderRadius: BorderRadius.vertical(bottom: Radius.circular(16))),
          child: Row(children: [
            if (t['terminal'] != null) ...[
              Expanded(child: _mini('Terminal', (t['terminal'] ?? '—').toString())),
              const SizedBox(width: 8),
            ],
            if (t['gate'] != null) ...[
              Expanded(child: _mini('Gate', (t['gate'] ?? '—').toString())),
              const SizedBox(width: 8),
            ],
            Expanded(child: _mini('Boarding', status)),
          ]),
        ),
      ]),
    );
  }

  Widget _mini(String label, String value) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label.toUpperCase(), style: const TextStyle(color: C.text3, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.4)),
      const SizedBox(height: 2),
      Text(value, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
    ]);
  }
}