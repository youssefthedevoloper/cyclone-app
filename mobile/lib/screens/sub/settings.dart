import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../api/api.dart';
import '../../state/auth.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});
  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _busy = false;

  void _editName() {
    final auth = context.read<AuthController>();
    final ctrl = TextEditingController(text: auth.user?['name'] as String? ?? '');
    showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: C.surface,
        title: const Text('Edit profile name'),
        content: TextField(controller: ctrl, autofocus: true, decoration: fieldDecoration(hint: 'Your name')),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Cancel')),
          FilledButton(
            onPressed: () async {
              Navigator.of(context).pop();
              if (ctrl.text.trim().isEmpty) return;
              setState(() => _busy = true);
              try {
                final res = await Api.patch('/api/users/me', {'name': ctrl.text.trim()});
                auth.updateUser(res['user'] as Map<String, dynamic>? ?? const {});
                if (mounted) toast(context, 'Profile updated');
              } on ApiException catch (e) {
                if (mounted) toast(context, e.message, error: true);
              } finally {
                if (mounted) setState(() => _busy = false);
              }
            },
            style: FilledButton.styleFrom(backgroundColor: C.primary),
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final email = auth.user?['email'] as String? ?? '';
    final name = auth.user?['name'] as String? ?? '';

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: wrapWeb(
        ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            CyCard(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Account', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                const SizedBox(height: 6),
                InfoTile(label: 'Name', value: name),
                InfoTile(label: 'Email', value: email),
                InfoTile(label: 'Plan', value: auth.isPremium ? 'Premium' : 'Free'),
              ]),
            ),
            const SizedBox(height: 12),
            CyCard(
              padding: EdgeInsets.zero,
              child: Column(children: [
                ListTile(
                  leading: const Icon(Icons.badge_outlined, color: C.primary),
                  title: const Text('Edit profile name', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14.5)),
                  trailing: const Icon(Icons.chevron_right, size: 19, color: C.text3),
                  onTap: _busy ? null : _editName,
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.logout, color: C.danger),
                  title: const Text('Log out', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14.5, color: C.danger)),
                  onTap: () => context.read<AuthController>().logout(),
                ),
              ]),
            ),
            const SizedBox(height: 16),
            CyCard(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('About', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                const SizedBox(height: 8),
                const Text('CYCLONE is a Flutter companion for the CYCLONE airport experience — journeys, Airport Map, QR item safety and loyalty rewards.', style: TextStyle(color: C.text2, fontSize: 13, height: 1.45)),
                const SizedBox(height: 12),
                InfoTile(label: 'Version', value: '1.0.0 (web)'),
                InfoTile(label: 'Backend', value: AppConst.apiBase),
              ]),
            ),
          ],
        ),
      ),
    );
  }
}