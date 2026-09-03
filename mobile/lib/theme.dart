import 'package:flutter/material.dart';

/// CYCLONE design system.
///
/// Clean, premium, travel-focused, iOS-inspired. White / very light
/// backgrounds, Cyclone blue primary, large rounded cards, spacious layout,
/// minimal borders, subtle shadows.
class C {
  // Brand
  static const Color primary = Color(0xFF0B5ADB);
  static const Color primaryDark = Color(0xFF0B2545);
  static const Color primarySoft = Color(0xFFEAF2FF);
  static const Color primaryLine = Color(0xFFCFE0FB);

  // Surfaces
  static const Color bg = Color(0xFFF4F7FB);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceAlt = Color(0xFFF7F9FC);

  // Text
  static const Color text = Color(0xFF0B1B33);
  static const Color text2 = Color(0xFF52678A);
  static const Color text3 = Color(0xFF8A97AD);

  // Lines / shadows
  static const Color border = Color(0xFFE6EBF3);

  // Status
  static const Color success = Color(0xFF0F9D58);
  static const Color successSoft = Color(0xFFE7F6EE);
  static const Color warning = Color(0xFFD97706);
  static const Color warningSoft = Color(0xFFFDF3E2);
  static const Color danger = Color(0xFFDC2626);
  static const Color dangerSoft = Color(0xFFFDECEC);
  static const Color neutralSoft = Color(0xFFEEF2F8);
  static const Color neutral = Color(0xFFB9C4D6);

  // Layout
  static const double radius = 22;
  static const double radiusCard = 22;
  static const double radiusSmall = 14;
  static const double radiusPill = 999;

  // Spacing scale
  static const double pad = 20;

  static BoxShadow cardShadow = BoxShadow(
    color: const Color(0x0B0B2545),
    blurRadius: 22,
    offset: const Offset(0, 8),
  );

  static BoxShadow softShadow = BoxShadow(
    color: const Color(0x080B2545),
    blurRadius: 12,
    offset: const Offset(0, 4),
  );
}

ThemeData buildTheme() {
  final base = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: C.primary,
      primary: C.primary,
      surface: C.surface,
    ),
    scaffoldBackgroundColor: C.bg,
    useMaterial3: true,
    splashFactory: InkSparkle.splashFactory,
  );
  return base.copyWith(
    appBarTheme: const AppBarTheme(
      backgroundColor: C.surface,
      foregroundColor: C.text,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      titleSpacing: 20,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: TextStyle(
        color: C.text,
        fontSize: 20,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.3,
      ),
    ),
    textTheme: base.textTheme.copyWith(
      displaySmall: const TextStyle(color: C.text, fontWeight: FontWeight.w900, fontSize: 30, letterSpacing: -0.5),
      headlineMedium: const TextStyle(color: C.text, fontWeight: FontWeight.w800, fontSize: 24, letterSpacing: -0.4),
      titleLarge: const TextStyle(color: C.text, fontWeight: FontWeight.w800, fontSize: 20, letterSpacing: -0.3),
      titleMedium: const TextStyle(color: C.text, fontWeight: FontWeight.w700, fontSize: 16),
      bodyMedium: const TextStyle(color: C.text, fontSize: 14.5, height: 1.35),
      bodySmall: const TextStyle(color: C.text2, fontSize: 13),
      labelLarge: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15),
    ),
    dividerTheme: const DividerThemeData(color: C.border),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: C.primaryDark,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: Colors.white,
      showDragHandle: true,
      surfaceTintColor: Colors.transparent,
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: C.surface,
      indicatorColor: C.primarySoft,
      surfaceTintColor: Colors.transparent,
      height: 68,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        final sel = states.contains(WidgetState.selected);
        return TextStyle(
          fontSize: 11,
          fontWeight: sel ? FontWeight.w700 : FontWeight.w600,
          color: sel ? C.primary : C.text3,
        );
      }),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        final sel = states.contains(WidgetState.selected);
        return IconThemeData(color: sel ? C.primary : C.text3);
      }),
    ),
  );
}

class AppConst {
  // Empty on purpose: the mobile app asks for the backend address once at
  // login (saved in SharedPreferences), and the web build resolves same-origin.
  static const String apiBase = String.fromEnvironment(
    'API_BASE',
    defaultValue: '',
  );
}
