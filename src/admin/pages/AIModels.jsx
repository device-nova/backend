// src/admin/pages/AIModels.jsx
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, UploadCloud, RotateCcw } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import StatCard from '../components/StatCard.jsx';
import { SkeletonCard } from '../components/SkeletonCard.jsx';
import { BrainCircuit, CheckCircle2, Hourglass, TrendingUp } from 'lucide-react';

function Bar({ value, max = 100, color = 'var(--accent-cyan)' }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min((value / max) * 100, 100)}%`, background: color }}
      />
    </div>
  );
}

export default function AIModels() {
  const { models, modelsLoading, addToast } = useAdmin();
  const [sortKey, setSortKey] = useState('accuracy');
  const [sortDir, setSortDir] = useState('desc');
  const [expanded, setExpanded] = useState(null);

  const active = models.filter((m) => m.status === 'active').length;
  const pending = models.filter((m) => m.status === 'pending').length;
  const avgAccuracy = models.length
    ? (models.reduce((s, m) => s + m.accuracy, 0) / models.length).toFixed(1)
    : '0.0';

  const sorted = useMemo(() => {
    const copy = [...models];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string') return av.localeCompare(bv);
      return av - bv;
    });
    if (sortDir === 'desc') copy.reverse();
    return copy;
  }, [models, sortKey, sortDir]);

  function handleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const columns = [
    { key: 'name', label: 'Model' },
    { key: 'accuracy', label: 'Accuracy' },
    { key: 'f1', label: 'F1' },
    { key: 'latency', label: 'Latency' },
    { key: 'devices', label: 'Devices' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {modelsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={1} />)
        ) : (
          <>
            <StatCard icon={BrainCircuit} value={models.length} label="Total Models" tone="cyan" />
            <StatCard icon={CheckCircle2} value={active} label="Deployed" tone="success" />
            <StatCard icon={Hourglass} value={pending} label="Pending Deployment" tone="amber" />
            <StatCard icon={TrendingUp} value={parseFloat(avgAccuracy)} suffix="%" label="Avg Accuracy" tone="cyan" />
          </>
        )}
      </div>

      {/* Model cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {modelsLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={4} />)
          : models.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-surface p-5"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-base font-semibold text-primary">{m.name}</h3>
                    <p className="font-mono text-xs text-muted">
                      {m.category} · {m.devices.toLocaleString()} devices
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-widest2 ${
                      m.status === 'active'
                        ? 'border-success/20 bg-success/10 text-success'
                        : 'border-amber/20 bg-amber/10 text-amber'
                    }`}
                  >
                    {m.status === 'active' ? 'Active' : 'Pending'} {m.version}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="font-mono text-lg font-bold tabular-nums text-primary">{m.accuracy}%</p>
                    <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-widest2 text-muted">Accuracy</p>
                    <Bar value={m.accuracy} />
                  </div>
                  <div>
                    <p className="font-mono text-lg font-bold tabular-nums text-primary">{m.f1}</p>
                    <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-widest2 text-muted">F1 Score</p>
                    <Bar value={m.f1 * 100} />
                  </div>
                  <div>
                    <p className="font-mono text-lg font-bold tabular-nums text-primary">{m.latency}ms</p>
                    <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-widest2 text-muted">Avg Latency</p>
                    <Bar value={(3 - m.latency) * 33} color="var(--accent-amber)" />
                  </div>
                  <div>
                    <p className="font-mono text-lg font-bold tabular-nums text-primary">{m.sizeMB}MB</p>
                    <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-widest2 text-muted">Model Size</p>
                    <Bar value={100 - m.sizeMB} />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <p className="font-mono text-[0.65rem] text-muted">
                    {m.lastDeployed ? `Deployed ${m.lastDeployed} by ${m.deployedBy}` : 'Not yet deployed'}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addToast(`Update queued for ${m.name}`)}
                      className="flex items-center gap-1 rounded-lg border border-cyan/30 bg-cyan/10 px-2.5 py-1.5
                                 font-mono text-[0.65rem] text-cyan hover:bg-cyan/20"
                    >
                      <UploadCloud size={11} /> Update
                    </button>
                    {m.status === 'active' && (
                      <button
                        onClick={() => addToast(`Rolled back ${m.name} to previous version`, 'warning')}
                        className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 font-mono
                                   text-[0.65rem] text-primary hover:border-hover"
                      >
                        <RotateCcw size={11} /> Rollback
                      </button>
                    )}
                    <button
                      onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                      aria-label="More details"
                      aria-expanded={expanded === m.id}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-raised"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
                    >
                      {expanded === m.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {expanded === m.id && (
                  <div className="mt-3 rounded-xl bg-surface-raised p-3 font-mono text-[0.65rem] text-muted">
                    Model ID: {m.id} · Trained for industrial edge inference on Jetson-class hardware.
                    Quantized for {m.sizeMB}MB footprint at {m.latency}ms p50 latency.
                  </div>
                )}
              </motion.div>
            ))}
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full">
          <thead className="bg-surface-raised">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="cursor-pointer select-none px-4 py-3 text-left font-mono text-xs uppercase
                             tracking-widest2 text-muted hover:text-primary"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((m) => (
              <tr key={m.id} className="hover:bg-surface-raised">
                <td className="px-4 py-3 font-mono text-sm font-semibold text-primary">{m.name}</td>
                <td className="px-4 py-3 font-mono text-sm tabular-nums text-primary">{m.accuracy}%</td>
                <td className="px-4 py-3 font-mono text-sm tabular-nums text-primary">{m.f1}</td>
                <td className="px-4 py-3 font-mono text-sm tabular-nums text-primary">{m.latency}ms</td>
                <td className="px-4 py-3 font-mono text-sm tabular-nums text-primary">{m.devices.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
