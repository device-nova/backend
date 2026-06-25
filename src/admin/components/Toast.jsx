import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';

const ICONS = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-amber/30 bg-amber/10 text-amber',
  info: 'border-cyan/30 bg-cyan/10 text-cyan',
};

export default function ToastStack() {
  const { toasts, removeToast } = useAdmin();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.tone] || ICONS.success;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto flex min-w-[280px] max-w-sm items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${
                COLORS[t.tone] || COLORS.success
              }`}
              role="status"
              aria-live="polite"
            >
              <Icon size={16} className="flex-shrink-0" aria-hidden="true" />
              <span className="flex-1 text-sm">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss toast"
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md opacity-60 transition-opacity hover:opacity-100"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
