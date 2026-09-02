import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../api/api.dart';
import '../../state/data.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';

class RewardsScreen extends StatefulWidget {
  const RewardsScreen({super.key});
  @override
  State<RewardsScreen> createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen> {
  List<Map<String, dynamic>>? _rewards;
  List<Map<String, dynamic>>? _history;
  String _busyId = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final r = await Api.get('/api/rewards');
      final h = await Api.get('/api/rewards/history/mine');
      if (!mounted) return;
      setState(() {
        _rewards = (r['rewards'] as List? ?? <dynamic>[]).cast<Map<String, dynamic>>();
        _history = (h['redemptions'] as List? ?? <dynamic>[]).cast<Map<String, dynamic>>();
      });
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    }
  }

  Future<void> _redeem(Map<String, dynamic> rw) async {
    setState(() => _busyId = rw['id'] as String? ?? '');
    try {
      final res = await Api.post('/api/rewards/${rw['id']}/redeem');
      if (!mounted) return;
      await context.read<AppData>().refresh(['loyalty', 'notifications']);
      await _load();
      if (!mounted) return;
      final code = res['voucherCode'] as String? ?? '—';
      await showDialog<void>(
        context: context,
        builder: (_) => AlertDialog(
          backgroundColor: C.surface,
          title: const Text('Reward redeemed!'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('${rw['title']}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
              const SizedBox(height: 10),
              Text('Voucher code:', style: const TextStyle(color: C.text3, fontSize: 12.5)),
              const SizedBox(height: 4),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(color: const Color(0xFFEAF2FF), borderRadius: BorderRadius.circular(10)),
                alignment: Alignment.center,
                child: Text(code, style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w800, fontSize: 15, color: C.primaryDark, letterSpacing: 1)),
              ),
              const SizedBox(height: 10),
              Text('${res['newBalance'] ?? 0} points remaining.', style: const TextStyle(color: C.text2, fontSize: 12.5)),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Done')),
          ],
        ),
      );
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _busyId = '');
    }
  }

  @override
  Widget build(BuildContext context) {
    final points = context.watch<AppData>().points;
    final rewards = _rewards ?? [];
    final history = _history ?? [];

    return Scaffold(
      appBar: AppBar(title: const Text('Rewards shop')),
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
                child: Row(children: [
                  Container(width: 42, height: 42, decoration: const BoxDecoration(color: Colors.white12, shape: BoxShape.circle), child: const Icon(Icons.local_activity, color: Colors.white)),
                  const SizedBox(width: 12),
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Your balance', style: TextStyle(color: Colors.white70, fontSize: 12.5)),
                    Text(points.toString(), style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900, fontFeatures: [FontFeature.tabularFigures()])),
                  ]),
                  const Spacer(),
                  const Icon(Icons.card_giftcard, color: Colors.white38),
                ]),
              ),
              const SizedBox(height: 8),
              const SectionTitle('Available rewards'),
              if (_rewards == null)
                const Padding(padding: EdgeInsets.all(8), child: Center(child: CircularProgressIndicator(color: C.primary)))
              else if (rewards.isEmpty)
                const EmptyState(icon: Icons.card_giftcard, title: 'No rewards right now')
              else
                for (final rw in rewards) ...[
                  _rewardCard(rw),
                  const SizedBox(height: 12),
                ],
              if (history.isNotEmpty) ...[
                const SectionTitle('Redemption history'),
                CyCard(
                  padding: EdgeInsets.zero,
                  child: Column(children: history.take(6).map((h) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                      child: Row(children: [
                        Container(
                          width: 34, height: 34,
                          decoration: BoxDecoration(color: C.neutralSoft, borderRadius: BorderRadius.circular(10)),
                          child: const Icon(Icons.redeem, size: 17, color: C.text2),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(h['rewardTitle']?.toString() ?? 'Reward', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13.5, color: C.text)),
                            Text('−${h['pointsSpent'] ?? 0} pts · ${h['voucherCode'] ?? ''}', style: const TextStyle(color: C.text3, fontSize: 11.5)),
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

  Widget _rewardCard(Map<String, dynamic> rw) {
    final cost = (rw['pointsCost'] as num?)?.toInt() ?? 0;
    final has = context.read<AppData>().points >= cost;
    final requiresPremium = rw['requiresPremium'] == true;
    final premiumOnly = rw['premiumOnly'] == true;
    final redeemable = rw['redeemable'] == true || has;
    final busy = _busyId == rw['id'];

    return CyCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            width: 40, height: 40,
            decoration: const BoxDecoration(color: Color(0xFFEAF2FF), borderRadius: BorderRadius.all(Radius.circular(12))),
            child: Icon(_iconFor(rw['category']?.toString() ?? ''), color: C.primary, size: 20),
          ),
          const SizedBox(width: 11),
          Expanded(child: Text(rw['title']?.toString() ?? 'Reward', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15))),
          if (premiumOnly) StatusBadge('premium', label: 'Premium'),
        ]),
        const SizedBox(height: 8),
        Text(rw['description']?.toString() ?? '', style: const TextStyle(color: C.text2, fontSize: 12.5, height: 1.35)),
        const SizedBox(height: 12),
        Row(children: [
          const Icon(Icons.local_activity, size: 16, color: C.primary),
          const SizedBox(width: 4),
          Text('$cost pts', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: C.text)),
          const Spacer(),
          if (requiresPremium)
            const Text('Needs premium', style: TextStyle(color: C.text3, fontSize: 12))
          else
            FilledButton(
              onPressed: busy || !redeemable ? null : () => _redeem(rw),
              style: FilledButton.styleFrom(backgroundColor: C.primary, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 9), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
              child: busy ? const SizedBox(width: 15, height: 15, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : Text(redeemable ? 'Redeem' : 'Not enough points', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
            ),
        ]),
      ]),
    );
  }

  IconData _iconFor(String cat) {
    switch (cat.toLowerCase()) {
      case 'lounge':
        return Icons.weekend_outlined;
      case 'premium':
        return Icons.workspace_premium_outlined;
      case 'dining':
        return Icons.restaurant_outlined;
      case 'airport':
        return Icons.airport_shuttle_outlined;
      case 'shopping':
        return Icons.shopping_bag_outlined;
      case 'travel':
        return Icons.wifi;
      default:
        return Icons.card_giftcard;
    }
  }
}