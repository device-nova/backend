import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
const CONFIG = {
  online: { label: 'Online', icon: Wifi, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  offline: { label: 'Offline', icon: WifiOff, color: 'text-muted', bg: 'bg-surface-raised', border: 'border-border' },
  warning: { label: 'Warning', icon: AlertTriangle, color: 'text-amber', bg: 'bg-amber/10', border: 'border-amber/20' },
};
export default function StatusBadge({ status, compact = false }) {
  const cfg = CONFIG[status] || CONFIG.offline;
  const Icon = cfg.icon;
  if (compact) {
    return (
      <span
        className={`inline-flex h-2 w-2 rounded-full ${
          status === 'online' ? 'bg-success' : status === 'warning' ? 'bg-amber animate-pulse' : 'bg-muted'
        }`}
        aria-hidden="true"
      />
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${cfg.border} ${cfg.bg} ${cfg.color}
                  px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-widest2`}
    >
      <Icon size={11} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}
