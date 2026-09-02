import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../api/api.dart';

class AuthController extends ChangeNotifier {
  String? token;
  Map<String, dynamic>? user;
  bool loading = true;

  bool get loggedIn => token != null && token!.isNotEmpty;
  bool get isPremium => user?['premiumStatus'] != null && user?['premiumStatus'] != 'free';
  bool get hasTicket => user?['hasTicket'] == true;
  bool get hasDemoAccess => user?['hasDemoAccess'] == true;

  static const _kToken = 'cyc_token';
  static const _kUser = 'cyc_user';

  Future<void> boot() async {
    final prefs = await SharedPreferences.getInstance();
    final t = prefs.getString(_kToken);
    if (t == null || t.isEmpty) {
      loading = false;
      notifyListeners();
      return;
    }
    token = t;
    Api.setToken(t);
    final cached = prefs.getString(_kUser);
    if (cached != null) {
      user = jsonDecode(cached) as Map<String, dynamic>;
    }
    // try to refresh from server; keep cached session if offline/unreachable
    try {
      final me = await Api.get('/api/users/me');
      user = me['user'] as Map<String, dynamic>? ?? user;
      await _persist();
    } catch (_) {
      // offline fallback: keep cached
    }
    loading = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final res = await Api.post('/api/auth/login', {
      'email': email,
      'password': password,
    });
    await _complete(res);
  }

  Future<void> register(String name, String email, String password) async {
    final res = await Api.post('/api/auth/register', {
      'name': name,
      'email': email,
      'password': password,
    }, false);
    await _complete(res);
  }

  Future<void> _complete(Map<String, dynamic> res) async {
    token = res['token'] as String;
    user = res['user'] as Map<String, dynamic>;
    Api.setToken(token);
    await _persist();
    notifyListeners();
  }

  Future<void> logout() async {
    token = null;
    user = null;
    Api.setToken(null);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kToken);
    await prefs.remove(_kUser);
    notifyListeners();
  }

  /// Replace the cached user (e.g. after a premium activation) and persist it.
  void updateUser(Map<String, dynamic> patch) {
    user = {...?user, ...patch};
    _persist();
    notifyListeners();
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    if (token != null) {
      await prefs.setString(_kToken, token!);
    }
    if (user != null) {
      await prefs.setString(_kUser, jsonEncode(user!));
    }
  }
}