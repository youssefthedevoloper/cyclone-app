import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../api/api.dart';
import '../../qr_widget.dart';
import '../../state/data.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';
import 'my_items.dart';

class GenerateQrScreen extends StatefulWidget {
  const GenerateQrScreen({super.key});
  @override
  State<GenerateQrScreen> createState() => _GenerateQrScreenState();
}

class _GenerateQrScreenState extends State<GenerateQrScreen> {
  Map<String, dynamic>? _selected;
  String? _identifier;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    final data = context.read<AppData>();
    if (data.items == null) data.loadItems();
  }

  Future<void> _generate([bool regenerate = false]) async {
    final sel = _selected;
    if (sel == null) return;
    setState(() => _busy = true);
    try {
      final res = await Api.post('/api/items/${sel['id']}/qr${regenerate ? '/regenerate' : ''}');
      if (!mounted) return;
      setState(() => _identifier = res['identifier'] as String?);
      if (regenerate) toast(context, 'New QR generated — old printed codes revoked.');
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = (context.watch<AppData>().items ?? <dynamic>[]).cast<Map<String, dynamic>>();

    return Scaffold(
      appBar: AppBar(title: const Text('Generate QR')),
      body: wrapWeb(
        ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            if (items.isEmpty)
              EmptyState(
                icon: Icons.shopping_bag_outlined,
                title: 'Register an item first',
                text: 'You need a registered item to generate its QR.',
                action: PrimaryBtn(label: 'Register item', onPressed: () => push(context, const MyItemsScreen())),
              )
            else ...[
              const FieldLabel('Choose an item'),
              CyCard(
                padding: EdgeInsets.zero,
                child: Column(children: items.map((it) {
                  final sel = _selected?['id'] == it['id'];
                  return InkWell(
                    onTap: () => setState(() {
                      _selected = it;
                      _identifier = null;
                    }),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(color: sel ? const Color(0xFFEAF2FF) : null, border: const Border(bottom: BorderSide(color: C.border))),
                      child: Row(children: [
                        Icon(sel ? Icons.radio_button_checked : Icons.radio_button_unchecked, size: 19, color: sel ? C.primary : C.text3),
                        const SizedBox(width: 10),
                        Expanded(child: Text(it['name']?.toString() ?? 'Item', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14))),
                        Text(it['category']?.toString() ?? '', style: const TextStyle(color: C.text3, fontSize: 12)),
                      ]),
                    ),
                  );
                }).toList()),
              ),
              const SizedBox(height: 14),
              if (_selected != null)
                FilledButton.icon(
                  onPressed: _busy ? null : () => _generate(),
                  style: FilledButton.styleFrom(backgroundColor: C.primary, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  icon: const Icon(Icons.qr_code_2),
                  label: const Text('Generate QR'),
                ),
              const SizedBox(height: 18),
              if (_identifier != null)
                CyCard(
                  color: const Color(0xFFEAF2FF),
                  border: Border.all(color: const Color(0xFFCFE0FB)),
                  child: Column(children: [
                    QrCard(data: _identifier!, size: 200, caption: _identifier),
                    const SizedBox(height: 8),
                    const Text('Show or print this code and attach it to your item.', style: TextStyle(color: C.text2, fontSize: 12.5), textAlign: TextAlign.center),
                    const SizedBox(height: 14),
                    Row(children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _busy ? null : () => _generate(true),
                          style: OutlinedButton.styleFrom(foregroundColor: C.danger, side: const BorderSide(color: Color(0xFFFFD1D1)), padding: const EdgeInsets.symmetric(vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(11))),
                          child: const Text('Regenerate', style: TextStyle(fontWeight: FontWeight.w700)),
                        ),
                      ),
                    ]),
                  ]),
                ),
            ],
          ],
        ),
      ),
    );
  }
}