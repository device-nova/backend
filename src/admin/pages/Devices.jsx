// src/admin/pages/Devices.jsx
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Plus, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import DeviceTable from '../components/DeviceTable.jsx';
import { SkeletonRow } from '../components/SkeletonCard.jsx';

const STATUS_OPTIONS = ['All', 'online', 'warning', 'offline'];

export default function Devices() {
  const { devices, devicesLoading, addToast } = useAdmin();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [location, setLocation] = useState('All');
  const [model, setModel] = useState('All');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ id: '', location: '', model: '' });
  const [errors, setErrors] = useState({});

  const locations = useMemo(() => ['All', ...new Set(devices.map((d) => d.location))], [devices]);
  const modelOptions = useMemo(
    () => ['All', ...new Set(devices.map((d) => d.model).filter(Boolean))],
    [devices]
  );

  const filtered = useMemo(() => {
    return devices.filter((d) => {
      if (search && !d.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (status !== 'All' && d.status !== status) return false;
      if (location !== 'All' && d.location !== location) return false;
      if (model !== 'All' && d.model !== model) return false;
      return true;
    });
  }, [devices, search, status, location, model]);

  function handleAddDevice(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!form.id.trim()) nextErrors.id = 'Device ID is required.';
    if (!form.location.trim()) nextErrors.location = 'Location is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    addToast(`${form.id} added to fleet`);
    setForm({ id: '', location: '', model: '' });
    setAddOpen(false);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Controls bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search devices..."
            aria-label="Search devices by ID"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-primary
                       placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
          <FilterSelect label="Location" value={location} onChange={setLocation} options={locations} />
          <FilterSelect label="Model" value={model} onChange={setModel} options={modelOptions} />
          <button
            onClick={() => addToast(`Exported ${filtered.length} devices to CSV`)}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2.5 font-mono text-xs
                       text-primary transition-colors hover:border-hover focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-cyan"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2.5
                       font-mono text-xs text-cyan transition-colors hover:bg-cyan/20 focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-cyan"
          >
            <Plus size={16} /> Add Device
          </button>
        </div>
      </div>

      {/* Table or skeleton */}
      {devicesLoading ? (
        <div className="rounded-2xl border border-border bg-surface">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-16 text-center">
          <p className="text-sm text-muted">No devices match these filters.</p>
        </div>
      ) : (
        <DeviceTable devices={filtered} />
      )}

      {/* Add device slide-in panel */}
      <AnimatePresence>
        {addOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-void/70 backdrop-blur-sm"
              onClick={() => setAddOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label="Add device"
              className="fixed right-0 top-0 z-50 h-full w-full max-w-[480px] overflow-y-auto border-l
                         border-border bg-surface p-6"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-primary">Add Device</h2>
                <button
                  onClick={() => setAddOpen(false)}
                  aria-label="Close panel"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-raised
                             hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddDevice} className="flex flex-col gap-4">
                <Field
                  id="device-id"
                  label="Device ID"
                  value={form.id}
                  onChange={(v) => setForm((f) => ({ ...f, id: v }))}
                  error={errors.id}
                  placeholder="DEV-121"
                />
                <Field
                  id="device-location"
                  label="Location"
                  value={form.location}
                  onChange={(v) => setForm((f) => ({ ...f, location: v }))}
                  error={errors.location}
                  placeholder="Factory A"
                />
                <Field
                  id="device-model"
                  label="Initial Model (optional)"
                  value={form.model}
                  onChange={(v) => setForm((f) => ({ ...f, model: v }))}
                  placeholder="YOLOv8-edge"
                />

                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAddOpen(false)}
                    className="rounded-xl border border-border px-4 py-2 font-mono text-xs text-primary
                               hover:border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2 font-mono text-xs text-cyan
                               hover:bg-cyan/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                  >
                    Add Device
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="rounded-xl border border-border bg-surface px-3 py-2.5 font-mono text-xs text-primary
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {label}: {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Field({ id, label, value, onChange, error, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-primary
                   placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
