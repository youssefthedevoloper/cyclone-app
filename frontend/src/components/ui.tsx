import React from 'react';
import { Link } from 'react-router-dom';
import { IconClose, IconChevron, IconCheck } from './Icons';

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const s = (status || '').toLowerCase();
  let cls = 'neutral';
  if (['completed', 'recovered', 'safe', 'landed', 'verified', 'redeemed', 'confirmed', 'premium', 'boarded'].includes(s)) cls = 'success';
  else if (['boarding', 'current', 'found', 'departed', 'scheduled'].includes(s)) cls = 'blue';
  else if (['delayed', 'attention_required', 'lost', 'attention required'].includes(s)) cls = 'warning';
  else if (['cancelled', 'required', 'error'].includes(s)) cls = 'danger';
  const dotMap: Record<string, string> = {
    success: 'dot-success',
    blue: 'dot-blue',
    warning: 'dot-warning',
    danger: 'dot-danger',
    neutral: 'dot-neutral',
  };
  const pretty = label || status.replace(/_/g, ' ');
  return (
    <span className={`badge badge-${cls}`}>
      <span className={`dot ${dotMap[cls]}`} />
      {pretty}
    </span>
  );
}

export function StatusDot({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  let cls = 'dot-neutral';
  if (['current', 'boarding', 'departed'].includes(s)) cls = 'dot-blue';
  else if (['completed', 'safe', 'recovered', 'landed', 'redeemed'].includes(s)) cls = 'dot-success';
  else if (['lost', 'attention_required', 'delayed'].includes(s)) cls = 'dot-warning';
  else if (['cancelled', 'required'].includes(s)) cls = 'dot-danger';
  return <span className={`dot ${cls}`} />;
}

export function Skeleton({ style, className = '' }: { style?: React.CSSProperties; className?: string }) {
  return <div className={`skel ${className}`} style={{ height: 16, ...style }} />;
}

export function Empty({ icon, title, text, action }: { icon?: React.ReactNode; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="empty">
      {icon && <div className="empty-icon">{icon}</div>}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="between mb16">
          {title ? <h3>{title}</h3> : <span />}
          <button className="back-btn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ModalCenter({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal center" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function ListItem({
  icon, label, value, to, onClick, danger,
}: {
  icon?: React.ReactNode; label: string; value?: string; to?: string; onClick?: () => void; danger?: boolean;
}) {
  const inner = (
    <React.Fragment>
      {icon && <span style={{ color: danger ? 'var(--c-danger)' : 'var(--c-primary)', display: 'flex' }}>{icon}</span>}
      <span className="grow" style={{ color: danger ? 'var(--c-danger)' : 'var(--c-text)', fontWeight: 600 }}>{label}</span>
      {value && <span className="muted-2 small">{value}</span>}
      {(to || onClick) && <IconChevron size={16} color="var(--c-text-3)" />}
    </React.Fragment>
  );
  const style: React.CSSProperties = {
    padding: '14px 6px',
    display: 'flex', alignItems: 'center', gap: 12,
    borderTop: '1px solid var(--c-border)',
    cursor: onClick || to ? 'pointer' : 'default',
    color: 'inherit', textDecoration: 'none',
  };
  if (to) return <Link style={{ ...style, display: 'flex' }} to={to}>{inner}</Link>;
  return <div style={style} onClick={onClick}>{inner}</div>;
}

export function StepProgress({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ width: '100%' }}>
      <div style={{ height: 7, borderRadius: 999, background: 'var(--c-neutral-soft)', overflow: 'hidden' }}>
        <div style={{ height: 7, width: `${pct}%`, background: 'var(--c-primary)', borderRadius: 999, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}

export function PointsChip({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="mono bold" style={{ fontSize: size, color: 'var(--c-primary-dark)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ color: 'var(--c-primary)', fontWeight: 800 }}>{value >= 0 ? '+' : ''}{value}</span>
      <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--c-primary)' }}>
        <circle cx="9" cy="9" r="6" fillOpacity="0" stroke="currentColor" strokeWidth="2" />
        <circle cx="15.5" cy="14.5" r="5.5" fillOpacity="0" stroke="currentColor" strokeWidth="2" />
      </svg>
    </span>
  );
}

export function Logo({ height = 26 }: { height?: number }) {
  return <img className="logo" src="/trans-logo.png" alt="CYCLONE" style={{ height }} onError={(e) => { (e.target as HTMLImageElement).src = '/trans-logo.jpeg'; }} />;
}

export function LogoMark({ size = 22 }: { size?: number }) {
  return <img src="/trans-logo.png" alt="CYCLONE" style={{ width: size, height: size, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).src = '/trans-logo.jpeg'; }} />;
}