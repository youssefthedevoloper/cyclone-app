import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth';
import { useToast } from '../components/toast';
import { Logo } from '../components/ui';

export default function AuthScreen({ mode }: { mode: 'login' | 'register' }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return toast.toast('Enter your email and password', 'error');
    if (!isLogin && !name) return toast.toast('Enter your name', 'error');
    setBusy(true);
    try {
      if (isLogin) await login(email, password);
      else await register(name, email, password);
      toast.toast(isLogin ? 'Welcome back to CYCLONE' : 'Account created', 'success');
      navigate('/onboarding', { replace: true });
    } catch (err: any) {
      toast.toast(err.message || 'Authentication failed', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function demoAccount(slot: number, emailAddr: string) {
    setBusy(true);
    try {
      await login(emailAddr, 'demo1234');
      toast.toast('Signed in to demo account', 'success');
      navigate('/onboarding', { replace: true });
    } catch (err: any) {
      toast.toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="app-main">
        <div className="page" style={{ paddingTop: 64 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <img src="/logo.png" alt="CYCLONE" style={{ height: 56, marginBottom: 14 }} onError={(e) => { (e.target as HTMLImageElement).src = '/trans-logo.png'; }} />
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>CYCLONE</h1>
            <p className="muted" style={{ marginTop: 4 }}>Your airport journey, simplified.</p>
          </div>

          <div className="card card-pad">
            <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 16 }}>
              {isLogin ? 'Sign in' : 'Create your account'}
            </h2>
            <form onSubmit={submit}>
              {!isLogin && (
                <div className="field">
                  <label>Full name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
                </div>
              )}
              <div className="field">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={isLogin ? 'current-password' : 'new-password'} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--c-text-2)', margin: '16px 0 4px' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <a className="link" onClick={() => navigate(isLogin ? '/register' : '/login')}>
              {isLogin ? 'Create one' : 'Sign in'}
            </a>
          </p>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--c-text-3)', fontWeight: 600, marginBottom: 10 }}>
            JUDGE DEMO — QUICK ACCESS
          </p>
          <div className="grid-2">
            <button className="btn btn-secondary" disabled={busy} onClick={() => demoAccount(1, 'judge@cyclone.example')}>
              Judge Account
            </button>
            <button className="btn btn-outline" disabled={busy} onClick={() => demoAccount(2, 'judge2@cyclone.example')}>
              Secondary Demo
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--c-text-3)', marginTop: 12 }}>
            First 20 accounts receive Demo Journey. Early demo accounts include virtual DEMO tickets, never real boarding passes.
          </p>
        </div>
      </div>
    </div>
  );
}