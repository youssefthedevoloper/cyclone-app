import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/auth.dart';
import '../state/data.dart';
import '../theme.dart';
import '../widgets.dart';
import 'auth_screen.dart';
import 'shell.dart';

class AppGate extends StatelessWidget {
  const AppGate({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    if (auth.loading) return const _Splash();
    if (!auth.loggedIn) return const AuthScreen();

    final data = context.read<AppData>();
    Future.microtask(() {
      if (data.airports == null && data.items == null) data.load();
    });

    return const AppShell();
  }
}

class _Splash extends StatelessWidget {
  const _Splash();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: C.bg,
      body: Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          logoImage(height: 40),
          const SizedBox(height: 18),
          const SizedBox(width: 26, height: 26, child: CircularProgressIndicator(strokeWidth: 2.6, color: C.primary)),
        ]),
      ),
    );
  }
}