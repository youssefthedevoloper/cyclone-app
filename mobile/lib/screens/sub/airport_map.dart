import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../api/api.dart';
import '../../state/data.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';
import 'airport_categories.dart';

class AirportMapScreen extends StatefulWidget {
  const AirportMapScreen({super.key});
  @override
  State<AirportMapScreen> createState() => _AirportMapScreenState();
}

class _AirportMapScreenState extends State<AirportMapScreen> {
  List<Map<String, dynamic>> _nodes = [];
  List<Map<String, dynamic>> _edges = [];
  String? _fromId;
  String? _toId;
  RouteResult? _route;
  String _query = '';

  @override
  void initState() {
    super.initState();
    final data = context.read<AppData>();
    if (data.airports == null || data.airports!.isEmpty) data.loadAirports();
    _load('CAI');
  }

  Future<void> _load(String code) async {
    try {
      final r = await Api.get('/api/airports/$code/map');
      if (!mounted) return;
      setState(() {
        final nodes = (r['nodes'] as List? ?? <dynamic>[]).cast<Map<String, dynamic>>();
        _nodes = nodes;
        _edges = (r['edges'] as List? ?? <dynamic>[]).cast<Map<String, dynamic>>();
        Map<String, dynamic>? entrance;
        for (var i = 0; i < nodes.length; i++) {
          if ((nodes[i]['type'] as String?) == 'entrance') { entrance = nodes[i]; break; }
        }
        _fromId = (entrance?['id'] ?? (nodes.isNotEmpty ? nodes.first['id'] : null)) as String?;
        _toId = null;
        _route = null;
      });
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    }
  }

  Future<void> _navigate() async {
    final from = _fromId;
    final to = _toId;
    if (from == null || to == null) {
      toast(context, 'Choose a destination first', error: true);
      return;
    }
    if (from == to) {
      setState(() => _route = null);
      toast(context, 'Pick a different destination', error: true);
      return;
    }
    try {
      final r = await Api.get('/api/airports/navigate?code=CAI&from=$from&to=$to');
      if (!mounted) return;
      setState(() {
        if (r['found'] == true) {
          final route = ((r['route'] as List?) ?? <dynamic>[]).cast<Map<String, dynamic>>();
          _route = RouteResult(
            routeIds: [for (final n in route) n['nodeId']?.toString() ?? ''],
            distance: (r['distance'] as num?)?.round() ?? 0,
            time: (r['walkingTime'] as num?)?.round() ?? 0,
          );
        } else {
          _route = null;
        }
      });
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    }
  }

  String _nodeName(String? id) {
    for (final n in _nodes) {
      if (n['id'] == id) return n['name']?.toString() ?? 'Node';
    }
    return 'Node';
  }

  @override
  Widget build(BuildContext context) {
    final airports = (context.watch<AppData>().airports ?? <dynamic>[]).cast<Map<String, dynamic>>();
    final q = _query;
    final visible = q.isEmpty
        ? _nodes
        : _nodes.where((n) {
            final name = (n['name'] as String?)?.toLowerCase() ?? '';
            final type = (n['type'] as String?)?.toLowerCase() ?? '';
            return name.contains(q) || type.contains(q);
          }).toList();
    final current = _nodeName(_toId ?? _fromId);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Airport Map'),
        actions: [
          IconButton(
            onPressed: () => push(context, const AirportCategoriesScreen()),
            icon: const Icon(Icons.category_outlined),
            tooltip: 'Browse categories',
          ),
        ],
      ),
      body: wrapWeb(
        Column(children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 6, 16, 6),
            child: DropdownButtonFormField<String>(
              initialValue: 'CAI',
              items: [
                for (final a in airports)
                  DropdownMenuItem(value: (a['code'] as String?) ?? '', child: Text('${a['name']}  (${a['code']})', overflow: TextOverflow.ellipsis)),
              ],
              onChanged: (v) {
                if (v != null) _load(v);
              },
              decoration: fieldDecoration(hint: 'Airport'),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
            child: TextField(
              onChanged: (v) => setState(() => _query = v.trim().toLowerCase()),
              decoration: fieldDecoration(hint: 'Search gates & services…'),
            ),
          ),
          Expanded(
            child: LayoutBuilder(builder: (context, box) {
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: CustomPaint(
                  size: Size(box.maxWidth, box.maxHeight),
                  painter: _MapPainter(nodes: visible, edges: _edges, routeIds: _route?.routeIds ?? const []),
                  child: Stack(children: [
                    for (final n in visible)
                      Positioned(
                        left: ((n['x'] as num?) ?? 0) / 100 * box.maxWidth - 14,
                        top: ((n['y'] as num?) ?? 0) / 100 * box.maxHeight - 14,
                        child: GestureDetector(
                          onTap: () {
                            final id = n['id'] as String? ?? '';
                            if (id.isNotEmpty) {
                              setState(() => _toId = id);
                              _navigate();
                            }
                          },
                          child: Tooltip(
                            message: n['name']?.toString() ?? '',
                            child: Container(
                              width: 28, height: 28,
                              decoration: BoxDecoration(
                                color: _nodeColor(n['type']?.toString() ?? ''),
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2),
                              ),
                              child: Icon(_nodeIcon(n['type']?.toString() ?? ''), size: 14, color: Colors.white),
                            ),
                          ),
                        ),
                      ),
                  ]),
                ),
              );
            }),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 6, 16, 0),
            child: Row(children: [
              Expanded(child: _nodePicker(hint: 'From', value: _fromId, onChanged: (v) => setState(() => _fromId = v))),
              const Padding(padding: EdgeInsets.symmetric(horizontal: 8), child: Icon(Icons.arrow_forward, color: C.text3, size: 18)),
              Expanded(child: _nodePicker(hint: 'To', value: _toId, onChanged: (v) {
                setState(() => _toId = v);
                _navigate();
              })),
            ]),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: PrimaryBtn(label: 'Navigate', icon: Icons.directions, onPressed: _navigate),
          ),
          if (_route != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: CyCard(
                color: const Color(0xFFEAF2FF),
                border: Border.all(color: const Color(0xFFCFE0FB)),
                padding: const EdgeInsets.all(12),
                child: Row(children: [
                  const Icon(Icons.near_me, color: C.primary, size: 18),
                  const SizedBox(width: 8),
                  Expanded(flex: 3, child: Text(current, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13), overflow: TextOverflow.ellipsis)),
                  const SizedBox(width: 8),
                  Expanded(flex: 2, child: Text('${_route!.distance} m', textAlign: TextAlign.right, style: const TextStyle(color: C.text2, fontWeight: FontWeight.w700))),
                  Expanded(flex: 2, child: Text('${_route!.time} min walk', textAlign: TextAlign.right, style: const TextStyle(color: C.text2, fontWeight: FontWeight.w700))),
                ]),
              ),
            ),
        ]),
      ),
    );
  }

  Widget _nodePicker({required String hint, String? value, required void Function(String?) onChanged}) {
    return InputDecorator(
      decoration: fieldDecoration(hint: hint),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          isExpanded: true,
          isDense: true,
          hint: Text(hint, style: const TextStyle(color: C.text3)),
          items: _nodes.isEmpty
              ? null
              : [
                  for (final n in _nodes)
                    DropdownMenuItem(value: (n['id'] as String?) ?? '', child: Text(n['name']?.toString() ?? '', overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13))),
                ],
          onChanged: onChanged,
        ),
      ),
    );
  }

  IconData _nodeIcon(String type) {
    switch (type) {
      case 'entrance':
        return Icons.login;
      case 'checkin':
      case 'baggage':
        return Icons.luggage_outlined;
      case 'security':
      case 'passport':
      case 'immigration':
        return Icons.security;
      case 'gate':
      case 'boarding':
        return Icons.flight;
      case 'lounge':
        return Icons.weekend_outlined;
      case 'restaurant':
        return Icons.restaurant_outlined;
      case 'shop':
        return Icons.shopping_bag_outlined;
      case 'atm':
        return Icons.payments_outlined;
      case 'medical':
        return Icons.local_hospital_outlined;
      case 'lostfound':
        return Icons.search_outlined;
      case 'transport':
        return Icons.directions_bus_outlined;
      case 'parking':
        return Icons.local_parking;
      case 'bathroom':
        return Icons.wc;
      case 'priority':
        return Icons.bolt;
      default:
        return Icons.circle;
    }
  }

  Color _nodeColor(String type) {
    switch (type) {
      case 'gate':
      case 'boarding':
        return C.primary;
      case 'security':
      case 'passport':
      case 'immigration':
        return const Color(0xFFDC2626);
      case 'lounge':
        return const Color(0xFF7C3AED);
      case 'restaurant':
        return const Color(0xFFD97706);
      case 'shop':
        return const Color(0xFF0F9D58);
      case 'medical':
        return const Color(0xFFDB2777);
      case 'entrance':
      case 'transport':
      case 'parking':
        return const Color(0xFF52678A);
      default:
        return const Color(0xFF8A97AD);
    }
  }
}

class RouteResult {
  final List<String> routeIds;
  final int distance;
  final int time;
  RouteResult({required this.routeIds, required this.distance, required this.time});
}

class _MapPainter extends CustomPainter {
  final List<Map<String, dynamic>> nodes;
  final List<Map<String, dynamic>> edges;
  final List<String> routeIds;
  _MapPainter({required this.nodes, required this.edges, required this.routeIds});

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final pos = <String, Offset>{};
    for (final n in nodes) {
      pos[n['id']?.toString() ?? ''] = Offset(((n['x'] as num?) ?? 0) / 100 * w, ((n['y'] as num?) ?? 0) / 100 * h);
    }
    final edgePaint = Paint()
      ..color = Color(0xFFD8E0EC)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    for (final e in edges) {
      final a = pos[e['fromNodeId']?.toString() ?? ''];
      final b = pos[e['toNodeId']?.toString() ?? ''];
      if (a == null || b == null) continue;
      canvas.drawLine(a, b, edgePaint);
    }
    if (routeIds.length > 1) {
      final routePaint = Paint()
        ..color = C.primary
        ..strokeWidth = 4
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;
      for (var i = 0; i < routeIds.length - 1; i++) {
        final a = pos[routeIds[i]];
        final b = pos[routeIds[i + 1]];
        if (a == null || b == null) continue;
        canvas.drawLine(a, b, routePaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _MapPainter old) {
    return old.edges != edges || old.nodes != nodes || old.routeIds != routeIds;
  }
}