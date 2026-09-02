import 'package:flutter/material.dart';

import '../api/api.dart';
import '../state/auth.dart';
import '../state/data.dart';
import '../theme.dart';
import '../widgets.dart';
import 'shell.dart';
import 'sub/airport_map.dart';
import 'sub/tickets.dart';

class JourneyTab extends StatefulWidget {
  final AuthController auth;
  final AppData data;
  const JourneyTab({super.key, required this.auth, required this.data});
  @override
  State<JourneyTab> createState() => _JourneyTabState();
}

class _JourneyTabState extends State<JourneyTab> {
  late AppData data = widget.data;
  bool _busy = false;

  dynamic get _j => data.journey;

  Future<void> completeStep(String stepId) async {
    setState(() => _busy = true);
    try {
      final res = await Api.post('/api/journey/steps/$stepId/complete');
      final earned = (res['pointsEarned'] as num?)?.toInt() ?? 0;
      await data.refresh(['journey', 'loyalty']);
      if (!mounted) return;
      toast(context, earned > 0 ? 'Step completed · +$earned pts' : 'Step completed', error: false);
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    } catch (_) {
      if (mounted) toast(context, 'Could not complete step', error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final j = _j;
    return Scaffold(
      appBar: AppBar(title: const Text('Journey')),
      body: j == null
          ? const Center(child: CircularProgressIndicator(color: C.primary))
          : wrapWeb(RefreshIndicator(
              onRefresh: data.loadJourney,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                children: _content(j as Map<String, dynamic>),
              ),
            )),
    );
  }

  List<Widget> _content(Map<String, dynamic> j) {
    final access = j['access'] as String? ?? 'required';
    if (access == 'required') {
      return [
        EmptyState(
          icon: Icons.flight_takeoff,
          title: 'A ticket is required',
          text: (j['reason'] as String?) ?? 'Link a ticket to start your personalized journey.',
          action: SecondaryBtn(label: 'Go to tickets', icon: Icons.airplane_ticket_outlined, onPressed: () => push(context, TicketsScreen())),
        ),
      ];
    }

    final journey = j['journey'] as Map<String, dynamic>?;
    if (journey == null) {
      return [
        EmptyState(icon: Icons.route, title: 'No journey yet', text: j['message'] as String?),
      ];
    }

    final steps = (journey['steps'] as List? ?? <dynamic>[]).cast<Map<String, dynamic>>();
    final progress = ((journey['progress'] as num?) ?? 0) * 100;
    final airport = (journey['airport'] as Map?)?['name'] ?? 'Airport';
    final isDemo = journey['isDemo'] == true;
    final done = steps.where((s) => (s['status'] as String?) == 'completed').length;

    final list = <Widget>[];
    list.add(CyCard(
      color: const Color(0xFF0B2545),
      border: Border.all(color: const Color(0xFF0B2545)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.flight, color: Colors.white, size: 20),
          const SizedBox(width: 8),
          Text(airport, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
          const Spacer(),
          StatusBadge((journey['status'] ?? 'in progress').toString()),
        ]),
        const SizedBox(height: 12),
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: LinearProgressIndicator(
            value: (progress / 100).clamp(0, 1),
            minHeight: 8,
            backgroundColor: Colors.white24,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 8),
        Text('$done of ${steps.length} steps done · ${progress.round()}%', style: const TextStyle(color: Colors.white70, fontSize: 12.5)),
      ]),
    ));

    if (isDemo) {
      list.add(CyCard(
        margin: const EdgeInsets.only(top: 12),
        color: const Color(0xFFEAF2FF),
        border: Border.all(color: const Color(0xFFCFE0FB)),
        child: Row(children: [
          const Icon(Icons.science_outlined, color: C.primary),
          const SizedBox(width: 10),
          const Expanded(child: Text('You are on a demo journey linked to your demo ticket.', style: TextStyle(color: C.primaryDark, fontSize: 13))),
        ]),
      ));
    }

    final allDone = done == steps.length && steps.isNotEmpty;
    if (allDone) {
      list.add(CyCard(
        margin: const EdgeInsets.only(top: 12),
        child: Row(children: [
          const Icon(Icons.emoji_events, color: C.warning),
          const SizedBox(width: 10),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Journey complete!', style: TextStyle(fontWeight: FontWeight.w800, color: C.text)),
              const SizedBox(height: 2),
              const Text('+100 points earned for finishing. Enjoy your trip!', style: TextStyle(color: C.text2, fontSize: 12.5)),
            ]),
          ),
        ]),
      ));
    }

    list.add(const SectionTitle('Your steps'));

    for (var i = 0; i < steps.length; i++) {
      final s = steps[i];
      list.add(_stepTile(i, s));
    }
    return list;
  }

  Widget _stepTile(int index, Map<String, dynamic> s) {
    final status = (s['status'] as String?) ?? 'upcoming';
    final isComplete = status == 'completed';
    final isCurrent = status == 'current';
    final nav = s['navigation'] is Map ? s['navigation'] as Map : null;
    final id = s['id'] as String? ?? '';

    IconData icon;
    Color color;
    if (isComplete) {
      icon = Icons.check_circle;
      color = C.success;
    } else if (isCurrent) {
      icon = Icons.radio_button_checked;
      color = C.primary;
    } else {
      icon = Icons.radio_button_unchecked;
      color = C.text3;
    }

    return CyCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, color: color, size: 22),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(child: Text(s['title']?.toString() ?? 'Step ${index + 1}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14.5, color: C.text))),
              if (nav != null && nav['type'] != null) DotBadge(nav['type'].toString()),
            ]),
            if (s['description'] != null) ...[
              const SizedBox(height: 3),
              Text(s['description'].toString(), style: const TextStyle(color: C.text2, fontSize: 12.5)),
            ],
            if (s['instructions'] != null) ...[
              const SizedBox(height: 6),
              Text('→ ${s['instructions']}', style: const TextStyle(color: C.text3, fontSize: 12)),
            ],
            if (isCurrent || !isComplete) ...[
              const SizedBox(height: 10),
              Row(children: [
                if (isCurrent)
                  SizedBox(
                    width: 160,
                    child: FilledButton(
                      onPressed: _busy ? null : () => completeStep(id),
                      style: FilledButton.styleFrom(backgroundColor: C.primary, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 10), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                      child: _busy ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Complete step', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    ),
                  ),
                if (nav != null && nav['id'] != null) ...[
                  if (isCurrent) const SizedBox(width: 8),
                  SizedBox(
                    width: isCurrent ? 150 : double.infinity,
                    child: OutlinedButton(
                      onPressed: () => push(context, const AirportMapScreen()),
                      style: OutlinedButton.styleFrom(foregroundColor: C.primary, side: const BorderSide(color: C.border), padding: const EdgeInsets.symmetric(vertical: 10), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                      child: const Text('Navigate', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ]),
            ],
          ]),
        ),
      ]),
    );
  }
}