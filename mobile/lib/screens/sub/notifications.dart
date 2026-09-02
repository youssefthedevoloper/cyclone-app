import 'package:flutter/material.dart';

import '../../api/api.dart';
import '../../state/data.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';

class NotificationsScreen extends StatefulWidget {
  final AppData data;
  const NotificationsScreen({super.key, required this.data});
  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _busyAll = false;

  @override
  void initState() {
    super.initState();
    final d = widget.data;
    if (d.notifications == null) d.loadNotifications();
  }

  Future<void> _markAll() async {
    setState(() => _busyAll = true);
    try {
      await Api.post('/api/notifications/read-all');
      await widget.data.loadNotifications();
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _busyAll = false);
    }
  }

  Future<void> _markOne(String id) async {
    try {
      await Api.post('/api/notifications/$id/read');
      await widget.data.loadNotifications();
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final data = widget.data;
    final raw = (data.notifications?['notifications'] as List?) ?? <dynamic>[];
    final list = raw.cast<Map<String, dynamic>>();
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          if (list.isNotEmpty)
            TextButton(onPressed: _busyAll ? null : _markAll, child: Text(_busyAll ? '…' : 'Mark all read', style: const TextStyle(color: C.primary, fontWeight: FontWeight.w700))),
        ],
      ),
      body: wrapWeb(
        RefreshIndicator(
          onRefresh: data.loadNotifications,
          child: list.isEmpty
              ? ListView(physics: const AlwaysScrollableScrollPhysics(), children: const [
                  EmptyState(icon: Icons.notifications_none, title: 'Nothing yet', text: 'Alerts about your journey, points and services appear here.'),
                ])
              : ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                  children: [
                    CyCard(
                      padding: EdgeInsets.zero,
                      child: Column(children: list.map((n) {
                        final unread = (n['read'] == false || n['read'] == 0) && n['read'] != true;
                        final type = (n['type'] as String?) ?? 'info';
                        return InkWell(
                          onTap: unread ? () => _markOne(n['id']?.toString() ?? '') : null,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
                            decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: C.border))),
                            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Container(
                                width: 36, height: 36,
                                decoration: BoxDecoration(color: unread ? C.successSoft : C.neutralSoft, borderRadius: BorderRadius.circular(11)),
                                child: Icon(_iconFor(type), size: 18, color: unread ? C.success : C.text3),
                              ),
                              const SizedBox(width: 11),
                              Expanded(
                                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Row(children: [
                                    Expanded(child: Text(n['title']?.toString() ?? 'Update', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5, color: unread ? C.text : C.text2))),
                                    Text(timeAgo(n['createdAt']?.toString() ?? ''), style: const TextStyle(color: C.text3, fontSize: 11)),
                                  ]),
                                  const SizedBox(height: 3),
                                  Text(n['message']?.toString() ?? '', style: const TextStyle(color: C.text2, fontSize: 12.5, height: 1.35)),
                                ]),
                              ),
                              if (unread) ...[
                                const SizedBox(width: 8),
                                Container(width: 8, height: 8, margin: const EdgeInsets.only(top: 5), decoration: const BoxDecoration(color: C.primary, shape: BoxShape.circle)),
                              ],
                            ]),
                          ),
                        );
                      }).toList()),
                    ),
                    const SizedBox(height: 14),
                    Center(child: Text('Tap notifications to mark them as read.', style: const TextStyle(color: C.text3, fontSize: 12))),
                  ],
                ),
        ),
      ),
    );
  }

  IconData _iconFor(String type) {
    switch (type) {
      case 'loyalty':
      case 'rewards':
        return Icons.local_activity;
      case 'journey':
      case 'ticket':
        return Icons.flight_takeoff;
      case 'item':
        return Icons.shopping_bag_outlined;
      case 'service':
      case 'premium':
        return Icons.room_service_outlined;
      default:
        return Icons.notifications_none;
    }
  }
}