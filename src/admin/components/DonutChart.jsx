// src/admin/components/DonutChart.jsx
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

// Map CSS variable strings to literal hex so SVG attributes resolve correctly
function resolveSvgColor(colorStr, theme) {
  if (!colorStr || !colorStr.startsWith('var(')) return colorStr;
  if (colorStr.includes('accent-cyan'))  return theme === 'dark' ? '#00D9FF' : '#0099CC';
  if (colorStr.includes('accent-amber')) return theme === 'dark' ? '#FF8A00' : '#E07700';
  if (colorStr.includes('success'))      return theme === 'dark' ? '#2EE6A6' : '#16A34A';
  if (colorStr.includes('danger'))       return theme === 'dark' ? '#F87171' : '#DC2626';
  if (colorStr.includes('fg-muted'))     return theme === 'dark' ? '#7E8CA0' : '#5B6B7F';
  if (colorStr.includes('fg-primary'))   return theme === 'dark' ? '#F2F6FA' : '#131B26';
  if (colorStr.includes('border'))       return theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(19,27,38,0.10)';
  return colorStr;
}

export default function DonutChart({
  segments, // [{ label, value, color }]
  size = 200,
  strokeWidth = 22,
  centerLabel,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const { theme } = useTheme();

  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const trackColor = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(19,27,38,0.10)';
  const primaryColor = theme === 'dark' ? '#F2F6FA' : '#131B26';
  const mutedColor = theme === 'dark' ? '#7E8CA0' : '#5B6B7F';

  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const fraction = seg.value / total;
    const arc = {
      ...seg,
      fraction,
      dashArray: `${circumference * fraction} ${circumference}`,
      offset: circumference * (1 - cumulative),
      resolvedColor: resolveSvgColor(seg.color, theme),
    };
    cumulative += fraction;
    return arc;
  });

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Donut chart: ${segments.map((s) => `${s.label} ${s.value}`).join(', ')}, total ${total}`}
      >
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {/* Track ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {arcs.map((arc, i) => (
            <motion.circle
              key={arc.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.resolvedColor}
              strokeWidth={strokeWidth}
              strokeDasharray={arc.dashArray}
              initial={{ strokeDashoffset: circumference, opacity: 0 }}
              animate={
                inView || reduced
                  ? { strokeDashoffset: arc.offset, opacity: 1 }
                  : { strokeDashoffset: circumference, opacity: 0 }
              }
              transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : i * 0.12, ease: 'easeOut' }}
              strokeLinecap="butt"
            />
          ))}
        </g>
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          fontSize="26"
          fontWeight="700"
          fontFamily="'Space Grotesk', sans-serif"
          style={{ fill: primaryColor }}
        >
          {total.toLocaleString()}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 16}
          textAnchor="middle"
          fontSize="10"
          fontFamily="'JetBrains Mono', monospace"
          style={{ fill: mutedColor }}
        >
          {centerLabel || 'TOTAL'}
        </text>
      </svg>

      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ background: resolveSvgColor(seg.color, theme) }}
            />
            <span className="font-mono text-xs text-muted">
              {seg.label} <span className="text-primary">{seg.value}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
