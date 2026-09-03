import 'package:flutter/material.dart';

import '../state/auth.dart';
import '../state/data.dart';
import '../theme.dart';
import '../widgets.dart';
import 'shell.dart';
import 'sub/airport_map.dart';
import 'sub/airport_categories.dart';
import 'sub/checkin.dart';
import 'sub/restaurants.dart';
import 'sub/shops.dart';
import 'sub/lounges.dart';
import 'sub/medical.dart';
import 'sub/transportation.dart';
import 'sub/services.dart';
import 'sub/lost_found.dart';

/// Dedicated airport navigation / service hub. The Airport Map is the primary
/// visual; secondary widgets surface gates, facilities and services.
class AirportTab extends StatelessWidget {
  final AuthController auth;
  final AppData data;
  const AirportTab({super.key, required this.auth, required this.data});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: data.loadAirports,
        child: wrapWeb(
          ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: EdgeInsets.zero,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(C.pad, 20, C.pad, 6),
                child: Row(children: [
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('Airport', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: C.text, letterSpacing: -0.4)),
                      const SizedBox(height: 2),
                      Text('Navigate the terminal', style: const TextStyle(color: C.text3, fontSize: 13.5)),
                    ]),
                  ),
                  logoMark(size: 34),
                ]),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(C.pad, 10, C.pad, 6),
                child: _mapPanel(context),
              ),
              const Padding(
                padding: EdgeInsets.fromLTRB(C.pad, 20, C.pad, 4),
                child: SectionHeader('Facilities & services', subtitle: 'Everything you need in the terminal'),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(C.pad, 0, C.pad, 12),
                child: _facilitiesGrid(context),
              ),
              const Padding(
                padding: EdgeInsets.fromLTRB(C.pad, 20, C.pad, 4),
                child: SectionHeader('Explore the terminal', subtitle: 'Places and services across the airport'),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(C.pad, 0, C.pad, 30),
                child: _servicesList(context),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _mapPanel(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(C.radius),
        boxShadow: [C.cardShadow],
      ),
      child: Material(
        color: C.surface,
        borderRadius: BorderRadius.circular(C.radius),
        child: InkWell(
          borderRadius: BorderRadius.circular(C.radius),
          onTap: () => push(context, const AirportMapScreen()),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(color: C.primary, borderRadius: BorderRadius.circular(14)),
                  child: const Icon(Icons.map_outlined, color: Colors.white, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Cairo International Airport', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                    const SizedBox(height: 2),
                    Text('Live interactive terminal map', style: const TextStyle(color: C.text3, fontSize: 12.5)),
                  ]),
                ),
                const Icon(Icons.chevron_right, color: C.text3),
              ]),
              const SizedBox(height: 16),
              Container(
                height: 96,
                decoration: BoxDecoration(
                  color: const Color(0xFFEAF1FC),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Stack(children: [
                  Positioned.fill(
                    child: CustomPaint(painter: _MiniMapPainter(color: C.primary)),
                  ),
                  Center(
                    child: Chip(
                      avatar: const Icon(Icons.navigation, size: 16, color: Colors.white),
                      label: const Text('Open Airport Map'),
                      backgroundColor: C.primary,
                      labelStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12.5),
                      side: BorderSide.none,
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    ),
                  ),
                ]),
              ),
              const SizedBox(height: 14),
              Wrap(spacing: 8, runSpacing: 8, children: [
                _mapChip(Icons.signpost_outlined, 'Gates'),
                _mapChip(Icons.luggage_outlined, 'Check-in'),
                _mapChip(Icons.security, 'Security'),
                _mapChip(Icons.verified_user_outlined, 'Passport Control'),
                _mapChip(Icons.luggage, 'Baggage Claim'),
              ]),
            ]),
          ),
        ),
      ),
    );
  }

  Widget _mapChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: C.primarySoft, borderRadius: BorderRadius.circular(10)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 14, color: C.primary),
        const SizedBox(width: 5),
        Text(label, style: const TextStyle(color: C.primaryDark, fontSize: 11.5, fontWeight: FontWeight.w700)),
      ]),
    );
  }

  Widget _facilitiesGrid(BuildContext context) {
    final items = [
      (Icons.luggage_outlined, 'Check-in', () => push(context, const CheckinScreen())),
      (Icons.security, 'Security', () => push(context, const AirportCategoriesScreen())),
      (Icons.verified_user_outlined, 'Passport', () => push(context, const AirportCategoriesScreen())),
      (Icons.luggage, 'Baggage', () => push(context, const AirportCategoriesScreen())),
      (Icons.weekend_outlined, 'Lounges', () => push(context, const LoungesScreen())),
      (Icons.restaurant_outlined, 'Dining', () => push(context, const RestaurantsScreen())),
      (Icons.shopping_bag_outlined, 'Shops', () => push(context, const ShopsScreen())),
      (Icons.payments_outlined, 'ATM', () => push(context, const AirportCategoriesScreen())),
      (Icons.local_hospital_outlined, 'Medical', () => push(context, const MedicalScreen())),
      (Icons.shield_outlined, 'Lost & Found', () => push(context, const LostFoundScreen())),
      (Icons.directions_bus_outlined, 'Transport', () => push(context, const TransportationScreen())),
      (Icons.local_parking, 'Parking', () => push(context, const AirportCategoriesScreen())),
    ];
    return LayoutBuilder(builder: (context, box) {
      final itemWidth = (box.maxWidth - 12 * 2) / 3;
      return Wrap(
        spacing: 12,
        runSpacing: 12,
        children: [
          for (final it in items)
            SizedBox(
              width: itemWidth,
              height: itemWidth * 1.02,
              child: QuickActionCard(icon: it.$1, label: it.$2, onTap: it.$3),
            ),
        ],
      );
    });
  }

  Widget _servicesList(BuildContext context) {
    final rows = [
      ServiceRow(
        icon: Icons.search_outlined,
        title: 'Browse airport map',
        subtitle: 'Gates, landmarks, every service',
        onTap: () => push(context, const AirportCategoriesScreen()),
      ),
      ServiceRow(
        icon: Icons.category_outlined,
        title: 'Terminal categories',
        subtitle: 'Explore by facility type',
        onTap: () => push(context, const AirportCategoriesScreen()),
      ),
      ServiceRow(
        icon: Icons.room_service_outlined,
        title: 'Airport services',
        subtitle: 'Book lounges, assistance and more',
        onTap: () => push(context, const ServicesScreen()),
      ),
    ];
    return ServiceListCard(children: rows);
  }
}

class _MiniMapPainter extends CustomPainter {
  final Color color;
  _MiniMapPainter({required this.color});
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withValues(alpha: 0.12)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;
    final route = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;
    final pts = [
      Offset(size.width * 0.12, size.height * 0.25),
      Offset(size.width * 0.3, size.height * 0.55),
      Offset(size.width * 0.5, size.height * 0.35),
      Offset(size.width * 0.68, size.height * 0.62),
      Offset(size.width * 0.85, size.height * 0.4),
    ];
    for (var i = 0; i < pts.length - 1; i++) {
      canvas.drawLine(pts[i], pts[i + 1], paint);
    }
    canvas.drawLine(pts[0], pts[3], route);
  }

  @override
  bool shouldRepaint(covariant _MiniMapPainter old) => old.color != color;
}
