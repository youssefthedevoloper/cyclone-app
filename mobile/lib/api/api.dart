import 'dart:convert';

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;

import '../theme.dart';

class ApiException implements Exception {
  final String message;
  final int? status;
  final String? code;
  ApiException(this.message, {this.status, this.code});
  @override
  String toString() => message;
}

/// Lightweight REST client for the CYCLONE backend.
class Api {
  Api();

  static String? _token;
  static void setToken(String? t) => _token = t;

  static String? _customBase;
  static String get baseUrl {
    if (_customBase != null && _customBase!.isNotEmpty) return _customBase!;
    return AppConst.apiBase;
  }

  /// Allows the user to point the app at any backend address (tunnel URL).
  static void setBaseUrl(String? url) {
    var u = (url ?? '').trim();
    while (u.endsWith('/')) {
      u = u.substring(0, u.length - 1);
    }
    _customBase = u;
  }

  static Future<Map<String, dynamic>> get(String path, {bool auth = true}) =>
      _send('GET', path, auth: auth);

  static Future<Map<String, dynamic>> post(String path, [Map<String, dynamic>? body, bool auth = true]) =>
      _send('POST', path, body: body, auth: auth);

  static Future<Map<String, dynamic>> patch(String path, [Map<String, dynamic>? body, bool auth = true]) =>
      _send('PATCH', path, body: body, auth: auth);

  static Future<Map<String, dynamic>> delete(String path, {bool auth = true}) =>
      _send('DELETE', path, auth: auth);

  static Future<Map<String, dynamic>> _send(
    String method,
    String path, {
    Map<String, dynamic>? body,
    bool auth = true,
  }) async {
    Uri uri;
    if (kIsWeb && baseUrl.isEmpty) {
      // Same-origin deployment (Flutter web served by the backend itself):
      // resolve against the current page URL instead of a hard-coded host.
      uri = Uri.base.resolve(path);
    } else if (baseUrl.isEmpty) {
      throw ApiException('Server address is not set. Enter it on the login screen.');
    } else {
      uri = Uri.parse('$baseUrl$path');
    }
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (auth && _token != null && _token!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_token';
    }
    final encoded = body == null ? null : jsonEncode(body);
    http.Response res;
    try {
      switch (method) {
        case 'GET':
          res = await http.get(uri, headers: headers);
          break;
        case 'POST':
          res = await http.post(uri, headers: headers, body: encoded);
          break;
        case 'PATCH':
          res = await http.patch(uri, headers: headers, body: encoded);
          break;
        case 'DELETE':
          res = await http.delete(uri, headers: headers);
          break;
        default:
          res = await http.get(uri, headers: headers);
      }
    } on Exception {
      throw ApiException('Cannot reach CYCLONE. Is the backend running?');
    }

    Map<String, dynamic> data;
    try {
      data = jsonDecode(res.body.isEmpty ? '{}' : res.body) as Map<String, dynamic>;
    } catch (_) {
      data = <String, dynamic>{};
    }
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return data;
    }
    final err = data['error'] is Map<String, dynamic> ? data['error'] as Map<String, dynamic> : null;
    final msg = (err?['message'] as String?) ?? 'Request failed (${res.statusCode})';
    throw ApiException(msg, status: res.statusCode, code: err?['code'] as String?);
  }
}