import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../state/auth';
import { useData } from '../../state/data';
import { TicketApi } from '../../api/client';
import { useToast } from '../../components/toast';
import { StatusBadge, Sheet, Empty, Skeleton } from '../../components/ui';
import { SubScreen } from '../SubScreen';
import { IconTicket, IconPlane, IconPlus } from '../../components/Icons';

export default function Tickets() {
  const { user } = useAuth();
  const { tickets, loaded, invalidate } = useData();
  const toast = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flightNumber, setFlightNumber] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [passenger, setPassenger] = useState(user?.name || '');

  async function addDemoTicket() {
    setBusy(true);
    try {
      await TicketApi.addDemo();
      invalidate(['tickets', 'journey']);
      toast.toast('Demo ticket added', 'success');
      setSheetOpen(false);
      reload();
    } catch (e: any) {
      toast.toast(e.message || 'Could not add demo ticket', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function addManualTicket() {
    if (!flightNumber || !bookingRef) {
      toast.toast('Flight number and booking reference are required', 'error');
      return;
    }
    setBusy(true);
    try {
      await TicketApi.add({ passengerName: passenger, bookingReference: bookingRef, flightNumber });
      invalidate(['tickets', 'journey']);
      toast.toast('Ticket added', 'success');
      setSheetOpen(false);
      reload();
    } catch (e: any) {
      toast.toast(e.message || 'Could not add ticket', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function reload() {
    invalidate(['tickets', 'journey']);
  }

  async function remove(id: string) {
    if (!window.confirm('Remove this ticket?')) return;
    try {
      await TicketApi.remove(id);
      invalidate(['tickets', 'journey']);
      toast.toast('Ticket removed', 'success');
    } catch (e: any) {
      toast.toast(e.message, 'error');
    }
  }

  const canAddDemo = user?.hasDemoAccess || user?.isDemo || false;

  return (
    <SubScreen
      title="Tickets"
      right={
        <button className="btn btn-primary" style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }} onClick={() => setSheetOpen(true)}>
          <IconPlus size={16} /> Add
        </button>
      }
    >
      {!loaded.tickets ? (
        <div className="card card-pad"><Skeleton style={{ height: 20 }} /><Skeleton style={{ marginTop: 12 }} /></div>
      ) : tickets.length === 0 ? (
        <Empty
          icon={<IconTicket size={26} />}
          title="No tickets yet"
          text="Add your flight to start your personalized Journey."
          action={
            <button className="btn btn-primary" onClick={() => setSheetOpen(true)}>Add your first ticket</button>
          }
        />
      ) : (
        <div>
          {tickets.map((t: any) => (
            <div key={t.id} className="card card-pad mb16" style={{ borderLeft: t.isDemoTicket ? '3px solid var(--c-warning)' : '3px solid var(--c-primary)' }}>
              <div className="between">
                <div className="row">
                  <span className="badge badge-blue">{t.origin} → {t.destination}</span>
                  {t.isDemoTicket && <span className="badge badge-warning">DEMO TICKET</span>}
                </div>
                <StatusBadge status={t.status} />
              </div>
              <div className="between mt12">
                <div>
                  <div className="muted-2 small">Flight</div>
                  <div className="bold">{t.bookingReference}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="muted-2 small">Passenger</div>
                  <div className="bold">{t.passengerName}</div>
                </div>
              </div>
              <div className="row mt12" style={{ gap: 6 }}>
                <span className="badge badge-neutral">Terminal {t.terminal || '—'}</span>
                <span className="badge badge-neutral">Gate {t.gate || '—'}</span>
                <span className="badge badge-neutral">{t.travelDate}</span>
              </div>
              {t.isDemoTicket && (
                <p className="small mt8" style={{ background: 'var(--c-warning-soft)', borderRadius: 8, padding: '8px 10px', color: 'var(--c-warning)', fontWeight: 600 }}>
                  This is a DEMO ticket for preview purposes. It is not a real boarding pass.
                </p>
              )}
              <div className="between mt12">
                <Link to="/journey" className="link small" style={{ fontSize: 13 }}>View Journey</Link>
                <button className="btn btn-danger" style={{ width: 'auto', padding: '7px 12px', fontSize: 12.5 }} onClick={() => remove(t.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add a ticket">
        {canAddDemo && (
          <button className="btn btn-secondary mb16" disabled={busy} onClick={addDemoTicket}>
            Use demo ticket for this account
          </button>
        )}
        <div className="divider" />
        <div className="field">
          <label>Passenger name</label>
          <input value={passenger} onChange={(e) => setPassenger(e.target.value)} />
        </div>
        <div className="field">
          <label>Flight number</label>
          <input value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder="e.g. EK30" />
        </div>
        <div className="field">
          <label>Booking reference</label>
          <input value={bookingRef} onChange={(e) => setBookingRef(e.target.value)} placeholder="e.g. ABC123" />
        </div>
        <button className="btn btn-primary" disabled={busy} onClick={addManualTicket}>
          {busy ? 'Adding…' : 'Add ticket'}
        </button>
      </Sheet>
    </SubScreen>
  );
}