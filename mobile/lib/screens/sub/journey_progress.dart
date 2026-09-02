import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../api/api.dart';
import '../../state/data.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';
import 'airport_map.dart';
import 'checkin.dart';
import 'flight_details.dart';
import 'tickets.dart';

/// Dedicated Journey Progress page: overall progress plus every step with
/// complete / navigate actions. Mirrors the Journey tab as a standalone screen.
class JourneyProgressScreen extends StatefulWidget {
  const JourneyProgressScreen({super.key});
  @override
  State<JourneyProgressScreen> createState() => _JourneyProgressScreenState();
}

class _JourneyProgressScreenState extends State<JourneyProgressScreen> {
  String _busyId = '';

  Future<void> _complete(String stepId) async {
    setState(() => _busyId = stepId);
    try {
      final res = await Api.post('/api/journey/steps/$stepId/complete');
      final earned = (res['pointsEarned'] as num?)?.toInt() ?? 0;
      if (!mounted) return;
      await context.read<AppData>().refresh(['journey', 'loyalty']);
      if (!mounted) return;
      toast(context, earned > 0 ? 'Step completed · +$earned pts' : 'Step completed', error: false);
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _busyId = '');
    }
  }

  @override
  Widget build(BuildContext context) {
    final data = context.watch<AppData>();
    final j = data.journey;
    final access = j?['access'] as String? ?? 'required';
    final journey = (j?['journey'] is Map) ? j!['journey'] as Map<String, dynamic> : null;

    return Scaffold(
      appBar: AppBar(title: const Text('Journey Progress')),
      body: wrapWeb(
        RefreshIndicator(
          onRefresh: data.loadJourney,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              if (access == 'required')
                EmptyState(
                  icon: Icons.flight_takeoff,
                  title: 'A ticket is required',
                  text: (j?['reason'] as String?) ?? 'Link a ticket to start your personalized journey.',
                  action: SecondaryBtn(label: 'Go to tickets', icon: Icons.airplane_ticket_outlined, onPressed: () => push(context, const TicketsScreen())),
                )
              else if (journey == null)
                const EmptyState(icon: Icons.route, title: 'No journey yet', text: 'Your journey will appear here.')
              else ...[
                _progressCard(journey),
                const SizedBox(height: 12),
                Row(children: [
                  Expanded(child: SecondaryBtn(label: 'Flight details', icon: Icons.flight, onPressed: () => push(context, const FlightDetailsScreen()))),
                  const SizedBox(width: 10),
                  Expanded(child: SecondaryBtn(label: 'Check-in', icon: Icons.checklist, onPressed: () => push(context, const CheckinScreen()))),
                ]),
                const SizedBox(height: 20),
                const SectionTitle('Your steps'),
                for (final s in ((journey['steps'] as List?) ?? <dynamic>[]).cast<Map<String, dynamic>>()) ...[
                  _stepTile(s),
                  const SizedBox(height: 12),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _progressCard(Map<String, dynamic> journey) {
    final steps = ((journey['steps'] as List?) ?? <dynamic>[]).cast<Map<String, dynamic>>();
    final done = steps.where((s) => (s['status'] as String?) == 'completed').length;
    final progress = ((journey['progress'] as num?) ?? 0) * 100;
    final airport = (journey['airport'] is Map) ? (journey['airport'] as Map)['name']?.toString() : null;
    final name = airport ?? 'Airport';
    return CyCard(
      color: const Color(0xFF0B2545),
      border: Border.all(color: const Color(0xFF0B2545)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.route, color: Colors.white, size: 20),
          const SizedBox(width: 8),
          Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
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
    );
  }

  Widget _stepTile(Map<String, dynamic> s) {
    final status = (s['status'] as String?) ?? 'upcoming';
    final isComplete = status == 'completed';
    final isCurrent = status == 'current';
    final busy = _busyId == s['id'];
    final nav = s['navigation'] is Map ? s['navigation'] as Map : null;

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
      padding: const EdgeInsets.all(14),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, color: color, size: 22),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(child: Text(s['title']?.toString() ?? 'Step', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14.5, color: C.text))),
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
                    width: 150,
                    child: FilledButton(
                      onPressed: busy ? null : () => _complete(s['id'] as String? ?? ''),
                      style: FilledButton.styleFrom(backgroundColor: C.primary, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 10), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                      child: busy ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Complete step', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
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