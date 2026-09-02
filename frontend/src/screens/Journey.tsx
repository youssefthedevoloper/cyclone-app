import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth';
import { useData } from '../state/data';
import { JourneyApi } from '../api/client';
import { useToast } from '../components/toast';
import { StatusBadge, StatusDot, StepProgress, Skeleton, Empty } from '../components/ui';
import { IconPlane, IconRoute, IconPin, IconTime, IconCheck, IconTicket, IconScan } from '../components/Icons';
import { formatTime } from './SubScreen';

export default function Journey() {
  const { user } = useAuth();
  const { journey, invalidate } = useData();
  const [busyId, setBusyId] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const j = journey?.journey;
  const flight = j?.flight;

  async function complete(stepId: string) {
    if (!j) return;
    setBusyId(stepId);
    try {
      const res = await JourneyApi.completeStep(j.id, stepId);
      invalidate(['journey', 'loyalty']);
      if (res.journey?.status === 'completed') toast.toast('Journey complete! +50 bonus points', 'success');
      else if (res.journey?.progress >= 60) toast.toast(`Journey ${res.journey.progress}% complete`, 'success');
      else toast.toast('Step completed', 'success');
    } catch (e: any) {
      toast.toast(e.message || 'Could not update step', 'error');
    } finally {
      setBusyId(null);
    }
  }

  if (!journey) {
    return (
      <div className="page">
        <h1 style={{ fontSize: 20, fontWeight: 800, paddingTop: 14, marginBottom: 4 }}>Journey</h1>
        <p className="muted">Personalized airport guidance</p>
        <div className="card card-pad mt16"><Skeleton style={{ height: 24 }} /><Skeleton style={{ marginTop: 12 }} /></div>
      </div>
    );
  }

  if (journey.access === 'required') {
    return (
      <div className="page">
        <h1 style={{ fontSize: 20, fontWeight: 800, paddingTop: 14, marginBottom: 4 }}>Journey</h1>
        <p className="muted">Personalized airport guidance</p>
        <Empty
          icon={<IconTicket size={26} />}
          title="Add your travel ticket"
          text="Add your travel ticket to unlock your personalized Journey."
          action={
            <button className="btn btn-primary" style={{ maxWidth: '100%' }} onClick={() => navigate('/profile/tickets')}>
              Add Ticket
            </button>
          }
        />
        <Empty
          icon={<IconScan size={26} />}
          title="Scan a ticket"
          text="Scan your boarding pass or enter your booking details to begin."
          action={
            <button className="btn btn-outline" style={{ maxWidth: '100%' }} onClick={() => navigate('/profile/tickets')}>
              Scan ticket
            </button>
          }
        />
      </div>
    );
  }

  if (!j || !flight) {
    return (
      <div className="page">
        <h1 style={{ fontSize: 20, fontWeight: 800, paddingTop: 14 }}>Journey</h1>
        <Empty icon={<IconRoute size={26} />} title="No journey yet" text="Add your ticket to get started." />
      </div>
    );
  }

  const steps = j.steps || [];

  return (
    <div className="page">
      <h1 style={{ fontSize: 20, fontWeight: 800, paddingTop: 14, marginBottom: 4 }}>Journey</h1>
      <p className="muted">Personalized airport guidance</p>

      {j.isDemo && (
        <div style={{ marginTop: 12, background: 'var(--c-primary-soft)', border: '1px solid #cfe0fb', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--c-primary-dark)' }}>
          Demo Journey — a realistic sample of your personalized CYCLONE experience.
        </div>
      )}

      {/* Flight summary */}
      <div className="card card-pad mt16">
        <div className="between">
          <div>
            <span className="badge badge-blue">{flight.flightNumber}</span>{' '}
            {flight.isDemoTicket && <span className="badge badge-warning">DEMO TICKET</span>}
          </div>
          <StatusBadge status={flight.status} />
        </div>
        <div className="between" style={{ marginTop: 14 }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px' }}>
            {flight.origin} <span className="muted-2" style={{ fontSize: 18 }}>→</span> {flight.destination}
          </div>
        </div>
        <div className="between small muted mt8">
          <span>{flight.airline}</span>
          <span>Terminal {flight.terminal} · Gate {flight.gate || '—'}</span>
        </div>
        <div className="between small muted mt8">
          <span>Departure</span>
          <span className="bold">{formatTime(flight.departureTime)}</span>
        </div>
        <div className="mt16">
          <StepProgress value={j.progress || 0} />
          <div className="between mt8 small muted">
            <span>{j.progress || 0}% complete</span>
            <span>{steps.length} steps</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="section-title">Journey timeline</div>
      <div className="timeline">
        {steps.map((s: any) => {
          const cls = s.status === 'completed' ? 'completed' : s.status === 'current' ? 'current' : s.status === 'delayed' ? 'delayed' : s.status === 'attention_required' ? 'attention' : 'upcoming';
          return (
            <div key={s.id} className={`tl-item ${cls}`}>
              <div className="tl-rail">
                <span className="tl-dot" />
                <div className="tl-line" />
              </div>
              <div className="tl-card">
                <div className="tl-top">
                  <h4>{s.title}</h4>
                  <StatusDot status={s.status} />
                </div>
                <div className="tl-sub">
                  {s.status.replace(/_/g, ' ')}
                </div>
                <p className="small muted mt8">{s.description}</p>

                <div className="row mt12" style={{ flexWrap: 'wrap', gap: 6 }}>
                  <span className="badge badge-neutral"><IconPin size={12} /> {s.location}</span>
                  {s.route && (
                    <span className="badge badge-neutral"><IconTime size={12} /> {s.route.walkingTime} min walk</span>
                  )}
                  {s.estimatedDuration && <span className="badge badge-neutral">~{s.estimatedDuration} min</span>}
                </div>

                {s.instructions && (
                  <p className="small muted mt8" style={{ background: 'var(--c-bg)', borderRadius: 8, padding: '8px 10px' }}>
                    {s.instructions}
                  </p>
                )}

                <div className="row mt12">
                  {s.status === 'current' && (
                    <button className="btn btn-primary" style={{ width: 'auto', flex: 1 }} disabled={busyId === s.id} onClick={() => complete(s.id)}>
                      {busyId === s.id ? 'Updating…' : s.title === 'Boarding' ? 'I’m onboarding' : 'Complete step'}
                    </button>
                  )}
                  {s.status === 'completed' && (
                    <span className="badge badge-success"><IconCheck size={12} /> Completed</span>
                  )}
                  {s.navigation && (
                    <button className="btn btn-outline" style={{ width: 'auto' }} onClick={() => navigate(`/features/map?to=${s.location}`)}>
                      Navigate
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ background: 'var(--c-primary-soft)', borderColor: '#cfe0fb', padding: 16, marginTop: 4 }}>
        <div className="row">
          <span style={{ color: 'var(--c-primary)', display: 'flex' }}><IconPlane size={18} /></span>
          <div className="grow">
            <div className="bold" style={{ color: 'var(--c-primary-dark)' }}>Completion reward</div>
            <div className="small" style={{ color: 'var(--c-primary-dark)', opacity: 0.75 }}>Earn +100 Cyclone Points per step and +50 bonus when you complete all steps.</div>
          </div>
        </div>
      </div>
    </div>
  );
}