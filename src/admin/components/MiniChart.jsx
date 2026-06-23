import { useReducedMotion } from 'framer-motion';
/** A tiny inline sparkline — no axes, no labels, no interaction. */
export default function MiniChart({ data, width = 120, height = 32, color = 'var(--accent-cyan)' }) {
  const reduced = useReducedMotion();
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" role="presentation">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: `drop-shadow(0 0 3px ${color})`,
          pathLength: 1,
          strokeDasharray: reduced ? undefined : 1,
          strokeDashoffset: reduced ? 0 : 0,
        }}
      />
    </svg>
  );
}
