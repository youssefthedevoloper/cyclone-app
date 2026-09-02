import 'package:flutter/material.dart';

import '../state/auth.dart';
import '../state/data.dart';
import '../theme.dart';
import '../widgets.dart';
import 'shell.dart';
import 'sub/premium.dart';
import 'sub/rewards.dart';

class LoyaltyTab extends StatelessWidget {
  final AuthController auth;
  final AppData data;
  const LoyaltyTab({super.key, required this.auth, required this.data});

  @override
  Widget build(BuildContext context) {
    final transactions = (data.loyalty?['transactions'] as List? ?? <dynamic>[]).cast<Map<String, dynamic>>();
    return Scaffold(
      appBar: AppBar(title: const Text('Loyalty')),
      body: wrapWeb(
        RefreshIndicator(
          onRefresh: data.loadLoyalty,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              CyCard(
                color: const Color(0xFF0B2545),
                border: Border.all(color: const Color(0xFF0B2545)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    const Icon(Icons.local_activity, color: Colors.white, size: 22),
                    const SizedBox(width: 8),
                    const Text('Cyclone Points', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700)),
                    const Spacer(),
                    StatusBadge(auth.isPremium ? 'premium' : 'free'),
                  ]),
                  const SizedBox(height: 10),
                  Text(
                    (data.loyalty?['balance'] as num?)?.toInt().toString() ?? '•••',
                    style: const TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.w900, fontFeatures: [FontFeature.tabularFigures()]),
                  ),
                  const SizedBox(height: 4),
                  const Text('available to spend', style: TextStyle(color: Colors.white70, fontSize: 12.5)),
                  const SizedBox(height: 14),
                  Row(children: [
                    Expanded(child: FilledButton(
                      onPressed: () => push(context, const RewardsScreen()),
                      style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: C.primaryDark, padding: const EdgeInsets.symmetric(vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(11))),
                      child: const Text('Rewards shop'),
                    )),
                    const SizedBox(width: 10),
                    Expanded(child: FilledButton(
                      onPressed: () => push(context, const PremiumScreen()),
                      style: FilledButton.styleFrom(backgroundColor: Colors.transparent, foregroundColor: Colors.white, side: const BorderSide(color: Colors.white38), padding: const EdgeInsets.symmetric(vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(11))),
                      child: const Text('Go Premium'),
                    )),
                  ]),
                ]),
              ),
              const SizedBox(height: 8),
              const SectionTitle('How points work'),
              Wrap(spacing: 8, runSpacing: 8, children: [
                _ruleChip('100', 'Finish a journey'),
                _ruleChip('50', 'Complete all steps'),
                _ruleChip('150', 'Lounge service'),
                _ruleChip('100', 'Premium service'),
                _ruleChip('25', 'Register an item'),
                _ruleChip('100', 'Partner purchase'),
              ]),
              const SectionTitle('History'),
              if (transactions.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 18),
                  child: Center(child: Text('No transactions yet', style: TextStyle(color: C.text3))),
                )
              else
                CyCard(
                  padding: EdgeInsets.zero,
                  child: Column(children: transactions.take(12).map((t) {
                    final amount = (t['amount'] as num?)?.toInt() ?? 0;
                    final isPlus = amount >= 0;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                      child: Row(children: [
                        Container(
                          width: 34, height: 34,
                          decoration: BoxDecoration(color: isPlus ? C.successSoft : C.neutralSoft, borderRadius: BorderRadius.circular(10)),
                          child: Icon(isPlus ? Icons.add : Icons.remove, size: 17, color: isPlus ? C.success : C.text2),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(t['reason']?.toString() ?? 'Points', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13.5, color: C.text)),
                            Text(t['createdAt']?.toString().substring(0, 10) ?? '', style: const TextStyle(color: C.text3, fontSize: 11.5)),
                          ]),
                        ),
                        Text((isPlus ? '+' : '') + amount.toString(), style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: isPlus ? C.success : C.text2)),
                      ]),
                    );
                  }).toList()),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _ruleChip(String pts, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(color: C.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: C.border)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Text(pts, style: const TextStyle(color: C.primary, fontWeight: FontWeight.w800, fontSize: 13)),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(color: C.text2, fontSize: 12.5)),
      ]),
    );
  }
}