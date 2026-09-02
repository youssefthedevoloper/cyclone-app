import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'screens/app_gate.dart';
import 'state/auth.dart';
import 'state/data.dart';
import 'theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
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