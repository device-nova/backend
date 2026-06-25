import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plug,
  Bell,
  Shield,
  Key,
  AlertTriangle,
  Check,
  X,
  ChevronRight,
  Copy,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';

const TABS = [
  { key: 'general', label: 'General', icon: RefreshCw },
  { key: 'integrations', label: 'Integrations', icon: Plug },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'apikeys', label: 'API Keys', icon: Key },
  { key: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

const INTEGRATIONS = [
  { id: 'nvidia', name: 'NVIDIA SDK', description: 'Edge AI model optimization layer', connected: true, version: 'v2.1' },
  { id: 'aws', name: 'AWS IoT Core', description: 'Cloud sync endpoint', connected: false, version: null },
  { id: 'azure', name: 'Azure IoT Hub', description: 'Secondary cloud sync', connected: true, version: 'v1.4' },
  { id: 'slack', name: 'Slack Webhooks', description: 'Alert notifications', connected: false, version: null },
];

const MOCK_KEYS = [
  { id: 'key-1', name: 'Production API', created: '2024-01-15', lastUsed: '2 min ago', permissions: 'Read/Write' },
  { id: 'key-2', name: 'Monitoring Only', created: '2024-02-20', lastUsed: '1 hour ago', permissions: 'Read' },
  { id: 'key-3', name: 'CI/CD Pipeline', created: '2024-03-10', lastUsed: '5 min ago', permissions: 'Write' },
];

export default function Settings() {
  const [tab, setTab] = useState('general');
  const [platformName, setPlatformName] = useState('Device-Nova');
  const [timezone, setTimezone] = useState('UTC');
  const [syncInterval, setSyncInterval] = useState(30);
  const [autoResolve, setAutoResolve] = useState(false);
  const [autoResolveHours, setAutoResolveHours] = useState(24);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [keys, setKeys] = useState(MOCK_KEYS);
  const [newKeyForm, setNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [confirmReset, setConfirmReset] = useState(null);
  const { addToast } = useAdmin();

  function toggleIntegration(id) {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i))
    );
    const item = integrations.find((i) => i.id === id);
    addToast(`${item.name} ${item.connected ? 'disconnected' : 'connected'}`, item.connected ? 'warning' : 'success');
  }

  function createKey(e) {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const newKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Just now',
      permissions: 'Read/Write',
    };
    setKeys((prev) => [newKey, ...prev]);
    setNewKeyName('');
    setNewKeyForm(false);
    addToast(`API key "${newKeyName}" created`);
  }

  function revokeKey(id) {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    addToast('API key revoked', 'warning');
    setConfirmReset(null);
  }

  function handleDangerAction(action) {
    if (action === 'reset') addToast('Alert thresholds reset to defaults', 'warning');
    if (action === 'cache') addToast('Device cache wiped', 'warning');
    if (action === 'factory') addToast('Platform settings reset', 'warning');
    setConfirmReset(null);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left nav tabs */}
      <nav className="flex flex-shrink-0 flex-col gap-1 lg:w-56" aria-label="Settings sections">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-all
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan
                          ${
                            tab === t.key
                              ? 'border-l-2 border-cyan bg-cyan/10 text-cyan'
                              : 'border-l-2 border-transparent text-muted hover:bg-surface-raised hover:text-primary'
                          }`}
            >
              <Icon size={16} aria-hidden="true" />
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Right panel */}
      <div className="min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            {tab === 'general' && (
              <div className="flex flex-col gap-5">
                <h2 className="font-display text-lg font-semibold text-primary">General Settings</h2>
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex flex-col gap-4">
                    <Field label="Platform Name" value={platformName} onChange={setPlatformName} />
                    <div>
                      <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">Timezone</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full max-w-xs rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-primary
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
                      >
                        {['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'].map((tz) => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">
                        Edge Sync Interval: {syncInterval}s
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={60}
                        value={syncInterval}
                        onChange={(e) => setSyncInterval(parseInt(e.target.value))}
                        className="w-full max-w-xs accent-cyan"
                        aria-label="Edge sync interval"
                      />
                      <div className="mt-1 flex max-w-xs justify-between font-mono text-[0.6rem] text-muted">
                        <span>1s</span>
                        <span>60s</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAutoResolve((v) => !v)}
                        aria-pressed={autoResolve}
                        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                          autoResolve ? 'bg-cyan' : 'bg-border'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                            autoResolve ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="text-sm text-primary">Auto-resolve alerts after {autoResolveHours}h</span>
                      {autoResolve && (
                        <input
                          type="number"
                          min={1}
                          max={168}
                          value={autoResolveHours}
                          onChange={(e) => setAutoResolveHours(parseInt(e.target.value) || 24)}
                          className="w-16 rounded-lg border border-border bg-surface-raised px-2 py-1 text-sm text-primary
                                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'integrations' && (
              <div className="flex flex-col gap-5">
                <h2 className="font-display text-lg font-semibold text-primary">Integrations</h2>
                <div className="flex flex-col gap-3">
                  {integrations.map((int) => (
                    <div key={int.id} className="rounded-2xl border border-border bg-surface p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-sm font-semibold text-primary">{int.name}</h3>
                            <span
                              className={`rounded-full border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest2 ${
                                int.connected
                                  ? 'border-success/20 bg-success/10 text-success'
                                  : 'border-border bg-surface-raised text-muted'
                              }`}
                            >
                              {int.connected ? 'Connected' : 'Disconnected'}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted">{int.description}</p>
                          {int.version && <p className="mt-1 font-mono text-[0.65rem] text-muted">Version {int.version}</p>}
                        </div>
                        <button
                          onClick={() => toggleIntegration(int.id)}
                          className={`rounded-xl border px-3 py-2 font-mono text-xs transition-colors focus-visible:outline-none
                                      focus-visible:ring-2 focus-visible:ring-cyan ${
                                        int.connected
                                          ? 'border-border text-primary hover:border-hover'
                                          : 'border-cyan/30 bg-cyan/10 text-cyan hover:bg-cyan/20'
                                      }`}
                        >
                          {int.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'notifications' && (
              <div className="flex flex-col gap-5">
                <h2 className="font-display text-lg font-semibold text-primary">Notifications</h2>
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex flex-col gap-4">
                    {[
                      { label: 'Critical alerts', desc: 'Immediate push + email', defaultOn: true },
                      { label: 'Warning alerts', desc: 'In-app + digest email', defaultOn: true },
                      { label: 'Info alerts', desc: 'In-app only', defaultOn: false },
                      { label: 'Model deployment', desc: 'When a model is deployed or rolled back', defaultOn: true },
                      { label: 'Device status changes', desc: 'When devices go offline or come online', defaultOn: true },
                      { label: 'Weekly digest', desc: 'Fleet health summary every Monday', defaultOn: false },
                    ].map((n) => (
                      <ToggleRow key={n.label} label={n.label} desc={n.desc} defaultOn={n.defaultOn} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'security' && (
              <div className="flex flex-col gap-5">
                <h2 className="font-display text-lg font-semibold text-primary">Security</h2>
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex flex-col gap-4">
                    <ToggleRow label="Require 2FA for all admins" desc="Enforce TOTP for Admin and Super Admin roles" defaultOn={true} />
                    <ToggleRow label="Session timeout" desc="Auto-logout after 30 minutes of inactivity" defaultOn={true} />
                    <ToggleRow label="IP allowlist" desc="Restrict admin access to configured IP ranges" defaultOn={false} />
                    <ToggleRow label="Audit log retention" desc="Keep audit logs for 90 days" defaultOn={true} />
                  </div>
                </div>
              </div>
            )}

            {tab === 'apikeys' && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-primary">API Keys</h2>
                  <button
                    onClick={() => setNewKeyForm((v) => !v)}
                    className="flex items-center gap-1.5 rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2 font-mono text-xs
                               text-cyan transition-colors hover:bg-cyan/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                  >
                    <Key size={16} /> Create Key
                  </button>
                </div>

                <AnimatePresence>
                  {newKeyForm && (
                    <motion.form
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      onSubmit={createKey}
                      className="overflow-hidden rounded-2xl border border-border bg-surface p-5"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
                    >
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">Key Name</label>
                          <input
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="e.g. Production API"
                            className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-primary
                                       placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                          />
                        </div>
                        <button
                          type="submit"
                          className="rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2.5 font-mono text-xs text-cyan
                                     hover:bg-cyan/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                        >
                          Create
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewKeyForm(false)}
                          className="rounded-xl border border-border px-4 py-2.5 font-mono text-xs text-primary
                                     hover:border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="flex flex-col gap-3">
                  {keys.map((k) => (
                    <div key={k.id} className="rounded-2xl border border-border bg-surface p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-sm font-semibold text-primary">{k.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.65rem] text-muted">
                            <span>Created {k.created}</span>
                            <span>Last used {k.lastUsed}</span>
                            <span className="rounded-full border border-cyan/20 bg-cyan/10 px-2 py-0.5 text-cyan">{k.permissions}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <code className="rounded-lg bg-surface-raised px-2 py-1 font-mono text-xs text-primary">
                              DN-****-****-{k.id.slice(-4).toUpperCase()}
                            </code>
                            <button
                              onClick={() => addToast('Key copied to clipboard')}
                              className="text-muted hover:text-primary"
                              aria-label="Copy key"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>
                        {confirmReset === k.id ? (
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="font-mono text-[0.65rem] text-amber">Revoke?</span>
                            <button onClick={() => revokeKey(k.id)} className="font-mono text-[0.65rem] text-amber underline">
                              Yes
                            </button>
                            <button onClick={() => setConfirmReset(null)} className="font-mono text-[0.65rem] text-muted">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmReset(k.id)}
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted
                                       hover:bg-surface-raised hover:text-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                            aria-label={`Revoke ${k.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'danger' && (
              <div className="flex flex-col gap-5">
                <h2 className="font-display text-lg font-semibold text-primary">Danger Zone</h2>
                <div className="rounded-2xl border border-red-900/30 bg-red-950/10 p-6">
                  <div className="flex flex-col gap-4">
                    {[
                      { id: 'reset', label: 'Reset Alert Thresholds', desc: 'Restore all alert thresholds to factory defaults' },
                      { id: 'cache', label: 'Wipe Device Cache', desc: 'Clear all cached device metadata and force full refresh' },
                      { id: 'factory', label: 'Factory Reset Platform', desc: 'Reset all settings to defaults. This cannot be undone.' },
                    ].map((action) => (
                      <div key={action.id} className="flex items-center justify-between gap-3 border-b border-red-900/20 pb-4 last:border-b-0 last:pb-0">
                        <div>
                          <p className="text-sm font-semibold text-primary">{action.label}</p>
                          <p className="text-xs text-muted">{action.desc}</p>
                        </div>
                        {confirmReset === action.id ? (
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="font-mono text-[0.65rem] text-amber">Are you sure?</span>
                            <button onClick={() => handleDangerAction(action.id)} className="font-mono text-[0.65rem] text-amber underline">
                              Yes
                            </button>
                            <button onClick={() => setConfirmReset(null)} className="font-mono text-[0.65rem] text-muted">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmReset(action.id)}
                            className="rounded-xl border border-red-900/30 bg-red-950/20 px-3 py-2 font-mono text-xs
                                       text-red-400 transition-colors hover:bg-red-950/30 focus-visible:outline-none
                                       focus-visible:ring-2 focus-visible:ring-red-500"
                          >
                            {action.label.split(' ')[0]}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-xs rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-primary
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
      />
    </div>
  );
}

function ToggleRow({ label, desc, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm text-primary">{label}</p>
        <p className="text-xs text-muted">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
          on ? 'bg-cyan' : 'bg-border'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            on ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
