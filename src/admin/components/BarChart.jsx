// src/admin/components/BarChart.jsx
import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext.jsx';

/**
 * orientation: 'horizontal' (bars grow left-to-right, label left of bar)
 *              'vertical'   (bars grow bottom-to-top, label below bar)
 */
export default function BarChart({
  data, // [{ label, value }]
  orientation = 'horizontal',
  height = 240,
  color = 'var(--accent-cyan)',
  unit = '',
  thresholdValue,
  thresholdLabel,
}) {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true });
  const reduced = useReducedMotion();
  const { theme } = useTheme();
  const [svgW, setSvgW] = useState(500);

  // Resolve CSS var to literal hex for SVG attributes
  const resolvedColor = color.startsWith('var(')
    ? (color.includes('cyan')  ? (theme === 'dark' ? '#00D9FF' : '#0099CC')
     : color.includes('amber') ? (theme === 'dark' ? '#FF8A00' : '#E07700')
     : color.includes('success') ? (theme === 'dark' ? '#2EE6A6' : '#16A34A')
     : '#00D9FF')
    : color;

  const THEME_COLORS = {
    border:        theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(19,27,38,0.10)',
    amber:         theme === 'dark' ? '#FF8A00' : '#E07700',
    surfaceRaised: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
    muted:         theme === 'dark' ? '#7E8CA0' : '#5B6B7F',
    primary:       theme === 'dark' ? '#F2F6FA' : '#131B26',
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => setSvgW(entry.contentRect.width || 500));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.value), thresholdValue || 0, 1);

  if (orientation === 'horizontal') {
    const rowH = 34;
    const gap = 10;
    const labelW = svgW < 480 ? 70 : 110;
    const barAreaW = svgW - labelW - 56;
    const totalH = data.length * (rowH + gap);

    return (
      <div ref={containerRef} className="w-full">
        <svg
          width="100%"
          height={totalH}
          viewBox={`0 0 ${svgW} ${totalH}`}
          role="img"
          aria-label={`Horizontal bar chart: ${data.map((d) => `${d.label} ${d.value}${unit}`).join(', ')}`}
        >
          <defs>
            <filter id="bar-glow-h" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {data.map((d, i) => {
            const barW = (d.value / maxVal) * barAreaW;
            const y = i * (rowH + gap);
            return (
              <g key={d.label}>
                <text
                  x={labelW - 10}
                  y={y + rowH / 2 + 4}
                  textAnchor="end"
                  fontSize="11"
                  fontFamily="'JetBrains Mono', monospace"
                  style={{ fill: THEME_COLORS.muted }}
                >
                  {d.label}
                </text>
                <rect
                  x={labelW}
                  y={y}
                  width={barAreaW}
                  height={rowH}
                  rx={6}
                  fill={THEME_COLORS.surfaceRaised}
                />
                <motion.rect
                  x={labelW}
                  y={y}
                  height={rowH}
                  rx={6}
                  fill={resolvedColor}
                  filter="url(#bar-glow-h)"
                  initial={{ width: 0 }}
                  animate={{ width: inView || reduced ? barW : 0 }}
                  transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : i * 0.06, ease: 'easeOut' }}
                />
                <text
                  x={labelW + barW + 8}
                  y={y + rowH / 2 + 4}
                  fontSize="11"
                  fontFamily="'JetBrains Mono', monospace"
                  style={{ fill: THEME_COLORS.primary }}
                >
                  {d.value}{unit}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // vertical histogram
  const PAD = { top: 16, right: 12, bottom: 30, left: 36 };
  const H = height - PAD.top - PAD.bottom;
  const barGap = 8;
  const barW = Math.max((svgW - PAD.left - PAD.right) / data.length - barGap, 4);

  return (
    <div ref={containerRef} className="w-full">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${svgW} ${height}`}
        role="img"
        aria-label={`Histogram: ${data.map((d) => `${d.label} ${d.value}${unit}`).join(', ')}`}
      >
        <defs>
          <filter id="bar-glow-v" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform={`translate(${PAD.left}, ${PAD.top})`}>
          {[0, 0.5, 1].map((t) => (
            <line
              key={t}
              x1={0}
              y1={H * t}
              x2={svgW - PAD.left - PAD.right}
              y2={H * t}
              stroke={THEME_COLORS.border}
              strokeWidth="1"
            />
          ))}

          {thresholdValue !== undefined && (
            <>
              <line
                x1={0}
                y1={H - (thresholdValue / maxVal) * H}
                x2={svgW - PAD.left - PAD.right}
                y2={H - (thresholdValue / maxVal) * H}
                stroke={THEME_COLORS.amber}
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <text
                x={svgW - PAD.left - PAD.right}
                y={H - (thresholdValue / maxVal) * H - 6}
                textAnchor="end"
                fontSize="9"
                fontFamily="'JetBrains Mono', monospace"
                style={{ fill: THEME_COLORS.amber }}
              >
                {thresholdLabel}
              </text>
            </>
          )}

          {data.map((d, i) => {
            const h = (d.value / maxVal) * H;
            const x = i * (barW + barGap);
            const isOverThreshold = thresholdValue !== undefined && d.value > thresholdValue;
            const barColor = isOverThreshold ? THEME_COLORS.amber : resolvedColor;
            return (
              <g key={d.label}>
                <motion.rect
                  x={x}
                  width={barW}
                  rx={4}
                  fill={barColor}
                  filter="url(#bar-glow-v)"
                  initial={{ height: 0, y: H }}
                  animate={{ height: inView || reduced ? h : 0, y: inView || reduced ? H - h : H }}
                  transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : i * 0.03, ease: 'easeOut' }}
                />
                <text
                  x={x + barW / 2}
                  y={H + 16}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="'JetBrains Mono', monospace"
                  style={{ fill: THEME_COLORS.muted }}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
