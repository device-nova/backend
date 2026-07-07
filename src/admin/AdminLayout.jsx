import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import ToastStack from './components/Toast.jsx';
export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef(null);
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <div
      className="flex h-screen overflow-hidden bg-void"
      style={{ backgroundColor: 'var(--bg-void)' }}
    >
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex w-[280px] flex-shrink-0 flex-col overflow-y-auto border-r border-border bg-surface"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
      >
        <Sidebar />
      </aside>
      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-void/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed bottom-0 left-0 top-0 z-50 w-[280px] overflow-y-auto border-r border-border
                         bg-surface lg:hidden"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <Sidebar onNavigate={() => setMobileOpen(false)} onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main ref={mainRef} className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--bg-void)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="p-4 md:p-6 lg:p-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <ToastStack />
    </div>
  );
}
