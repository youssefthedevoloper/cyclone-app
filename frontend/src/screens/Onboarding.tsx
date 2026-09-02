import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth';
import { LogoMark } from '../components/ui';

const steps = [
  { title: 'Welcome to CYCLONE', text: 'Your personal airport companion that turns a stressful journey into a clear, guided experience.', icon: 'M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z' },
  { title: 'Add your flight', text: 'Add your ticket to unlock a personalized journey built around your flight.', icon: 'M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7Z' },
  { title: 'Get guided', text: 'Follow step-by-step guidance through check-in, security, and to your gate.', icon: 'M6 19h8a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h8' },
  { title: 'Navigate the airport', text: 'Find restaurants, lounges, ATMs and landmarks with airport navigation.', icon: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z' },
  { title: 'Protect your belongings', text: 'Register your items with a CYCLONE QR so they can always be identified.', icon: 'M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z' },
  { title: 'Earn Cyclone Points', text: 'Complete journeys and use services to earn loyalty points.', icon: 'M9 3l2.5 5 5.5.8-4 3.9 1 5.5L9 15.8 3.5 18.2l1-5.5L.5 8.8 6 8 9 3Z' },
  { title: 'Redeem rewards', text: 'Spend points in the Rewards Shop on lounges, premium trials and more.', icon: 'M12 9 14.5 14 20 14.8 16 18.7 17 24 12 21.5 7 24 8 18.7 4 14.8 9.5 14 12 9Z' },
];

export default function Onboarding() {
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const step = steps[idx];
  const last = idx === steps.length - 1;

  return (
    <div className="app-shell">
      <div className="app-main" style={{ padding: '0 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ paddingTop: 22 }}>
          <div className="between">
            <LogoMark size={30} />
            <div style={{ display: 'flex', gap: 5 }}>
              {steps.map((_, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: 99, background: i <= idx ? 'var(--c-primary)' : 'var(--c-border)' }} />
              ))}
            </div>
            <button className="link" style={{ fontSize: 13 }} onClick={() => navigate('/home')}>Skip</button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ width: 84, height: 84, borderRadius: 24, background: 'var(--c-primary-soft)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-primary-dark)' }}>
            <svg width={42} height={42} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d={step.icon} />
            </svg>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', letterSpacing: '-0.4px' }}>{step.title}</h2>
          <p style={{ textAlign: 'center', color: 'var(--c-text-2)', marginTop: 10, lineHeight: 1.55 }}>{step.text}</p>
        </div>

        <div style={{ padding: '0 0 28px' }}>
          <button className="btn btn-primary" onClick={() => (last ? navigate('/home') : setIdx(idx + 1))}>
            {last ? 'Start using CYCLONE' : 'Continue'}
          </button>
          {!last && (
            <button className="btn btn-ghost" onClick={() => navigate('/home')}>
              {user?.hasDemoAccess || user?.hasTicket ? 'Go to my Journey' : 'I’ll do this later'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}