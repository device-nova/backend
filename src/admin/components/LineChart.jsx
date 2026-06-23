// src/admin/components/LineChart.jsx
// Pure SVG + Framer Motion. No charting library.
import { useRef, useEffect, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function LineChart({
  data,
  width = '100%',
  height = 220,
  label = 'Value',
  color = 'var(--accent-cyan)',
  showArea = true,
  anomalies = [],
  unit = '',
}) {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const inView = useInView(containerRef, { once: true });
  const reduced = useReducedMotion();
  const { theme } = useTheme();
  const [svgW, setSvgW] = useState(600);
  const [pathLen, setPathLen] = useState(1000);
  const [tooltip, setTooltip] = useState(null);

  // Resolve CSS var to literal hex for SVG attributes
  const resolvedColor = color.startsWith('var(')
    ? (color.includes('cyan')  ? (theme === 'dark' ? '#00D9FF' : '#0099CC')
     : color.includes('amber') ? (theme === 'dark' ? '#FF8A00' : '#E07700')
     : color.includes('success') ? (theme === 'dark' ? '#2EE6A6' : '#16A34A')
     : '#00D9FF')
    : color;

  const THEME_COLORS = {
    border:       theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(19,27,38,0.10)',
    borderHover:  theme === 'dark' ? 'rgba(0,217,255,0.40)'   : 'rgba(0,153,204,0.40)',
    amber:        theme === 'dark' ? '#FF8A00' : '#E07700',
    surface:      theme === 'dark' ? '#0D131C' : '#FFFFFF',
    surfaceRaised:theme === 'dark' ? '#131B26' : '#F3F5F8',
    muted:        theme === 'dark' ? '#7E8CA0' : '#5B6B7F',
    primary:      theme === 'dark' ? '#F2F6FA' : '#131B26',
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => setSvgW(entry.contentRect.width || 600));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (!data || data.length === 0) return null;

  const isMobile = svgW < 480;
  const PAD = { top: 16, right: 16, bottom: 28, left: 44 };
  const W = Math.max(svgW - PAD.left - PAD.right, 10);
  const H = Math.max(height - PAD.top - PAD.bottom, 10);
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = Math.min(...data.map((d) => d.value), 0);
  const range = maxVal - minVal || 1;

  const toX = (i) => (data.length > 1 ? (i / (data.length - 1)) * W : W / 2);
  const toY = (v) => H - ((v - minVal) / range) * H;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.value)}`).join(' ');
  const areaPath = `${linePath} L ${toX(data.length - 1)} ${H} L 0 ${H} Z`;

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
  }, [data, svgW]);

  const tickEvery = isMobile ? Math.ceil(data.length / 4) : Math.ceil(data.length / 8);
  const gradId = `area-grad-${label.replace(/\s+/g, '-')}`;
  const glowId = `line-glow-${label.replace(/\s+/g, '-')}`;

  return (
    <div ref={containerRef} style={{ width }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${svgW} ${height}`}
        role="img"
        aria-label={`${label} line chart with ${data.length} data points, ranging from ${minVal} to ${maxVal}${unit}`}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={resolvedColor} stopOpacity="0.22" />
            <stop offset="100%" stopColor={resolvedColor} stopOpacity="0.01" />
          </linearGradient>
          {/* SVG filter for glow — CSS drop-shadow doesn't resolve CSS vars */}
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform={`translate(${PAD.left}, ${PAD.top})`}>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line key={t} x1={0} y1={H * t} x2={W} y2={H * t} stroke={THEME_COLORS.border} strokeWidth="1" />
          ))}

          {[0, 0.5, 1].map((t) => (
            <text
              key={t}
              x={-8}
              y={H * (1 - t) + 4}
              textAnchor="end"
              fontSize="10"
              fontFamily="'JetBrains Mono', monospace"
              style={{ fill: THEME_COLORS.muted }}
            >
              {Math.round(minVal + range * t)}{unit}
            </text>
          ))}

          {data.map(
            (d, i) =>
              i % tickEvery === 0 && (
                <text
                  key={i}
                  x={toX(i)}
                  y={H + 18}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="'JetBrains Mono', monospace"
                  style={{ fill: THEME_COLORS.muted }}
                >
                  {d.label}
                </text>
              )
          )}

          {showArea && <path d={areaPath} fill={`url(#${gradId})`} />}

          <path
            ref={pathRef}
            d={linePath}
            fill="none"
            stroke={resolvedColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${glowId})`}
            style={{
              strokeDasharray: pathLen,
              strokeDashoffset: reduced || !inView ? 0 : pathLen,
              transition: reduced ? 'none' : undefined,
            }}
          >
            {!reduced && inView && (
              <animate
                attributeName="strokeDashoffset"
                from={pathLen}
                to={0}
                dur="1.2s"
                fill="freeze"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
              />
            )}
          </path>

          {anomalies.map((a, i) => (
            <rect key={i} x={toX(a.index) - 1} y={0} width={2} height={H} fill={THEME_COLORS.amber} opacity="0.35" />
          ))}
          {anomalies.map((a, i) => (
            <circle
              key={`dot-${i}`}
              cx={toX(a.index)}
              cy={toY(data[a.index]?.value ?? 0)}
              r={4}
              fill={THEME_COLORS.amber}
              stroke={THEME_COLORS.surface}
              strokeWidth="1.5"
            />
          ))}

          {data.map((d, i) => (
            <circle
              key={i}
              cx={toX(i)}
              cy={toY(d.value)}
              r={11}
              fill="transparent"
              style={{ pointerEvents: 'all', cursor: 'pointer' }}
              onMouseEnter={() => setTooltip({ x: toX(i), y: toY(d.value), d })}
              onMouseLeave={() => setTooltip(null)}
              onFocus={() => setTooltip({ x: toX(i), y: toY(d.value), d })}
              onBlur={() => setTooltip(null)}
              tabIndex={0}
              aria-label={`${d.label}: ${d.value}${unit}`}
            />
          ))}

          {tooltip && (
            <g style={{ pointerEvents: 'none' }}>
              <rect
                x={Math.min(Math.max(tooltip.x - 40, 0), W - 80)}
                y={Math.max(tooltip.y - 38, 0)}
                width={80}
                height={30}
                rx={6}
                fill={THEME_COLORS.surfaceRaised}
                stroke={THEME_COLORS.borderHover}
                strokeWidth="1"
              />
              <text
                x={Math.min(Math.max(tooltip.x, 40), W - 40)}
                y={Math.max(tooltip.y - 19, 11)}
                textAnchor="middle"
                fontSize="11"
                fontFamily="'JetBrains Mono', monospace"
                style={{ fill: THEME_COLORS.primary }}
              >
                {tooltip.d.value}{unit}
              </text>
              <text
                x={Math.min(Math.max(tooltip.x, 40), W - 40)}
                y={Math.max(tooltip.y - 7, 23)}
                textAnchor="middle"
                fontSize="9"
                fontFamily="'JetBrains Mono', monospace"
                style={{ fill: THEME_COLORS.muted }}
              >
                {tooltip.d.label}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
