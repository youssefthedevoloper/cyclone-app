import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../api/api.dart';
import '../../state/auth.dart';
import '../../state/data.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});
  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  List<Map<String, dynamic>>? _services;
  List<Map<String, dynamic>>? _history;
  String _busyId = '';
  String _filter = 'All';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final s = await Api.get('/api/services');
      final h = await Api.get('/api/services/history/mine');
      if (!mounted) return;
      setState(() {
        _services = (s['services'] as List? ?? <dynamic>[]).cast<Map<String, dynamic>>();
        _history = (h['transactions'] as List? ?? <dynamic>[]).cast<Map<String, dynamic>>();
      });
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    }
  }

  Future<void> _use(Map<String, dynamic> svc) async {
    setState(() => _busyId = svc['id'] as String? ?? '');
    try {
      final res = await Api.post('/api/services/${svc['id']}/use');
      if (!mounted) return;
      await context.read<AppData>().refresh(['loyalty', 'notifications']);
      await _load();
      if (!mounted) return;
      toast(context, '${svc['name']} confirmed · +${res['pointsEarned'] ?? 0} points');
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _busyId = '');
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final services = _services ?? [];
    final cats = <String>['All'];
    for (final s in services) {
      final c = s['category']?.toString() ?? '';
      if (c.isNotEmpty && !cats.contains(c)) cats.add(c);
    }
    final visible = _filter == 'All' ? services : services.where((s) => (s['category'] as String?) == _filter).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Airport services')),
      body: wrapWeb(
        RefreshIndicator(
          onRefresh: _load,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              CyCard(
                color: const Color(0xFFEAF2FF),
                border: Border.all(color: const Color(0xFFCFE0FB)),
                child: Row(children: [
                  const Icon(Icons.room_service_outlined, color: C.primary),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(auth.isPremium ? 'Premium member' : 'Free plan', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13.5, color: C.primaryDark)),
                      const SizedBox(height: 2),
                      const Text('Premium-only services unlock with Premium.', style: TextStyle(color: C.primaryDark, fontSize: 12.5)),
                    ]),
                  ),
                ]),
              ),
              const SizedBox(height: 14),
              SizedBox(
                height: 38,
                child: ListView(scrollDirection: Axis.horizontal, children: [
                  for (final c in cats)
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(c),
                        selected: _filter == c,
                        onSelected: (_) => setState(() => _filter = c),
                        selectedColor: C.primary,
                        labelStyle: TextStyle(color: _filter == c ? Colors.white : C.text2, fontWeight: FontWeight.w700, fontSize: 12.5),
                        backgroundColor: C.surface,
                        side: const BorderSide(color: C.border),
                      ),
                    ),
                ]),
              ),
              const SizedBox(height: 14),
              if (_services == null)
                const Padding(padding: EdgeInsets.all(8), child: Center(child: CircularProgressIndicator(color: C.primary)))
              else if (visible.isEmpty)
                const EmptyState(icon: Icons.room_service_outlined, title: 'No services here')
              else
                for (final svc in visible) ...[
                  _serviceCard(svc),
                  const SizedBox(height: 12),
                ],
              if (_history != null && _history!.isNotEmpty) ...[
                const SectionTitle('Your bookings'),
                CyCard(
                  padding: EdgeInsets.zero,
                  child: Column(children: _history!.take(8).map((h) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                      child: Row(children: [
                        Container(
                          width: 34, height: 34,
                          decoration: BoxDecoration(color: C.successSoft, borderRadius: BorderRadius.circular(10)),
                          child: const Icon(Icons.check, size: 17, color: C.success),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(h['serviceName']?.toString() ?? 'Service', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13.5, color: C.text)),
                            Text('${h['amount'] != null ? '\$${h['amount']} · ' : ''}+${h['pointsEarned'] ?? 0} pts', style: const TextStyle(color: C.text3, fontSize: 11.5)),
                          ]),
                        ),
                        Text(fmtDate(h['createdAt']?.toString() ?? ''), style: const TextStyle(color: C.text3, fontSize: 11)),
                      ]),
                    );
                  }).toList()),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _serviceCard(Map<String, dynamic> svc) {
    final requiresPremium = svc['requiresPremium'] == true;
    final busy = _busyId == svc['id'];
    final usable = svc['usable'] == true;

    return CyCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            width: 40, height: 40,
            decoration: const BoxDecoration(color: Color(0xFFEAF2FF), borderRadius: BorderRadius.all(Radius.circular(12))),
            child: Icon(_iconFor(svc['category']?.toString() ?? ''), color: C.primary, size: 20),
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(svc['name']?.toString() ?? 'Service', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
              Text(svc['category']?.toString() ?? '', style: const TextStyle(color: C.text3, fontSize: 11.5)),
            ]),
          ),
          if (requiresPremium) StatusBadge('premium', label: 'Premium'),
        ]),
        const SizedBox(height: 8),
        Text(svc['description']?.toString() ?? '', style: const TextStyle(color: C.text2, fontSize: 12.5, height: 1.35)),
        const SizedBox(height: 12),
        Row(children: [
          Text('Earns ', style: const TextStyle(color: C.text3, fontSize: 12.5)),
          PointsChip((svc['pointsReward'] as num?)?.toInt() ?? 0),
          const Spacer(),
          if (!usable)
            const Text('Premium required', style: TextStyle(color: C.text3, fontSize: 12))
          else
            FilledButton(
              onPressed: busy ? null : () => _use(svc),
              style: FilledButton.styleFrom(backgroundColor: C.primary, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 9), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
              child: busy ? const SizedBox(width: 15, height: 15, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Book', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
            ),
        ]),
      ]),
    );
  }

  IconData _iconFor(String cat) {
    switch (cat.toLowerCase()) {
      case 'lounge':
        return Icons.weekend_outlined;
      case 'assistance':
        return Icons.support_agent_outlined;
      case 'navigation':
        return Icons.navigation_outlined;
      default:
        return Icons.room_service_outlined;
    }
  }
}