import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AirportApi } from '../../api/client';
import { useToast } from '../../components/toast';
import { SubScreen } from '../SubScreen';
import { Skeleton, Empty } from '../../components/ui';
import { IconPin } from '../../components/Icons';

const CATEGORY_TYPES: Record<string, string[]> = {
  lounge: ['lounge'],
  restaurants: ['restaurant'],
  dining: ['restaurant'],
  shops: ['shop'],
  banks: ['atm'],
  atms: ['atm'],
  medical: ['medical'],
  transportation: ['transport'],
  transport: ['transport'],
  parking: ['parking'],
  accessibility: ['priority', 'accessibility'],
};

export default function AirportServicesCategory() {
  const { category } = useParams<{ category: string }>();
  const [groups, setGroups] = useState<any[] | null>(null);
  const [airport, setAirport] = useState<string>('CAI');
  const toast = useToast();
  const wanted = (category || '').toLowerCase();

  useEffect(() => {
    let active = true;
    setGroups(null);
    AirportApi.locations(airport)
      .then((r) => {
        if (active) {
          setAirport(r.airport.code);
          setGroups(r.locations || []);
        }
      })
      .catch((e: any) => { if (active) toast.toast(e.message, 'error'); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airport]);

  const typeFilter = CATEGORY_TYPES[wanted] || (wanted ? [wanted] : null);
  const visible = typeFilter
    ? (groups || []).filter((g) => typeFilter.some((t) => t === g.type))
    : groups || [];

  const pretty = (wanted || 'services').replace(/_/g, ' ');

  return (
    <SubScreen title={pretty[0]?.toUpperCase() + pretty.slice(1)}>
      <div className="row mb16" style={{ gap: 6 }}>
        {['CAI', 'DXB', 'DOH'].map((c) => (
          <button key={c} className={`btn btn-${airport === c ? 'primary' : 'outline'}`} style={{ width: 'auto', padding: '8px 14px', fontSize: 12.5 }} onClick={() => setAirport(c)}>{c}</button>
        ))}
      </div>

      {!groups ? (
        <div className="card card-pad"><Skeleton style={{ height: 18 }} /><Skeleton style={{ marginTop: 10 }} /></div>
      ) : visible.length === 0 ? (
        <Empty icon={<IconPin size={26} />} title="Nothing here yet" text="Try another airport or category." action={<Link className="btn btn-outline" style={{ width: 'auto', marginTop: 4 }} to="/features/map">Open Airport Map</Link>} />
      ) : (
        visible.map((g: any) => (
          <div key={g.type} className="mb16">
            <div className="section-title">{g.type.replace(/_/g, ' ')}</div>
            {g.items.map((n: any) => (
              <div key={n.id} className="card card-pad mb12" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--c-primary-soft)', color: 'var(--c-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconPin size={20} />
                </span>
                <div className="grow">
                  <div className="bold" style={{ fontSize: 15 }}>{n.name}</div>
                  <div className="tiny muted-2">Terminal {n.terminal}</div>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      <Link to="/features/map" className="btn btn-outline mb24"><IconPin size={16} /> View full airport map</Link>
    </SubScreen>
  );
}