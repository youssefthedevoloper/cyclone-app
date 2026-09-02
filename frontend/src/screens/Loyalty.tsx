import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../state/data';
import { useAuth } from '../state/auth';
import { Skeleton, Empty, StatusBadge } from '../components/ui';
import { IconCoins, IconGift, IconStar } from '../components/Icons';
import { PointsChip } from '../components/ui';
import { timeAgo } from './SubScreen';

export default function Loyalty() {
  const { loyalty, loaded } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const transactions = loyalty?.transactions || [];
  const balance = loyalty?.balance ?? user?.loyaltyPoints ?? 0;

  const earned = transactions.filter((t: any) => t.amount > 0).reduce((s: number, t: any) => s + t.amount, 0);
  const spent = transactions.filter((t: any) => t.amount < 0).reduce((s: number, t: any) => s + Math.abs(t.amount), 0);

  return (
    <div className="page">
      <h1 style={{ fontSize: 20, fontWeight: 800, paddingTop: 14, marginBottom: 2 }}>Loyalty</h1>
      <p className="muted">Earn Cyclone Points by using CYCLONE.</p>

      <div className="balance-hero mt16">
        <div className="between" style={{ marginBottom: 6 }}>
          <h3>CYCLONE POINTS</h3>
          <span className="badge badge-blue" style={{ background: 'rgba(255,255,255,0.12)' }}>Balance</span>
        </div>
        <div className="num">
          {loaded.loyalty ? balance : <span style={{ color: 'rgba(255,255,255,0.35)' }}>•••</span>}
        </div>
        <div className="between" style={{ marginTop: 10 }}>
          <span className="small" style={{ color: 'rgba(255,255,255,0.7)' }}>Earned {earned.toLocaleString()}</span>
          <span className="small" style={{ color: 'rgba(255,255,255,0.7)' }}>Spent {spent.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid-2 mt16">
        <Link to="/features/rewards/shop" className="card feature-card">
          <div className="feature-icon"><IconGift /></div>
          <h4>Rewards Shop</h4>
          <p>Spend points on perks &amp; vouchers</p>
          <button className="btn btn-primary mt12" style={{ padding: '9px 12px', fontSize: 13 }}>Shop rewards</button>
        </Link>
        <Link to="/features/services" className="card feature-card">
          <div className="feature-icon"><IconStar /></div>
          <h4>Earn more</h4>
          <p>Complete journeys &amp; use services</p>
          <button className="btn btn-secondary mt12" style={{ padding: '9px 12px', fontSize: 13 }}>See services</button>
        </Link>
      </div>

      <div className="card mt16" style={{ padding: 14 }}>
        <div className="small muted" style={{ fontWeight: 700 }}>How to earn</div>
        <div className="mt8 small">
          <div className="between" style={{ padding: '5px 0' }}><span>Complete a Journey step</span><PointsChip value={100} /></div>
          <div className="between" style={{ padding: '5px 0' }}><span>Complete all Journey steps (bonus)</span><PointsChip value={50} /></div>
          <div className="between" style={{ padding: '5px 0' }}><span>Register an item with CYCLONE QR</span><PointsChip value={25} /></div>
          <div className="between" style={{ padding: '5px 0' }}><span>Lounge service</span><PointsChip value={150} /></div>
          <div className="between" style={{ padding: '5px 0' }}><span>Premium airport service</span><PointsChip value={100} /></div>
          <div className="between" style={{ padding: '5px 0' }}><span>Eligible paid service</span><span><PointsChip value={50} /><span className="muted-2 small">–200</span></span></div>
        </div>
      </div>

      <div className="section-title">History</div>
      {!loaded.loyalty ? (
        <div className="card card-pad"><Skeleton style={{ height: 18 }} /><Skeleton style={{ marginTop: 10 }} /><Skeleton style={{ marginTop: 10 }} /></div>
      ) : transactions.length === 0 ? (
        <Empty icon={<IconCoins size={26} />} title="No points yet" text="Complete your first Journey to start earning Cyclone Points." />
      ) : (
        <div className="card">
          {transactions.map((t: any, i: number) => (
            <div key={t.id} className="row" style={{ padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--c-border)' }}>
              <div className="grow">
                <div className="bold small">{t.reason}</div>
                <div className="muted-2" style={{ fontSize: 12 }}>{timeAgo(t.createdAt)}</div>
              </div>
              <span className="mono bold" style={{ fontSize: 16, color: t.amount >= 0 ? 'var(--c-success)' : 'var(--c-danger)' }}>
                {t.amount >= 0 ? '+' : ''}{t.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}