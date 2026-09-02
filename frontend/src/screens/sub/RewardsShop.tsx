import React, { useEffect, useState } from 'react';
import { useData } from '../../state/data';
import { RewardsApi } from '../../api/client';
import { useToast } from '../../components/toast';
import { SubScreen } from '../SubScreen';
import { Empty, Skeleton, ModalCenter } from '../../components/ui';
import { IconGift, IconCoins } from '../../components/Icons';

export default function RewardsShop() {
  const { loyalty, invalidate } = useData();
  const [rewards, setRewards] = useState<any[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<any | null>(null);
  const toast = useToast();
  const balance = loyalty?.balance ?? 0;

  useEffect(() => {
    let active = true;
    RewardsApi.list()
      .then((r) => { if (active) setRewards(r.rewards || []); })
      .catch(() => { if (active) setRewards([]); });
    return () => { active = false; };
  }, []);

  async function redeem(r: any) {
    setBusy(true);
    setConfirm(null);
    try {
      const res = await RewardsApi.redeem(r.id);
      invalidate(['loyalty', 'notifications']);
      toast.toast(res.message || 'Reward redeemed', 'success');
    } catch (e: any) {
      toast.toast(e.message || 'Could not redeem', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SubScreen title="Rewards Shop">
      <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--c-primary-soft)', borderColor: '#cfe0fb' }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--c-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconCoins size={22} />
        </div>
        <div>
          <div className="small" style={{ color: 'var(--c-primary-dark)', opacity: 0.8 }}>Your balance</div>
          <div className="mono bold" style={{ fontSize: 24, color: 'var(--c-primary-dark)' }}>{balance} <span style={{ fontSize: 13, fontWeight: 600 }}>pts</span></div>
        </div>
      </div>

      <div className="mt16">
        {!rewards ? (
          <div className="card card-pad"><Skeleton style={{ height: 18 }} /><Skeleton style={{ marginTop: 10 }} /><Skeleton style={{ marginTop: 10 }} /></div>
        ) : rewards.length === 0 ? (
          <Empty icon={<IconGift size={26} />} title="No rewards yet" text="Check back soon for new partner rewards." />
        ) : (
          rewards.map((r: any) => {
            const affordable = balance >= r.cost;
            return (
              <div key={r.id} className="card card-pad mb16">
                <div className="between">
                  <div className="row" style={{ gap: 12 }}>
                    {r.badge && <img src={r.badge} alt="" style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                    <div>
                      <div className="bold" style={{ fontSize: 16 }}>{r.title}</div>
                      <div className="small muted" style={{ marginTop: 2 }}>{r.description}</div>
                    </div>
                  </div>
                </div>
                <div className="between mt12" style={{ borderTop: '1px solid var(--c-border)', paddingTop: 12 }}>
                  <span className="mono bold" style={{ color: 'var(--c-primary)' }}>{r.cost} pts</span>
                  <button className="btn btn-primary" disabled={!affordable || busy} onClick={() => setConfirm(r)}>
                    {affordable ? 'Redeem' : 'Not enough points'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ModalCenter open={!!confirm} onClose={() => setConfirm(null)}>
        {confirm && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 58, height: 58, borderRadius: 18, background: 'var(--c-primary-soft)', color: 'var(--c-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <IconGift size={28} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Redeem {confirm.title}?</h3>
            <p className="muted small mt8">This will cost {confirm.cost} points from your balance of {balance}.</p>
            <div className="grid-2 mt16">
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={busy} onClick={() => redeem(confirm)}>{busy ? 'Redeeming…' : 'Confirm'}</button>
            </div>
          </div>
        )}
      </ModalCenter>
    </SubScreen>
  );
}