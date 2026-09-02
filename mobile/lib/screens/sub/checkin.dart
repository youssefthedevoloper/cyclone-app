import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../api/api.dart';
import '../../state/data.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';
import 'airport_map.dart';
import 'tickets.dart';

/// Dedicated Check-in page: the check-in step of your journey with flight
/// summary and a one-tap "checked in" action.
class CheckinScreen extends StatefulWidget {
  const CheckinScreen({super.key});
  @override
  State<CheckinScreen> createState() => _CheckinScreenState();
}

class _CheckinScreenState extends State<CheckinScreen> {
  bool _busy = false;

  Map<String, dynamic>? _checkinStep(Map<String, dynamic> journey) {
    for (final s in ((journey['steps'] as List?) ?? <dynamic>[]).cast<Map<String, dynamic>>()) {
      final nav = s['navigation'];
      if (nav is Map && (nav['type'] as String?) == 'checkin') return s;
      if ((s['title']?.toString().toLowerCase().contains('check-in')) ?? false) return s;
    }
    return null;
  }

  Future<void> _complete(String stepId) async {
    setState(() => _busy = true);
    try {
      final res = await Api.post('/api/journey/steps/$stepId/complete');
      final earned = (res['pointsEarned'] as num?)?.toInt() ?? 0;
      if (!mounted) return;
      await context.read<AppData>().refresh(['journey', 'loyalty']);
      if (!mounted) return;
      toast(context, earned > 0 ? 'Checked in · +$earned pts' : 'Checked in ✓');
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final data = context.watch<AppData>();
    final j = data.journey;
    final access = j?['access'] as String? ?? 'required';
    final journey = (j?['journey'] is Map) ? j!['journey'] as Map<String, dynamic> : null;
    final step = journey == null ? null : _checkinStep(journey);
    final status = step?['status'] as String? ?? 'upcoming';
    final f = (journey?['flight'] is Map) ? journey!['flight'] as Map<String, dynamic> : null;

    return Scaffold(
      appBar: AppBar(title: const Text('Check-in')),
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
                  text: (j?['reason'] as String?) ?? 'Link a ticket to unlock check-in.',
                  action: SecondaryBtn(label: 'Go to tickets', icon: Icons.airplane_ticket_outlined, onPressed: () => push(context, const TicketsScreen())),
                )
              else if (f != null) ...[
                _flightCard(f),
                const SizedBox(height: 16),
                if (step == null)
                  const EmptyState(icon: Icons.checklist, title: 'No check-in step', text: 'Your journey does not include check-in yet.')
                else
                  CyCard(
                    color: status == 'completed' ? const Color(0xFFEAF7E8) : const Color(0xFFEAF2FF),
                    border: Border.all(color: status == 'completed' ? const Color(0xFFBFE3B8) : const Color(0xFFCFE0FB)),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        Icon(status == 'completed' ? Icons.check_circle : Icons.login_outlined, color: status == 'completed' ? C.success : C.primary),
                        const SizedBox(width: 8),
                        const Text('Check-in', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: C.text)),
                        const Spacer(),
                        StatusBadge(status),
                      ]),
                      const SizedBox(height: 8),
                      Text(step['description']?.toString() ?? '', style: const TextStyle(color: C.text2, fontSize: 12.5, height: 1.4)),
                      if (step['instructions'] != null) ...[
                        const SizedBox(height: 6),
                        Text('→ ${step['instructions']}', style: const TextStyle(color: C.text3, fontSize: 12)),
                      ],
                    ]),
                  ),
                const SizedBox(height: 16),
                if (status == 'completed')
                  const OutlineBtn(label: 'Done — boarding next', icon: Icons.verified)
                else if (access == 'personal' || step != null) ...[
                  FilledButton(
                    onPressed: status != 'current' || _busy ? null : () => _complete(step!['id'] as String? ?? ''),
                    style: FilledButton.styleFrom(backgroundColor: C.primary, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    child: _busy
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white))
                        : Text(status == 'current' ? 'Complete check-in' : 'Complete earlier steps first', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  ),
                  const SizedBox(height: 10),
                  SecondaryBtn(label: 'Find check-in on the map', icon: Icons.map_outlined, onPressed: () => push(context, const AirportMapScreen())),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _flightCard(Map<String, dynamic> f) {
    return CyCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.airplane_ticket_outlined, size: 20, color: C.primary),
          const SizedBox(width: 8),
          Expanded(child: Text('${f['airline'] ?? 'CYCLONE'} · ${f['flightNumber'] ?? 'Flight'}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16))),
          StatusBadge((f['status'] ?? 'Scheduled').toString()),
        ]),
        const SizedBox(height: 12),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(f['origin'] ?? '—', style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w900)),
          const Icon(Icons.arrow_forward, color: C.text3),
          Text(f['destination'] ?? '—', style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w900)),
        ]),
        const SizedBox(height: 10),
        Row(children: [
          if (f['terminal'] != null) ...[
            const Icon(Icons.location_on_outlined, size: 15, color: C.text3),
            const SizedBox(width: 4),
            Text('Terminal ${f['terminal']}', style: const TextStyle(fontSize: 12.5, color: C.text2)),
          ],
          if (f['gate'] != null) ...[
            const SizedBox(width: 14),
            const Icon(Icons.signpost_outlined, size: 15, color: C.text3),
            const SizedBox(width: 4),
            Text('Gate ${f['gate']}', style: const TextStyle(fontSize: 12.5, color: C.text2)),
          ],
        ]),
      ]),
    );
  }
}