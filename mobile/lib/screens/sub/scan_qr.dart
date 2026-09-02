import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../api/api.dart';
import '../../state/data.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';

/// QR verification screen. Camera scanning is not wired on this build;
/// users enter (or tap) a CYCLONE identifier instead.
class ScanQrScreen extends StatefulWidget {
  const ScanQrScreen({super.key});
  @override
  State<ScanQrScreen> createState() => _ScanQrScreenState();
}

class _ScanQrScreenState extends State<ScanQrScreen> {
  final _ctrl = TextEditingController();
  Map<String, dynamic>? _result;
  bool _busy = false;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _verify(String? raw) async {
    final id = (raw ?? _ctrl.text).trim();
    if (id.isEmpty) {
      toast(context, 'Enter or pick a QR identifier', error: true);
      return;
    }
    setState(() => _busy = true);
    try {
      final res = await Api.post('/api/qr/verify', {'identifier': id});
      if (!mounted) return;
      setState(() => _result = res);
    } on ApiException catch (e) {
      if (mounted) {
        setState(() => _result = null);
        toast(context, e.message, error: true);
      }
    } catch (_) {
      if (mounted) {
        setState(() => _result = null);
        toast(context, 'Verify failed', error: true);
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _reportFound() async {
    final id = ((_result?['identifier'] as String?) ?? _ctrl.text).trim();
    setState(() => _busy = true);
    try {
      final res = await Api.post('/api/qr/found', {'identifier': id});
      if (!mounted) return;
      await context.read<AppData>().refresh(['notifications']);
      if (!mounted) return;
      setState(() => _result = null);
      _ctrl.clear();
      toast(context, res['message']?.toString() ?? 'Thank you! The owner has been notified.');
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = (context.watch<AppData>().items ?? <dynamic>[]).cast<Map<String, dynamic>>();
    final demoIds = <String>{};
    for (final it in items) {
      final qr = it['qrIdentifier'] as String?;
      if (qr != null && qr.isNotEmpty) demoIds.add(qr);
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Scan QR')),
      body: wrapWeb(
        ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            CyCard(
              child: Column(children: [
                Container(
                  width: 84, height: 84,
                  decoration: BoxDecoration(color: const Color(0xFFEAF2FF), borderRadius: BorderRadius.circular(22)),
                  child: const Icon(Icons.qr_code_scanner, size: 38, color: C.primary),
                ),
                const SizedBox(height: 14),
                const Text('Identify any CYCLONE-tagged item', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15.5)),
                const SizedBox(height: 4),
                const Text('Camera scanning is off in this build — enter the identifier shown under the QR, or pick one of your own codes below.', style: TextStyle(color: C.text2, fontSize: 12.5, height: 1.4), textAlign: TextAlign.center),
                const SizedBox(height: 14),
                TextField(
                  controller: _ctrl,
                  autofocus: false,
                  decoration: fieldDecoration(hint: 'e.g. CYCLONE-… identifier'),
                  onSubmitted: (_) => _verify(null),
                  textInputAction: TextInputAction.done,
                ),
                const SizedBox(height: 12),
                PrimaryBtn(label: 'Verify identifier', busy: _busy, onPressed: () => _verify(null)),
              ]),
            ),
            if (demoIds.isNotEmpty) ...[
              const SectionTitle('Your codes to try'),
              Wrap(spacing: 8, runSpacing: 8, children: [
                for (final id in demoIds)
                  ActionChip(
                    label: Text(id, style: const TextStyle(fontFamily: 'monospace', fontSize: 11)),
                    avatar: const Icon(Icons.qr_code, size: 15, color: C.primary),
                    backgroundColor: C.surface,
                    side: const BorderSide(color: C.border),
                    onPressed: () {
                      _ctrl.text = id;
                      _verify(id);
                    },
                  ),
              ]),
            ],
            if (_result != null) ...[
              const SizedBox(height: 8),
              _resultCard(_result!),
            ],
          ],
        ),
      ),
    );
  }

  Widget _resultCard(Map<String, dynamic> res) {
    final owned = res['owned'] == true;
    final action = (res['action'] as String?) ?? 'info';
    final item = res['item'] is Map ? res['item'] as Map : null;
    final report = res['report'] is Map ? res['report'] as Map : null;

    return CyCard(
      margin: const EdgeInsets.only(top: 8),
      color: owned ? const Color(0xFFE8F6EE) : const Color(0xFFEAF2FF),
      border: Border.all(color: owned ? const Color(0xFFBCE3CC) : const Color(0xFFCFE0FB)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(owned ? Icons.verified : Icons.privacy_tip_outlined, color: owned ? C.success : C.primary, size: 20),
          const SizedBox(width: 8),
          Text(owned ? 'Your item' : 'Registered item', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14.5, color: C.text)),
        ]),
        const SizedBox(height: 10),
        if (item != null) ...[
          if (item['name'] != null) InfoTile(label: 'Name', value: item['name'].toString()),
          if (item['category'] != null) InfoTile(label: 'Category', value: item['category'].toString()),
          if (item['status'] != null) InfoTile(label: 'Status', value: item['status'].toString()),
          if (item['registered'] != null) InfoTile(label: 'Registered', value: fmtDate(item['registered'].toString())),
        ],
        if (report != null) ...[
          if (report['airport'] != null) InfoTile(label: 'Reported at', value: report['airport'].toString().toUpperCase()),
          if (report['location'] != null) InfoTile(label: 'Location', value: report['location'].toString()),
        ],
        const SizedBox(height: 8),
        Text(res['message']?.toString() ?? '', style: const TextStyle(color: C.text2, fontSize: 12.5, height: 1.4)),
        if (!owned && action == 'found') ...[
          const SizedBox(height: 12),
          PrimaryBtn(
            label: 'Report item found',
            busy: _busy,
            icon: Icons.volunteer_activism_outlined,
            onPressed: _reportFound,
          ),
        ],
      ]),
    );
  }
}