import { motion, useReducedMotion } from 'framer-motion';
export default function AlertBadge({ count, size = 'sm' }) {
  const reduced = useReducedMotion();
  if (!count) return null;
  const sizeClasses = size === 'sm' ? 'h-4 min-w-[1rem] px-1 text-[0.6rem]' : 'h-5 min-w-[1.25rem] px-1.5 text-[0.65rem]';
  return (
    <motion.span
      role="status"
      aria-live="polite"
      aria-label={`${count} critical alert${count === 1 ? '' : 's'}`}
      animate={reduced ? {} : { scale: [1, 1.15, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className={`inline-flex items-center justify-center rounded-full bg-amber font-mono font-semibold
                  text-white ${sizeClasses}`}
    >
      {count}
    </motion.span>
  );
}
