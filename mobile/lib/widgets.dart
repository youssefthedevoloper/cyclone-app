import 'package:flutter/material.dart';

import 'theme.dart';

class CyCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry? margin;
  final Color? color;
  final Border? border;
  const CyCard({super.key, required this.child, this.padding = const EdgeInsets.all(16), this.margin, this.color, this.border});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? C.surface,
        borderRadius: BorderRadius.circular(16),
        border: border ?? Border.all(color: C.border),
        boxShadow: const [
          BoxShadow(color: Color(0x080B2545), blurRadius: 14, offset: Offset(0, 4)),
        ],
      ),
      child: child,
    );
  }
}

class SectionTitle extends StatelessWidget {
  final String text;
  const SectionTitle(this.text, {super.key});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(2, 20, 2, 10),
      child: Text(
        text.toUpperCase(),
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.6,
          color: C.text3,
        ),
      ),
    );
  }
}

String _pretty(String s) => s.replaceAll('_', ' ');

class StatusBadge extends StatelessWidget {
  final String status;
  final String? label;
  const StatusBadge(this.status, {super.key, this.label});

  (Color, Color) _colors() {
    const successes = {'completed', 'recovered', 'safe', 'landed', 'verified', 'redeemed', 'confirmed', 'premium', 'boarded'};
    const blues = {'boarding', 'current', 'found', 'departed', 'scheduled'};
    const warnings = {'delayed', 'attention', 'attention_required', 'lost'};
    const dangers = {'cancelled', 'required', 'error'};
    final s = status.toLowerCase();
    if (successes.contains(s)) return (C.successSoft, C.success);
    if (blues.contains(s)) return (const Color(0xFFE6EEFC), C.primaryDark);
    if (warnings.contains(s)) return (C.warningSoft, C.warning);
    if (dangers.contains(s)) return (C.dangerSoft, C.danger);
    return (C.neutralSoft, C.text2);
  }

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = _colors();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Container(width: 7, height: 7, decoration: BoxDecoration(color: fg, shape: BoxShape.circle)),
        const SizedBox(width: 5),
        Text(label ?? _pretty(status), style: TextStyle(color: fg, fontSize: 12, fontWeight: FontWeight.w600)),
      ]),
    );
  }
}

class DotBadge extends StatelessWidget {
  final String category;
  final String? icon;
  const DotBadge(this.category, {super.key, this.icon});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: C.neutralSoft, borderRadius: BorderRadius.circular(6)),
      child: Text(category, style: const TextStyle(color: C.text2, fontSize: 11.5, fontWeight: FontWeight.w600)),
    );
  }
}

class PointsChip extends StatelessWidget {
  final int value;
  final double size;
  const PointsChip(this.value, {super.key, this.size = 15});
  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Text(
        (value >= 0 ? '+' : '') + value.toString(),
        style: TextStyle(color: C.primary, fontSize: size, fontWeight: FontWeight.w800, fontFeatures: const [FontFeature.tabularFigures()]),
      ),
      const SizedBox(width: 3),
      Icon(Icons.local_activity, size: size + 2, color: C.primary),
    ]);
  }
}

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? text;
  final Widget? action;
  const EmptyState({super.key, required this.icon, required this.title, this.text, this.action});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 16),
      child: Column(children: [
        Container(
          width: 64, height: 64,
          decoration: const BoxDecoration(color: C.neutralSoft, shape: BoxShape.circle),
          child: Icon(icon, size: 28, color: C.text3),
        ),
        const SizedBox(height: 14),
        Text(title, textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: C.text)),
        if (text != null) ...[
          const SizedBox(height: 6),
          Text(text!, textAlign: TextAlign.center, style: const TextStyle(fontSize: 13, color: C.text2)),
        ],
        if (action != null) ...[const SizedBox(height: 16), action!],
      ]),
    );
  }
}

class SkeletonBox extends StatelessWidget {
  final double height;
  final double width;
  final double radius;
  const SkeletonBox({super.key, this.height = 16, this.width = double.infinity, this.radius = 8});
  @override
  Widget build(BuildContext context) {
    return Container(height: height, width: width, decoration: BoxDecoration(color: const Color(0xFFEDF1F7), borderRadius: BorderRadius.circular(radius)));
  }
}

class PrimaryBtn extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool busy;
  final Widget? child;
  const PrimaryBtn({super.key, this.label = 'Continue', this.onPressed, this.icon, this.busy = false, this.child});
  @override
  Widget build(BuildContext context) {
    final content = child ??
        Row(mainAxisSize: MainAxisSize.min, children: [
          if (icon != null) ...[Icon(icon, size: 18), const SizedBox(width: 8)],
          Text(label),
        ]);
    return SizedBox(
      width: double.infinity,
      child: FilledButton(
        onPressed: busy ? null : onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: C.primary,
          disabledBackgroundColor: C.primary.withValues(alpha: 0.55),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: busy ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white)) : content,
      ),
    );
  }
}

class SecondaryBtn extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool busy;
  const SecondaryBtn({super.key, required this.label, this.onPressed, this.icon, this.busy = false});
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: FilledButton(
        onPressed: busy ? null : onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: const Color(0xFFDCEAFF),
          foregroundColor: C.primaryDark,
          disabledBackgroundColor: const Color(0xFFDCEAFF).withValues(alpha: 0.6),
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          if (icon != null) ...[Icon(icon, size: 18), const SizedBox(width: 8)],
          Text(label),
        ]),
      ),
    );
  }
}

class OutlineBtn extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  const OutlineBtn({super.key, required this.label, this.onPressed, this.icon});
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: C.text,
          side: const BorderSide(color: C.border),
          backgroundColor: C.surface,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          if (icon != null) ...[Icon(icon, size: 18, color: C.text2), const SizedBox(width: 8)],
          Text(label, style: const TextStyle(color: C.text)),
        ]),
      ),
    );
  }
}

class DangerBtn extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  const DangerBtn({super.key, required this.label, this.onPressed, this.icon});
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: FilledButton(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: C.dangerSoft,
          foregroundColor: C.danger,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          if (icon != null) ...[Icon(icon, size: 18), const SizedBox(width: 8)],
          Text(label),
        ]),
      ),
    );
  }
}

class InfoTile extends StatelessWidget {
  final String label;
  final String value;
  const InfoTile({super.key, required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: C.text3, fontSize: 12.5)),
          const SizedBox(width: 12),
          Flexible(child: Text(value, style: const TextStyle(color: C.text, fontWeight: FontWeight.w700, fontSize: 13.5), textAlign: TextAlign.right)),
        ],
      ),
    );
  }
}

class FieldLabel extends StatelessWidget {
  final String text;
  const FieldLabel(this.text, {super.key});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(text, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: C.text2)),
    );
  }
}

InputDecoration fieldDecoration({String? hint}) {
  return InputDecoration(
    hintText: hint,
    hintStyle: const TextStyle(color: C.text3),
    filled: true,
    fillColor: C.surface,
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: C.border)),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: C.border)),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: C.primary, width: 1.5)),
  );
}

Widget logoImage({double height = 28}) {
  return Image.asset(
    'assets/trans-logo.png',
    height: height,
    errorBuilder: (_, _, _) => Image.asset('assets/trans-logo.jpeg', height: height, errorBuilder: (_, _, _) => Image.asset('assets/logo.png', height: height)),
  );
}

Widget logoMark({double size = 26}) {
  return ClipRRect(
    borderRadius: BorderRadius.circular(7),
    child: Image.asset('assets/trans-logo.png', width: size, height: size, fit: BoxFit.contain,
        errorBuilder: (_, _, _) => Image.asset('assets/trans-logo.jpeg', width: size, height: size, fit: BoxFit.contain)),
  );
}

String fmtDate(String iso) {
  try {
    final d = DateTime.parse(iso).toLocal();
    return '${_month[d.month - 1]} ${d.day}, ${d.year}';
  } catch (_) {
    return iso;
  }
}

String fmtTime(String iso) {
  try {
    final d = DateTime.parse(iso).toLocal();
    final h = d.hour <= 12 ? (d.hour == 0 ? 12 : d.hour) : d.hour - 12;
    final m = d.minute.toString().padLeft(2, '0');
    return '$h:$m ${d.hour < 12 ? 'AM' : 'PM'}';
  } catch (_) {
    return iso;
  }
}

String timeAgo(String iso) {
  try {
    final diff = DateTime.now().difference(DateTime.parse(iso).toLocal());
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  } catch (_) {
    return '';
  }
}

const _month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];