import React, { useEffect, useState } from 'react';
import { useData } from '../../state/data';
import { PremiumApi } from '../../api/client';
import { useToast } from '../../components/toast';
import { SubScreen } from '../SubScreen';
import { StatusBadge, Skeleton, Sheet } from '../../components/ui';
import { IconShield, IconCheck, IconCoins, IconAccess } from '../../components/Icons';

function PremiumRow({ on, label, desc }: { on: boolean; label: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--c-border)', opacity: on ? 1 : 0.55 }}>
      <span style={{ width: 24, height: 24, borderRadius: '50%', background: on ? 'var(--c-success-soft)' : 'var(--c-neutral-soft)', color: on ? 'var(--c-success)' : 'var(--c-text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <IconCheck size={14} />
      </span>
      <div>
        <div className="bold" style={{ fontSize: 14 }}>{label}</div>
        <div className="small muted">{desc}</div>
      </div>
    </div>
  );
}

export default function Premium() {
  const { loyalty, invalidate, refresh } = useData();
  const [premium, setPremium] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const toast = useToast();
  const balance = loyalty?.balance ?? 0;
  const COST = 500;

  useEffect(() => {
    let active = true;
    PremiumApi.get().then((r) => { if (active) setPremium(r.premium); }).catch(() => {});
    return () => { active = false; };
  }, []);

  async function activate() {
    setBusy(true);
    setConfirm(false);
    try {
      const r = await PremiumApi.activate(1);
      setPremium(r.premium);
      invalidate(['loyalty']);
      await refresh(['loyalty']);
      toast.toast('Premium is now active', 'success');
    } catch (e: any) {
      toast.toast(e.message || 'Could not activate Premium', 'error');
    } finally {
      setBusy(false);
    }
  }

  const on = premium?.premium || false;

  return (
    <SubScreen title="Premium">
      {!premium ? (
        <div className="card card-pad"><Skeleton style={{ height: 18 }} /><Skeleton style={{ marginTop: 10 }} /></div>
      ) : (
        <>
          <div className="card card-pad" style={{ background: on ? 'var(--c-primary)' : 'var(--c-surface)', borderColor: on ? 'var(--c-primary)' : 'var(--c-border)', color: on ? '#fff' : 'inherit', textAlign: 'center', paddingTop: 26, paddingBottom: 26 }}>
            <div style={{ width: 58, height: 58, borderRadius: 20, background: on ? 'rgba(255,255,255,0.18)' : 'var(--c-primary-soft)', color: on ? '#fff' : 'var(--c-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <IconShield size={30} />
            </div>
            {on ? (
              <>
                <h3 style={{ fontSize: 21, fontWeight: 800, color: '#fff' }}>Premium active</h3>
                <div className="small" style={{ color: 'rgba(255,255,255,0.85)', marginTop: 6 }}>Enjoying VIP access, lounge, fast-track &amp; more.</div>
                {premium.expiresAt && <div className="small mt8" style={{ color: 'rgba(255,255,255,0.7)' }}>Expires {new Date(premium.expiresAt).toLocaleDateString()}</div>}
              </>
            ) : (
              <>
                <h3 style={{ fontSize: 21, fontWeight: 800 }}>Go Premium</h3>
                <div className="small muted mt6" style={{ lineHeight: 1.5 }}>Unlock lounge access, fast-track, VIP assistance and priority everywhere.</div>
                <div className="row mt16" style={{ justifyContent: 'center', gap: 6 }}>
                  <span className="badge badge-neutral">Lounge &amp; VIP</span>
                  <span className="badge badge-neutral">Fast-track</span>
                </div>
                <div className="mono bold mt16" style={{ fontSize: 20, color: 'var(--c-primary-dark)' }}>{COST} pts / month</div>
                <button className="btn btn-primary mt16" disabled={busy || balance < COST} onClick={() => setConfirm(true)}>
                  {balance < COST ? `Need ${COST - balance} more pts` : 'Activate with points'}
                </button>
                <div className="tiny muted mt8">You have {balance} points</div>
              </>
            )}
          </div>

          {on && (
            <div className="card card-pad mt16">
              <div className="section-title" style={{ marginTop: 0 }}>Status</div>
              <div className="between" style={{ padding: '5px 0' }}><span className="muted-2 small">Membership</span><StatusBadge status="premium" label="Premium" /></div>
              {premium.entitlements.map((e: any) => (
                <div key={e.id} className="between" style={{ padding: '5px 0' }}><span className="muted-2 small">{e.feature}</span><span className="badge badge-success">Active</span></div>
              ))}
            </div>
          )}

          <div className="card card-pad mt16">
            <div className="section-title" style={{ marginTop: 0 }}>What's included</div>
            <PremiumRow on label="Airport lounge access" desc="Unlimited lounge entry for you and a guest at partner lounges." />
            <PremiumRow on label="Fast-track & priority lanes" desc="Skip queues at security, immigration and boarding." />
            <PremiumRow on label="VIP assistance" desc="Personal meet &amp; greet from kerbside to gate." />
            <PremiumRow on label="Premium-only airport services" desc="Unlock exclusive services in the Services tab." />
          </div>

          <Sheet open={confirm} onClose={() => setConfirm(false)} title="Activate Premium">
            <p className="small muted" style={{ lineHeight: 1.5 }}>
              Activating Premium costs <b>500 Cyclone Points per month</b>. Your balance is {balance} points. Proceed?
            </p>
            <button className="btn btn-primary mt16" disabled={busy} onClick={activate}>{busy ? 'Activating…' : 'Activate Premium'}</button>
          </Sheet>
        </>
      )}
    </SubScreen>
  );
}