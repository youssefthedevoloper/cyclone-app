import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../state/data.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';
import 'item_detail.dart';
import 'my_items.dart';
import 'scan_qr.dart';

class LostFoundScreen extends StatelessWidget {
  const LostFoundScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const _LostFoundBody();
  }
}

class _LostFoundBody extends StatefulWidget {
  const _LostFoundBody();
  @override
  State<_LostFoundBody> createState() => _LostFoundBodyState();
}

class _LostFoundBodyState extends State<_LostFoundBody> {
  @override
  void initState() {
    super.initState();
    final data = context.read<AppData>();
    if (data.items == null) data.loadItems();
  }

  @override
  Widget build(BuildContext context) {
    final items = (context.watch<AppData>().items ?? <dynamic>[]).cast<Map<String, dynamic>>();
    final lost = items.where((i) {
      final s = (i['status'] as String?) ?? '';
      return s == 'lost' || s == 'found' || s == 'recovered';
    }).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Lost & Found')),
      body: wrapWeb(
        RefreshIndicator(
          onRefresh: context.read<AppData>().loadItems,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              CyCard(
                color: const Color(0xFF0B2545),
                border: Border.all(color: const Color(0xFF0B2545)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Container(width: 40, height: 40, decoration: const BoxDecoration(color: Colors.white12, shape: BoxShape.circle), child: const Icon(Icons.shield_outlined, color: Colors.white, size: 20)),
                    const SizedBox(width: 12),
                    const Expanded(child: Text('How CYCLONE Lost & Found works', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15))),
                  ]),
                  const SizedBox(height: 12),
                  const Text('Every registered item carries a QR. Lose an item and the scan shows "lost" so anyone can help return it — without sharing your personal details.', style: TextStyle(color: Colors.white70, fontSize: 12.5, height: 1.4)),
                ]),
              ),
              const SizedBox(height: 14),
              Row(children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () => push(context, const ScanQrScreen()),
                    style: FilledButton.styleFrom(backgroundColor: C.primary, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 13), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    icon: const Icon(Icons.qr_code_scanner, size: 19),
                    label: const Text('Scan a QR'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => push(context, const MyItemsScreen()),
                    style: OutlinedButton.styleFrom(foregroundColor: C.primary, side: const BorderSide(color: Color(0xFF9FC3F5)), padding: const EdgeInsets.symmetric(vertical: 13), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    icon: const Icon(Icons.add, size: 19),
                    label: const Text('Register item'),
                  ),
                ),
              ]),
              const SizedBox(height: 22),
              const SectionTitle('Your lost items'),
              if (lost.isEmpty)
                const EmptyState(icon: Icons.check_circle_outline, title: 'All your items are accounted for', text: 'Items you report as lost will appear here with a finder report.')
              else
                for (final it in lost) ...[
                  _lostTile(it),
                  const SizedBox(height: 10),
                ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _lostTile(Map<String, dynamic> it) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => push(context, ItemDetailScreen(itemId: it['id'] as String)),
      child: CyCard(
        padding: const EdgeInsets.all(14),
        child: Row(children: [
          Container(
            width: 42, height: 42,
            decoration: const BoxDecoration(color: Color(0xFFFDF3E3), borderRadius: BorderRadius.all(Radius.circular(12))),
            child: Icon((it['status'] as String?) == 'recovered' ? Icons.check_circle : Icons.search, color: C.warning, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(it['name']?.toString() ?? 'Item', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14.5)),
              const SizedBox(height: 3),
              Text(it['category']?.toString() ?? '', style: const TextStyle(color: C.text3, fontSize: 12)),
            ]),
          ),
          StatusBadge((it['status'] as String?) ?? 'safe'),
          const SizedBox(width: 4),
          const Icon(Icons.chevron_right, size: 19, color: C.text3),
        ]),
      ),
    );
  }
}