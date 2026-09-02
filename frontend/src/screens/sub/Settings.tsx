import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../state/auth';
import { useToast } from '../../components/toast';
import { ListItem } from '../../components/ui';
import { SubScreen } from '../SubScreen';
import { IconUser, IconBell, IconHelp, IconLogout, IconBack, IconSettings } from '../../components/Icons';

export default function Settings() {
  const { user, updateName, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [emailNotif, setEmailNotif] = useState(true);
  const [editName, setEditName] = useState(false);

  async function saveName() {
    try {
      await updateName(name);
      toast.toast('Name updated', 'success');
      setEditName(false);
    } catch (e: any) {
      toast.toast(e.message, 'error');
    }
  }

  return (
    <SubScreen title="Settings">
      <div className="section-title">Profile</div>
      <div className="card">
        <div className="card-pad">
          <div className="between">
            <div>
              <div className="bold">{user?.name}</div>
              <div className="muted-2 small">{user?.email}</div>
            </div>
            <button className="btn btn-outline" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => setEditName(!editName)}>
              Edit name
            </button>
          </div>
          {editName && (
            <div className="mt12">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              <button className="btn btn-primary mt8" onClick={saveName}>Save</button>
            </div>
          )}
        </div>
      </div>

      <div className="section-title">Preferences</div>
      <div className="card">
        <div className="between" style={{ padding: '14px 16px', borderTop: '1px solid var(--c-border)' }}>
          <div className="row">
            <span style={{ color: 'var(--c-primary)', display: 'flex' }}><IconBell size={20} /></span>
            <span style={{ fontWeight: 600 }}>Email notifications</span>
          </div>
          <button
            className="btn btn-outline"
            style={{ width: 'auto', padding: '6px 14px', fontSize: 13 }}
            onClick={() => { setEmailNotif(!emailNotif); toast.toast(emailNotif ? 'Email notifications off' : 'Email notifications on', 'success'); }}
          >
            {emailNotif ? 'On' : 'Off'}
          </button>
        </div>
        <ListItem icon={<IconUser size={20} />} label="Account number" value={`#${user?.accountNumber}`} />
        <ListItem icon={<IconSettings size={20} />} label="Premium status" value={user?.premiumStatus !== 'free' ? 'Premium' : 'Free'} to="/features/premium" />
      </div>

      <div className="section-title">Help</div>
      <div className="card">
        <ListItem
          icon={<IconHelp size={20} />}
          label="About CYCLONE"
          onClick={() => {
            toast.toast('CYCLONE helps you navigate airports with a personalized journey, QR-protected belongings, and Cyclone Points rewards.', 'default');
          }}
        />
      </div>

      <button className="btn btn-danger mt16" onClick={logout}>
        <IconLogout size={18} /> Log out
      </button>
    </SubScreen>
  );
}