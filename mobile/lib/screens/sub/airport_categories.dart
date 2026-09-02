import 'package:flutter/material.dart';

import '../../api/api.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';
import 'airport_map.dart';

/// Browser for airport locations grouped by category (from /api/airports/locations).
class AirportCategoriesScreen extends StatefulWidget {
  const AirportCategoriesScreen({super.key});
  @override
  State<AirportCategoriesScreen> createState() => _AirportCategoriesScreenState();
}

class _AirportCategoriesScreenState extends State<AirportCategoriesScreen> {
  Map<String, dynamic>? _data;
  String _filter = 'All';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final r = await Api.get('/api/airports/locations?code=CAI');
      if (!mounted) return;
      setState(() => _data = r);
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final locations = ((_data?['locations'] as List?) ?? <dynamic>[]).cast<Map<String, dynamic>>();
    final airportName = (_data?['airport'] is Map) ? (_data!['airport'] as Map)['name']?.toString() ?? 'Airport' : 'Airport';
    final cats = <String>['All'];
    for (final l in locations) {
      final t = l['type']?.toString() ?? '';
      if (t.isNotEmpty && !cats.contains(t)) cats.add(t);
    }
    final visible = _filter == 'All' ? locations : locations.where((l) => (l['type'] as String?) == _filter).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Airport locations')),
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
                  const Icon(Icons.map_outlined, color: C.primary),
                  const SizedBox(width: 10),
                  Expanded(child: Text(airportName, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: C.primaryDark))),
                  FilledButton(
                    onPressed: () => push(context, const AirportMapScreen()),
                    style: FilledButton.styleFrom(backgroundColor: C.primary, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                    child: const Text('Map', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5)),
                  ),
                ]),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 40,
                child: ListView(scrollDirection: Axis.horizontal, children: [
                  for (final c in cats)
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(_pretty(c)),
                        selected: _filter == c,
                        onSelected: (_) => setState(() => _filter = c),
                        selectedColor: C.primary,
                        labelStyle: TextStyle(color: _filter == c ? Colors.white : C.text2, fontWeight: FontWeight.w700, fontSize: 12),
                        backgroundColor: C.surface,
                        side: const BorderSide(color: C.border),
                      ),
                    ),
                ]),
              ),
              const SizedBox(height: 6),
              if (_data == null)
                const Padding(padding: EdgeInsets.all(8), child: Center(child: CircularProgressIndicator(color: C.primary)))
              else if (visible.isEmpty)
                const EmptyState(icon: Icons.map_outlined, title: 'Nothing here')
              else
                for (final l in visible) ...[
                  Padding(
                    padding: const EdgeInsets.only(top: 14),
                    child: Row(children: [
                      Text(_pretty(l['type']?.toString() ?? '').toUpperCase(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 0.5, color: C.text3)),
                      const Spacer(),
                    ]),
                  ),
                  const SizedBox(height: 6),
                  CyCard(
                    padding: EdgeInsets.zero,
                    child: Column(children: ((l['items'] as List?) ?? <dynamic>[]).cast<Map<String, dynamic>>().map((n) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                        child: Row(children: [
                          Icon(Icons.location_on_outlined, size: 17, color: C.primary),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(n['name']?.toString() ?? 'Location', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13.5)),
                              Text('Terminal ${n['terminal']?.toString() ?? '—'}', style: const TextStyle(color: C.text3, fontSize: 11.5)),
                            ]),
                          ),
                          const Icon(Icons.chevron_right, size: 18, color: C.text3),
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

  String _pretty(String s) => s.replaceAll('_', ' ');
}