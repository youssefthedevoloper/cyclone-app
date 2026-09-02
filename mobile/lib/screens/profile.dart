import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/auth.dart';
import '../state/data.dart';
import '../theme.dart';
import '../widgets.dart';
import 'shell.dart';
import 'sub/lost_found.dart';
import 'sub/my_items.dart';
import 'sub/notifications.dart';
import 'sub/settings.dart';
import 'sub/tickets.dart';

class ProfileTab extends StatelessWidget {
  final AuthController auth;
  final AppData data;
  const ProfileTab({super.key, required this.auth, required this.data});

  @override
  Widget build(BuildContext context) {
    final name = (auth.user?['name'] as String?) ?? 'Traveler';
    final email = (auth.user?['email'] as String?) ?? '';
    final acc = (auth.user?['accountNumber'] as num?)?.toString() ?? '';

    final tiles = <(IconData, String, VoidCallback)>[
      (Icons.airplane_ticket_outlined, 'Tickets', () => push(context, const TicketsScreen())),
      (Icons.notifications_none, 'Notifications', () => push(context, NotificationsScreen(data: data))),
      (Icons.shield_outlined, 'Lost & Found', () => push(context, const LostFoundScreen())),
      (Icons.style_outlined, 'My Items', () => push(context, const MyItemsScreen())),
      (Icons.tune, 'Settings', () => push(context, const SettingsScreen())),
      (Icons.logout, 'Log out', () async {
        await context.read<AuthController>().logout();
      }),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: wrapWeb(
        RefreshIndicator(
          onRefresh: data.load,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              CyCard(
                padding: const EdgeInsets.all(18),
                child: Row(children: [
                  Container(
                    width: 58, height: 58,
                    decoration: BoxDecoration(color: C.primary, borderRadius: BorderRadius.circular(18)),
                    alignment: Alignment.center,
                    child: Text(name.isNotEmpty ? name[0].toUpperCase() : '?', style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800)),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(name, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: C.text)),
                      const SizedBox(height: 2),
                      Text(email, style: const TextStyle(color: C.text2, fontSize: 12.5)),
                      const SizedBox(height: 8),
                      Row(children: [
                        const Icon(Icons.local_activity, size: 15, color: C.primary),
                        const SizedBox(width: 4),
                        Text('${data.points} pts', style: const TextStyle(color: C.primary, fontWeight: FontWeight.w800, fontSize: 13)),
                        const SizedBox(width: 12),
                        StatusBadge(auth.isPremium ? 'premium' : 'free'),
                        if (acc.isNotEmpty) ...[const SizedBox(width: 8), Text('#$acc', style: const TextStyle(color: C.text3, fontSize: 11.5))],
                      ]),
                    ]),
                  ),
                ]),
              ),
              const SizedBox(height: 14),
              _counts(context, data),
              const SizedBox(height: 8),
              CyCard(
                padding: EdgeInsets.zero,
                child: Column(children: tiles.map((t) {
                  final isLogout = t.$1 == Icons.logout;
                  return InkWell(
                    onTap: t.$3,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
                      child: Row(children: [
                        Icon(t.$1, size: 20, color: isLogout ? C.danger : C.primary),
                        const SizedBox(width: 12),
                        Expanded(child: Text(t.$2, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14.5, color: isLogout ? C.danger : C.text))),
                        if (t.$2 == 'Notifications' && data.unreadCount > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: const BoxDecoration(color: C.primary, borderRadius: BorderRadius.all(Radius.circular(999))),
                            child: Text('${data.unreadCount}', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800)),
                          ),
                        const SizedBox(width: 6),
                        const Icon(Icons.chevron_right, size: 19, color: C.text3),
                      ]),
                    ),
                  );
                }).toList()),
              ),
              const SizedBox(height: 16),
              Center(child: Text('CYCLONE v1.0 · FLUTTER', style: const TextStyle(color: C.text3, fontSize: 11, letterSpacing: 1))),
            ],
          ),
        ),
      ),
    );
  }

  Widget _counts(BuildContext context, AppData data) {
    return Row(children: [
      _countCard((data.tickets?.length ?? 0), 'Tickets', () => push(context, const TicketsScreen())),
      const SizedBox(width: 10),
      _countCard((data.items?.length ?? 0), 'Items', () => push(context, const MyItemsScreen())),
      const SizedBox(width: 10),
      _countCard(data.unreadCount, 'Unread', () => push(context, NotificationsScreen(data: data))),
    ]);
  }

  Widget _countCard(int value, String label, VoidCallback onTap) {
    return Expanded(
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: CyCard(padding: const EdgeInsets.symmetric(vertical: 14), child: Column(children: [
          Text(value.toString(), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: C.text, fontFeatures: [FontFeature.tabularFigures()])),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(color: C.text3, fontSize: 11.5)),
        ])),
      ),
    );
  }
}