// src/admin/pages/Alerts.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ExternalLink, BellOff } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import { SkeletonRow } from '../components/SkeletonCard.jsx';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'CRITICAL', label: 'Critical' },
  { key: 'WARNING', label: 'Warning' },
  { key: 'INFO', label: 'Info' },
  { key: 'resolved', label: 'Resolved' },
];

export default function Alerts() {
  const navigate = useNavigate();
  const { alerts, loading, acknowledge, resolve } = useAdmin();
  const [tab, setTab] = useState('all');

  const tabCounts = useMemo(
    () => ({
      all: alerts.length,
      CRITICAL: alerts.filter((a) => a.severity === 'CRITICAL' && !a.resolved).length,
      WARNING: alerts.filter((a) => a.severity === 'WARNING' && !a.resolved).length,
      INFO: alerts.filter((a) => a.severity === 'INFO' && !a.resolved).length,
      resolved: alerts.filter((a) => a.resolved).length,
    }),
    [alerts]
  );

  const filtered = useMemo(() => {
    if (tab === 'all') return alerts;
    if (tab === 'resolved') return alerts.filter((a) => a.resolved);
    return alerts.filter((a) => a.severity === tab && !a.resolved);
  }, [alerts, tab]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter alerts">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-4 py-2 font-mono text-xs transition-colors focus-visible:outline-none
                        focus-visible:ring-2 focus-visible:ring-cyan ${
                          tab === t.key
                            ? 'border-cyan/40 bg-cyan/10 text-cyan'
                            : 'border-border text-muted hover:text-primary'
                        }`}
          >
            {t.label} ({tabCounts[t.key] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-surface">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface py-16 text-center">
          <BellOff size={22} className="text-muted" aria-hidden="true" />
          <p className="text-sm text-muted">Nothing here. You're all caught up.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2" aria-live="polite">
          <AnimatePresence>
            {filtered.map((alert) => (
              <motion.li
                key={alert.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
                className={`rounded-2xl border-l-4 bg-surface p-4 ${
                  alert.severity === 'CRITICAL'
                    ? 'border-l-amber border-y border-r border-border'
                    : alert.severity === 'WARNING'
                    ? 'border-l-amber/60 border-y border-r border-border'
                    : 'border-l-cyan/50 border-y border-r border-border'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        alert.severity === 'CRITICAL' ? 'bg-amber animate-pulse' : alert.severity === 'WARNING' ? 'bg-amber' : 'bg-cyan'
                      }`}
                      aria-hidden="true"
                    />
                    <p className="font-mono text-xs uppercase tracking-widest2 text-primary">
                      {alert.resolved ? 'RESOLVED' : alert.severity} <span className="text-muted">· {alert.deviceId}</span>
                    </p>
                  </div>
                  <span className="font-mono text-[0.65rem] text-muted">{alert.timestamp}</span>
                </div>
                <p className="mt-2 text-sm text-primary">{alert.message}</p>
                {!alert.resolved && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => acknowledge(alert.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-mono
                                 text-xs text-primary transition-colors hover:border-hover focus-visible:outline-none
                                 focus-visible:ring-2 focus-visible:ring-cyan"
                    >
                      <Check size={12} /> Acknowledge
                    </button>
                    <button
                      onClick={() => navigate(`/admin/devices/${alert.deviceId}`)}
                      className="flex items-center gap-1.5 rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-1.5
                                 font-mono text-xs text-cyan transition-colors hover:bg-cyan/20 focus-visible:outline-none
                                 focus-visible:ring-2 focus-visible:ring-cyan"
                    >
                      <ExternalLink size={12} /> View Device
                    </button>
                  </div>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
