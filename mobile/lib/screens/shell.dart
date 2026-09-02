import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/auth.dart';
import '../state/data.dart';
import '../theme.dart';
import 'features.dart';
import 'home.dart';
import 'journey.dart';
import 'loyalty.dart';
import 'profile.dart';

const double _maxW = 560;

Widget wrapWeb(Widget child) {
  return Align(
    alignment: Alignment.topCenter,
    child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: _maxW), child: child),
  );
}

/// Bottom navigation app shell (mobile layout, centered on web).
class AppShell extends StatefulWidget {
  const AppShell({super.key});
  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final data = context.watch<AppData>();
    final pages = [
      HomeTab(auth: auth, data: data),
      JourneyTab(auth: auth, data: data),
      FeaturesTab(auth: auth, data: data),
      LoyaltyTab(auth: auth, data: data),
      ProfileTab(auth: auth, data: data),
    ];
    return Scaffold(
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: _maxW),
        child: NavigationBar(
          selectedIndex: _index,
          backgroundColor: C.surface,
          indicatorColor: const Color(0xFFDCEAFF),
          height: 64,
          onDestinationSelected: (i) => setState(() => _index = i),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.route_outlined), selectedIcon: Icon(Icons.route), label: 'Journey'),
            NavigationDestination(icon: Icon(Icons.grid_view_outlined), selectedIcon: Icon(Icons.grid_view), label: 'Features'),
            NavigationDestination(icon: Icon(Icons.stars_outlined), selectedIcon: Icon(Icons.stars), label: 'Loyalty'),
            NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
          ],
        ),
      ),
    );
  }
}

Future<T?> push<T>(BuildContext context, Widget screen) {
  return Navigator.of(context).push<T>(
    MaterialPageRoute(builder: (_) => screen),
  );
}

void toast(BuildContext context, String msg, {bool error = false}) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(msg), backgroundColor: error ? const Color(0xFF8A1C1C) : C.primaryDark),
  );
}