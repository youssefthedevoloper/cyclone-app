import React, { useEffect, useState } from 'react';
import { useData } from '../../state/data';
import { ServiceApi } from '../../api/client';
import { useToast } from '../../components/toast';
import { SubScreen } from '../SubScreen';
import { Skeleton, Empty, ModalCenter } from '../../components/ui';
import { IconUtensils, IconBag, IconMed, IconAccess, IconCheck } from '../../components/Icons';

const CAT_ICON: Record<string, React.ReactNode> = {
  dining: <IconUtensils size={22} />,
  baggage: <IconBag size={22} />,
  medical: <IconMed size={22} />,
  accessibility: <IconAccess size={22} />,
};

export default function Services() {
  const { invalidate } = useData();
  const [services, setServices] = useState<any[] | null>(null);
  const [history, setHistory] = useState<any[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<any | null>(null);
  const toast = useToast();

  useEffect(() => {
    let active = true;
    ServiceApi.list().then((r) => { if (active) setServices(r.services || []); }).catch(() => { if (active) setServices([]); });
    ServiceApi.history().then((r) => { if (active) setHistory(r.transactions || []); }).catch(() => { if (active) setHistory([]); });
    return () => { active = false; };
  }, []);

  async function book(s: any) {
    setBusy(true);
    setConfirm(null);
    try {
      const res = await ServiceApi.use(s.id);
      invalidate(['loyalty', 'notifications']);
      toast.toast(res.pointsEarned ? `${res.serviceName} confirmed · +${res.pointsEarned} pts` : `${res.serviceName} confirmed`, 'success');
      ServiceApi.history().then((r) => setHistory(r.transactions || [])).catch(() => {});
    } catch (e: any) {
      toast.toast(e.message || 'Could not book', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SubScreen title="Airport Services">
      <p className="small muted mb16" style={{ lineHeight: 1.5 }}>
        Book services for your time at the airport. Each confirmed service earns Cyclone Points.
      </p>

      {!services ? (
        <div className="card card-pad"><Skeleton style={{ height: 18 }} /><Skeleton style={{ marginTop: 10 }} /></div>
      ) : services.length === 0 ? (
        <Empty icon={<IconAccess size={26} />} title="No services" text="Services will appear here." />
      ) : (
        services.map((s) => (
          <div key={s.id} className="card card-pad mb16" style={{ opacity: s.available === false ? 0.55 : 1 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="feature-icon" style={{ marginBottom: 0, minWidth: 46 }}>{CAT_ICON[s.category] || <IconBag size={22} />}</div>
              <div className="grow">
                <div className="between">
                  <div className="bold" style={{ fontSize: 16 }}>{s.name}</div>
                  {s.requiresPremium && <span className="badge badge-blue">Premium</span>}
                </div>
                <p className="small muted mt4">{s.description}</p>
                <div className="row mt8" style={{ gap: 6 }}>
                  {s.price ? <span className="badge badge-neutral">${s.price}</span> : <span className="badge badge-success">Complimentary</span>}
                  <span className="badge badge-blue">+{s.pointsReward} pts</span>
                  {s.premiumRequired && !s.requiresPremium && <span className="badge badge-amber">Premium included</span>}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                disabled={!s.usable || s.available === false || busy}
                onClick={() => setConfirm(s)}
              >
                {!s.usable ? (s.requiresPremium ? 'Requires Premium' : 'Unavailable') : 'Book now'}
              </button>
            </div>
          </div>
        ))
      )}

      {history && history.length > 0 && (
        <div className="mt24">
          <h4 style={{ marginBottom: 10 }}>Recent bookings</h4>
          {history.slice(0, 5).map((h) => (
            <div key={h.id} className="card card-pad mb12" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="badge badge-success"><IconCheck size={12} /></span>
              <div className="grow">
                <div className="bold small">{h.serviceName}</div>
                <div className="muted-2 tiny">{new Date(h.createdAt).toLocaleString()}</div>
              </div>
              {h.pointsEarned > 0 && <span className="mono bold small" style={{ color: 'var(--c-primary)' }}>+{h.pointsEarned} pts</span>}
            </div>
          ))}
        </div>
      )}

      <ModalCenter open={!!confirm} onClose={() => setConfirm(null)}>
        {confirm && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 58, height: 58, borderRadius: 18, background: 'var(--c-primary-soft)', color: 'var(--c-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              {CAT_ICON[confirm.category] || <IconBag size={26} />}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Book {confirm.name}?</h3>
            <p className="muted small mt8">{confirm.price ? `Cost: $${confirm.price} · ` : 'Complimentary · '}Earn {confirm.pointsReward} pts</p>
            <div className="grid-2 mt16">
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={busy} onClick={() => book(confirm)}>{busy ? 'Booking…' : 'Confirm'}</button>
            </div>
          </div>
        )}
      </ModalCenter>
    </SubScreen>
  );
}