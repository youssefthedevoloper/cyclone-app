import 'package:flutter/material.dart';

/// CYCLONE design system.
///
/// White canvas + Cyclone blue accents, premium / minimal / travel-focused /
/// Apple-inspired. Large rounded cards, subtle shadows, generous whitespace.
class C {
  // Brand
  static const Color primary = Color(0xFF1E4DB7);
  static const Color primaryDark = Color(0xFF173A8A);
  static const Color primarySoft = Color(0xFFE6F0FF);
  static const Color primaryLine = Color(0xFFCCDDF5);

  // Surfaces
  static const Color bg = Color(0xFFF8FAFD);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceAlt = Color(0xFFF4F7FB);

  // Text
  static const Color text = Color(0xFF080808);
  static const Color text2 = Color(0xFF6B7280);
  static const Color text3 = Color(0xFF9AA3B2);

  // Lines / shadows
  static const Color border = Color(0xFFE9EDF3);

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
  static const double radius = 26; // large cards
  static const double radiusCard = 24; // medium/large cards
  static const double radiusSmall = 16; // buttons / icon containers
  static const double radiusPill = 999;

  // Spacing scale
  static const double pad = 20;

  static BoxShadow cardShadow = BoxShadow(
    color: const Color(0x0A173A8A),
    blurRadius: 16,
    offset: const Offset(0, 4),
  );

  static BoxShadow softShadow = BoxShadow(
    color: const Color(0x0A173A8A),
    blurRadius: 10,
    offset: const Offset(0, 3),
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
      titleSpacing: 24,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: TextStyle(
        color: C.text,
        fontSize: 22,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.3,
      ),
    ),
    textTheme: base.textTheme.copyWith(
      displaySmall: const TextStyle(color: C.text, fontWeight: FontWeight.w700, fontSize: 30, letterSpacing: -0.4),
      headlineMedium: const TextStyle(color: C.text, fontWeight: FontWeight.w700, fontSize: 24, letterSpacing: -0.3),
      titleLarge: const TextStyle(color: C.text, fontWeight: FontWeight.w700, fontSize: 20, letterSpacing: -0.3),
      titleMedium: const TextStyle(color: C.text, fontWeight: FontWeight.w600, fontSize: 17),
      bodyMedium: const TextStyle(color: C.text, fontSize: 15, height: 1.4),
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
      elevation: 0,
      height: 66,
      labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        final sel = states.contains(WidgetState.selected);
        return TextStyle(
          fontSize: 11,
          fontWeight: sel ? FontWeight.w600 : FontWeight.w500,
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
