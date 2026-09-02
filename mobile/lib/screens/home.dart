import 'package:flutter/material.dart';

import '../state/auth.dart';
import '../state/data.dart';
import '../theme.dart';
import '../widgets.dart';
import 'shell.dart';
import 'sub/lost_found.dart';
import 'sub/notifications.dart';
import 'sub/premium.dart';
import 'sub/rewards.dart';
import 'sub/services.dart';
import 'sub/airport_map.dart';
import 'sub/points.dart';
import 'sub/scan_qr.dart';

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

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_hadData) {
      _hadData = true;
      data.load();
    }
  }

  @override
  Widget build(BuildContext context) {
    final journey = _journey;
    final canJourney = journey != null && journey['access'] == 'personal';
    final ticket = data.tickets != null && data.tickets!.isNotEmpty ? data.tickets!.first as Map<String, dynamic> : null;
    final firstName = (auth.user?['name'] as String? ?? 'Traveler').split(' ').first;

    final quick = [
      (Icons.shield_outlined, 'Lost & Found', () => push(context, const LostFoundScreen())),
      (Icons.qr_code_2, 'QR Scanner', () => push(context, const ScanQrScreen())),
      (Icons.card_giftcard, 'Rewards', () => push(context, const RewardsScreen())),
      (Icons.room_service_outlined, 'Services', () => push(context, const ServicesScreen())),
      (Icons.workspace_premium_outlined, 'Premium', () => push(context, const PremiumScreen())),
      (Icons.map_outlined, 'Airport Map', () => push(context, const AirportMapScreen())),
    ];

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: data.refresh,
        child: wrapWeb(
          ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
            children: [
              _header(firstName),
              const SizedBox(height: 16),
              _pointsCard(),
              const SizedBox(height: 16),
              if (ticket != null) _flightCard(ticket) else _noTicket(),
              if (canJourney && journey?['journey'] != null) ...[
                const SizedBox(height: 16),
                _nextStep(context, journey!['journey'] as Map<String, dynamic>),
              ],
              const SizedBox(height: 22),
              const SectionTitle('Quick access'),
              _quickGrid(quick),
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
          Text('Hello, $firstName 👋'.replaceAll(' 👋', ''),
              style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w800, color: C.text)),
          const SizedBox(height: 2),
          Text(auth.isPremium ? 'Premium member · priority everywhere' : 'Free plan · earn points to unlock more', style: const TextStyle(color: C.text2, fontSize: 13)),
        ]),
      ),
      logoMark(size: 30),
      const SizedBox(width: 4),
      InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => push(context, NotificationsScreen(data: data)),
        child: Stack(children: [
          Container(width: 42, height: 42, decoration: BoxDecoration(color: C.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: C.border)), child: const Icon(Icons.notifications_none, color: C.text)),
          if (data.unreadCount > 0)
            Positioned(
              right: 0, top: 0,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(color: C.primary, shape: BoxShape.circle),
                child: Text(data.unreadCount.toString(), style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.w800)),
              ),
            ),
        ]),
      ),
    ]);
  }

  Widget _pointsCard() {
    final busy = data.loading.contains('loyalty');
    return CyCard(
      color: const Color(0xFFEAF2FF),
      border: Border.all(color: const Color(0xFFCFE0FB)),
      child: Row(children: [
        Container(
          width: 46, height: 46,
          decoration: BoxDecoration(color: C.primary, borderRadius: BorderRadius.circular(14)),
          child: const Icon(Icons.local_activity, color: Colors.white),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Cyclone Points', style: TextStyle(color: Color(0xCC0B2545), fontSize: 12.5, fontWeight: FontWeight.w600)),
            const SizedBox(height: 2),
            Text(busy ? '•••' : data.points.toString(), style: const TextStyle(color: C.primaryDark, fontSize: 26, fontWeight: FontWeight.w900, fontFeatures: [FontFeature.tabularFigures()])),
          ]),
        ),
        TextButton(onPressed: () => push(context, const CyclonePointsScreen()), child: const Text('Details →', style: TextStyle(color: C.primary, fontSize: 12.5))),
      ]),
    );
  }

  Widget _flightCard(Map<String, dynamic> t) {
    return CyCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.airplane_ticket_outlined, size: 20, color: C.primary),
          const SizedBox(width: 8),
          Text('${t['flightNumber'] ?? t['id'] ?? 'Flight'}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
          const Spacer(),
          StatusBadge((t['status'] ?? 'Scheduled').toString()),
        ]),
        const SizedBox(height: 12),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          _airport(t['origin'] ?? '—', t['departureTime']?.toString()),
          const Column(children: [Icon(Icons.arrow_forward, color: C.text3), SizedBox(height: 4), Icon(Icons.flight, size: 20, color: C.primary)]),
          _airport(t['destination'] ?? '—', t['arrivalTime']?.toString(), right: true),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          if (t['gate'] != null) ...[Icon(Icons.signpost_outlined, size: 15, color: C.text3), const SizedBox(width: 4), Text('Gate ${t['gate']}', style: const TextStyle(fontSize: 12.5, color: C.text2))],
          const Spacer(),
          Text('Terminal ${t['terminal'] ?? '—'}', style: const TextStyle(fontSize: 12.5, color: C.text3)),
        ]),
      ]),
    );
  }

  Widget _airport(String code, String? time, {bool right = false}) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      if (right) ...[
        Text(time != null ? fmtTime(time) : '', style: const TextStyle(color: C.text3, fontSize: 12)),
        const SizedBox(width: 6),
      ],
      Text(code, style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w900, color: C.text)),
      if (!right) ...[
        const SizedBox(width: 6),
        Text(time != null ? fmtTime(time) : '', style: const TextStyle(color: C.text3, fontSize: 12)),
      ],
    ]);
  }

  Widget _noTicket() {
    return CyCard(
      child: Row(children: [
        const Icon(Icons.flight_takeoff, size: 26, color: C.primary),
        const SizedBox(width: 12),
        const Expanded(child: Text('Add a ticket to unlock your personalized journey.',
            style: TextStyle(color: C.text2, fontSize: 13.5))),
        TextButton(onPressed: () {}, child: const Text('Add', style: TextStyle(color: C.primary, fontWeight: FontWeight.w700))),
      ]),
    );
  }

  Widget _nextStep(BuildContext context, Map<String, dynamic> journey) {
    final steps = (journey['steps'] as List? ?? <dynamic>[]).cast<Map<String, dynamic>>();
    Map<String, dynamic>? current;
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
    return CyCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.route, size: 20, color: C.primary),
          const SizedBox(width: 8),
          const Text('Your journey', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15.5)),
          const Spacer(),
          Text('${pct.round()}%', style: const TextStyle(color: C.primary, fontWeight: FontWeight.w800, fontSize: 13)),
        ]),
        const SizedBox(height: 10),
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: LinearProgressIndicator(value: (pct / 100).clamp(0, 1), minHeight: 7, backgroundColor: const Color(0xFFE6ECF5), color: C.primary),
        ),
        const SizedBox(height: 12),
        Text(current['title'] ?? 'Next step', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14.5)),
        Text(current['description'] ?? '', style: const TextStyle(color: C.text2, fontSize: 12.5)),
      ]),
    );
  }

  Widget _quickGrid(List<(IconData, String, VoidCallback)> items) {
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.05,
      children: items.map((q) {
        return InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: q.$3,
          child: Container(
            decoration: BoxDecoration(color: C.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: C.border)),
            padding: const EdgeInsets.all(8),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Container(
                width: 42, height: 42,
                decoration: const BoxDecoration(color: Color(0xFFEAF2FF), shape: BoxShape.circle),
                child: Icon(q.$1, color: C.primary),
              ),
              const SizedBox(height: 8),
              Text(q.$2, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: C.text), textAlign: TextAlign.center),
            ]),
          ),
        );
      }).toList(),
    );
  }
}