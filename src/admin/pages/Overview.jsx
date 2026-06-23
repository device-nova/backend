// src/admin/pages/Overview.jsx
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, BrainCircuit, Bell, Cpu, Clock, ChevronRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import StatCard from '../components/StatCard.jsx';
import TopologyWidget from '../components/TopologyWidget.jsx';
import AlertFeed from '../components/AlertFeed.jsx';
import LineChart from '../components/LineChart.jsx';
import DonutChart from '../components/DonutChart.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { SkeletonCard, SkeletonChart } from '../components/SkeletonCard.jsx';
import { generateTimeSeriesData } from '../hooks/useAdminData.js';

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return w;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export default function Overview() {
  const navigate = useNavigate();
  const { devices, devicesLoading, alerts, loading: alertsLoading, models, restartDeviceAI } = useAdmin();
  const windowWidth = useWindowWidth();
  const chartHeight = windowWidth < 640 ? 160 : 220;

  const stats = useMemo(() => {
    const online = devices.filter((d) => d.status === 'online').length;
    const offline = devices.filter((d) => d.status === 'offline').length;
    const withModel = devices.filter((d) => d.model);
    const avgLoad = withModel.length
      ? Math.round(withModel.reduce((s, d) => s + (d.aiLoad || 0), 0) / withModel.length)
      : 0;
    const latencies = withModel
      .map((d) => parseFloat(d.latency))
      .filter((n) => !Number.isNaN(n));
    const avgLatency = latencies.length
      ? (latencies.reduce((s, n) => s + n, 0) / latencies.length).toFixed(1)
      : '0.0';
    const activeModels = models.filter((m) => m.status === 'active').length;
    return { online, offline, avgLoad, avgLatency, activeModels };
  }, [devices, models]);

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && !a.resolved).length;

  const inferenceData = useMemo(() => generateTimeSeriesData(24, 850, 140, 1.5, 7), []);
  const anomalies = useMemo(
    () => inferenceData.filter((d) => d.isAnomaly).map((d) => ({ index: d.index })),
    [inferenceData]
  );

  const donutSegments = [
    { label: 'Online', value: stats.online, color: 'var(--accent-cyan)' },
    { label: 'Warning', value: devices.filter((d) => d.status === 'warning').length, color: 'var(--accent-amber)' },
    { label: 'Offline', value: stats.offline, color: 'var(--fg-muted)' },
  ];

  const recentDevices = useMemo(
    () => devices.filter((d) => d.status !== 'offline').slice(0, 5),
    [devices]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Stat strip */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
      >
        {devicesLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={1} />)
          : [
              <StatCard key="online" icon={Wifi} value={stats.online} label="Online Devices" tone="success" />,
              <StatCard key="offline" icon={WifiOff} value={stats.offline} label="Offline" tone="amber" />,
              <StatCard key="models" icon={BrainCircuit} value={stats.activeModels} label="AI Models Active" tone="cyan" />,
              <StatCard
                key="alerts"
                icon={Bell}
                value={criticalCount}
                label="Critical Alerts"
                tone="amber"
                pulse={criticalCount > 0}
                onClick={() => navigate('/admin/alerts')}
              />,
              <StatCard key="load" icon={Cpu} value={stats.avgLoad} suffix="%" label="AI Processing Load" tone="cyan" />,
              <StatCard key="latency" icon={Clock} value={stats.avgLatency} suffix="ms" label="Avg Inference Latency" tone="cyan" />,
            ]}
      </motion.div>

      {/* Topology + Alert feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="min-h-[360px]">
          {devicesLoading ? (
            <SkeletonChart height={360} />
          ) : (
            <TopologyWidget devices={devices} onRestart={restartDeviceAI} />
          )}
        </div>
        <div className="min-h-[360px]">
          <AlertFeed alerts={alerts} loading={alertsLoading} />
        </div>
      </div>

      {/* Inference chart + donut */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="mb-4 font-display text-sm font-semibold text-primary">Inference Rate — Last 24h</h3>
          <LineChart data={inferenceData} height={chartHeight} anomalies={anomalies} unit="/s" label="Inference rate" />
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-5">
          <h3 className="mb-4 self-start font-display text-sm font-semibold text-primary">Device Status</h3>
          {devicesLoading ? (
            <SkeletonChart height={200} />
          ) : (
            <DonutChart segments={donutSegments} centerLabel="DEVICES" />
          )}
        </div>
      </div>

      {/* Recent devices */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-primary">Recently Active Devices</h3>
          <button
            onClick={() => navigate('/admin/devices')}
            className="font-mono text-[0.65rem] uppercase tracking-widest2 text-cyan hover:underline
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan rounded"
          >
            View all
          </button>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {devicesLoading
            ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 w-full skeleton my-1 rounded-lg" />)
            : recentDevices.map((d) => (
                <button
                  key={d.id}
                  onClick={() => navigate(`/admin/devices/${d.id}`)}
                  className="flex items-center justify-between gap-3 py-3 text-left transition-colors
                             hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2
                             focus-visible:ring-cyan rounded-lg px-2"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge status={d.status} compact />
                    <span className="font-mono text-sm font-semibold text-primary">{d.id}</span>
                    <span className="hidden font-mono text-xs text-muted sm:inline">{d.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden font-mono text-xs text-cyan sm:inline">{d.model || '—'}</span>
                    <span className="font-mono text-xs text-muted">{d.lastSeen}</span>
                    <ChevronRight size={14} className="text-muted" aria-hidden="true" />
                  </div>
                </button>
              ))}
        </div>
      </div>
    </div>
  );
}
