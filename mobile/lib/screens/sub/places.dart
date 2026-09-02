import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../api/api.dart';
import '../../state/data.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';
import 'airport_map.dart';

/// A dedicated screen for a single airport category (Lounges, Restaurants,
/// Shops, Medical, Transportation). Data comes from the airport map nodes and,
/// optionally, bookable CYCLONE services. "View on Map" opens the shared map.
class PlacesListScreen extends StatefulWidget {
  final String title;
  final IconData icon;
  final String intro;
  final List<String> types;
  final List<String> serviceCats;
  const PlacesListScreen({
    super.key,
    required this.title,
    required this.icon,
    required this.intro,
    required this.types,
    this.serviceCats = const [],
  });
  @override
  State<PlacesListScreen> createState() => _PlacesListScreenState();
}

class _PlacesListScreenState extends State<PlacesListScreen> {
  List<Map<String, dynamic>> _nodes = [];
  List<Map<String, dynamic>> _services = [];
  String _busyId = '';
  bool _loaded = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final r = await Api.get('/api/airports/CAI/map');
      List<Map<String, dynamic>> svc = [];
      if (widget.serviceCats.isNotEmpty) {
        final s = await Api.get('/api/services');
        svc = (s['services'] as List? ?? <dynamic>[])
            .cast<Map<String, dynamic>>()
            .where((m) => widget.serviceCats.contains((m['category'] as String?) ?? ''))
            .toList();
      }
      if (!mounted) return;
      setState(() {
        _nodes = (r['nodes'] as List? ?? <dynamic>[]).cast<Map<String, dynamic>>();
        _services = svc;
        _loaded = true;
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
    final places = _nodes.where((n) => widget.types.contains((n['type'] as String?) ?? '')).toList();
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
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
                  Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(color: C.primary, borderRadius: BorderRadius.circular(12)),
                    child: Icon(widget.icon, color: Colors.white, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Cairo International Airport', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13.5, color: C.primaryDark)),
                      const SizedBox(height: 3),
                      Text(widget.intro, style: const TextStyle(color: C.primaryDark, fontSize: 12)),
                    ]),
                  ),
                ]),
              ),
              const SizedBox(height: 12),
              SecondaryBtn(
                label: 'View on Map',
                icon: Icons.map_outlined,
                onPressed: () => push(context, const AirportMapScreen()),
              ),
              if (_services.isNotEmpty) ...[
                const SectionTitle('Book a service'),
                for (final svc in _services) ...[
                  _serviceCard(svc),
                  const SizedBox(height: 12),
                ],
              ],
              SectionTitle(widget.title),
              const SizedBox(height: 6),
              if (!_loaded)
                const Padding(padding: EdgeInsets.all(8), child: Center(child: CircularProgressIndicator(color: C.primary)))
              else if (places.isEmpty)
                const EmptyState(icon: Icons.place_outlined, title: 'Nothing listed here yet')
              else
                for (final n in places) ...[
                  _placeCard(n),
                  const SizedBox(height: 12),
                ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _placeCard(Map<String, dynamic> n) {
    return CyCard(
      padding: const EdgeInsets.all(14),
      child: Row(children: [
        Icon(widget.icon, color: C.primary, size: 22),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(n['name']?.toString() ?? 'Place', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14.5)),
            const SizedBox(height: 3),
            Text('Terminal ${n['terminal']?.toString() ?? '—'} · ${_pretty(n['type']?.toString() ?? '')}', style: const TextStyle(color: C.text3, fontSize: 12)),
          ]),
        ),
        OutlinedButton(
          onPressed: () => push(context, const AirportMapScreen()),
          style: OutlinedButton.styleFrom(foregroundColor: C.primary, side: const BorderSide(color: C.border), padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
          child: const Text('Map', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
        ),
      ]),
    );
  }

  Widget _serviceCard(Map<String, dynamic> svc) {
    final busy = _busyId == svc['id'];
    final usable = svc['usable'] == true;
    return CyCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            width: 40, height: 40,
            decoration: const BoxDecoration(color: Color(0xFFEAF2FF), borderRadius: BorderRadius.all(Radius.circular(12))),
            child: Icon(Icons.weekend_outlined, color: C.primary, size: 20),
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(svc['name']?.toString() ?? 'Service', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
              Text(svc['category']?.toString() ?? '', style: const TextStyle(color: C.text3, fontSize: 11.5)),
            ]),
          ),
          if (svc['requiresPremium'] == true) const StatusBadge('premium', label: 'Premium'),
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

  String _pretty(String s) => s.replaceAll('_', ' ');
}