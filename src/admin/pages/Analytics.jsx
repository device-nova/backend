// src/admin/pages/Analytics.jsx
import { useMemo, useState } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import LineChart from '../components/LineChart.jsx';
import DonutChart from '../components/DonutChart.jsx';
import BarChart from '../components/BarChart.jsx';
import { SkeletonChart } from '../components/SkeletonCard.jsx';
import { generateTimeSeriesData } from '../hooks/useAdminData.js';

const RANGES = [
  { key: '1H', points: 12, base: 900, variance: 80, seed: 11 },
  { key: '6H', points: 18, base: 870, variance: 110, seed: 12 },
  { key: '24H', points: 24, base: 850, variance: 140, seed: 13 },
  { key: '7D', points: 7, base: 820, variance: 180, seed: 14 },
  { key: '30D', points: 30, base: 800, variance: 200, seed: 15 },
];

export default function Analytics() {
  const { devices, devicesLoading } = useAdmin();
  const [range, setRange] = useState('24H');

  const rangeConfig = RANGES.find((r) => r.key === range);
  const inferenceData = useMemo(
    () => generateTimeSeriesData(rangeConfig.points, rangeConfig.base, rangeConfig.variance, 1, rangeConfig.seed),
    [rangeConfig]
  );
  const anomalies = useMemo(
    () => inferenceData.filter((d) => d.isAnomaly).map((d) => ({ index: d.index })),
    [inferenceData]
  );

  const donutSegments = useMemo(() => {
    const online = devices.filter((d) => d.status === 'online').length;
    const warning = devices.filter((d) => d.status === 'warning').length;
    const offline = devices.filter((d) => d.status === 'offline').length;
    return [
      { label: 'Online', value: online, color: 'var(--accent-cyan)' },
      { label: 'Warning', value: warning, color: 'var(--accent-amber)' },
      { label: 'Offline', value: offline, color: 'var(--fg-muted)' },
    ];
  }, [devices]);

  const loadByLocation = useMemo(() => {
    const map = {};
    devices.forEach((d) => {
      if (!d.model) return;
      map[d.location] = map[d.location] || { total: 0, count: 0 };
      map[d.location].total += d.aiLoad;
      map[d.location].count += 1;
    });
    return Object.entries(map)
      .map(([label, v]) => ({ label, value: Math.round(v.total / v.count) }))
      .sort((a, b) => b.value - a.value);
  }, [devices]);

  const latencyHistogram = useMemo(() => {
    const buckets = ['0-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30+'].map((label) => ({ label, value: 0 }));
    devices.forEach((d) => {
      const lat = parseFloat(d.latency);
      if (Number.isNaN(lat)) return;
      const bucketLat = lat * 10; // scale mock ms values into a 0-35ms-ish spread for a believable histogram
      const idx = Math.min(Math.floor(bucketLat / 5), buckets.length - 1);
      buckets[idx].value += 1;
    });
    return buckets;
  }, [devices]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-lg font-semibold text-primary">Fleet Analytics</h2>
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1 scrollbar-none"
             style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              aria-pressed={range === r.key}
              className={`min-h-[44px] rounded-lg px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline-none
                          focus-visible:ring-2 focus-visible:ring-cyan ${
                            range === r.key ? 'bg-cyan/10 text-cyan' : 'text-muted hover:text-primary'
                          }`}
            >
              {r.key}
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="mb-4 font-display text-sm font-semibold text-primary">Inference Rate</h3>
        {devicesLoading ? (
          <SkeletonChart height={260} />
        ) : (
          <LineChart data={inferenceData} height={260} anomalies={anomalies} unit="/s" label="Inference rate" />
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-5">
          <h3 className="mb-4 self-start font-display text-sm font-semibold text-primary">Device Health Distribution</h3>
          {devicesLoading ? <SkeletonChart height={200} /> : <DonutChart segments={donutSegments} centerLabel="DEVICES" />}
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="mb-4 font-display text-sm font-semibold text-primary">AI Load by Location</h3>
          {devicesLoading ? <SkeletonChart height={200} /> : <BarChart data={loadByLocation} orientation="horizontal" unit="%" />}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="mb-4 font-display text-sm font-semibold text-primary">Latency Distribution</h3>
        {devicesLoading ? (
          <SkeletonChart height={240} />
        ) : (
          <BarChart
            data={latencyHistogram}
            orientation="vertical"
            unit=""
            thresholdValue={5}
            thresholdLabel="25ms threshold"
          />
        )}
      </section>
    </div>
  );
}
