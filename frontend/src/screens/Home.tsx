import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth';
import { useData } from '../state/data';
import { StatusBadge, StepProgress, Skeleton, LogoMark, PointsChip } from '../components/ui';
import { IconPlane, IconBell, IconChevron, IconRoute, IconMap, IconCoins } from '../components/Icons';
import { formatTime } from './SubScreen';

export default function Home() {
  const { user } = useAuth();
  const { journey, loyalty, tickets, notifications, loaded } = useData();
  const navigate = useNavigate();

  const j = journey?.journey;
  const hasAccess = journey?.access === 'personal' || journey?.access === 'demo';

  const nextStep = j?.nextStep || (j?.steps || []).find((s: any) => s.status === 'current') || null;
  const currentStep = j?.steps?.find((s: any) => s.status === 'current') || null;
  const flight = j?.flight;

  return (
    <div className="page">
      <div style={{ paddingTop: 14 }}>
        <div className="between" style={{ marginBottom: 6 }}>
          <div className="row">
            <LogoMark size={30} />
            <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px' }}>
              {user ? `Hi, ${user.name.split(' ')[0]}` : 'CYCLONE'}
            </h1>
          </div>
          <button className="back-btn" onClick={() => navigate('/profile/notifications')} aria-label="Notifications" style={{ position: 'relative' }}>
            <IconBell size={18} />
            {!!notifications?.unreadCount && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--c-danger)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 99, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                {notifications.unreadCount > 9 ? '9+' : notifications.unreadCount}
              </span>
            )}
          </button>
        </div>
        <p className="muted small">Account #{user?.accountNumber}</p>
      </div>

      {/* Flight card */}
      {!loaded.journey ? (
        <div className="card card-pad mt16">
          <Skeleton style={{ height: 14, width: '40%' }} />
          <Skeleton style={{ height: 22, marginTop: 12 }} />
          <Skeleton style={{ height: 12, marginTop: 12 }} />
        </div>
      ) : hasAccess && flight ? (
        <div className="card card-pad mt16">
          <div className="between">
            <div className="row">
              <StatusBadge status={flight.status} />
              {flight.isDemoTicket && (
                <span className="badge badge-warning">DEMO TICKET</span>
              )}
            </div>
            <span className="badge badge-blue">{flight.flightNumber}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
            <div className="grow">
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>{flight.origin}</div>
              <div className="muted-2 small">{flight.airline}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 1.5, background: 'var(--c-border)', position: 'relative' }}>
                <span style={{ position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)', color: 'var(--c-primary)' }}>
                  <IconPlane size={16} />
                </span>
              </div>
            </div>
            <div className="grow" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>{flight.destination}</div>
              <div className="muted-2 small">Terminal {flight.terminal}</div>
            </div>
          </div>

          <div className="divider" style={{ margin: '14px 0 10px' }} />
          <div className="between">
            <div>
              <div className="muted-2 small">Departure</div>
              <div className="bold">{formatTime(flight.departureTime)}</div>
            </div>
            <div>
              <div className="muted-2 small">Gate</div>
              <div className="bold">{flight.gate || '—'}</div>
            </div>
            <div>
              <div className="muted-2 small">Journey</div>
              <div className="bold">{j?.progress || 0}%</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card card-pad mt16" style={{ textAlign: 'center', padding: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--c-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--c-primary)' }}>
            <IconPlane size={26} />
          </div>
          <h3 style={{ fontWeight: 800, fontSize: 17 }}>Your journey starts here</h3>
          <p className="muted" style={{ marginTop: 6 }}>Add your flight to receive personalized airport guidance for your trip.</p>
          <div className="grid-2" style={{ marginTop: 18 }}>
            <Link to="/profile/tickets" className="btn btn-primary" style={{ textDecoration: 'none' }}>Add Ticket</Link>
            <Link to="/features" className="btn btn-outline" style={{ textDecoration: 'none' }}>Explore CYCLONE</Link>
          </div>
          {journey?.access === 'demo' && (
            <p style={{ marginTop: 14, fontSize: 12.5, fontWeight: 600, color: 'var(--c-primary-dark)', background: 'var(--c-primary-soft)', borderRadius: 10, padding: '8px 12px', display: 'inline-block' }}>
              Demo Journey available for early accounts
            </p>
          )}
          {journey?.access !== 'demo' && !hasAccess && (
            <Link to="/profile/tickets" className="link" style={{ display: 'inline-block', marginTop: 14, fontSize: 13 }}>
              Scan or enter your ticket
            </Link>
          )}
        </div>
      )}

      {/* Your next step */}
      {hasAccess && loaded.journey && j && (
        <div className="card mt16" style={{ padding: 16, borderLeft: '3px solid var(--c-primary)' }}>
          <div className="muted-2 small" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11 }}>
            Your next step
          </div>
          <div className="between mt8">
            <h3 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.3px' }}>
              {nextStep ? nextStep.title : 'Journey complete 🎉'}
            </h3>
            {currentStep && <StatusBadge status={currentStep.status} />}
          </div>
          {nextStep && (
            <>
              <div className="row mt8" style={{ gap: 6 }}>
                <span className="badge badge-neutral">{nextStep.location}</span>
                {nextStep.route && (
                  <span className="badge badge-neutral">{Math.round(nextStep.route.walkingTime)} min walk</span>
                )}
                {nextStep.estimatedDuration && (
                  <span className="badge badge-neutral">~{nextStep.estimatedDuration} min</span>
                )}
              </div>
              <div className="mt16">
                <StepProgress value={j.progress || 0} />
                <div className="between mt8 small muted">
                  <span>{j.progress || 0}% complete</span>
                  <span>{j.stepCount} steps</span>
                </div>
              </div>
              <Link to="/journey" className="btn btn-primary mt16" style={{ textDecoration: 'none' }}>Continue Journey</Link>
            </>
          )}
        </div>
      )}

      {/* Points + premium */}
      <div className="grid-2 mt16">
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="row">
            <span style={{ color: 'var(--c-primary)', display: 'flex' }}><IconCoins size={18} /></span>
            <span className="muted-2 small" style={{ fontWeight: 700 }}>Cyclone Points</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8 }}>{loaded.loyalty ? (loyalty?.balance ?? 0) : <Skeleton style={{ width: 80 }} />}</div>
          <Link to="/loyalty" className="link small" style={{ marginTop: 6 }}>View details →</Link>
        </div>
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', background: user?.premiumStatus !== 'free' ? 'var(--c-primary-soft)' : undefined, borderColor: user?.premiumStatus !== 'free' ? '#cfe0fb' : undefined }}>
          <div className="between">
            <span className="muted-2 small" style={{ fontWeight: 700 }}>Status</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, marginTop: 8 }}>
            {user?.premiumStatus !== 'free' ? 'Premium' : 'Free'}
          </div>
          <Link to="/features/premium" className="link small" style={{ marginTop: 6 }}>
            {user?.premiumStatus !== 'free' ? 'Manage premium →' : 'Try premium →'}
          </Link>
        </div>
      </div>

      {/* Flight status */}
      {flight && (
        <div className="card mt16">
          <div className="between card-pad" style={{ padding: '14px 16px' }}>
            <div className="row">
              <span style={{ color: 'var(--c-primary)' }}><IconRoute size={18} /></span>
              <div>
                <div className="bold">Flight status</div>
                <div className="muted-2 small">Updates shown here when flight data changes</div>
              </div>
            </div>
            <span className="badge badge-blue">{flight.status}</span>
          </div>
        </div>
      )}

      {/* Quick shortcuts */}
      <div className="section-title">Quick access</div>
      <div className="grid-2">
        <Link to="/features/map" className="feature-card"><div className="feature-icon"><IconMap /></div><h4>Airport map</h4><p>Find services and navigate terminals</p></Link>
        <Link to="/features/lost-found" className="feature-card"><div className="feature-icon"><IconRoute /></div><h4>Lost &amp; Found</h4><p>Protect belongings with CYCLONE QR</p></Link>
      </div>
    </div>
  );
}