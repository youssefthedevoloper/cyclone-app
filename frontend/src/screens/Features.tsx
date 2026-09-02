import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../state/auth';
import {
  IconRoute, IconPlane, IconMap, IconTicket, IconQr, IconScan, IconBag, IconShield,
  IconCoins, IconGift, IconStar, IconBell, IconUser, IconSettings, IconPin,
  IconUtensils, IconShop, IconMed, IconBus, IconParking, IconAccess, IconWallet, IconHelp, IconTime,
} from '../components/Icons';

interface Feature {
  title: string;
  desc: string;
  icon: React.ReactNode;
  to: string;
  tag: 'free' | 'premium' | 'ticket' | 'locked';
}

function Section({ title, items }: { title: string; items: Feature[] }) {
  return (
    <React.Fragment>
      <div className="section-title">{title}</div>
      <div className="grid-2">
        {items.map((f) => (
          <Link to={f.to} key={f.title} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
            <span className={`tag tag-${f.tag}`} style={{ marginTop: 8 }}>
              {f.tag === 'premium' ? 'Premium' : f.tag === 'ticket' ? 'Ticket' : f.tag === 'locked' ? 'Locked' : 'Free'}
            </span>
          </Link>
        ))}
      </div>
    </React.Fragment>
  );
}

export default function Features() {
  const { user } = useAuth();
  const isPremium = user?.premiumStatus !== 'free';
  const hasTicket = user?.hasTicket;
  const early = user && (user.hasDemoAccess || user.isDemo);

  const journeyItems: Feature[] = [
    { title: 'Personalized Journey', desc: 'Step-by-step airport guidance built around your flight.', icon: <IconRoute />, to: '/journey', tag: hasTicket || early ? 'free' : 'ticket' },
    { title: 'Flight Status', desc: 'Live flight information and gate updates.', icon: <IconPlane />, to: '/home', tag: 'free' },
    { title: 'Airport Map', desc: 'Explore the terminal and find every service.', icon: <IconMap />, to: '/features/map', tag: 'free' },
    { title: 'Boarding Info', desc: 'Boarding gates, times and status at a glance.', icon: <IconTicket />, to: '/journey', tag: 'free' },
  ];

  const airportItems: Feature[] = [
    { title: 'Airport Map', desc: 'Search gates, bathrooms and landmarks.', icon: <IconMap />, to: '/features/map', tag: 'free' },
    { title: 'Lounges', desc: 'Relax with CYCLONE lounges before your flight.', icon: <IconStar />, to: '/features/services/lounge', tag: isPremium ? 'premium' : 'free' },
    { title: 'Restaurants', desc: 'Find the best places to eat in the terminal.', icon: <IconUtensils />, to: '/features/map', tag: 'free' },
    { title: 'Shops', desc: 'Duty-free and partner stores nearby.', icon: <IconShop />, to: '/features/map', tag: 'free' },
    { title: 'ATMs & Banks', desc: 'Currency and banking services.', icon: <IconWallet />, to: '/features/map', tag: 'free' },
    { title: 'Medical', desc: 'Medical facilities and assistance.', icon: <IconMed />, to: '/features/map', tag: 'free' },
    { title: 'Transportation', desc: 'Ground transport and transfers.', icon: <IconBus />, to: '/features/map', tag: 'free' },
    { title: 'Parking', desc: 'Parking information for your airport.', icon: <IconParking />, to: '/features/map', tag: 'free' },
    { title: 'Accessibility', desc: 'Assistance for passengers with reduced mobility.', icon: <IconAccess />, to: '/features/map', tag: 'free' },
  ];

  const safetyItems: Feature[] = [
    { title: 'Lost & Found', desc: 'Report, recover and identify lost items.', icon: <IconShield />, to: '/features/lost-found', tag: 'free' },
    { title: 'My Items', desc: 'Your registered items with QR identifiers.', icon: <IconBag />, to: '/features/lost-found/my-items', tag: 'free' },
    { title: 'QR Scanner', desc: 'Identify any CYCLONE-tagged item.', icon: <IconScan />, to: '/features/lost-found/scan', tag: 'free' },
    { title: 'Generate QR', desc: 'Protect a belonging with a personal QR.', icon: <IconQr />, to: '/features/lost-found/generate', tag: 'free' },
  ];

  const rewardItems: Feature[] = [
    { title: 'Cyclone Points', desc: 'Your loyalty balance and history.', icon: <IconCoins />, to: '/loyalty', tag: 'free' },
    { title: 'Rewards Shop', desc: 'Spend points on travel perks.', icon: <IconGift />, to: '/features/rewards/shop', tag: 'free' },
    { title: 'Premium', desc: 'Priority assistance and advanced features.', icon: <IconStar />, to: '/features/premium', tag: isPremium ? 'premium' : 'free' },
    { title: 'Airport Services', desc: 'Lounges, assistance and premium services.', icon: <IconHelp />, to: '/features/services', tag: 'free' },
  ];

  const accountItems: Feature[] = [
    { title: 'Tickets', desc: 'Manage your flights and boarding passes.', icon: <IconTicket />, to: '/profile/tickets', tag: 'free' },
    { title: 'Notifications', desc: 'Gate changes, journey alerts and rewards.', icon: <IconBell />, to: '/profile/notifications', tag: 'free' },
    { title: 'Profile', desc: 'Your account, points and premium.', icon: <IconUser />, to: '/profile', tag: 'free' },
    { title: 'Settings', desc: 'Manage your CYCLONE preferences.', icon: <IconSettings />, to: '/profile/settings', tag: 'free' },
  ];

  return (
    <div className="page">
      <h1 style={{ fontSize: 20, fontWeight: 800, paddingTop: 14, marginBottom: 2 }}>Features</h1>
      <p className="muted">Everything CYCLONE does for you.</p>

      <div className="card mt16" style={{ background: isPremium ? 'var(--c-primary-soft)' : undefined, borderColor: isPremium ? '#cfe0fb' : undefined, padding: 14 }}>
        <div className="between">
          <div className="row">
            <span style={{ color: 'var(--c-primary)' }}><IconStar size={20} /></span>
            <div>
              <div className="bold">{isPremium ? 'Premium enabled' : 'Free plan'}</div>
              <div className="small muted">{isPremium ? 'Enjoy priority assistance and advanced navigation.' : 'Unlock premium with points or a service purchase.'}</div>
            </div>
          </div>
          <Link to="/features/premium" className="btn btn-secondary" style={{ width: 'auto', padding: '8px 14px', fontSize: 12.5 }}>View</Link>
        </div>
      </div>

      <Section title="Journey" items={journeyItems} />
      <Section title="Airport" items={airportItems} />
      <Section title="Safety" items={safetyItems} />
      <Section title="Rewards" items={rewardItems} />
      <Section title="Account" items={accountItems} />
    </div>
  );
}