import 'package:flutter/material.dart';

import 'theme.dart';

/// Base surface card for the CYCLONE design system.
class CyCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry? margin;
  final Color? color;
  final Border? border;
  const CyCard({super.key, required this.child, this.padding = const EdgeInsets.all(18), this.margin, this.color, this.border});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? C.surface,
        borderRadius: BorderRadius.circular(C.radiusCard),
        border: border,
        boxShadow: [C.cardShadow],
      ),
      child: child,
    );
  }
}

/// Uppercase micro label used as a section heading.
class SectionTitle extends StatelessWidget {
  final String text;
  const SectionTitle(this.text, {super.key});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 24, 4, 12),
      child: Text(
        text.toUpperCase(),
        style: const TextStyle(
          fontSize: 12.5,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.8,
          color: C.text3,
        ),
      ),
    );
  }
}

/// A friendly, larger section header with title and optional action.
class SectionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;
  const SectionHeader(this.title, {super.key, this.subtitle, this.actionLabel, this.onAction});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 24, 4, 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w800, color: C.text, letterSpacing: -0.3)),
              if (subtitle != null) ...[const SizedBox(height: 2), Text(subtitle!, style: const TextStyle(color: C.text3, fontSize: 13))],
            ]),
          ),
          if (actionLabel != null && onAction != null)
            TextButton(onPressed: onAction, style: TextButton.styleFrom(foregroundColor: C.primary), child: Text(actionLabel!, style: const TextStyle(fontWeight: FontWeight.w700))),
        ],
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
    if (blues.contains(s)) return (C.primarySoft, C.primaryDark);
    if (warnings.contains(s)) return (C.warningSoft, C.warning);
    if (dangers.contains(s)) return (C.dangerSoft, C.danger);
    return (C.neutralSoft, C.text2);
  }

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = _colors();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 5),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(C.radiusPill)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Container(width: 7, height: 7, decoration: BoxDecoration(color: fg, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(label ?? _pretty(status), style: TextStyle(color: fg, fontSize: 12, fontWeight: FontWeight.w700)),
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
      decoration: BoxDecoration(color: C.neutralSoft, borderRadius: BorderRadius.circular(8)),
      child: Text(category, style: const TextStyle(color: C.text2, fontSize: 11.5, fontWeight: FontWeight.w700)),
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
          width: 68, height: 68,
          decoration: const BoxDecoration(color: C.neutralSoft, shape: BoxShape.circle),
          child: Icon(icon, size: 30, color: C.text3),
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
  const SkeletonBox({super.key, this.height = 16, this.width = double.infinity, this.radius = 10});
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
          padding: const EdgeInsets.symmetric(vertical: 15),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(C.radiusSmall)),
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
          backgroundColor: C.primarySoft,
          foregroundColor: C.primaryDark,
          disabledBackgroundColor: C.primarySoft.withValues(alpha: 0.6),
          padding: const EdgeInsets.symmetric(vertical: 15),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(C.radiusSmall)),
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
          padding: const EdgeInsets.symmetric(vertical: 15),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(C.radiusSmall)),
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
          padding: const EdgeInsets.symmetric(vertical: 15),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(C.radiusSmall)),
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
      padding: const EdgeInsets.symmetric(vertical: 6),
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
      child: Text(text, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: C.text2)),
    );
  }
}

InputDecoration fieldDecoration({String? hint}) {
  return InputDecoration(
    hintText: hint,
    hintStyle: const TextStyle(color: C.text3),
    filled: true,
    fillColor: C.surface,
    contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(C.radiusSmall), borderSide: const BorderSide(color: C.border)),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(C.radiusSmall), borderSide: const BorderSide(color: C.border)),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(C.radiusSmall), borderSide: const BorderSide(color: C.primary, width: 1.6)),
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
    borderRadius: BorderRadius.circular(8),
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

/* -------------------------------------------------------------------------- */
/*  New reusable CYCLONE components                                           */
/* -------------------------------------------------------------------------- */

/// Large blue hero card used for the primary flight on the Home screen.
class FlightHeroCard extends StatelessWidget {
  final Map<String, dynamic> flight;
  final VoidCallback onTap;
  const FlightHeroCard({super.key, required this.flight, required this.onTap});

  String _fmt(String? v) => (v ?? '').toString();

  @override
  Widget build(BuildContext context) {
    final status = _fmt(flight['status']).isEmpty ? 'Scheduled' : _fmt(flight['status']);
    final airline = _fmt(flight['airline']).isEmpty ? 'CYCLONE' : _fmt(flight['airline']);
    final num = _fmt(flight['flightNumber']).isEmpty ? 'Flight' : _fmt(flight['flightNumber']);

    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF0E5ADB), Color(0xFF0B3CA0)],
        ),
        borderRadius: BorderRadius.circular(C.radius),
        boxShadow: [
          BoxShadow(color: C.primary.withValues(alpha: 0.35), blurRadius: 26, offset: const Offset(0, 12)),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(C.radius),
        child: InkWell(
          borderRadius: BorderRadius.circular(C.radius),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 18, 20, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Container(
                    width: 38, height: 38,
                    decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.18), borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.flight, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('$airline  $num', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16, letterSpacing: -0.2)),
                      Text('Boarding pass', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12)),
                    ]),
                  ),
                  _glassBadge(status),
                ]),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _airportCol(_fmt(flight['origin']), _fmt(flight['departureTime']), start: true),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.16), borderRadius: BorderRadius.circular(C.radiusPill)),
                      child: const Row(mainAxisSize: MainAxisSize.min, children: [
                        Icon(Icons.flight_takeoff, color: Colors.white, size: 20),
                        SizedBox(width: 4),
                        Icon(Icons.arrow_forward, color: Colors.white, size: 16),
                      ]),
                    ),
                    _airportCol(_fmt(flight['destination']), _fmt(flight['arrivalTime'])),
                  ],
                ),
                const SizedBox(height: 18),
                Container(height: 1, color: Colors.white.withValues(alpha: 0.18)),
                const SizedBox(height: 14),
                Row(children: [
                  _miniStat(Icons.signpost_outlined, 'Gate', _fmt(flight['gate']).isEmpty ? '—' : _fmt(flight['gate'])),
                  const SizedBox(width: 16),
                  _miniStat(Icons.event_seat_outlined, 'Seat', _fmt(flight['seat']).isEmpty ? '—' : _fmt(flight['seat'])),
                  const Spacer(),
                  Container(
                    width: 34, height: 34,
                    decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.18), shape: BoxShape.circle),
                    child: const Icon(Icons.chevron_right, color: Colors.white, size: 22),
                  ),
                ]),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _glassBadge(String status) {
    final bg = status.toLowerCase() == 'boarding' ? const Color(0xFF4CD964) : Colors.white.withValues(alpha: 0.2);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 5),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(C.radiusPill)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        if (status.toLowerCase() == 'boarding') ...[
          Container(width: 7, height: 7, decoration: const BoxDecoration(color: Color(0xFF0B5A2A), shape: BoxShape.circle)),
          const SizedBox(width: 6),
        ],
        Text(status.toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.w800, letterSpacing: 0.6)),
      ]),
    );
  }

  Widget _airportCol(String code, String time, {bool start = false}) {
    return Column(
      crossAxisAlignment: start ? CrossAxisAlignment.start : CrossAxisAlignment.end,
      children: [
        Text(time.isEmpty ? '' : fmtTime(time), style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12.5, fontWeight: FontWeight.w600)),
        const SizedBox(height: 2),
        Text(code.isEmpty ? '—' : code, style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: -0.5)),
      ],
    );
  }

  Widget _miniStat(IconData icon, String label, String value) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Icon(icon, color: Colors.white70, size: 16),
      const SizedBox(width: 5),
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: TextStyle(color: Colors.white.withValues(alpha: 0.65), fontSize: 10, fontWeight: FontWeight.w600)),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13)),
      ]),
    ]);
  }
}

/// White card wrapped version of the flight (used without a hero).
class FlightCard extends StatelessWidget {
  final Map<String, dynamic> flight;
  final VoidCallback onTap;
  const FlightCard({super.key, required this.flight, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final status = (flight['status'] ?? 'Scheduled').toString();
    final num = (flight['flightNumber'] ?? flight['id'] ?? 'Flight').toString();
    return CyCard(
      padding: EdgeInsets.zero,
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(C.radiusCard),
        child: InkWell(
          borderRadius: BorderRadius.circular(C.radiusCard),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(color: C.primarySoft, borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.airplane_ticket_outlined, size: 20, color: C.primary),
                ),
                const SizedBox(width: 12),
                Text(num, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                const Spacer(),
                StatusBadge(status),
              ]),
              const SizedBox(height: 16),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                _airport((flight['origin'] ?? '—').toString(), flight['departureTime']?.toString()),
                const Column(children: [Icon(Icons.arrow_forward, color: C.text3, size: 18), SizedBox(height: 4), Icon(Icons.flight, size: 22, color: C.primary)]),
                _airport((flight['destination'] ?? '—').toString(), flight['arrivalTime']?.toString(), right: true),
              ]),
              const SizedBox(height: 14),
              Row(children: [
                if (flight['gate'] != null) ...[Icon(Icons.signpost_outlined, size: 16, color: C.text3), const SizedBox(width: 4), Text('Gate ${flight['gate']}', style: const TextStyle(fontSize: 12.5, color: C.text2))],
                const Spacer(),
                Text('Terminal ${flight['terminal'] ?? '—'}', style: const TextStyle(fontSize: 12.5, color: C.text3)),
              ]),
            ]),
          ),
        ),
      ),
    );
  }

  Widget _airport(String code, String? time, {bool right = false}) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      if (right) ...[
        Text(time != null ? fmtTime(time) : '', style: const TextStyle(color: C.text3, fontSize: 12)),
        const SizedBox(width: 6),
      ],
      Text(code, style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w900, color: C.text)),
      if (!right) ...[
        const SizedBox(width: 6),
        Text(time != null ? fmtTime(time) : '', style: const TextStyle(color: C.text3, fontSize: 12)),
      ],
    ]);
  }
}

/// A compact quick-action widget (icon tile + label) used on Home and Airport hubs.
class QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final String? badge;
  const QuickActionCard({super.key, required this.icon, required this.label, required this.onTap, this.badge});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(C.radiusCard),
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: C.surface,
          borderRadius: BorderRadius.circular(C.radiusCard),
          boxShadow: [C.softShadow],
        ),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Stack(clipBehavior: Clip.none, alignment: Alignment.center, children: [
            Container(
              width: 50, height: 50,
              decoration: const BoxDecoration(color: C.primarySoft, shape: BoxShape.circle),
              child: Icon(icon, color: C.primary, size: 23),
            ),
            if (badge != null)
              Positioned(
                right: -2, top: -2,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: const BoxDecoration(color: C.primary, shape: BoxShape.circle),
                  child: Text(badge!, style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.w800)),
                ),
              ),
          ]),
          const SizedBox(height: 10),
          Text(label, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: C.text), textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis),
        ]),
      ),
    );
  }
}

/// A white service row tile with a rounded blue icon chip (used in Airport/Explore).
class ServiceCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;
  final Widget? trailing;
  const ServiceCard({super.key, required this.icon, required this.title, this.subtitle, required this.onTap, this.trailing});

  @override
  Widget build(BuildContext context) {
    return CyCard(
      padding: const EdgeInsets.all(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(C.radiusCard - 4),
        onTap: onTap,
        child: Row(children: [
          Container(
            width: 48, height: 48,
            decoration: const BoxDecoration(color: C.primarySoft, borderRadius: BorderRadius.all(Radius.circular(14))),
            child: Icon(icon, color: C.primary, size: 23),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: C.text)),
              if (subtitle != null) ...[const SizedBox(height: 2), Text(subtitle!, style: const TextStyle(color: C.text3, fontSize: 12.5))],
            ]),
          ),
          ?trailing,
          const SizedBox(width: 4),
          const Icon(Icons.chevron_right, size: 20, color: C.text3),
        ]),
      ),
    );
  }
}

/// Vertically-stacked service list card (rows separated by hairline dividers).
class ServiceListCard extends StatelessWidget {
  final List<Widget> children;
  const ServiceListCard({super.key, required this.children});

  @override
  Widget build(BuildContext context) {
    return CyCard(
      padding: EdgeInsets.zero,
      child: Column(children: [
        for (var i = 0; i < children.length; i++) ...[
          if (i > 0) const Divider(height: 1, indent: 74),
          children[i],
        ],
      ]),
    );
  }
}

/// A single tappable row for a service list card.
class ServiceRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;
  final Widget? trailing;
  const ServiceRow({super.key, required this.icon, required this.title, this.subtitle, required this.onTap, this.trailing});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(C.radiusCard),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
        child: Row(children: [
          Container(
            width: 40, height: 40,
            decoration: const BoxDecoration(color: C.primarySoft, borderRadius: BorderRadius.all(Radius.circular(12))),
            child: Icon(icon, color: C.primary, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: C.text)),
              if (subtitle != null) ...[const SizedBox(height: 1), Text(subtitle!, style: const TextStyle(color: C.text3, fontSize: 12))],
            ]),
          ),
          ?trailing,
          const SizedBox(width: 2),
          const Icon(Icons.chevron_right, size: 18, color: C.text3),
        ]),
      ),
    );
  }
}

/// Circular profile avatar with initial.
class ProfileAvatar extends StatelessWidget {
  final String name;
  final double size;
  final VoidCallback onTap;
  const ProfileAvatar({super.key, required this.name, this.size = 44, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final initial = name.trim().isEmpty ? '?' : name.trim()[0].toUpperCase();
    return InkWell(
      borderRadius: BorderRadius.circular(size / 2),
      onTap: onTap,
      child: Container(
        width: size, height: size,
        decoration: BoxDecoration(
          gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF2C74E8), Color(0xFF0B4BC4)]),
          borderRadius: BorderRadius.circular(size / 2),
          boxShadow: [BoxShadow(color: C.primary.withValues(alpha: 0.25), blurRadius: 12, offset: const Offset(0, 5))],
        ),
        alignment: Alignment.center,
        child: Text(initial, style: TextStyle(color: Colors.white, fontSize: size * 0.42, fontWeight: FontWeight.w800)),
      ),
    );
  }
}

/// Rounded header button for Home (notifications / profile).
class HeaderIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final int? badge;
  const HeaderIconButton({super.key, required this.icon, required this.onTap, this.badge});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Container(
        width: 46, height: 46,
        decoration: BoxDecoration(color: C.surface, borderRadius: BorderRadius.circular(14), boxShadow: [C.softShadow]),
        child: Stack(alignment: Alignment.center, children: [
          Icon(icon, color: C.text, size: 22),
          if (badge != null && badge! > 0)
            Positioned(
              right: 8, top: 8,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(color: C.primary, shape: BoxShape.circle),
                child: Text(badge.toString(), style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800)),
              ),
            ),
        ]),
      ),
    );
  }
}

/// Large blue hero panel with title + actions (used on Airport / Journey hubs).
class HeroPanel extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String? value;
  final String? valueLabel;
  final List<Widget>? actions;
  final Widget? progress;
  const HeroPanel({super.key, required this.icon, required this.title, required this.subtitle, this.value, this.valueLabel, this.actions, this.progress});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF0E5ADB), Color(0xFF0B3CA0)]),
        borderRadius: BorderRadius.circular(C.radius),
        boxShadow: [BoxShadow(color: C.primary.withValues(alpha: 0.3), blurRadius: 24, offset: const Offset(0, 12))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            width: 42, height: 42,
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.18), borderRadius: BorderRadius.circular(13)),
            child: Icon(icon, color: Colors.white, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 17))),
        ]),
        const SizedBox(height: 12),
        if (value != null) ...[
          Text(value!, style: const TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.w900, fontFeatures: [FontFeature.tabularFigures()])),
          if (valueLabel != null) Text(valueLabel!, style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12.5)),
        ] else
          Text(subtitle, style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 13, height: 1.4)),
        if (value != null) const SizedBox(height: 6),
        if (progress != null) ...[
          const SizedBox(height: 14),
          progress!,
        ],
        if (actions != null) ...[
          const SizedBox(height: 16),
          Row(children: actions!),
        ],
      ]),
    );
  }
}

/// A step row used in the Journey / step-by-step views.
class JourneyStep extends StatelessWidget {
  final String title;
  final String? description;
  final String? instructions;
  final String status; // completed | current | upcoming
  final Widget? leading; // custom leading widget (overrides defaults)
  final Widget? trailing;
  final VoidCallback? onTap;
  const JourneyStep({super.key, required this.title, this.description, this.instructions, this.status = 'upcoming', this.leading, this.trailing, this.onTap});

  @override
  Widget build(BuildContext context) {
    final isComplete = status == 'completed';
    final isCurrent = status == 'current';

    IconData icon;
    Color color;
    if (isComplete) {
      icon = Icons.check_circle;
      color = C.success;
    } else if (isCurrent) {
      icon = Icons.radio_button_checked;
      color = C.primary;
    } else {
      icon = Icons.radio_button_unchecked;
      color = C.text3;
    }

    final effectiveLeading = leading ?? Icon(icon, color: color, size: 22);
    final accent = isCurrent ? const Color(0xFFF3F7FF) : null;
    final accentBorder = isCurrent ? C.primaryLine : C.border;

    return CyCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      color: accent,
      border: Border.all(color: accentBorder),
      child: InkWell(
        borderRadius: BorderRadius.circular(C.radiusCard - 4),
        onTap: onTap,
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          effectiveLeading,
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14.5, color: C.text)),
              if (description != null && description!.isNotEmpty) ...[
                const SizedBox(height: 3),
                Text(description!, style: const TextStyle(color: C.text2, fontSize: 12.5)),
              ],
              if (instructions != null && instructions!.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text('“$instructions”', style: const TextStyle(color: C.text3, fontSize: 12, fontStyle: FontStyle.italic)),
              ],
            ]),
          ),
          ?trailing,
        ]),
      ),
    );
  }
}
