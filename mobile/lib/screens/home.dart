import 'package:flutter/material.dart';

import '../state/auth.dart';
import '../state/data.dart';
import '../theme.dart';
import '../widgets.dart';
import 'shell.dart';
import 'sub/lost_found.dart';
import 'sub/notifications.dart';
import 'sub/services.dart';
import 'sub/airport_map.dart';
import 'sub/journey_progress.dart';
import 'sub/boarding_pass.dart';
import 'sub/points.dart';
import 'sub/flight_details.dart';

class HomeTab extends StatefulWidget {
  final AuthController auth;
  final AppData data;
  const HomeTab({super.key, required this.auth, required this.data});

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  late AuthController auth = widget.auth;
  late AppData data = widget.data;

  dynamic get _journey => data.journey;
  bool _hadData = false;
  bool _flightsRequested = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_hadData) {
      _hadData = true;
      data.load();
      _requestFlightStatus();
    }
  }

  void _requestFlightStatus() {
    if (_flightsRequested) return;
    _flightsRequested = true;
    final t = data.tickets != null && data.tickets!.isNotEmpty ? data.tickets!.first as Map<String, dynamic> : null;
    final origin = (t?['origin'] as String?) ?? 'CAI';
    final dest = (t?['destination'] as String?) ?? 'DXB';
    data.loadFlights(origin, dest);
  }

  String _timeGreeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good morning,';
    if (h < 18) return 'Good afternoon,';
    return 'Good evening,';
  }

  @override
  Widget build(BuildContext context) {
    final journey = _journey;
    final ticket = data.tickets != null && data.tickets!.isNotEmpty ? data.tickets!.first as Map<String, dynamic> : null;
    final firstName = (auth.user?['name'] as String? ?? 'Traveler').split(' ').first;

    final quick = [
      (Icons.map_outlined, 'Airport Map', () => push(context, const AirportMapScreen())),
      (Icons.airplane_ticket_outlined, 'Boarding Pass', () => push(context, const BoardingPassScreen())),
      (Icons.flight_takeoff, 'Flight Status', () => push(context, const FlightDetailsScreen())),
      (Icons.local_cafe_outlined, 'Dining', () => push(context, const ServicesScreen())),
      (Icons.shield_outlined, 'Lost & Found', () => push(context, const LostFoundScreen())),
      (Icons.help_outline, 'Help', () => push(context, const ServicesScreen())),
    ];

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: data.refresh,
        child: wrapWeb(
          ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(C.pad, 18, C.pad, 28),
              children: [
                _header(firstName),
                const SizedBox(height: 22),
                if (ticket != null)
                  FlightHeroCard(flight: ticket, onTap: () => push(context, const BoardingPassScreen()))
                else
                  _noTicket(),
                const SizedBox(height: 18),
                SectionTitle('Quick actions'),
                _quickGrid(quick),
                const SizedBox(height: 8),
                _nextStep(context, journey?['journey'] as Map<String, dynamic>?),
                const SizedBox(height: 8),
                SectionHeader('Flight Status', actionLabel: 'See All', onAction: () => push(context, const FlightDetailsScreen())),
                _flightStatus(),
                const SizedBox(height: 26),
                _pointsCard(),
                const SizedBox(height: 16),
              ],
          ),
        ),
      ),
    );
  }

  Widget _header(String firstName) {
    return Row(children: [
      Expanded(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            logoImage(height: 22),
            const SizedBox(width: 8),
            const Text('CYCLONE', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w900, letterSpacing: 2, color: C.primaryDark)),
          ]),
          const SizedBox(height: 10),
          Text(_timeGreeting(), style: const TextStyle(color: C.text3, fontSize: 13)),
          Text(firstName, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: C.text, letterSpacing: -0.4)),
        ]),
      ),
      const SizedBox(width: 10),
      HeaderIconButton(
        icon: Icons.notifications_none,
        badge: data.unreadCount,
        onTap: () => push(context, NotificationsScreen(data: data)),
      ),
      const SizedBox(width: 10),
      ProfileAvatar(name: firstName, onTap: () {}),
    ]);
  }

  Widget _pointsCard() {
    final busy = data.loading.contains('loyalty');
    return CyCard(
      color: C.primarySoft,
      border: Border.all(color: C.primaryLine),
      child: Row(children: [
        Container(
          width: 50, height: 50,
          decoration: BoxDecoration(color: C.primary, borderRadius: BorderRadius.circular(15)),
          child: const Icon(Icons.local_activity, color: Colors.white),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Cyclone Points', style: TextStyle(color: C.primaryDark, fontSize: 12.5, fontWeight: FontWeight.w700)),
            const SizedBox(height: 2),
            Text(busy ? '—' : data.points.toString(), style: const TextStyle(color: C.primaryDark, fontSize: 26, fontWeight: FontWeight.w900, fontFeatures: [FontFeature.tabularFigures()])),
          ]),
        ),
        TextButton(onPressed: () => push(context, const CyclonePointsScreen()), child: const Text('Details', style: TextStyle(color: C.primary, fontSize: 12.5, fontWeight: FontWeight.w700))),
      ]),
    );
  }

  Widget _noTicket() {
    return CyCard(
      child: Row(children: [
        Container(
          width: 48, height: 48,
          decoration: BoxDecoration(color: C.primarySoft, borderRadius: BorderRadius.circular(14)),
          child: const Icon(Icons.flight_takeoff, size: 24, color: C.primary),
        ),
        const SizedBox(width: 12),
        const Expanded(child: Text('Add a ticket to unlock your personalized journey.', style: TextStyle(color: C.text2, fontSize: 13.5))),
        TextButton(onPressed: () => push(context, const JourneyProgressScreen()), child: const Text('Add', style: TextStyle(color: C.primary, fontWeight: FontWeight.w700))),
      ]),
    );
  }

  Widget _flightStatus() {
    final flights = data.flights;
    if (flights == null || flights.isEmpty) {
      return CyCard(
        child: Row(children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(color: C.primarySoft, borderRadius: BorderRadius.circular(13)),
            child: const Icon(Icons.flight_takeoff, color: C.primary, size: 22),
          ),
          const SizedBox(width: 12),
          const Expanded(child: Text('Live flight status will appear here.', style: TextStyle(color: C.text2, fontSize: 13.5))),
        ]),
      );
    }
    return FlightStatusCard(flights: flights.cast<Map<String, dynamic>>(), onRowTap: () => push(context, const FlightDetailsScreen()));
  }

  Widget _nextStep(BuildContext context, Map<String, dynamic>? journey) {
    if (journey == null) return const SizedBox.shrink();
    final steps = (journey['steps'] as List? ?? <dynamic>[]).cast<Map<String, dynamic>>();    Map<String, dynamic>? current;
    for (final s in steps) {
      if ((s['status'] as String? ?? '') == 'current') { current = s; break; }
    }
    if (current == null) {
      for (final s in steps) {
        if ((s['status'] as String? ?? '') == 'upcoming') { current = s; break; }
      }
    }
    if (current == null && steps.isNotEmpty) current = steps.first;
    if (current == null) return const SizedBox.shrink();
    final pct = ((journey['progress'] as num?) ?? 0) * 100;
    final nextText = current['title']?.toString() ?? 'Next step';

    return CyCard(
      color: C.surfaceAlt,
      child: InkWell(
        borderRadius: BorderRadius.circular(C.radiusCard),
        onTap: () => push(context, const JourneyProgressScreen()),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Container(
                width: 40, height: 40,
                decoration: BoxDecoration(color: C.primarySoft, borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.route, size: 20, color: C.primary),
              ),
              const SizedBox(width: 10),
              const Text('Your journey', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
              const Spacer(),
              Text('${pct.round()}%', style: const TextStyle(color: C.primary, fontWeight: FontWeight.w800, fontSize: 13)),
              const SizedBox(width: 2),
              const Icon(Icons.chevron_right, size: 18, color: C.text3),
            ]),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: LinearProgressIndicator(value: (pct / 100).clamp(0, 1), minHeight: 8, backgroundColor: const Color(0xFFE6ECF5), color: C.primary),
            ),
            const SizedBox(height: 12),
            Text('Next up: ', style: const TextStyle(color: C.text3, fontSize: 12.5)),
            Text(nextText, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14.5)),
          ]),
        ),
      ),
    );
  }

  Widget _quickGrid(List<(IconData, String, VoidCallback)> items) {
    return LayoutBuilder(builder: (context, box) {
      final itemWidth = (box.maxWidth - 12 * 2) / 3;
      final itemHeight = itemWidth * 1.05;
      return Wrap(
        spacing: 12,
        runSpacing: 12,
        children: [
          for (var i = 0; i < items.length; i++)
            SizedBox(
              width: itemWidth,
              height: itemHeight,
              child: QuickActionCard(
                icon: items[i].$1,
                label: items[i].$2,
                onTap: items[i].$3,
              ),
            ),
        ],
      );
    });
  }
}
