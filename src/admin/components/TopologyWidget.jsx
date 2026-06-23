// src/admin/components/TopologyWidget.jsx
// NOTE: the brief asks to "reuse the exact topology map from the user
// dashboard" — that component's source wasn't available in this build's
// context, so this is an original implementation built to the same spec
// (clickable nodes, right-click actions, refresh-replays-pulse) using
// animated SVG rather than three.js, to keep it dependency-light and
// fully accessible/keyboard-navigable.
import { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Eye, RotateCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function TopologyWidget({ devices = [], onRestart }) {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Derive literal hex colors from theme — CSS vars don't resolve in SVG attributes
  const COLORS = {
    cyan:        theme === 'dark' ? '#00D9FF' : '#0099CC',
    amber:       theme === 'dark' ? '#FF8A00' : '#E07700',
    muted:       theme === 'dark' ? '#7E8CA0' : '#5B6B7F',
    surface:     theme === 'dark' ? '#0D131C' : '#FFFFFF',
    surfaceRaised: theme === 'dark' ? '#131B26' : '#F3F5F8',
    bg:          theme === 'dark' ? '#060A10' : '#F0F4F8',
    border:      theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(19,27,38,0.10)',
  };

  const STATUS_COLOR = {
    online:  COLORS.cyan,
    warning: COLORS.amber,
    offline: COLORS.muted,
  };
  const reduced = useReducedMotion();
  const [animKey, setAnimKey] = useState(0);
  const [menu, setMenu] = useState(null); // { x, y, device }
  const containerRef = useRef(null);

  const sample = useMemo(() => devices.slice(0, 14), [devices]);

  useEffect(() => {
    function close(e) {
      if (!containerRef.current?.contains(e.target)) setMenu(null);
    }
    function closeOnEscape(e) {
      if (e.key === 'Escape') setMenu(null);
    }
    window.addEventListener('click', close);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const size = 100; // viewBox units
  const center = size / 2;
  const radius = 38;

  const nodes = sample.map((d, i) => {
    const angle = (i / sample.length) * Math.PI * 2 - Math.PI / 2;
    return {
      device: d,
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });

  return (
    <div ref={containerRef} className="relative flex h-full flex-col rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold text-primary">Fleet Topology</h3>
          <p className="font-mono text-[0.65rem] text-muted">{sample.length} nodes shown · click for detail</p>
        </div>
        <button
          onClick={() => setAnimKey((k) => k + 1)}
          aria-label="Refresh topology pulse animation"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted
                     transition-colors hover:border-hover hover:text-cyan focus-visible:outline-none
                     focus-visible:ring-2 focus-visible:ring-cyan"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="relative flex-1">
        <svg
          key={animKey}
          viewBox={`0 0 ${size} ${size}`}
          className="h-full w-full"
          role="img"
          aria-label={`Network topology showing ${sample.length} connected devices`}
        >
          {/* Pulse rings from hub */}
          {!reduced &&
            [0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx={center}
                cy={center}
                r={6}
                fill="none"
                stroke={COLORS.cyan}
                strokeWidth="0.5"
                initial={{ r: 6, opacity: 0.6 }}
                animate={{ r: radius + 6, opacity: 0 }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
              />
            ))}

          {/* Connection lines */}
          {nodes.map(({ device, x, y }) => (
            <line
              key={`line-${device.id}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke={STATUS_COLOR[device.status] || STATUS_COLOR.offline}
              strokeOpacity={device.status === 'offline' ? 0.15 : 0.35}
              strokeWidth="0.4"
            />
          ))}

          {/* Hub */}
          <circle cx={center} cy={center} r={5} fill={COLORS.surfaceRaised} stroke={COLORS.cyan} strokeWidth="0.6" />
          <circle cx={center} cy={center} r={2} fill={COLORS.cyan} />

          {/* Device nodes */}
          {nodes.map(({ device, x, y }, i) => (
            <g key={device.id}>
              {device.status === 'warning' && !reduced && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r={3.4}
                  fill="none"
                  stroke={COLORS.amber}
                  strokeWidth="0.5"
                  animate={{ r: [3.4, 5, 3.4], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <motion.circle
                cx={x}
                cy={y}
                r={2.6}
                fill={STATUS_COLOR[device.status] || STATUS_COLOR.offline}
                stroke={COLORS.surface}
                strokeWidth="0.6"
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: reduced ? 0 : 0.5 + i * 0.05 }}
                whileHover={{ scale: 1.6 }}
                role="button"
                tabIndex={0}
                aria-label={`${device.id}, ${device.status}, ${device.location}. Press Enter to view details.`}
                onClick={() => navigate(`/admin/devices/${device.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(`/admin/devices/${device.id}`);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  const rect = containerRef.current.getBoundingClientRect();
                  setMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top, device });
                }}
              />
            </g>
          ))}
        </svg>

        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              style={{ position: 'absolute', left: menu.x, top: menu.y }}
              className="z-20 w-52 overflow-hidden rounded-xl border border-border bg-surface-raised shadow-lg"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
            >
              <p className="border-b border-border px-3 py-2 font-mono text-[0.65rem] uppercase tracking-widest2 text-muted">
                {menu.device.id}
              </p>
              <button
                onClick={() => {
                  navigate(`/admin/devices/${menu.device.id}`);
                  setMenu(null);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-primary hover:bg-surface"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
              >
                <Eye size={14} className="text-muted" /> View Device Details
              </button>
              <button
                onClick={() => {
                  onRestart?.(menu.device.id);
                  setMenu(null);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-primary hover:bg-surface"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
              >
                <RotateCw size={14} className="text-muted" /> Restart Inference
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center justify-center gap-4">
        {[
          ['Online', COLORS.cyan],
          ['Warning', COLORS.amber],
          ['Offline', COLORS.muted],
        ].map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5 font-mono text-[0.65rem] text-muted">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
