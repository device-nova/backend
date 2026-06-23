import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useAlerts } from '../hooks/useAlerts.js';
import { useAdminData } from '../hooks/useAdminData.js';
const AdminContext = createContext(null);
export function AdminProvider({ children }) {
  const alertsState = useAlerts();
  const data = useAdminData();
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const addToast = useCallback(
    (message, tone = 'success') => {
      const id = ++toastId.current;
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => removeToast(id), 3000);
      return id;
    },
    [removeToast]
  );
  // Lightweight client-side device "actions" — these mutate a local copy of
  // the mock device list so action buttons (restart / offline / online) feel
  // real even though there's no backend behind this demo.
  const [deviceOverrides, setDeviceOverrides] = useState({});
  const devices = useMemo(
    () => data.devices.map((d) => ({ ...d, ...deviceOverrides[d.id] })),
    [data.devices, deviceOverrides]
  );
  const setDeviceStatus = useCallback((id, status) => {
    setDeviceOverrides((prev) => ({ ...prev, [id]: { ...prev[id], status } }));
  }, []);
  const updateDevice = useCallback((id, patch) => {
    setDeviceOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);
  const restartDeviceAI = useCallback(
    (id) => {
      addToast(`Restart command sent to ${id}`, 'success');
    },
    [addToast]
  );
  const value = {
    ...alertsState,
    ...data,
    devices,
    setDeviceStatus,
    updateDevice,
    restartDeviceAI,
    toasts,
    addToast,
    removeToast,
  };
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within an AdminProvider');
  return ctx;
}
