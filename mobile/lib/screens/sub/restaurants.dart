import 'package:flutter/material.dart';

import 'places.dart';

class RestaurantsScreen extends StatelessWidget {
  const RestaurantsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return const PlacesListScreen(
      title: 'Restaurants',
      icon: Icons.restaurant_outlined,
      intro: 'Best places to eat in the terminal.',
      types: ['restaurant'],
    );
  }
}