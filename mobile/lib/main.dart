import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'api/api.dart';
import 'screens/app_gate.dart';
import 'state/auth.dart';
import 'state/data.dart';
import 'theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final saved = prefs.getString('server_url');
  if (saved != null && saved.isNotEmpty) {
    Api.setBaseUrl(saved);
  }
  runApp(const CycloneApp());
}

class CycloneApp extends StatelessWidget {
  const CycloneApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthController()..boot()),
        ChangeNotifierProvider(create: (_) => AppData()),
      ],
      child: MaterialApp(
        title: 'CYCLONE',
        debugShowCheckedModeBanner: false,
        theme: buildTheme(),
        home: const AppGate(),
      ),
    );
  }
}