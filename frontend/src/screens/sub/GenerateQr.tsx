import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemApi } from '../../api/client';
import { useToast } from '../../components/toast';
import { useData } from '../../state/data';
import { SubScreen } from '../SubScreen';
import { QrImage } from '../../components/toast';
import { IconQr, IconPrint, IconBag } from '../../components/Icons';

const CATEGORIES = ['Backpack', 'Suitcase', 'Laptop', 'Phone', 'Passport', 'Wallet', 'Jacket', 'Camera', 'Other'];

export default function GenerateQr() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Backpack');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ item: any; pointsEarned: number; qr?: any } | null>(null);
  const [qrBusy, setQrBusy] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { invalidate } = useData();

  async function generate() {
    if (!name.trim()) return toast.toast('Enter an item name', 'error');
    setBusy(true);
    try {
      const res = await ItemApi.create({ name, category, description });
      invalidate(['items', 'loyalty']);
      const qr = await generateQrForItem(res.item.id);
      setResult({ item: res.item, pointsEarned: res.pointsEarned || 0, qr });
      toast.toast(res.pointsEarned ? `Item registered · +${res.pointsEarned} points` : 'Item registered', 'success');
    } catch (e: any) {
      toast.toast(e.message || 'Could not register item', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function generateQrForItem(id: string) {
    setQrBusy(true);
    try {
      return await ItemApi.qr(id);
    } finally {
      setQrBusy(false);
    }
  }

  async function regenerate() {
    if (!result) return;
    setQrBusy(true);
    try {
      const qr = await ItemApi.regenerateQr(result.item.id);
      setResult({ ...result, qr });
      toast.toast('New QR generated · previous codes revoked', 'success');
    } catch (e: any) {
      toast.toast(e.message, 'error');
    } finally {
      setQrBusy(false);
    }
  }

  function print() {
    window.print();
  }

  if (result && result.qr) {
    return (
      <SubScreen title="Your CYCLONE QR">
        <div style={{ textAlign: 'center' }}>
          <img src="/logo.png" alt="CYCLONE" style={{ height: 40, margin: '6px auto 16px', display: 'block' }} onError={(e) => { (e.target as HTMLImageElement).src = '/trans-logo.png'; }} />
          <div style={{ display: 'inline-block', textAlign: 'center' }}>
            <QrImage dataUrl={result.qr.qrDataUrl} logoDataUrl={result.qr.logoDataUrl} />
            <p className="muted-2 small" style={{ marginTop: 12 }}>“Scan to identify this item”</p>
          </div>

          <div className="card card-pad mt16" style={{ textAlign: 'left' }}>
            <div className="between">
              <div>
                <div className="muted-2 small">Item</div>
                <div className="bold" style={{ fontSize: 17 }}>{result.item.name}</div>
              </div>
              <span className="badge badge-success">Safe · Registered</span>
            </div>
            <div className="row mt12" style={{ gap: 6 }}>
              <span className="badge badge-neutral">{result.item.category}</span>
              <span className="badge badge-blue">+{result.pointsEarned} pts</span>
            </div>
            <p className="small muted mt8">
              This QR contains only a secure identifier. It reveals no name, email or contact details.
            </p>
          </div>

          <div className="grid-2 mt16">
            <button className="btn btn-primary" onClick={print}>
              <IconPrint size={17} /> Print
            </button>
            <button className="btn btn-outline" disabled={qrBusy} onClick={regenerate}>
              <IconQr size={17} /> New QR
            </button>
          </div>
          <button className="btn btn-secondary mt12" onClick={() => navigate('/features/lost-found/my-items')}>
            <IconBag size={17} /> View in My Items
          </button>
        </div>
      </SubScreen>
    );
  }

  return (
    <SubScreen title="Generate QR">
      <div className="card card-pad">
        <div className="field">
          <label>Item name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Black Backpack" />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Description (optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Anything that helps identify it" />
        </div>
        <button className="btn btn-primary" disabled={busy || !name.trim()} onClick={generate}>
          <IconQr size={17} /> {busy ? 'Registering…' : 'Generate QR'}
        </button>
        <p className="small muted mt8">
          You'll earn +25 Cyclone Points for each item you register.
        </p>
      </div>
    </SubScreen>
  );
}