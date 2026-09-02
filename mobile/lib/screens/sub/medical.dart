import 'package:flutter/material.dart';

import 'places.dart';

class MedicalScreen extends StatelessWidget {
  const MedicalScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return const PlacesListScreen(
      title: 'Medical',
      icon: Icons.local_hospital_outlined,
      intro: 'Medical facilities and assistance available.',
      types: ['medical'],
    );
  }
}