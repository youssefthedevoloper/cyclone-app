import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/api.dart';
import '../state/auth.dart';
import '../theme.dart';
import '../widgets.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});
  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _register = false;
  bool _busy = false;
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _email.text.trim();
    final pass = _password.text;
    if (!email.contains('@') || pass.length < 6) {
      _err('Enter a valid email and a password of at least 6 characters.');
      return;
    }
    setState(() => _busy = true);
    final auth = context.read<AuthController>();
    try {
      if (_register) {
        await auth.register(_name.text.trim().isEmpty ? email.split('@').first : _name.text.trim(), email, pass);
      } else {
        await auth.login(email, pass);
      }
    } on ApiException catch (e) {
      _err(e.message);
    } catch (_) {
      _err('Something went wrong. Please try again.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _err(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: C.surface,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          children: [
            const SizedBox(height: 40),
            Center(child: logoImage(height: 46)),
            const SizedBox(height: 8),
            const Center(child: Text('CYCLONE', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, letterSpacing: 4, color: C.primaryDark))),
            const SizedBox(height: 4),
            const Center(child: Text('Your airport passenger assistant', style: TextStyle(color: C.text2, fontSize: 13.5))),
            const SizedBox(height: 32),
            CyCard(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(_register ? 'Create account' : 'Welcome back', style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w800, color: C.text)),
                const SizedBox(height: 4),
                Text(_register ? 'Join CYCLONE to start earning points.' : 'Log in to continue.', style: const TextStyle(color: C.text2, fontSize: 13)),
                const SizedBox(height: 18),
                if (_register) ...[
                  const FieldLabel('Full name'),
                  TextField(controller: _name, decoration: fieldDecoration(hint: 'e.g. Sarah Traveler')),
                  const SizedBox(height: 14),
                ],
                const FieldLabel('Email'),
                TextField(controller: _email, keyboardType: TextInputType.emailAddress, autocorrect: false, decoration: fieldDecoration(hint: 'you@example.com')),
                const SizedBox(height: 14),
                const FieldLabel('Password'),
                TextField(controller: _password, obscureText: true, decoration: fieldDecoration(hint: 'At least 6 characters')),
                const SizedBox(height: 20),
                PrimaryBtn(label: _register ? 'Create account' : 'Log in', busy: _busy, onPressed: _submit),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(_register ? 'Already have an account?' : 'New to CYCLONE?', style: const TextStyle(color: C.text2, fontSize: 13)),
                    TextButton(
                      onPressed: _busy ? null : () => setState(() => _register = !_register),
                      child: Text(_register ? 'Log in' : 'Create account', style: const TextStyle(color: C.primary, fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
              ]),
            ),
            const SizedBox(height: 20),
            CyCard(
              color: const Color(0xFFEFF4FF),
              border: Border.all(color: const Color(0xFFCFE0FB)),
              padding: const EdgeInsets.all(14),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Demo accounts', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13.5, color: C.primaryDark)),
                const SizedBox(height: 8),
                _DemoRow(email: 'judge@cyclone.example', pass: 'demo1234', label: 'Premium demo'),
                const SizedBox(height: 6),
                _DemoRow(email: 'judge2@cyclone.example', pass: 'demo1234', label: 'Second demo'),
              ]),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _DemoRow extends StatelessWidget {
  final String email;
  final String pass;
  final String label;
  const _DemoRow({required this.email, required this.pass, required this.label});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(10),
      onTap: () {
        final auth = context.read<AuthController>();
        auth.login(email, pass).catchError((err) {
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$err')));
          }
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(color: C.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: C.border)),
        child: Row(children: [
          const Icon(Icons.arrow_downward, size: 15, color: C.primary),
          const SizedBox(width: 8),
          Expanded(child: Text('$label\n$email  ·  $pass', style: const TextStyle(fontSize: 12.2, color: C.text))),
          const Icon(Icons.chevron_right, size: 18, color: C.text3),
        ]),
      ),
    );
  }
}