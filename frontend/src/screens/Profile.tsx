import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth';
import { useData } from '../state/data';
import { ListItem } from '../components/ui';
import { IconTicket, IconBell, IconBag, IconCoins, IconSettings, IconHelp, IconLogout, IconStar, IconQr } from '../components/Icons';

export default function Profile() {
  const { user, logout } = useAuth();
  const { tickets, items, notifications, loyalty } = useData();
  const navigate = useNavigate();

  return (
    <div className="page">
      <h1 style={{ fontSize: 20, fontWeight: 800, paddingTop: 14, marginBottom: 6 }}>Profile</h1>

      <div className="card card-pad">
        <div className="row">
          <div style={{ width: 50, height: 50, borderRadius: 16, background: 'var(--c-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>
            {user?.name?.[0]?.toUpperCase() || 'C'}
          </div>
          <div className="grow">
            <div style={{ fontSize: 17, fontWeight: 800 }}>{user?.name}</div>
            <div className="muted-2 small">{user?.email}</div>
            <div className="row mt8" style={{ gap: 6 }}>
              <span className="badge badge-neutral">Account #{user?.accountNumber}</span>
              {user?.premiumStatus !== 'free' ? <span className="badge badge-blue">Premium</span> : <span className="badge badge-neutral">Free</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2 mt16">
        <div className="card card-pad" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{loyalty?.balance ?? 0}</div>
          <div className="muted-2 small">Cyclone Points</div>
          <Link to="/loyalty" className="link small">View →</Link>
        </div>
        <div className="card card-pad" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{tickets?.length ?? 0}</div>
          <div className="muted-2 small">Tickets</div>
          <Link to="/profile/tickets" className="link small">Manage →</Link>
        </div>
      </div>

      <div className="card mt16">
        <ListItem icon={<IconTicket size={20} />} label="Tickets" value={`${tickets?.length ?? 0}`} to="/profile/tickets" />
        <ListItem icon={<IconBag size={20} />} label="My Items" value={`${items?.length ?? 0}`} to="/features/lost-found/my-items" />
        <ListItem icon={<IconBell size={20} />} label="Notifications" value={`${notifications?.unreadCount ?? 0} unread`} to="/profile/notifications" />
        <ListItem icon={<IconQr size={20} />} label="Lost & Found" to="/features/lost-found" />
        <ListItem icon={<IconStar size={20} />} label="Premium" to="/features/premium" />
        <ListItem icon={<IconSettings size={20} />} label="Settings" to="/profile/settings" />
        <ListItem icon={<IconHelp size={20} />} label="Help & Support" onClick={() => navigate('/profile/settings?tab=help')} />
        <ListItem icon={<IconCoins size={20} />} label="Rewards Shop" to="/features/rewards/shop" />
        <ListItem icon={<IconLogout size={20} />} label="Log out" onClick={logout} danger />
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--c-text-3)', marginTop: 18 }}>
        CYCLONE v1.0 · Airport Companion
      </p>
    </div>
  );
}