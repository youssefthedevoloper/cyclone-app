import 'package:flutter/material.dart';

import '../state/auth.dart';
import '../state/data.dart';
import '../theme.dart';
import '../widgets.dart';
import 'shell.dart';
import 'sub/restaurants.dart';
import 'sub/shops.dart';
import 'sub/lounges.dart';
import 'sub/transportation.dart';
import 'sub/medical.dart';
import 'sub/services.dart';
import 'sub/tickets.dart';
import 'sub/boarding_pass.dart';
import 'sub/lost_found.dart';
import 'sub/airport_map.dart';

/// Explore: dining, shops, lounges, transportation and useful airport
/// information — surfaced as focused destination cards.
class ExploreTab extends StatelessWidget {
  final AuthController auth;
  final AppData data;
  const ExploreTab({super.key, required this.auth, required this.data});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: data.loadAirports,
        child: wrapWeb(
          ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(C.pad, 20, C.pad, 30),
            children: [
              Row(children: [
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Explore', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: C.text, letterSpacing: -0.4)),
                    const SizedBox(height: 2),
                    Text('Discover the airport', style: const TextStyle(color: C.text3, fontSize: 13.5)),
                  ]),
                ),
                headerChip(Icons.local_activity, '${data.points} pts'),
              ]),
              const SizedBox(height: 18),
              _browseRow(
                icon: Icons.restaurant_outlined,
                title: 'Dining',
                subtitle: 'Restaurants & cafés',
                onTap: () => push(context, const RestaurantsScreen()),
              ),
              const SizedBox(height: 12),
              _browseRow(
                icon: Icons.shopping_bag_outlined,
                title: 'Shops',
                subtitle: 'Duty-free & partner stores',
                onTap: () => push(context, const ShopsScreen()),
              ),
              const SizedBox(height: 12),
              _browseRow(
                icon: Icons.weekend_outlined,
                title: 'Lounges',
                subtitle: 'Relax, work & refresh',
                onTap: () => push(context, const LoungesScreen()),
              ),
              const SizedBox(height: 12),
              _browseRow(
                icon: Icons.directions_bus_outlined,
                title: 'Transportation',
                subtitle: 'Ground transport & transfers',
                onTap: () => push(context, const TransportationScreen()),
              ),
              const SizedBox(height: 12),
              _browseRow(
                icon: Icons.local_hospital_outlined,
                title: 'Medical',
                subtitle: 'Facilities & assistance',
                onTap: () => push(context, const MedicalScreen()),
              ),
              const SizedBox(height: 12),
              _browseRow(
                icon: Icons.room_service_outlined,
                title: 'Airport Services',
                subtitle: 'Book lounges, assistance & more',
                onTap: () => push(context, const ServicesScreen()),
              ),
              const SizedBox(height: 26),
              const SectionHeader('Useful info', subtitle: 'Trip essentials at a glance'),
              ServiceListCard(children: [
                ServiceRow(icon: Icons.airplane_ticket_outlined, title: 'Tickets', subtitle: 'Manage your flights', onTap: () => push(context, const TicketsScreen())),
                ServiceRow(icon: Icons.badge_outlined, title: 'Boarding Pass', subtitle: 'View your pass', onTap: () => push(context, const BoardingPassScreen())),
                ServiceRow(icon: Icons.shield_outlined, title: 'Lost & Found', subtitle: 'Report & recover items', onTap: () => push(context, const LostFoundScreen())),
                ServiceRow(icon: Icons.map_outlined, title: 'Airport Map', subtitle: 'Navigate the terminal', onTap: () => push(context, const AirportMapScreen())),
              ]),
            ],
          ),
        ),
      ),
    );
  }

  Widget headerChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(color: C.primarySoft, borderRadius: BorderRadius.circular(12)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 16, color: C.primary),
        const SizedBox(width: 5),
        Text(label, style: const TextStyle(color: C.primaryDark, fontWeight: FontWeight.w800, fontSize: 12.5)),
      ]),
    );
  }

  Widget _browseRow({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return CyCard(
      padding: const EdgeInsets.all(18),
      child: InkWell(
        borderRadius: BorderRadius.circular(C.radiusCard - 4),
        onTap: onTap,
        child: Row(children: [
          Container(
            width: 54, height: 54,
            decoration: BoxDecoration(color: C.primarySoft, borderRadius: BorderRadius.circular(16)),
            child: Icon(icon, color: C.primary, size: 26),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: C.text)),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(color: C.text3, fontSize: 12.5)),
            ]),
          ),
          Container(
            width: 32, height: 32,
            decoration: const BoxDecoration(color: C.primarySoft, shape: BoxShape.circle),
            child: const Icon(Icons.arrow_forward, size: 17, color: C.primary),
          ),
        ]),
      ),
    );
  }
}
