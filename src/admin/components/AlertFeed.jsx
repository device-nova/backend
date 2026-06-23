// src/admin/components/AlertFeed.jsx
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AlertFeed({ alerts = [], loading = false, limit = 5 }) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const items = alerts.slice(0, limit);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-primary">Live Alert Feed</h3>
        <button
          onClick={() => navigate('/admin/alerts')}
          className="font-mono text-[0.65rem] uppercase tracking-widest2 text-cyan hover:underline
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan rounded"
        >
          View all
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" role="status" aria-live="polite">
        {loading ? (
          <div className="flex flex-col gap-3 py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 w-full rounded-lg skeleton" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-8 text-center">
            <Bell size={22} className="text-muted" aria-hidden="true" />
            <p className="text-sm text-muted">All clear. No active alerts.</p>
          </div>
        ) : (
          items.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : i * 0.05 }}
              className="group flex items-start gap-3 rounded-lg border-b border-border px-3 py-3
                         transition-all duration-200 last:border-b-0 hover:bg-surface-raised cursor-pointer"
              onClick={() => navigate('/admin/alerts')}
            >
              <div
                className={`mt-2 h-2 w-2 flex-shrink-0 rounded-full ${
                  alert.severity === 'CRITICAL' ? 'bg-amber animate-pulse' : 'bg-cyan'
                }`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`font-mono text-xs uppercase tracking-widest2 ${
                    alert.severity === 'CRITICAL' ? 'text-amber' : 'text-cyan'
                  }`}
                >
                  {alert.severity} · {alert.deviceId}
                </p>
                <p className="mt-0.5 truncate text-sm text-primary">{alert.message}</p>
                <p className="mt-1 font-mono text-[0.6rem] text-muted">{alert.timestamp}</p>
              </div>
              <ChevronRight
                size={14}
                className="mt-1 flex-shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
