import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../state/data';
import { SubScreen } from '../SubScreen';
import { IconScan, IconQr, IconBag } from '../../components/Icons';

export default function LostFound() {
  const { items } = useData();
  const lostCount = (items || []).filter((i: any) => i.status === 'lost').length;

  return (
    <SubScreen title="Lost & Found">
      <div className="grid-2">
        <Link to="/features/lost-found/scan" className="feature-card" style={{ textDecoration: 'none' }}>
          <div className="feature-icon"><IconScan /></div>
          <h4>Scan QR</h4>
          <p>Identify any CYCLONE-tagged item</p>
        </Link>
        <Link to="/features/lost-found/generate" className="feature-card" style={{ textDecoration: 'none' }}>
          <div className="feature-icon"><IconQr /></div>
          <h4>Generate QR</h4>
          <p>Protect a belonging with your own QR</p>
        </Link>
      </div>

      <div className="mt16">
        <Link to="/features/lost-found/my-items" className="card feature-card" style={{ textDecoration: 'none' }}>
          <div className="between">
            <div className="row">
              <div className="feature-icon" style={{ marginBottom: 0 }}><IconBag /></div>
              <div>
                <h4>My Items</h4>
                <p>{items?.length ?? 0} registered · {lostCount} reported lost</p>
              </div>
            </div>
            <span className="badge badge-neutral">{items?.length ?? 0}</span>
          </div>
        </Link>
      </div>

      <div className="card mt16" style={{ background: 'var(--c-primary-soft)', borderColor: '#cfe0fb', padding: 14 }}>
        <div className="bold small" style={{ color: 'var(--c-primary-dark)' }}>How CYCLONE protection works</div>
        <p className="small mt8" style={{ color: 'var(--c-primary-dark)', opacity: 0.85, lineHeight: 1.5 }}>
          Every item you register gets a secure CYCLONE QR containing only a private identifier — no personal information. If your item is lost and someone scans it, they can anonymously report it found and you'll be notified. Your contact details are never shared.
        </p>
      </div>
    </SubScreen>
  );
}