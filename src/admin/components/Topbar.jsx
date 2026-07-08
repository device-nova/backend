import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAdmin } from '../context/AdminContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import AlertBadge from './AlertBadge.jsx';

const TITLES = {
  '/': 'Fleet Overview',
  '/devices': 'Device Fleet',
  '/aimodels': 'AI Models',
  '/alerts': 'Alert Center',
  '/analytics': 'Analytics',
  '/users': 'User Management',
  '/settings': 'Settings',
  '/profile': 'My Profile',
};

function getTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith('/devices/')) return 'Device Detail';
  return 'Admin';
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { counts, devices } = useAdmin();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [lastSynced, setLastSynced] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setLastSynced(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const matches = search.trim()
    ? devices.filter((d) => d.id.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : [];

  const initials = getInitials(user?.displayName);

  return (
    <header className="flex h-16 flex-shrink-0 items-center gap-3 border-b border-border bg-surface px-4 md:px-6">
      <button onClick={onMenuClick} aria-label="Open navigation menu"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-raised hover:text-primary lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
      >
        <Menu size={18} />
      </button>

      <div className="hidden flex-col md:flex">
        <h1 className="font-display text-base font-semibold text-primary">{getTitle(location.pathname)}</h1>
        <p className="font-mono text-[0.6rem] text-muted">
          Last synced {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <div className="relative flex w-full max-w-[160px] items-center sm:max-w-xs md:max-w-sm">
        <Search size={16} className="absolute left-3 text-muted" aria-hidden="true" />
        <input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setShowSearchResults(true); }}
          onFocus={() => setShowSearchResults(true)} onBlur={() => setTimeout(() => setShowSearchResults(false), 120)}
          placeholder="Search devices..." aria-label="Search devices"
          className="w-full rounded-xl border border-border bg-surface-raised py-2 pl-9 pr-3 text-sm text-primary placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        />
        {showSearchResults && matches.length > 0 && (
          <div className="absolute top-full left-0 z-30 mt-1 w-full overflow-hidden rounded-xl border border-border bg-surface-raised shadow-lg">
            {matches.map((d) => (
              <button key={d.id} onClick={() => { navigate(`/devices/${d.id}`); setSearch(''); }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-primary hover:bg-surface"
              >
                <span className="font-mono">{d.id}</span>
                <span className="font-mono text-xs text-muted">{d.location}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifications((v) => !v)} aria-label={`Alerts, ${counts?.critical || 0} critical`}
            className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-raised hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            <Bell size={18} />
            {counts?.critical > 0 && (
              <span className="absolute -right-0.5 -top-0.5"><AlertBadge count={counts.critical} /></span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0d1527] border border-slate-800 rounded-lg shadow-xl p-2 z-50">
              <button onClick={() => { navigate('/alerts'); setShowNotifications(false); }}
                className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-primary hover:bg-white/5 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-xs text-primary">Anomalous vibration detected on Robotic Assembly Arm #4. Latency stable at 1.8ms.</p>
                </div>
              </button>
              <div className="mx-2 my-1 border-t border-slate-800" />
              <button onClick={() => { navigate('/alerts'); setShowNotifications(false); }}
                className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-primary hover:bg-white/5 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-xs text-primary">Edge deployment node sync successfully configured for 548 Market St facility.</p>
                </div>
              </button>
            </div>
          )}
        </div>

        <button onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-raised hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button onClick={() => navigate('/profile')} aria-label="Open my profile"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-cyan/20 bg-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-full w-full rounded-full object-cover" />
          ) : (
            <span className="font-mono text-xs font-semibold text-cyan">{initials}</span>
          )}
        </button>
      </div>
    </header>
  );
}
