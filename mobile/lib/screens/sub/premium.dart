import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../api/api.dart';
import '../../state/auth.dart';
import '../../state/data.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';

class PremiumScreen extends StatefulWidget {
  const PremiumScreen({super.key});
  @override
  State<PremiumScreen> createState() => _PremiumScreenState();
}

class _PremiumScreenState extends State<PremiumScreen> {
  Map<String, dynamic>? _status;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final r = await Api.get('/api/premium');
      if (!mounted) return;
      setState(() => _status = r['premium'] as Map<String, dynamic>?);
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    }
  }

  Future<void> _activate() async {
    setState(() => _busy = true);
    try {
      await Api.post('/api/premium/activate', {'months': 1});
      if (!mounted) return;
      final auth = context.read<AuthController>();
      auth.updateUser({'premiumStatus': 'premium'});
      await context.read<AppData>().refresh(['loyalty', 'notifications']);
      await _load();
      if (!mounted) return;
      toast(context, 'Premium activated! Enjoy priority assistance.');
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final isOn = auth.isPremium;
    final entitlements = ((_status?['entitlements'] as List?) ?? <dynamic>[]).cast<Map<String, dynamic>>();
    final expires = _status?['expiresAt'] as String?;

    return Scaffold(
      appBar: AppBar(title: const Text('CYCLONE Premium')),
      body: wrapWeb(
        RefreshIndicator(
          onRefresh: _load,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              CyCard(
                color: const Color(0xFF0B2545),
                border: Border.all(color: const Color(0xFF0B2545)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    const Icon(Icons.workspace_premium, color: Colors.white, size: 26),
                    const SizedBox(width: 10),
                    const Text('Premium', style: TextStyle(color: Colors.white, fontSize: 19, fontWeight: FontWeight.w900)),
                    const Spacer(),
                    StatusBadge(isOn ? 'premium' : 'free'),
                  ]),
                  const SizedBox(height: 12),
                  Text(isOn ? 'Active — enjoy priority everywhere' : 'Unlock with 500 Cyclone Points · 1 month', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                  if (expires != null) ...[
                    const SizedBox(height: 6),
                    Text('Renews every month · ${fmtDate(expires)}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                  ],
                  const SizedBox(height: 18),
                  if (!isOn)
                    FilledButton(
                      onPressed: _busy ? null : _activate,
                      style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: C.primaryDark, padding: const EdgeInsets.symmetric(vertical: 13), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(11))),
                      child: _busy ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2.4, color: C.primaryDark)) : const Text('Activate Premium · 500 pts', style: TextStyle(fontWeight: FontWeight.w800)),
                    )
                  else
                    FilledButton(
                      onPressed: null,
                      style: FilledButton.styleFrom(disabledBackgroundColor: Colors.white24, padding: const EdgeInsets.symmetric(vertical: 13), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(11))),
                      child: const Text('Premium active', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
                    ),
                ]),
              ),
              const SectionTitle('What you get'),
              ..._benefit(Icons.bolt, 'Priority queues', 'Faster check-in and security lines.'),
              ..._benefit(Icons.qr_code_2, 'Advanced navigation', 'Turn-by-turn terminal directions.'),
              ..._benefit(Icons.weekend_outlined, 'Premium lounge services', 'Lounge and VIP rewards unlock.'),
              ..._benefit(Icons.assignment_outlined, 'Service entitlements', 'Premium-only airport services become bookable.'),
              if (entitlements.isNotEmpty) ...[
                const SectionTitle('Active entitlements'),
                CyCard(
                  padding: EdgeInsets.zero,
                  child: Column(children: entitlements.map((e) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                      child: Row(children: [
                        const Icon(Icons.check_circle, size: 17, color: C.success),
                        const SizedBox(width: 10),
                        Expanded(child: Text(e['feature']?.toString() ?? 'Entitlement', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13.5))),
                        Text(e['expiresAt'] != null ? fmtDate(e['expiresAt'].toString()) : 'Permanent', style: const TextStyle(color: C.text3, fontSize: 11.5)),
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

  List<Widget> _benefit(IconData icon, String title, String desc) {
    return [
      CyCard(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(13),
        child: Row(children: [
          Container(width: 38, height: 38, decoration: const BoxDecoration(color: Color(0xFFEAF2FF), shape: BoxShape.circle), child: Icon(icon, color: C.primary, size: 19)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5)),
              Text(desc, style: const TextStyle(color: C.text3, fontSize: 12)),
            ]),
          ),
        ]),
      ),
    ];
  }
}