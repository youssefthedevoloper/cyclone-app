import 'package:flutter/material.dart';

import 'places.dart';

class ShopsScreen extends StatelessWidget {
  const ShopsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return const PlacesListScreen(
      title: 'Shops',
      icon: Icons.shopping_bag_outlined,
      intro: 'Duty-free and partner stores in the terminal.',
      types: ['shop'],
    );
  }
}