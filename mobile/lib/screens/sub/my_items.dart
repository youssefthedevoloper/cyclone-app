import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../api/api.dart';
import '../../state/data.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';
import 'item_detail.dart';

class MyItemsScreen extends StatefulWidget {
  const MyItemsScreen({super.key});
  @override
  State<MyItemsScreen> createState() => _MyItemsScreenState();
}

class _MyItemsScreenState extends State<MyItemsScreen> {
  @override
  void initState() {
    super.initState();
    final data = context.read<AppData>();
    if (data.items == null) data.loadItems();
  }

  void _addSheet() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _RegisterItemSheet(onDone: () async {
        if (!mounted) return;
        await context.read<AppData>().refresh(['items', 'loyalty', 'notifications']);
        if (!mounted) return;
        Navigator.of(context).pop();
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    final data = context.watch<AppData>();
    final items = (data.items ?? <dynamic>[]).cast<Map<String, dynamic>>();
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Items'),
        actions: [
          Padding(padding: const EdgeInsets.only(right: 8), child: IconButton(onPressed: _addSheet, icon: const Icon(Icons.add), tooltip: 'Register item')),
        ],
      ),
      body: wrapWeb(
        RefreshIndicator(
          onRefresh: data.loadItems,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              CyCard(
                margin: const EdgeInsets.only(bottom: 12),
                color: const Color(0xFFEAF2FF),
                border: Border.all(color: const Color(0xFFCFE0FB)),
                child: Row(children: [
                  const Icon(Icons.qr_code_2, color: C.primary),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Text('Register your belongings, then print or show their QR to identify them fast.', style: TextStyle(color: C.primaryDark, fontSize: 12.5)),
                  ),
                ]),
              ),
              if (items.isEmpty)
                const EmptyState(
                  icon: Icons.shopping_bag_outlined,
                  title: 'No items registered',
                  text: 'Each registered item gets a personal QR identifier and earns you +25 points.',
                  action: null,
                )
              else
                for (final it in items) ...[
                  _itemTile(it),
                  const SizedBox(height: 10),
                ],
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  Widget _itemTile(Map<String, dynamic> it) {
    final status = (it['status'] as String?) ?? 'safe';
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => push(context, ItemDetailScreen(itemId: it['id'] as String)),
      child: CyCard(
        padding: const EdgeInsets.all(14),
        child: Row(children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(color: const Color(0xFFEAF2FF), borderRadius: BorderRadius.circular(12)),
            child: Icon(_iconFor(it['category']?.toString() ?? ''), color: C.primary, size: 21),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(it['name']?.toString() ?? 'Item', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
              const SizedBox(height: 3),
              Text(it['category']?.toString() ?? '', style: const TextStyle(color: C.text3, fontSize: 12)),
            ]),
          ),
          const SizedBox(width: 8),
          StatusBadge(status),
          const SizedBox(width: 4),
          const Icon(Icons.chevron_right, size: 19, color: C.text3),
        ]),
      ),
    );
  }

  IconData _iconFor(String category) {
    switch (category.toLowerCase()) {
      case 'electronics':
        return Icons.devices_other;
      case 'baggage':
        return Icons.luggage_outlined;
      case 'documents':
        return Icons.description_outlined;
      case 'personal':
        return Icons.shopping_bag_outlined;
      case 'child':
      case 'children':
        return Icons.child_care;
      default:
        return Icons.shopping_bag_outlined;
    }
  }
}

class _RegisterItemSheet extends StatefulWidget {
  final VoidCallback onDone;
  const _RegisterItemSheet({required this.onDone});
  @override
  State<_RegisterItemSheet> createState() => _RegisterItemSheetState();
}

class _RegisterItemSheetState extends State<_RegisterItemSheet> {
  static const _cats = ['Electronics', 'Baggage', 'Documents', 'Personal', 'Luggage', 'Other'];
  bool _busy = false;
  final _name = TextEditingController();
  final _desc = TextEditingController();
  String _cat = _cats.first;

  @override
  void dispose() {
    _name.dispose();
    _desc.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_name.text.trim().isEmpty) {
      toast(context, 'Give your item a name', error: true);
      return;
    }
    setState(() => _busy = true);
    try {
      final res = await Api.post('/api/items', {
        'name': _name.text.trim(),
        'category': _cat,
        'description': _desc.text.trim().isEmpty ? null : _desc.text.trim(),
      });
      final pts = (res['pointsEarned'] as num?)?.toInt() ?? 0;
      widget.onDone();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(pts > 0 ? 'Item registered · +$pts points' : 'Item registered')));
      }
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Register item', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          const Text('Earn +25 CYCLONE points and get a personal QR.', style: TextStyle(color: C.text3, fontSize: 12.5)),
          const SizedBox(height: 16),
          const FieldLabel('Item name'),
          TextField(controller: _name, decoration: fieldDecoration(hint: 'e.g. My camera')),
          const SizedBox(height: 12),
          const FieldLabel('Category'),
          DropdownButtonFormField<String>(
            initialValue: _cat,
            items: _cats.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
            onChanged: (v) => setState(() => _cat = v ?? _cats.first),
            decoration: fieldDecoration(),
          ),
          const SizedBox(height: 12),
          const FieldLabel('Description (optional)'),
          TextField(controller: _desc, maxLines: 2, decoration: fieldDecoration(hint: 'Colour, brand, anything recognisable')),
          const SizedBox(height: 20),
          PrimaryBtn(label: 'Register item', busy: _busy, onPressed: _submit),
        ]),
      ),
    );
  }
}