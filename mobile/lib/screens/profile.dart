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
import 'sub/boarding_pass.dart';
import 'sub/rewards.dart';
import 'sub/premium.dart';
import 'sub/scan_qr.dart';
import 'sub/generate_qr.dart';

class ProfileTab extends StatelessWidget {
  final AuthController auth;
  final AppData data;
  const ProfileTab({super.key, required this.auth, required this.data});

  @override
  Widget build(BuildContext context) {
    final name = (auth.user?['name'] as String?) ?? 'Traveler';
    final email = (auth.user?['email'] as String?) ?? '';
    final acc = (auth.user?['accountNumber'] as num?)?.toString() ?? '';
    final firstName = name.split(' ').first;

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: data.load,
        child: wrapWeb(
          ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(C.pad, 20, C.pad, 28),
            children: [
              Row(children: [
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Profile', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: C.text, letterSpacing: -0.4)),
                    const SizedBox(height: 2),
                    Text('Your account & travel', style: const TextStyle(color: C.text3, fontSize: 13.5)),
                  ]),
                ),
                logoMark(size: 34),
              ]),
              const SizedBox(height: 18),
              _identityCard(context, name, email, acc, firstName),
              const SizedBox(height: 14),
              _quickCards(context, data),
              const SizedBox(height: 26),
              const SectionHeader('Your travel', subtitle: 'Trips, passes and rewards'),
              ServiceListCard(children: [
                ServiceRow(icon: Icons.airplane_ticket_outlined, title: 'Tickets', subtitle: 'Manage your flights', onTap: () => push(context, const TicketsScreen())),
                ServiceRow(icon: Icons.badge_outlined, title: 'Boarding Pass', subtitle: 'View your pass', onTap: () => push(context, const BoardingPassScreen())),
                ServiceRow(icon: Icons.local_activity, title: 'Rewards Shop', subtitle: 'Spend your points', onTap: () => push(context, const RewardsScreen())),
                ServiceRow(icon: Icons.workspace_premium_outlined, title: 'Premium', subtitle: auth.isPremium ? 'You\'re a premium member' : 'Priority access & more', onTap: () => push(context, const PremiumScreen())),
              ]),
              const SizedBox(height: 26),
              const SectionHeader('Account & safety', subtitle: 'Manage your profile & belongings'),
              ServiceListCard(children: [
                ServiceRow(icon: Icons.shield_outlined, title: 'Lost & Found', subtitle: 'Report & recover items', onTap: () => push(context, const LostFoundScreen())),
                ServiceRow(icon: Icons.style_outlined, title: 'My Items', subtitle: 'Items with QR identifiers', onTap: () => push(context, const MyItemsScreen())),
                ServiceRow(icon: Icons.qr_code_scanner, title: 'QR Scanner', subtitle: 'Identify CYCLONE-tagged items', onTap: () => push(context, const ScanQrScreen())),
                ServiceRow(icon: Icons.qr_code_2, title: 'Generate QR', subtitle: 'Protect a belonging with a QR', onTap: () => push(context, const GenerateQrScreen())),
                ServiceRow(icon: Icons.notifications_none, title: 'Notifications', subtitle: data.unreadCount > 0 ? '${data.unreadCount} unread alerts' : 'View alerts', onTap: () => push(context, NotificationsScreen(data: data))),
                ServiceRow(icon: Icons.tune, title: 'Settings', subtitle: 'Profile, plan & app', onTap: () => push(context, const SettingsScreen())),
              ]),
              const SizedBox(height: 20),
              CyCard(
                color: C.dangerSoft,
                border: Border.all(color: const Color(0xFFF4C4C4)),
                child: InkWell(
                  borderRadius: BorderRadius.circular(C.radiusCard - 4),
                  onTap: () => context.read<AuthController>().logout(),
                  child: const Padding(
                    padding: EdgeInsets.symmetric(vertical: 4),
                    child: Row(children: [
                      Icon(Icons.logout, color: C.danger, size: 22),
                      SizedBox(width: 12),
                      Text('Log out', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: C.danger)),
                    ]),
                  ),
                ),
              ),
              const SizedBox(height: 22),
              Center(child: Text('CYCLONE  v1.0  ·  FLUTTER', style: const TextStyle(color: C.text3, fontSize: 11, letterSpacing: 1))),
            ],
          ),
        ),
      ),
    );
  }

  Widget _identityCard(BuildContext context, String name, String email, String acc, String firstName) {
    return CyCard(
      padding: const EdgeInsets.all(20),
      color: C.primarySoft,
      border: Border.all(color: C.primaryLine),
      child: Row(children: [
        ProfileAvatar(name: name, size: 60, onTap: () => push(context, const SettingsScreen())),
        const SizedBox(width: 16),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: C.primaryDark)),
            const SizedBox(height: 2),
            Text(email, style: const TextStyle(color: C.primaryDark, fontSize: 12.5)),
            const SizedBox(height: 10),
            Wrap(spacing: 8, runSpacing: 6, crossAxisAlignment: WrapCrossAlignment.center, children: [
              _planChip(auth.isPremium),
              if (acc.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: C.surface, borderRadius: BorderRadius.circular(C.radiusPill), border: Border.all(color: C.primaryLine)),
                  child: Text('#$acc', style: const TextStyle(color: C.text2, fontSize: 11.5, fontWeight: FontWeight.w700)),
                ),
            ]),
          ]),
        ),
      ]),
    );
  }

  Widget _planChip(bool premium) {
    final bg = premium ? C.primary : C.neutralSoft;
    final fg = premium ? Colors.white : C.text2;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(C.radiusPill)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(premium ? Icons.workspace_premium : Icons.person_outline, size: 13, color: fg),
        const SizedBox(width: 4),
        Text(premium ? 'Premium' : 'Free', style: TextStyle(color: fg, fontSize: 11.5, fontWeight: FontWeight.w800)),
      ]),
    );
  }

  Widget _quickCards(BuildContext context, AppData data) {
    return Row(children: [
      _statCard((data.tickets?.length ?? 0), 'Tickets', () => push(context, const TicketsScreen())),
      const SizedBox(width: 12),
      _statCard((data.items?.length ?? 0), 'Items', () => push(context, const MyItemsScreen())),
      const SizedBox(width: 12),
      _statCard(data.points, 'Points', () => push(context, const RewardsScreen())),
    ]);
  }

  Widget _statCard(int value, String label, VoidCallback onTap) {
    return Expanded(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(color: C.surface, borderRadius: BorderRadius.circular(16), boxShadow: [C.softShadow]),
          child: Column(children: [
            Text(value.toString(), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: C.text, fontFeatures: [FontFeature.tabularFigures()])),
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(color: C.text3, fontSize: 11.5, fontWeight: FontWeight.w600)),
          ]),
        ),
      ),
    );
  }
}
