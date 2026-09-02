import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../api/api.dart';
import '../../state/auth.dart';
import '../../state/data.dart';
import '../../theme.dart';
import '../../widgets.dart';
import '../shell.dart';

class TicketsScreen extends StatefulWidget {
  const TicketsScreen({super.key});
  @override
  State<TicketsScreen> createState() => _TicketsScreenState();
}

class _TicketsScreenState extends State<TicketsScreen> {
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    final data = context.read<AppData>();
    if (data.tickets == null) data.loadTickets();
  }

  Future<void> _addDemo() async {
    setState(() => _busy = true);
    try {
      await Api.post('/api/tickets/demo');
      if (!mounted) return;
      await context.read<AppData>().refresh(['tickets', 'journey']);
      if (!mounted) return;
      toast(context, 'Demo ticket added. Journey unlocked.');
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _removeTicket(Map<String, dynamic> t) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Remove ticket?'),
        content: Text('Remove ${t['bookingReference'] ?? 'this ticket'} from your journey?'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.of(context).pop(true), style: FilledButton.styleFrom(backgroundColor: C.danger), child: const Text('Remove')),
        ],
      ),
    );
    if (ok != true) return;
    try {
      final id = t['id'] as String? ?? '';
      await Api.delete('/api/tickets/$id');
      if (!mounted) return;
      await context.read<AppData>().refresh(['tickets', 'journey']);
      if (mounted) toast(context, 'Ticket removed');
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    }
  }

  void _addForm() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _AddTicketSheet(onDone: () async {
        if (!mounted) return;
        await context.read<AppData>().refresh(['tickets', 'journey']);
        if (!mounted) return;
        Navigator.of(context).pop();
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    final data = context.watch<AppData>();
    final auth = context.read<AuthController>();
    final tickets = (data.tickets ?? <dynamic>[]).cast<Map<String, dynamic>>();
    final canDemo = auth.user?['hasDemoAccess'] == true;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tickets'),
        actions: [
          if (canDemo)
            TextButton.icon(
              onPressed: _busy ? null : _addDemo,
              icon: const Icon(Icons.science_outlined, size: 16),
              label: Text(_busy ? '…' : 'Demo ticket'),
            ),
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: IconButton(onPressed: _addForm, icon: const Icon(Icons.add), tooltip: 'Add ticket'),
          ),
        ],
      ),
      body: wrapWeb(
        RefreshIndicator(
          onRefresh: data.loadTickets,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              if (canDemo)
                CyCard(
                  margin: const EdgeInsets.only(bottom: 12),
                  color: const Color(0xFFEAF2FF),
                  border: Border.all(color: const Color(0xFFCFE0FB)),
                  child: Row(children: [
                    const Icon(Icons.science_outlined, color: C.primary),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const Text('Demo account', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13.5, color: C.primaryDark)),
                        const SizedBox(height: 2),
                        const Text('Add a demo ticket to unlock a full demo journey.', style: TextStyle(color: C.primaryDark, fontSize: 12.5)),
                      ]),
                    ),
                    OutlinedButton(onPressed: _busy ? null : _addDemo, style: OutlinedButton.styleFrom(foregroundColor: C.primary, side: const BorderSide(color: Color(0xFF9FC3F5))), child: Text(_busy ? '…' : 'Add')),
                  ]),
                )
              else
                CyCard(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Row(children: [
                    const Icon(Icons.info_outline, color: C.primary),
                    const SizedBox(width: 10),
                    const Expanded(child: Text('Add a ticket to unlock your personalized journey.', style: TextStyle(color: C.text2, fontSize: 13))),
                  ]),
                ),
              if (tickets.isEmpty)
                const EmptyState(icon: Icons.airplane_ticket_outlined, title: 'No tickets yet', text: 'Tap + to add your flight.')
              else
                for (final t in tickets) ...[
                  _ticketCard(t),
                  const SizedBox(height: 12),
                ],
              const SizedBox(height: 8),
              Center(child: Text('All flights link to your CYCLONE Journey.', style: const TextStyle(color: C.text3, fontSize: 12))),
            ],
          ),
        ),
      ),
    );
  }

  Widget _ticketCard(Map<String, dynamic> t) {
    final isDemo = t['isDemo'] == true || t['isDemoTicket'] == true;
    return CyCard(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            width: 42, height: 42,
            decoration: const BoxDecoration(color: Color(0xFFEAF2FF), borderRadius: BorderRadius.all(Radius.circular(12))),
            child: const Icon(Icons.flight, color: C.primary, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(t['flightNumber']?.toString() ?? 'Flight', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
              Text(t['bookingReference']?.toString() ?? '', style: const TextStyle(color: C.text2, fontSize: 12.5)),
            ]),
          ),
          if (isDemo) const Text('DEMO', style: TextStyle(color: C.primaryDark, fontSize: 10.5, letterSpacing: 1, fontWeight: FontWeight.w800)),
          const SizedBox(width: 8),
          StatusBadge((t['status'] ?? 'Scheduled').toString()),
          const SizedBox(width: 4),
          InkWell(
            onTap: () => _removeTicket(t),
            borderRadius: BorderRadius.circular(8),
            child: const Padding(padding: EdgeInsets.all(4), child: Icon(Icons.delete_outline, size: 17, color: C.text3)),
          ),
        ]),
        const SizedBox(height: 14),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(t['origin'] ?? '—', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
            Text(fmtTime(t['departureTime']?.toString() ?? ''), style: const TextStyle(color: C.text3, fontSize: 12)),
          ])),
          const Icon(Icons.flight_takeoff, color: C.text3, size: 26),
          const SizedBox(width: 8),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text(t['destination'] ?? '—', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
            Text(fmtDate(t['travelDate']?.toString() ?? t['departureTime']?.toString() ?? ''), style: const TextStyle(color: C.text3, fontSize: 12)),
          ])),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          if (t['terminal'] != null) ...[
            const Icon(Icons.location_on_outlined, size: 15, color: C.text3),
            const SizedBox(width: 4),
            Text('Terminal ${t['terminal']}', style: const TextStyle(fontSize: 12.5, color: C.text2)),
          ],
          if (t['gate'] != null) ...[
            const SizedBox(width: 14),
            const Icon(Icons.signpost_outlined, size: 15, color: C.text3),
            const SizedBox(width: 4),
            Text('Gate ${t['gate']}', style: const TextStyle(fontSize: 12.5, color: C.text2)),
          ],
        ]),
      ]),
    );
  }
}

class _AddTicketSheet extends StatefulWidget {
  final VoidCallback onDone;
  const _AddTicketSheet({required this.onDone});
  @override
  State<_AddTicketSheet> createState() => _AddTicketSheetState();
}

class _AddTicketSheetState extends State<_AddTicketSheet> {
  bool _busy = false;
  final _name = TextEditingController();
  final _ref = TextEditingController();
  final _flight = TextEditingController();
  final _origin = TextEditingController();
  final _dest = TextEditingController();

  @override
  void dispose() {
    _name.dispose();
    _ref.dispose();
    _flight.dispose();
    _origin.dispose();
    _dest.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_name.text.trim().isEmpty || _ref.text.trim().isEmpty) {
      toast(context, 'Passenger name and booking reference are required', error: true);
      return;
    }
    setState(() => _busy = true);
    try {
      final body = <String, dynamic>{
        'passengerName': _name.text.trim(),
        'bookingReference': _ref.text.trim(),
        'flightNumber': _flight.text.trim(),
        if (_origin.text.trim().isNotEmpty) 'origin': _origin.text.trim().toUpperCase(),
        if (_dest.text.trim().isNotEmpty) 'destination': _dest.text.trim().toUpperCase(),
      };
      await Api.post('/api/tickets', body);
      widget.onDone();
    } on ApiException catch (e) {
      if (mounted) toast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Add ticket', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          const Text('A flight number auto-fills route details when found.', style: TextStyle(color: C.text3, fontSize: 12.5)),
          const SizedBox(height: 16),
          const FieldLabel('Passenger name'),
          TextField(controller: _name, decoration: fieldDecoration(hint: 'Full name on ticket')),
          const SizedBox(height: 12),
          const FieldLabel('Booking reference'),
          TextField(controller: _ref, decoration: fieldDecoration(hint: 'e.g. X7K2MP')),
          const SizedBox(height: 12),
          const FieldLabel('Flight number (optional)'),
          TextField(controller: _flight, decoration: fieldDecoration(hint: 'e.g. MS049')),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const FieldLabel('Origin (optional)'),
              TextField(controller: _origin, decoration: fieldDecoration(hint: 'CAI')),
            ])),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const FieldLabel('Destination (optional)'),
              TextField(controller: _dest, decoration: fieldDecoration(hint: 'DXB')),
            ])),
          ]),
          const SizedBox(height: 20),
          PrimaryBtn(label: 'Add ticket', busy: _busy, onPressed: _submit),
        ]),
      ),
    );
  }
}