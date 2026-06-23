import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Settings, Boxes, X, LogOut } from 'lucide-react';
import { ADMIN_NAV } from '../constants/adminNav.js';
import { useAdmin } from '../context/AdminContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { logoutUser } from '../../services/authService.js';
import AlertBadge from './AlertBadge.jsx';

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar({ onNavigate, onClose }) {
  const navigate = useNavigate();
  const { counts } = useAdmin();
  const { user } = useAuth();

  async function handleLogout() {
    await logoutUser();
    navigate('/login');
  }

  const [imgError, setImgError] = useState(false);
  const displayName = user?.displayName || 'User';
  const initials = getInitials(displayName);

  useEffect(() => setImgError(false), [user?.photoURL]);

  return (
    <div className="flex h-full flex-col px-3 py-5">
      {onClose && (
        <div className="mb-2 flex items-center justify-between px-1 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10">
              <Boxes size={16} className="text-cyan" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-sm font-bold leading-none text-primary">Device-Nova</p>
              <p className="font-mono text-[0.6rem] leading-none text-muted">Admin Console</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted
                       hover:bg-surface-raised hover:text-primary focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-cyan"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="mb-6 flex items-center gap-2.5 px-3 lg:flex hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10">
          <Boxes size={16} className="text-cyan" aria-hidden="true" />
        </div>
        <div>
          <p className="font-display text-sm font-bold leading-none text-primary">Device-Nova</p>
          <p className="font-mono text-[0.6rem] leading-none text-muted">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto" aria-label="Admin navigation">
        {ADMIN_NAV.map((group) => (
          <div key={group.group} className="mb-5">
            <p className="mb-2 px-3 font-mono text-[0.6rem] uppercase tracking-widest2 text-muted">
              {group.group}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const badgeCount = item.badgeKey ? counts?.[item.badgeKey] : 0;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.exact}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan ${
                           isActive
                             ? 'border-l-2 border-cyan bg-cyan/10 text-cyan'
                             : 'border-l-2 border-transparent text-muted hover:bg-surface-raised hover:text-primary'
                         }`
                      }
                    >
                      <item.icon size={16} aria-hidden="true" className="flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {badgeCount > 0 && <AlertBadge count={badgeCount} />}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <button
          onClick={() => {
            navigate('/admin/profile');
            onNavigate?.();
          }}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all
                     duration-200 hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-cyan"
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-cyan/20 bg-cyan/10">
            {user?.photoURL && !imgError ? (
              <img src={user.photoURL} alt="" referrerPolicy="no-referrer" onError={() => setImgError(true)} className="h-full w-full rounded-full object-cover" />
            ) : (
              <span className="font-mono text-xs font-semibold text-cyan">{initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate font-display text-sm font-semibold text-primary">{displayName}</p>
            <p className="font-mono text-[0.6rem] text-muted">Admin</p>
          </div>
          <Settings
            size={14}
            className="flex-shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </button>
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-all
                     duration-200 hover:bg-surface-raised hover:text-red-400 focus-visible:outline-none
                     focus-visible:ring-2 focus-visible:ring-cyan"
        >
          <LogOut size={16} aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
