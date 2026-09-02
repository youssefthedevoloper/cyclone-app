import 'package:flutter/material.dart';

import '../state/auth.dart';
import '../state/data.dart';
import '../theme.dart';
import '../widgets.dart';
import 'shell.dart';
import 'sub/airport_map.dart';
import 'sub/generate_qr.dart';
import 'sub/lost_found.dart';
import 'sub/my_items.dart';
import 'sub/boarding_pass.dart';
import 'sub/checkin.dart';
import 'sub/flight_details.dart';
import 'sub/journey_progress.dart';
import 'sub/lounges.dart';
import 'sub/medical.dart';
import 'sub/points.dart';
import 'sub/premium.dart';
import 'sub/restaurants.dart';
import 'sub/rewards.dart';
import 'sub/scan_qr.dart';
import 'sub/services.dart';
import 'sub/shops.dart';
import 'sub/transportation.dart';

class FeaturesTab extends StatelessWidget {
  final AuthController auth;
  final AppData data;
  const FeaturesTab({super.key, required this.auth, required this.data});

  @override
  Widget build(BuildContext context) {
    final sections = [
      _Sec('Journey', [
        _Feat(Icons.route, 'Personalized Journey', 'Step-by-step guidance for your flight.', () => push(context, const JourneyProgressScreen())),
        _Feat(Icons.flight, 'Flight Status', 'Live flight information and gate updates.', () => push(context, const FlightDetailsScreen())),
        _Feat(Icons.map, 'Airport Map', 'Explore the terminal and find services.', () => push(context, const AirportMapScreen())),
        _Feat(Icons.checklist, 'Check-in', 'Check in for your flight and drop bags.', () => push(context, const CheckinScreen())),
        _Feat(Icons.badge_outlined, 'Boarding Info', 'Gates, times and status at a glance.', () => push(context, const BoardingPassScreen())),
      ]),
      _Sec('Airport', [
        _Feat(Icons.map_outlined, 'Airport Map', 'Search gates, landmarks, services.', () => push(context, const AirportMapScreen())),
        _Feat(Icons.local_cafe_outlined, 'Lounges', 'Relax with CYCLONE lounges.', () => push(context, const LoungesScreen())),
        _Feat(Icons.restaurant_outlined, 'Restaurants', 'Best places to eat in the terminal.', () => push(context, const RestaurantsScreen())),
        _Feat(Icons.shopping_bag_outlined, 'Shops', 'Duty-free and partner stores.', () => push(context, const ShopsScreen())),
        _Feat(Icons.local_hospital_outlined, 'Medical', 'Medical facilities and assistance.', () => push(context, const MedicalScreen())),
        _Feat(Icons.directions_bus_outlined, 'Transportation', 'Ground transport and transfers.', () => push(context, const TransportationScreen())),
        _Feat(Icons.local_parking_outlined, 'Parking', 'Parking information.', () => push(context, const AirportMapScreen())),
      ]),
      _Sec('Safety', [
        _Feat(Icons.shield_outlined, 'Lost & Found', 'Report, recover and identify lost items.', () => push(context, const LostFoundScreen())),
        _Feat(Icons.work_outlined, 'My Items', 'Registered items with QR identifiers.', () => push(context, const MyItemsScreen())),
        _Feat(Icons.qr_code_scanner, 'QR Scanner', 'Identify any CYCLONE-tagged item.', () => push(context, const ScanQrScreen())),
        _Feat(Icons.qr_code_2, 'Generate QR', 'Protect a belonging with a personal QR.', () => push(context, const GenerateQrScreen())),
      ]),
      _Sec('Rewards', [
        _Feat(Icons.local_activity, 'Cyclone Points', 'Your loyalty balance and history.', () => push(context, const CyclonePointsScreen())),
        _Feat(Icons.card_giftcard, 'Rewards Shop', 'Spend points on travel perks.', () => push(context, const RewardsScreen())),
        _Feat(Icons.workspace_premium_outlined, 'Premium', 'Priority assistance and advanced features.', () => push(context, const PremiumScreen())),
        _Feat(Icons.room_service_outlined, 'Airport Services', 'Lounges, assistance and premium services.', () => push(context, const ServicesScreen())),
      ]),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Features')),
      body: wrapWeb(
        RefreshIndicator(
          onRefresh: data.refresh,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.only(bottom: 24),
            children: [
              _premiumBanner(context),
              for (final sec in sections) ...[
                SectionTitle(sec.title),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 1.35,
                    children: sec.items.map((f) => f.build(context)).toList(),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _premiumBanner(BuildContext context) {
    final on = auth.isPremium;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      child: CyCard(
        color: on ? const Color(0xFFEAF2FF) : null,
        border: on ? Border.all(color: const Color(0xFFCFE0FB)) : null,
        child: Row(children: [
          Icon(on ? Icons.workspace_premium : Icons.workspace_premium_outlined, color: C.primary),
          const SizedBox(width: 10),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(on ? 'Premium enabled' : 'Free plan', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14.5)),
              Text(on ? 'Enjoy priority assistance and advanced navigation.' : 'Unlock premium with points.', style: const TextStyle(color: C.text2, fontSize: 12.5)),
            ]),
          ),
          TextButton(onPressed: () => push(context, const PremiumScreen()), child: const Text('View', style: TextStyle(color: C.primary, fontWeight: FontWeight.w700))),
        ]),
      ),
    );
  }
}

class _Feat {
  final IconData icon;
  final String title;
  final String desc;
  final VoidCallback onTap;
  const _Feat(this.icon, this.title, this.desc, this.onTap);

  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(13),
        decoration: BoxDecoration(color: C.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: C.border)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            width: 40, height: 40,
            decoration: const BoxDecoration(color: Color(0xFFEAF2FF), shape: BoxShape.circle),
            child: Icon(icon, color: C.primary, size: 20),
          ),
          const Spacer(),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5, color: C.text)),
          const SizedBox(height: 2),
          Expanded(child: Text(desc, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11.5, color: C.text2, height: 1.3))),
        ]),
      ),
    );
  }
}

class _Sec {
  final String title;
  final List<_Feat> items;
  const _Sec(this.title, this.items);
}