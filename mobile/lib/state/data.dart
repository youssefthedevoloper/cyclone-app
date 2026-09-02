import 'package:flutter/foundation.dart';

import '../api/api.dart';

/// Global app data, reset on login/logout. Screens listen and call [refresh] after mutations.
class AppData extends ChangeNotifier {
  Map<String, dynamic>? journey; // { access, journey, reason, message }
  Map<String, dynamic>? loyalty; // { balance, transactions }
  List<dynamic>? tickets;
  List<dynamic>? items;
  Map<String, dynamic>? notifications; // { notifications, unreadCount }
  List<dynamic>? airports;
  final Set<String> loading = {};

  Future<void> load() async {
    await Future.wait([loadJourney(), loadLoyalty(), loadItems(), loadAirports()]);
  }

  Future<void> loadJourney() async {
    loading.add('journey');
    notifyListeners();
    try {
      journey = await Api.get('/api/journey');
    } catch (e) {
      journey = {'access': 'required', 'reason': e.toString()};
    }
    loading.remove('journey');
    notifyListeners();
  }

  Future<void> loadLoyalty() async {
    loading.add('loyalty');
    notifyListeners();
    try {
      loyalty = await Api.get('/api/loyalty');
    } catch (_) {}
    loading.remove('loyalty');
    notifyListeners();
  }

  Future<void> loadTickets() async {
    loading.add('tickets');
    notifyListeners();
    try {
      final r = await Api.get('/api/tickets');
      tickets = (r['tickets'] as List?) ?? [];
    } catch (_) {
      tickets = [];
    }
    loading.remove('tickets');
    notifyListeners();
  }

  Future<void> loadItems() async {
    loading.add('items');
    notifyListeners();
    try {
      final r = await Api.get('/api/items');
      items = (r['items'] as List?) ?? [];
    } catch (_) {
      items = [];
    }
    loading.remove('items');
    notifyListeners();
  }

  Future<void> loadNotifications() async {
    loading.add('notifications');
    notifyListeners();
    try {
      notifications = await Api.get('/api/notifications');
    } catch (_) {}
    loading.remove('notifications');
    notifyListeners();
  }

  Future<void> loadAirports() async {
    loading.add('airports');
    notifyListeners();
    try {
      final r = await Api.get('/api/airports');
      airports = (r['airports'] as List?) ?? [];
    } catch (_) {
      airports = [];
    }
    loading.remove('airports');
    notifyListeners();
  }

  int get points => (loyalty?['balance'] as num?)?.toInt() ?? 0;
  int get unreadCount =>
      (notifications?['unreadCount'] as num?)?.toInt() ?? 0;

  Future<void> refresh([List<String> keys = const []]) async {
    if (keys.isEmpty) {
      await load();
      return;
    }
    final futures = <Future<void>>[];
    for (final k in keys) {
      switch (k) {
        case 'journey':
          futures.add(loadJourney());
          break;
        case 'loyalty':
          futures.add(loadLoyalty());
          break;
        case 'tickets':
          futures.add(loadTickets());
          break;
        case 'items':
          futures.add(loadItems());
          break;
        case 'notifications':
          futures.add(loadNotifications());
          break;
        case 'airports':
          futures.add(loadAirports());
          break;
      }
    }
    await Future.wait(futures);
  }
}