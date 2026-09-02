import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../api/api.dart';
import '../../state/data.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../../qr_widget.dart';
import '../shell.dart';

class ItemDetailScreen extends StatefulWidget {
  final String itemId;
  const ItemDetailScreen({super.key, required this.itemId});
  @override
  State<ItemDetailScreen> createState() => _ItemDetailScreenState();
}

class _ItemDetailScreenState extends State<ItemDetailScreen> {
  Map<String, dynamic>? _item;
  bool _loading = true;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await Api.get('/api/items/${widget.itemId}');
      _item = res['item'] as Map<String, dynamic>?;
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _mutate(String action, {Map<String, dynamic>? body}) async {
    setState(() => _busy = true);
    try {
      await Api.post('/api/items/${widget.itemId}/$action', body);
      if (!mounted) return;
      await context.read<AppData>().refresh(['items', 'loyalty', 'notifications']);
      await _load();
      if (!mounted) return;
      toast(context, action == 'recovered' ? 'Item marked as recovered' : 'Item updated');
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _showQr({bool regenerate = false}) async {
    setState(() => _busy = true);
    try {
      final res = await Api.post('/api/items/${widget.itemId}/qr${regenerate ? '/regenerate' : ''}');
      if (!mounted) return;
      final identifier = res['identifier'] as String? ?? '';
      await showDialog<void>(
        context: context,
        builder: (_) => AlertDialog(
          backgroundColor: C.surface,
          title: Text(regenerate ? 'New QR ready' : 'Your QR identifier'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              QrCard(data: identifier, size: 190, caption: identifier),
              const SizedBox(height: 8),
              if (regenerate) const Text('Old printed codes no longer verify.', style: TextStyle(color: C.warning, fontSize: 12.5)),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Close')),
          ],
        ),
      );
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _markLostSheet() {
    final item = _item;
    if (item == null) return;
    final locCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    String airport = 'CAI';
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Report lost', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text('Where did you lose "${item['name']}"?', style: const TextStyle(color: C.text3, fontSize: 12.5)),
            const SizedBox(height: 16),
            const FieldLabel('Airport'),
            DropdownButtonFormField<String>(
              initialValue: airport,
              items: const [
                DropdownMenuItem(value: 'CAI', child: Text('Cairo (CAI)')),
                DropdownMenuItem(value: 'DXB', child: Text('Dubai (DXB)')),
                DropdownMenuItem(value: 'DOH', child: Text('Doha (DOH)')),
              ],
              onChanged: (v) => airport = v ?? 'CAI',
              decoration: fieldDecoration(),
            ),
            const SizedBox(height: 12),
            const FieldLabel('Last seen location (optional)'),
            TextField(controller: locCtrl, decoration: fieldDecoration(hint: 'e.g. Gate A14 lounge')),
            const SizedBox(height: 12),
            const FieldLabel('Description (optional)'),
            TextField(controller: descCtrl, decoration: fieldDecoration(hint: 'Anything that helps identify it')),
            const SizedBox(height: 20),
            PrimaryBtn(
              label: 'Mark as lost',
              busy: _busy,
              onPressed: () async {
                Navigator.of(context).pop();
                await _mutate('lost', body: {
                  'airportCode': airport,
                  'location': locCtrl.text.trim().isEmpty ? null : locCtrl.text.trim(),
                  'description': descCtrl.text.trim().isEmpty ? null : descCtrl.text.trim(),
                });
              },
            ),
          ]),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading && _item == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Item')),
        body: wrapWeb(const Padding(
          padding: EdgeInsets.all(24),
          child: Center(child: CircularProgressIndicator(color: C.primary)),
        )),
      );
    }
    final it = _item;
    if (it == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Item')),
        body: wrapWeb(const EmptyState(icon: Icons.error_outline, title: 'Item not found')),
      );
    }
    final status = (it['status'] as String?) ?? 'safe';
    final lost = status == 'lost' || status == 'found';
    final report = it['lostReport'] is Map ? it['lostReport'] as Map : null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Item details'),
        actions: [
          IconButton(
            onPressed: _busy ? null : () => _showQr(regenerate: true),
            icon: const Icon(Icons.qr_code_2_outlined),
            tooltip: 'Regenerate QR',
          ),
        ],
      ),
      body: wrapWeb(
        RefreshIndicator(
          onRefresh: _load,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              CyCard(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Container(
                      width: 46, height: 46,
                      decoration: const BoxDecoration(color: Color(0xFFEAF2FF), borderRadius: BorderRadius.all(Radius.circular(13))),
                      child: const Icon(Icons.shopping_bag_outlined, color: C.primary, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(child: Text(it['name']?.toString() ?? 'Item', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18))),
                    StatusBadge(status),
                  ]),
                  const SizedBox(height: 16),
                  InfoTile(label: 'Category', value: it['category']?.toString() ?? '—'),
                  if (it['description'] != null) InfoTile(label: 'Description', value: it['description'].toString()),
                  InfoTile(label: 'Registered', value: fmtDate(it['createdAt']?.toString() ?? '')),
                ]),
              ),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: _busy ? null : () => _showQr(),
                  style: FilledButton.styleFrom(backgroundColor: C.primary, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  icon: const Icon(Icons.qr_code_2),
                  label: const Text('Show / print QR'),
                ),
              ),
              const SizedBox(height: 10),
              if (status == 'safe' || status == 'recovered')
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: _busy ? null : _markLostSheet,
                    style: OutlinedButton.styleFrom(foregroundColor: C.danger, side: const BorderSide(color: Color(0xFFFFD1D1)), padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    icon: const Icon(Icons.search_off),
                    label: const Text('Report as lost'),
                  ),
                )
              else if (lost)
                SizedBox(
                  width: double.infinity,
                  child: PrimaryBtn(label: 'Mark as recovered', busy: _busy, icon: Icons.check_circle_outline, onPressed: () => _mutate('recovered')),
                ),
              if (report != null) ...[
                const SizedBox(height: 14),
                CyCard(
                  color: const Color(0xFFFDF3E3),
                  border: Border.all(color: const Color(0xFFF3DFB0)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Lost & Found report', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: C.warning)),
                    const SizedBox(height: 8),
                    if (report['location'] != null) InfoTile(label: 'Location', value: report['location'].toString()),
                    if (report['airportId'] != null) InfoTile(label: 'Airport', value: report['airportId'].toString().toUpperCase()),
                    if (report['description'] != null) InfoTile(label: 'Description', value: report['description'].toString()),
                    InfoTile(label: 'Status', value: report['status']?.toString() ?? '—'),
                    InfoTile(label: 'Reported', value: fmtDate(report['createdAt']?.toString() ?? '')),
                  ]),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}