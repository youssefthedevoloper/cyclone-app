import React from 'react';
import { LogoMark } from '../components/ui';

export default function Loading() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: 'var(--c-bg)' }}>
      <LogoMark size={46} />
      <div style={{ width: 120, height: 4, borderRadius: 999, background: 'var(--c-neutral-soft)', overflow: 'hidden' }}>
        <div style={{ width: '40%', height: 4, background: 'var(--c-primary)', borderRadius: 999, animation: 'loadingbar 1s infinite ease-in-out' }} />
      </div>
      <style>{`@keyframes loadingbar { 0%{transform:translateX(-100%)} 100%{transform:translateX(320%)} }`}</style>
    </div>
  );
}