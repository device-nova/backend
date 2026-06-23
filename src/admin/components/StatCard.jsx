import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { useCountUp } from '../../hooks/useCountUp.js';
const TONES = {
  cyan: { icon: 'text-cyan bg-cyan/10 border-cyan/20', glow: 'hover:shadow-glow-cyan' },
  amber: { icon: 'text-amber bg-amber/10 border-amber/20', glow: 'hover:shadow-glow-amber' },
  success: { icon: 'text-success bg-success/10 border-success/20', glow: '' },
  muted: { icon: 'text-muted bg-surface-raised border-border', glow: '' },
};
export default function StatCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  tone = 'cyan',
  sublabel,
  pulse = false,
  onClick,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const isNumeric = typeof value === 'number';
  const count = useCountUp(isNumeric ? value : 0, 1400, inView);
  const { icon: iconClass, glow } = TONES[tone] || TONES.cyan;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reduced ? {} : { y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick();
            }
          : undefined
      }
      className={`flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5
                  transition-colors duration-300 hover:border-hover ${glow}
                  ${onClick ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan' : 'cursor-default'}`}
    >
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center border ${iconClass}`}>
        <Icon size={18} aria-hidden="true" className={iconClass.split(' ')[0]} />
      </div>
      <div>
        <p className="font-display text-3xl font-bold text-primary tabular-nums">
          {isNumeric ? count.toLocaleString() : value}
          {suffix}
        </p>
        <p className="font-mono text-xs tracking-widest2 text-muted mt-1 uppercase">{label}</p>
        {sublabel && (
          <p
            className={`font-mono text-[0.65rem] mt-1 ${pulse ? 'text-amber' : 'text-cyan'} ${
              pulse && !reduced ? 'animate-pulse' : ''
            }`}
          >
            {sublabel}
          </p>
        )}
      </div>
    </motion.div>
  );
}
