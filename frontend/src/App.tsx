import React from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './state/auth';
import AuthScreen from './screens/AuthScreen';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import Journey from './screens/Journey';
import Features from './screens/Features';
import Loyalty from './screens/Loyalty';
import Profile from './screens/Profile';
import LostFound from './screens/sub/LostFound';
import ScanQr from './screens/sub/ScanQr';
import GenerateQr from './screens/sub/GenerateQr';
import MyItems from './screens/sub/MyItems';
import ItemDetail from './screens/sub/ItemDetail';
import RewardsShop from './screens/sub/RewardsShop';
import Services from './screens/sub/Services';
import Premium from './screens/sub/Premium';
import Tickets from './screens/sub/Tickets';
import Notifications from './screens/sub/Notifications';
import Settings from './screens/sub/Settings';
import AirportMap from './screens/sub/AirportMap';
import AirportServices from './screens/sub/AirportServicesCategory';
import Loading from './screens/Loading';

function TabLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const tabs = [
    { to: '/home', label: 'Home', icon: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5M9.5 21v-6h5v6' },
    { to: '/journey', label: 'Journey', icon: 'M6 19h8a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h8' },
    { to: '/features', label: 'Features', icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' },
    { to: '/loyalty', label: 'Loyalty', icon: 'M9 3l2.5 5 5.5.8-4 3.9 1 5.5L9 15.8 3.5 18.2l1-5.5L.5 8.8 6 8 9 3Z' },
    { to: '/profile', label: 'Profile', icon: 'M12 4.5a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2ZM4.5 20c1-4 4-5.5 7.5-5.5S18.5 16 19.5 20' },
  ];
  return (
    <div className="app-shell">
      <main className="app-main">{children}</main>
      <nav className="bottom-nav">
        {tabs.map((t) => {
          const active = location.pathname.startsWith(t.to);
          return (
            <Link key={t.to} to={t.to} className={`nav-item ${active ? 'active' : ''}`}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={t.icon} />
              </svg>
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

// Intercept anchor navigations to use router push (hash-free)
function NavLinkCatcher({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function App() {
  return (
    <NavLinkCatcher>
      <Routes>
        <Route path="/login" element={<AuthScreen mode="login" />} />
        <Route path="/register" element={<AuthScreen mode="register" />} />
        <Route path="/onboarding" element={<Onboarding />} />

        <Route
          path="/home"
          element={
            <Protected>
              <TabLayout><Home /></TabLayout>
            </Protected>
          }
        />
        <Route
          path="/journey"
          element={
            <Protected>
              <TabLayout><Journey /></TabLayout>
            </Protected>
          }
        />
        <Route
          path="/features"
          element={
            <Protected>
              <TabLayout><Features /></TabLayout>
            </Protected>
          }
        />
        <Route
          path="/loyalty"
          element={
            <Protected>
              <TabLayout><Loyalty /></TabLayout>
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected>
              <TabLayout><Profile /></TabLayout>
            </Protected>
          }
        />

        {/* Sub screens (no bottom nav) */}
        <Route path="/features/lost-found" element={<Protected><LostFound /></Protected>} />
        <Route path="/features/lost-found/scan" element={<Protected><ScanQr /></Protected>} />
        <Route path="/features/lost-found/generate" element={<Protected><GenerateQr /></Protected>} />
        <Route path="/features/lost-found/my-items" element={<Protected><MyItems /></Protected>} />
        <Route path="/items/:id" element={<Protected><ItemDetail /></Protected>} />
        <Route path="/features/rewards/shop" element={<Protected><RewardsShop /></Protected>} />
        <Route path="/features/services" element={<Protected><Services /></Protected>} />
        <Route path="/features/premium" element={<Protected><Premium /></Protected>} />
        <Route path="/profile/tickets" element={<Protected><Tickets /></Protected>} />
        <Route path="/profile/notifications" element={<Protected><Notifications /></Protected>} />
        <Route path="/profile/settings" element={<Protected><Settings /></Protected>} />
        <Route path="/features/map" element={<Protected><AirportMap /></Protected>} />
        <Route path="/features/services/:category" element={<Protected><AirportServices /></Protected>} />

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </NavLinkCatcher>
  );
}