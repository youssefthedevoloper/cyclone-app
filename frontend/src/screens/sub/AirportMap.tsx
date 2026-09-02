import React, { useEffect, useState } from 'react';
import { useData } from '../../state/data';
import { AirportApi } from '../../api/client';
import { useToast } from '../../components/toast';
import { SubScreen } from '../SubScreen';
import { Skeleton } from '../../components/ui';
import { IconPin, IconRoute } from '../../components/Icons';

const TYPE_LABEL: Record<string, string> = {
  entrance: 'Entrance', checkin: 'Check-in', baggage: 'Baggage', security: 'Security',
  passport: 'Passport', gate: 'Gate', boarding: 'Boarding', lounge: 'Lounge',
  restaurant: 'Restaurant', shop: 'Shop', atm: 'ATM', medical: 'Medical',
  lostfound: 'Lost & Found', transport: 'Transport', parking: 'Parking',
  bathroom: 'Bathroom', immigration: 'Immigration', priority: 'Priority',
};

export default function AirportMap() {
  const { airports, loaded } = useData();
  const [code, setCode] = useState('CAI');
  const [map, setMap] = useState<any | null>(null);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [route, setRoute] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let active = true;
    setMap(null);
    setRoute(null);
    setFrom(''); setTo('');
    AirportApi.map(code)
      .then((m) => {
        if (!active) return;
        setMap(m);
        const dest = m.nodes.find((n: any) => n.type === 'boarding' || n.type === 'gate') || m.nodes[0];
        if (dest) { setTo(dest.id); setFrom(m.nodes[0]?.id || ''); }
      })
      .catch((e: any) => { if (active) toast.toast(e.message, 'error'); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function go() {
    if (!from || !to) return toast.toast('Choose both points', 'error');
    setBusy(true);
    try {
      const r = await AirportApi.navigate(code, from, to);
      setRoute(r);
      if (!r.found) toast.toast('No route found', 'error');
    } catch (e: any) {
      toast.toast(e.message, 'error');
    } finally { setBusy(false); }
  }

  const nodes = map?.nodes || [];
  const edges = map?.edges || [];
  const routeIds = new Set((route?.route || []).map((n: any) => n.id));
  const routePairs = new Set<string>();
  (route?.route || []).forEach((n: any, idx: number) => {
    if (idx < route.route.length - 1) routePairs.add([n.id, route.route[idx + 1].id].sort().join('|'));
  });

  return (
    <SubScreen title={`Airport Map · ${code}`} right={
      loaded.airports && airports.length ? (
        <select value={code} onChange={(e) => setCode(e.target.value)} className="select-inline">
          {airports.map((a: any) => <option key={a.code} value={a.code}>{a.code}</option>)}
        </select>
      ) : undefined
    }>
      {!map ? (
        <div className="card card-pad"><Skeleton style={{ height: 260 }} /></div>
      ) : (
        <>
          <div className="card card-pad" style={{ padding: 6, overflow: 'hidden' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', display: 'block' }}>
              {edges.map((e: any) => {
                const a = nodes.find((n: any) => n.id === e.fromNodeId);
                const b = nodes.find((n: any) => n.id === e.toNodeId);
                if (!a || !b) return null;
                const active = routePairs.has([e.fromNodeId, e.toNodeId].sort().join('|'));
                return <line key={e.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={active ? 'var(--c-primary)' : '#dfe5ee'} strokeWidth={active ? 1.4 : 0.6} />;
              })}
              {nodes.map((n: any) => {
                const active = routeIds.has(n.id);
                const isFrom = from === n.id;
                const isTo = to === n.id;
                return (
                  <g key={n.id} onClick={() => { if (!isFrom && !isTo) setTo(n.id); }}>
                    <circle cx={n.x} cy={n.y} r={active ? 2.6 : 1.7} fill={active ? 'var(--c-primary)' : isFrom || isTo ? 'var(--c-primary-dark)' : '#fff'} stroke={active ? 'var(--c-primary)' : isFrom || isTo ? 'var(--c-primary-dark)' : '#b9c4d6'} strokeWidth={0.7} />
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="tiny muted mt8" style={{ textAlign: 'center' }}>Tap a point to set your destination · highlighted nodes = route</p>

          <div className="mt16">
            <div className="field">
              <label>From</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)}>
                <option value="">Choose</option>
                {nodes.map((n: any) => <option key={n.id} value={n.id}>{TYPE_LABEL[n.type] || n.type} · {n.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>To</label>
              <select value={to} onChange={(e) => setTo(e.target.value)}>
                <option value="">Choose</option>
                {nodes.map((n: any) => <option key={n.id} value={n.id}>{TYPE_LABEL[n.type] || n.type} · {n.name}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" disabled={busy} onClick={go}><IconRoute size={17} /> Get directions</button>
          </div>

          {route && route.found && (
            <div className="card card-pad mt16">
              <div className="between">
                <div className="bold" style={{ fontSize: 15 }}><IconPin size={15} /> {route.from.name} → {route.to.name}</div>
              </div>
              <div className="row mt8" style={{ gap: 6 }}>
                <span className="badge badge-blue">~{route.walkingTime} min</span>
                <span className="badge badge-neutral">{route.distance} m</span>
                <span className="badge badge-neutral">{route.route.length} stops</span>
              </div>
              <div className="mt12">
                {route.route.map((n: any, i: number) => (
                  <div key={n.id} className="row" style={{ gap: 12, padding: '7px 0' }}>
                    <span style={{ width: 24, height: 24, borderRadius: 999, background: i === 0 ? 'var(--c-primary-soft)' : 'var(--c-neutral-soft)', color: i === 0 ? 'var(--c-primary-dark)' : 'var(--c-text-2)', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                    <div>
                      <div className="bold small">{n.name}</div>
                      <div className="tiny muted-2">{TYPE_LABEL[n.type] || n.type} · Terminal {n.terminal}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </SubScreen>
  );
}