import 'package:flutter/material.dart';

import 'places.dart';

class LoungesScreen extends StatelessWidget {
  const LoungesScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return const PlacesListScreen(
      title: 'Lounges',
      icon: Icons.weekend_outlined,
      intro: 'Relax with CYCLONE lounges across the terminal.',
      types: ['lounge'],
      serviceCats: ['Lounge'],
    );
  }
}