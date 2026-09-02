import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBack } from '../components/Icons';

export function PageHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="page-header no-print">
      <button className="back-btn" onClick={onBack || (() => navigate(-1))} aria-label="Back">
        <IconBack />
      </button>
      <h1>{title}</h1>
      {right}
    </div>
  );
}

export function SubScreen({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="app-main">
        <PageHeader title={title} right={right} />
        <div className="page">{children}</div>
      </div>
    </div>
  );
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}