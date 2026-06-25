// src/admin/pages/DeviceDetail.jsx
import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  RotateCw,
  Pencil,
  MoreVertical,
  Check,
  Power,
  PowerOff,
  Trash2,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import LineChart from '../components/LineChart.jsx';
import { generateTimeSeriesData } from '../hooks/useAdminData.js';

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 9973;
  return h || 1;
}

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { devices, devicesLoading, alerts, acknowledge, restartDeviceAI, updateDevice, setDeviceStatus, addToast } =
    useAdmin();

  const device = devices.find((d) => d.id === id);

  const [editing, setEditing] = useState(false);
  const [editLocation, setEditLocation] = useState('');
  const [editModel, setEditModel] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const seriesData = useMemo(
    () => (device ? generateTimeSeriesData(24, 800, 130, 1, hashSeed(device.id)) : []),
    [device]
  );
  const anomalies = useMemo(
    () => seriesData.filter((d) => d.isAnomaly).map((d) => ({ index: d.index })),
    [seriesData]
  );

  const deviceAlerts = useMemo(
    () => alerts.filter((a) => a.deviceId === id).slice(0, 10),
    [alerts, id]
  );

  if (devicesLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-6 w-40 skeleton rounded-lg" />
        <div className="h-24 w-full skeleton rounded-2xl" />
        <div className="h-64 w-full skeleton rounded-2xl" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-muted">Device "{id}" wasn't found in the fleet.</p>
        <Link to="/admin/devices" className="font-mono text-xs text-cyan hover:underline">
          ← Back to Devices
        </Link>
      </div>
    );
  }

  function startEdit() {
    setEditLocation(device.location);
    setEditModel(device.model || '');
    setEditing(true);
  }

  function saveEdit() {
    updateDevice(device.id, { location: editLocation, model: editModel || null });
    addToast('Device details updated');
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => navigate('/admin/devices')}
        className="flex items-center gap-1.5 self-start font-mono text-xs text-muted transition-colors
                   hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan rounded"
      >
        <ArrowLeft size={16} /> Back to Devices
      </button>

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <h1 className="font-display text-xl font-bold text-primary">{device.id}</h1>
            <StatusBadge status={device.status} />
          </div>
          {editing ? (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                aria-label="Edit location"
                className="rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-sm text-primary
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              />
              <input
                value={editModel}
                onChange={(e) => setEditModel(e.target.value)}
                placeholder="No model assigned"
                aria-label="Edit active model"
                className="rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-sm text-primary
                           placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              />
              <button
                onClick={saveEdit}
                className="rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-1.5 font-mono text-xs text-cyan hover:bg-cyan/20"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="font-mono text-xs text-muted hover:text-primary"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="font-mono text-xs text-muted">
              {device.location} · {device.site} · {device.status === 'online' ? `Online since ${device.onlineSince}` : 'Currently unreachable'}
            </p>
          )}
        </div>

        <div className="relative flex flex-shrink-0 items-center gap-2">
          <button
            onClick={() => restartDeviceAI(device.id)}
            className="flex items-center gap-1.5 rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2 font-mono
                       text-xs text-cyan transition-colors hover:bg-cyan/20 focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-cyan"
          >
            <RotateCw size={16} /> Restart AI
          </button>
          <button
            onClick={startEdit}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 font-mono text-xs
                       text-primary transition-colors hover:border-hover focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-cyan"
          >
            <Pencil size={16} /> Edit
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted
                       transition-colors hover:border-hover hover:text-primary focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-cyan"
          >
            <MoreVertical size={16} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-xl border border-border
                           bg-surface-raised shadow-lg"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
              >
                <button
                  onClick={() => {
                    if (device.status === 'offline') {
                      setDeviceStatus(device.id, 'online');
                      addToast(`${device.id} brought online`);
                    } else {
                      setDeviceStatus(device.id, 'offline');
                      addToast(`${device.id} taken offline`, 'warning');
                    }
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-primary hover:bg-surface"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
                >
                  {device.status === 'offline' ? <Power size={16} className="text-muted" /> : <PowerOff size={16} className="text-muted" />}
                  {device.status === 'offline' ? 'Bring Online' : 'Take Offline'}
                </button>
                <div className="border-t border-border" />
                {confirmRemove ? (
                  <div className="px-3 py-2.5">
                    <p className="mb-2 text-xs text-amber">Remove this device permanently?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          addToast(`${device.id} removed`, 'warning');
                          setMenuOpen(false);
                          setConfirmRemove(false);
                          navigate('/admin/devices');
                        }}
                        className="rounded-lg bg-amber/20 px-2.5 py-1 text-xs text-amber"
                      >
                        Yes, remove
                      </button>
                      <button
                        onClick={() => setConfirmRemove(false)}
                        className="rounded-lg px-2.5 py-1 text-xs text-muted hover:text-primary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmRemove(true)}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-amber hover:bg-surface"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
                  >
                    <Trash2 size={16} /> Remove Device
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['AI Load', device.model ? `${device.aiLoad}%` : '—'],
          ['Latency', device.latency],
          ['Model Ver', device.modelVersion],
          ['Uptime', device.uptime],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-border bg-surface p-4">
            <p className="font-mono text-2xl font-bold tabular-nums text-primary">{value}</p>
            <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-widest2 text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Inference history + metadata */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="mb-4 font-display text-sm font-semibold text-primary">Inference History — Last 24h</h3>
          <LineChart data={seriesData} anomalies={anomalies} unit="/s" label={`${device.id} inference rate`} />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="mb-4 font-display text-sm font-semibold text-primary">Device Metadata</h3>
          <dl className="flex flex-col gap-3">
            {[
              ['IP Address', device.ip],
              ['Hardware', device.hardware],
              ['OS', device.os],
              ['Firmware', device.firmware],
              ['Location', device.location],
              ['Site', device.site],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-border pb-2 last:border-b-0">
                <dt className="font-mono text-[0.65rem] uppercase tracking-widest2 text-muted">{k}</dt>
                <dd className="font-mono text-xs text-primary">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Recent alerts */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="mb-3 font-display text-sm font-semibold text-primary">Recent Alerts — {device.id}</h3>
        {deviceAlerts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No alerts logged for this device.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {deviceAlerts.map((alert) => (
              <li key={alert.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p
                    className={`font-mono text-xs uppercase tracking-widest2 ${
                      alert.severity === 'CRITICAL' ? 'text-amber' : 'text-cyan'
                    }`}
                  >
                    {alert.severity} · {alert.timestamp}
                  </p>
                  <p className="truncate text-sm text-primary">{alert.message}</p>
                </div>
                {!alert.resolved && (
                  <button
                    onClick={() => acknowledge(alert.id)}
                    className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5
                               font-mono text-[0.65rem] text-primary hover:border-hover focus-visible:outline-none
                               focus-visible:ring-2 focus-visible:ring-cyan"
                  >
                    <Check size={16} /> Resolve
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
