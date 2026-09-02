import 'package:flutter/material.dart';

import 'places.dart';

class TransportationScreen extends StatelessWidget {
  const TransportationScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return const PlacesListScreen(
      title: 'Transportation',
      icon: Icons.directions_bus_outlined,
      intro: 'Ground transport and transfers from the airport.',
      types: ['transport'],
    );
  }
}