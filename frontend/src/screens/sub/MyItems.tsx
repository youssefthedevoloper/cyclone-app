import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../state/data';
import { ItemApi } from '../../api/client';
import { useToast } from '../../components/toast';
import { SubScreen } from '../SubScreen';
import { Empty, Skeleton, Sheet } from '../../components/ui';
import { ItemQrThumb } from './ItemQrThumb';
import { IconBag, IconPlus } from '../../components/Icons';

export default function MyItems() {
  const { items, loaded, invalidate } = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const [regSheet, setRegSheet] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Backpack');
  const [busy, setBusy] = useState(false);

  async function register() {
    if (!name.trim()) return toast.toast('Enter item name', 'error');
    setBusy(true);
    try {
      const res = await ItemApi.create({ name, category });
      invalidate(['items', 'loyalty']);
      setRegSheet(false);
      setName('');
      toast.toast(res.pointsEarned ? `Item registered · +${res.pointsEarned} pts` : 'Item registered', 'success');
      navigate(`/items/${res.item.id}`);
    } catch (e: any) {
      toast.toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SubScreen
      title="My Items"
      right={
        <button className="btn btn-primary" style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }} onClick={() => setRegSheet(true)}>
          <IconPlus size={16} /> Register
        </button>
      }
    >
      {!loaded.items ? (
        <div className="card card-pad"><Skeleton style={{ height: 18 }} /><Skeleton style={{ marginTop: 10 }} /></div>
      ) : (items || []).length === 0 ? (
        <Empty
          icon={<IconBag size={26} />}
          title="No items yet"
          text="Protect your belongings with a CYCLONE QR."
          action={
            <button className="btn btn-primary" onClick={() => navigate('/features/lost-found/generate')}>Generate a QR</button>
          }
        />
      ) : (
        <div>
          {items.map((it: any) => (
            <Link key={it.id} to={`/items/${it.id}`} className="card card-pad mb16" style={{ display: 'flex', gap: 14, textDecoration: 'none', color: 'inherit' }}>
              <ItemQrThumb itemId={it.id} size={74} />
              <div className="grow">
                <span className={`badge badge-${it.status === 'safe' ? 'success' : it.status === 'lost' ? 'warning' : 'blue'}`}>{it.status}</span>
                <div className="bold mt8" style={{ fontSize: 16 }}>{it.name}</div>
                <div className="muted-2 small">{it.category}</div>
                <div className="muted-2 small" style={{ marginTop: 4 }}>Registered {new Date(it.createdAt).toLocaleDateString()}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Sheet open={regSheet} onClose={() => setRegSheet(false)} title="Register an item">
        <div className="field">
          <label>Item name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Black Backpack" />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {['Backpack', 'Suitcase', 'Laptop', 'Phone', 'Passport', 'Wallet', 'Jacket', 'Camera', 'Other'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" disabled={busy} onClick={register}>{busy ? 'Registering…' : 'Register item'}</button>
        <p className="small muted mt8">+25 Cyclone Points on registration.</p>
      </Sheet>
    </SubScreen>
  );
}