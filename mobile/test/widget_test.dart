import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:cyclone_app/main.dart';

void main() {
  testWidgets('app boots to the CYCLONE auth screen', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const CycloneApp());
    await tester.pumpAndSettle();
    expect(find.text('CYCLONE'), findsWidgets);
  });
}