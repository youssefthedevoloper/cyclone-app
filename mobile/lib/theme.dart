import 'package:flutter/material.dart';

class C {
  static const Color primary = Color(0xFF0B5ADB);
  static const Color primaryDark = Color(0xFF0B2545);
  static const Color bg = Color(0xFFF2F5FA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color border = Color(0xFFE3E9F2);
  static const Color text = Color(0xFF10213F);
  static const Color text2 = Color(0xFF52678A);
  static const Color text3 = Color(0xFF8A97AD);
  static const Color success = Color(0xFF0F9D58);
  static const Color successSoft = Color(0xFFE8F6EE);
  static const Color warning = Color(0xFFD97706);
  static const Color warningSoft = Color(0xFFFDF3E3);
  static const Color danger = Color(0xFFDC2626);
  static const Color dangerSoft = Color(0xFFFDECEC);
  static const Color neutralSoft = Color(0xFFEEF2F8);
  static const Color neutral = Color(0xFFB9C4D6);
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
  );
  return base.copyWith(
    appBarTheme: const AppBarTheme(
      backgroundColor: C.surface,
      foregroundColor: C.text,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: C.text,
        fontSize: 19,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.2,
      ),
    ),
    textTheme: base.textTheme.copyWith(
      bodyMedium: const TextStyle(color: C.text, fontSize: 14.5),
      bodySmall: const TextStyle(color: C.text2, fontSize: 13),
      titleLarge: const TextStyle(color: C.text, fontWeight: FontWeight.w800, fontSize: 20),
      titleMedium: const TextStyle(color: C.text, fontWeight: FontWeight.w700, fontSize: 16),
      labelLarge: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14.5),
    ),
    dividerTheme: const DividerThemeData(color: C.border),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: C.primaryDark,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: Colors.white,
      showDragHandle: true,
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