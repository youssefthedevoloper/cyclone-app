import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../theme.dart';
import '../widgets.dart';

class QrCard extends StatelessWidget {
  final String data;
  final double size;
  final String? caption;
  const QrCard({super.key, required this.data, this.size = 200, this.caption});

  @override
  Widget build(BuildContext context) {
    return Column(mainAxisSize: MainAxisSize.min, children: [
      Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: C.border),
        ),
        child: Stack(alignment: Alignment.center, children: [
          QrImageView(data: data, version: QrVersions.auto, size: size, backgroundColor: Colors.white),
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(7)),
            child: logoMark(size: 32),
          ),
        ]),
      ),
      if (caption != null) ...[
        const SizedBox(height: 10),
        Text(caption!, style: const TextStyle(color: C.text3, fontSize: 12.5)),
      ],
    ]);
  }
}

class QrThumb extends StatelessWidget {
  final String data;
  final double size;
  const QrThumb({super.key, required this.data, this.size = 72});
  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      padding: const EdgeInsets.all(5),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: C.border)),
      child: QrImageView(data: data, size: size, backgroundColor: Colors.white),
    );
  }
}