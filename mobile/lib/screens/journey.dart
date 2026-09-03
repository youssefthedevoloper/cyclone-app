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
      toast(context, earned > 0 ? 'Step completed — +$earned pts' : 'Step completed', error: false);
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
      body: j == null
          ? const Center(child: CircularProgressIndicator(color: C.primary))
          : wrapWeb(RefreshIndicator(
              onRefresh: data.loadJourney,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(C.pad, 16, C.pad, 28),
                children: [
                  const Text('Journey', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: C.text, letterSpacing: -0.4)),
                  const SizedBox(height: 2),
                  const Text('Where you are, and what\'s next', style: TextStyle(color: C.text3, fontSize: 13.5)),
                  const SizedBox(height: 16),
                  ..._content(j as Map<String, dynamic>),
                ],
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
          action: SecondaryBtn(label: 'Go to tickets', icon: Icons.airplane_ticket_outlined, onPressed: () => push(context, const TicketsScreen())),
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
    final allDone = done == steps.length && steps.isNotEmpty;

    Map<String, dynamic>? currentStep;
    for (final s in steps) {
      if ((s['status'] as String?) == 'current') { currentStep = s; break; }
    }
    if (currentStep == null) {
      for (final s in steps) {
        if ((s['status'] as String?) == 'upcoming') { currentStep = s; break; }
      }
    }
    if (currentStep == null && steps.isNotEmpty) currentStep = steps.first;
    final currentIndex = steps.indexWhere((s) => identical(s, currentStep));

    final list = <Widget>[];

    // Hero progress panel
    list.add(HeroPanel(
      icon: Icons.route,
      title: airport,
      subtitle: allDone ? 'Journey complete — enjoy your trip!' : 'Follow each step to reach boarding',
      value: allDone ? '100%' : '${progress.round()}%',
      valueLabel: '$done of ${steps.length} steps complete',
      progress: ClipRRect(
        borderRadius: BorderRadius.circular(999),
        child: LinearProgressIndicator(
          value: (progress / 100).clamp(0, 1),
          minHeight: 9,
          backgroundColor: Colors.white24,
          color: Colors.white,
        ),
      ),
    ));

    if (isDemo) {
      list.add(CyCard(
        margin: const EdgeInsets.only(top: 12),
        color: C.primarySoft,
        border: Border.all(color: C.primaryLine),
        child: Row(children: [
          const Icon(Icons.science_outlined, color: C.primary),
          const SizedBox(width: 10),
          const Expanded(child: Text('You are on a demo journey linked to your demo ticket.', style: TextStyle(color: C.primaryDark, fontSize: 13))),
        ]),
      ));
    }

    // Current step spotlight (reference: large blue card + Step X of Y + dots)
    if (!allDone && currentStep != null) {
      list.add(const SizedBox(height: 16));
      list.add(Row(children: [
        Expanded(
          child: Text('Step ${currentIndex + 1} of ${steps.length}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: C.text)),
        ),
        JourneyProgressDots(total: steps.length, current: currentIndex),
      ]));
      list.add(const SizedBox(height: 12));
      list.add(_currentStepCard(context, currentStep));
    }

    if (allDone) {
      list.add(CyCard(
        margin: const EdgeInsets.only(top: 16),
        color: C.successSoft,
        border: Border.all(color: const Color(0xFFBFE5CF)),
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

    list.add(const SectionHeader('Your steps', subtitle: 'Your journey at a glance'));

    for (var i = 0; i < steps.length; i++) {
      list.add(_stepTile(i, steps[i]));
    }
    return list;
  }

  Widget _currentStepCard(BuildContext context, Map<String, dynamic> s) {
    final id = s['id'] as String? ?? '';
    final nav = s['navigation'] is Map ? s['navigation'] as Map : null;
    final title = s['title']?.toString() ?? 'Next step';
    final desc = s['description']?.toString() ?? '';
    final instructions = s['instructions']?.toString() ?? '';

    return CyCard(
      padding: const EdgeInsets.all(20),
      color: C.primary,
      border: Border.all(color: C.primary),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(999)),
            child: const Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.my_location, color: Colors.white, size: 15),
              SizedBox(width: 6),
              Text('You are here', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800)),
            ]),
          ),
        ]),
        const SizedBox(height: 14),
        Text(title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: Colors.white, letterSpacing: -0.3)),
        if (desc.isNotEmpty) ...[
          const SizedBox(height: 8),
          Text(desc, style: const TextStyle(color: Colors.white70, fontSize: 13.5, height: 1.4)),
        ],
        if (instructions.isNotEmpty) ...[
          const SizedBox(height: 8),
          Text('“$instructions”', style: const TextStyle(color: Colors.white, fontSize: 12.5, fontStyle: FontStyle.italic)),
        ],
        const SizedBox(height: 16),
        Row(children: [
          Expanded(
            child: FilledButton(
              onPressed: _busy ? null : () => completeStep(id),
              style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: C.primary, padding: const EdgeInsets.symmetric(vertical: 13), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(C.radiusSmall))),
              child: _busy ? const SizedBox(width: 17, height: 17, child: CircularProgressIndicator(strokeWidth: 2, color: C.primary)) : const Text('Complete step', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700)),
            ),
          ),
          if (nav != null && nav['id'] != null) ...[
            const SizedBox(width: 10),
            Expanded(
              child: OutlinedButton(
                onPressed: () => push(context, const AirportMapScreen()),
                style: OutlinedButton.styleFrom(foregroundColor: Colors.white, side: const BorderSide(color: Colors.white38), padding: const EdgeInsets.symmetric(vertical: 13), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(C.radiusSmall))),
                child: const Text('Navigate', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ]),
      ]),
    );
  }

  Widget _stepTile(int index, Map<String, dynamic> s) {
    final status = (s['status'] as String?) ?? 'upcoming';
    final isComplete = status == 'completed';
    final isCurrent = status == 'current';
    final nav = s['navigation'] is Map ? s['navigation'] as Map : null;

    return JourneyStep(
      title: s['title']?.toString() ?? 'Step ${index + 1}',
      description: s['description']?.toString(),
      instructions: s['instructions']?.toString(),
      status: status,
      trailing: nav != null && nav['type'] != null ? DotBadge(nav['type'].toString()) : null,
      onTap: (isCurrent || !isComplete) && nav != null && nav['id'] != null ? () => push(context, const AirportMapScreen()) : null,
    );
  }
}
