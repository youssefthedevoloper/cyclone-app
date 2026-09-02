import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ItemApi } from '../../api/client';
import { useToast } from '../../components/toast';
import { useData } from '../../state/data';
import { SubScreen } from '../SubScreen';
import { Sheet, StatusBadge, Skeleton } from '../../components/ui';
import { QrImage } from '../../components/toast';
import { IconQr, IconCheck, IconPin, IconShield } from '../../components/Icons';

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<any | null>(null);
  const [qr, setQr] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [lostSheet, setLostSheet] = useState(false);
  const [foundSheet, setFoundSheet] = useState(false);
  const [location, setLocation] = useState('');
  const [airportCode, setAirportCode] = useState('CAI');
  const toast = useToast();
  const navigate = useNavigate();
  const { invalidate } = useData();

  useEffect(() => {
    if (!id) return;
    let active = true;
    ItemApi.get(id)
      .then((r) => { if (active) setItem(r.item); })
      .catch((e: any) => { toast.toast(e.message || 'Item not found', 'error'); navigate('/features/lost-found/my-items', { replace: true }); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadQr() {
    try {
      const q = await ItemApi.qr(id!);
      setQr(q);
    } catch {}
  }

  useEffect(() => { if (item) loadQr(); }, [item]);

  async function markLost() {
    setBusy(true);
    try {
      await ItemApi.lost(id!, { location, airportCode });
      invalidate(['items']);
      setLostSheet(false);
      toast.toast('Item marked as lost', 'success');
      const fresh = await ItemApi.get(id!);
      setItem(fresh.item);
    } catch (e: any) {
      toast.toast(e.message, 'error');
    } finally { setBusy(false); }
  }

  async function markRecovered() {
    setBusy(true);
    try {
      await ItemApi.recovered(id!);
      invalidate(['items']);
      setFoundSheet(false);
      toast.toast('Item marked as recovered', 'success');
      const fresh = await ItemApi.get(id!);
      setItem(fresh.item);
    } catch (e: any) {
      toast.toast(e.message, 'error');
    } finally { setBusy(false); }
  }

  if (!item) {
    return (
      <SubScreen title="Item">
        <div className="card card-pad"><Skeleton style={{ height: 20 }} /><Skeleton style={{ marginTop: 12 }} /><Skeleton style={{ marginTop: 12 }} /></div>
      </SubScreen>
    );
  }

  return (
    <SubScreen title={item.name || 'Item'}>
      <div className="card card-pad" style={{ textAlign: 'center' }}>
        {qr ? (
          <div style={{ display: 'inline-block', textAlign: 'center' }}>
            <QrImage dataUrl={qr.qrDataUrl} logoDataUrl={qr.logoDataUrl} size={150} />
            <p className="muted-2 small" style={{ marginTop: 10 }}>Scan to identify this item</p>
            <div className="mono small muted" style={{ marginTop: 6, wordBreak: 'break-all', userSelect: 'all' }}>{item.qrIdentifier}</div>
          </div>
        ) : (
          <div className="skel" style={{ width: 150, height: 150, margin: '0 auto', borderRadius: 16 }} />
        )}
        <div className="mt16">
          <StatusBadge status={item.status} />
        </div>
      </div>

      <div className="card card-pad mt16">
        <div className="between" style={{ padding: '5px 0' }}><span className="muted-2 small">Category</span><span className="bold">{item.category}</span></div>
        {item.description && <div className="between" style={{ padding: '5px 0' }}><span className="muted-2 small">Description</span><span className="small" style={{ textAlign: 'right' }}>{item.description}</span></div>}
        <div className="between" style={{ padding: '5px 0' }}><span className="muted-2 small">Registered</span><span className="small">{new Date(item.createdAt).toLocaleDateString()}</span></div>
        <div className="between" style={{ padding: '5px 0' }}><span className="muted-2 small">QR identifier</span><span className="mono small">{String(item.qrIdentifier || '').slice(0, 18)}…</span></div>
      </div>

      {item.lostReport && (
        <div className="card card-pad mt16" style={{ background: 'var(--c-warning-soft)', borderColor: '#f5e2b8' }}>
          <div className="bold small" style={{ color: 'var(--c-warning)' }}>Lost report</div>
          {(item.lostReport.location || item.lostReport.airportId) && (
            <p className="small mt8"><IconPin size={14} /> {item.lostReport.location || 'Airport'} {item.lostReport.airportId ? `· ${item.lostReport.airportId}` : ''}</p>
          )}
          {item.lostReport.description && <p className="small mt4">{item.lostReport.description}</p>}
          <p className="small mt4 muted">Reported {new Date(item.lostReport.createdAt).toLocaleString()}</p>
        </div>
      )}

      <div className="mt16">
        {item.status === 'lost' ? (
          <button className="btn btn-success" disabled={busy} onClick={() => setFoundSheet(true)}><IconCheck size={17} /> I recovered this item</button>
        ) : (
          <button className="btn btn-danger" disabled={busy} onClick={() => setLostSheet(true)}><IconShield size={17} /> Report lost</button>
        )}
        <button className="btn btn-outline mt12" onClick={loadQr}><IconQr size={17} /> Refresh QR preview</button>
      </div>

      <Sheet open={lostSheet} onClose={() => setLostSheet(false)} title="Report lost">
        <p className="small muted" style={{ lineHeight: 1.5 }}>
          Anyone who scans your QR will be able to help return it — without ever seeing your personal data.
        </p>
        <div className="field mt16">
          <label>Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Gate C18, seating area" />
        </div>
        <div className="field">
          <label>Airport</label>
          <select value={airportCode} onChange={(e) => setAirportCode(e.target.value)}>
            <option value="CAI">Cairo International (CAI)</option>
            <option value="DXB">Dubai International (DXB)</option>
            <option value="DOH">Hamad International (DOH)</option>
          </select>
        </div>
        <button className="btn btn-danger" disabled={busy} onClick={markLost}>{busy ? '…' : 'Mark as lost'}</button>
      </Sheet>

      <Sheet open={foundSheet} onClose={() => setFoundSheet(false)} title="I found my item">
        <p className="small muted" style={{ lineHeight: 1.5 }}>Marking as recovered clears the lost report and notifies the Lost &amp; Found service.</p>
        <button className="btn btn-success" disabled={busy} onClick={markRecovered}>{busy ? '…' : 'Recovered — it’s back'}</button>
      </Sheet>
    </SubScreen>
  );
}