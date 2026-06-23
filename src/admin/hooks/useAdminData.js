import { useState, useEffect, useMemo } from 'react';

export const MOCK_DEVICES = Array.from({ length: 120 }, (_, i) => ({
  id: `DEV-${String(i + 1).padStart(3, '0')}`,
  status: ['online', 'online', 'online', 'warning', 'offline'][i % 5 === 4 ? 4 : i % 5 === 3 ? 3 : 0],
  model: i % 7 === 0 ? null : ['YOLOv8-edge', 'Anomaly-v3', 'PredMaint-v2', 'VibSensor-v1'][i % 4],
  latency: (0.8 + Math.random() * 2.5).toFixed(1) + 'ms',
  lastSeen: ['2 min ago', '5 min ago', '11 min ago', '3 hours ago', '1 day ago'][Math.floor(i / 24) % 5],
  location: ['Factory A', 'Factory B', 'Remote-7', 'Silo-2', 'Line B', 'Platform-3'][i % 6],
  site: ['Nordic Plant 1', 'Nordic Plant 2', 'UK Site Alpha', 'US Midwest Hub'][Math.floor(i / 30)],
  hardware: 'NVIDIA Jetson Xavier NX',
  ip: `192.168.${Math.floor(i / 254)}.${(i % 254) + 1}`,
  uptime: (95 + Math.random() * 4.9).toFixed(1) + '%',
  firmware: '3.2.1',
  aiLoad: Math.floor(20 + Math.random() * 70),
  onlineSince: `${Math.floor(Math.random() * 5) + 1} days ${Math.floor(Math.random() * 12)}h`,
  modelVersion: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 9)}`,
  os: 'Ubuntu 22.04',
}));

export const MOCK_ALERTS = Array.from({ length: 48 }, (_, i) => {
  const severities = ['CRITICAL', 'WARNING', 'WARNING', 'INFO', 'INFO', 'INFO'];
  const severity = severities[i % severities.length];
  const deviceId = `DEV-${String((i % 120) + 1).padStart(3, '0')}`;
  const messages = [
    'AI inference timeout after 400ms',
    'Latency spike: 38ms avg (threshold: 25ms)',
    'Device offline — last contact 3h 12m',
    'Model drift detected: accuracy drop 2.3%',
    'Temperature threshold exceeded: 72°C',
    'Firmware update available',
  ];
  return {
    id: `ALT-${String(i + 1).padStart(3, '0')}`,
    severity,
    deviceId,
    message: messages[i % messages.length],
    timestamp: ['3 min ago', '11 min ago', '3 hrs ago', '5 hrs ago', '1 day ago', '2 days ago'][i % 6],
    resolved: i > 10 && i % 3 === 0,
  };
});

export const MOCK_MODELS = [
  { id: 'MDL-001', name: 'YOLOv8-edge', version: 'v2.3.1', status: 'active', category: 'Anomaly Detection', devices: 847, accuracy: 94.2, f1: 0.91, latency: 1.2, sizeMB: 48, lastDeployed: '3 days ago', deployedBy: 'admin@devicanova.io' },
  { id: 'MDL-002', name: 'Anomaly-v3', version: 'v1.7.0', status: 'active', category: 'Anomaly Detection', devices: 312, accuracy: 91.8, f1: 0.88, latency: 0.9, sizeMB: 32, lastDeployed: '1 week ago', deployedBy: 'ops@devicanova.io' },
  { id: 'MDL-003', name: 'PredMaint-v2', version: 'v0.9.2', status: 'pending', category: 'Predictive Maintenance', devices: 0, accuracy: 97.1, f1: 0.95, latency: 2.1, sizeMB: 96, lastDeployed: null, deployedBy: null },
  { id: 'MDL-004', name: 'VibSensor-v1', version: 'v1.2.0', status: 'active', category: 'Vibration Analysis', devices: 156, accuracy: 89.5, f1: 0.84, latency: 1.5, sizeMB: 28, lastDeployed: '2 weeks ago', deployedBy: 'admin@devicanova.io' },
  { id: 'MDL-005', name: 'DefectNet-edge', version: 'v3.0.1', status: 'active', category: 'Visual Inspection', devices: 420, accuracy: 96.3, f1: 0.93, latency: 2.8, sizeMB: 64, lastDeployed: '5 days ago', deployedBy: 'admin@devicanova.io' },
  { id: 'MDL-006', name: 'ThermalAI-v2', version: 'v2.1.0', status: 'pending', category: 'Thermal Analysis', devices: 0, accuracy: 92.7, f1: 0.89, latency: 1.8, sizeMB: 45, lastDeployed: null, deployedBy: null },
];

export const MOCK_USERS = [
  { id: 'USR-001', name: 'James Okonkwo', email: 'james@devicanova.io', role: 'Super Admin', status: 'active', lastActive: 'Just now' },
  { id: 'USR-002', name: 'Sarah Chen', email: 'sarah@devicanova.io', role: 'Admin', status: 'active', lastActive: '2 min ago' },
  { id: 'USR-003', name: 'Marcus Johnson', email: 'marcus@devicanova.io', role: 'Operator', status: 'active', lastActive: '15 min ago' },
  { id: 'USR-004', name: 'Elena Rodriguez', email: 'elena@devicanova.io', role: 'Viewer', status: 'active', lastActive: '1 hour ago' },
  { id: 'USR-005', name: 'David Park', email: 'david@devicanova.io', role: 'Operator', status: 'inactive', lastActive: '3 days ago' },
  { id: 'USR-006', name: 'Aisha Patel', email: 'aisha@devicanova.io', role: 'Admin', status: 'active', lastActive: '45 min ago' },
  { id: 'USR-007', name: 'Tom Wilson', email: 'tom@devicanova.io', role: 'Viewer', status: 'active', lastActive: '2 hours ago' },
];

export function generateTimeSeriesData(points, baseValue, variance, trend = 0, seed = 1) {
  const rng = seededRandom(seed);
  return Array.from({ length: points }, (_, i) => {
    const value = Math.max(0, Math.round(baseValue + (rng() - 0.5) * variance + trend * i));
    const isAnomaly = rng() < 0.05;
    return {
      value,
      label: formatTimeLabel(i, points),
      isAnomaly,
      index: i,
    };
  });
}

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function formatTimeLabel(index, total) {
  const now = new Date();
  const interval = total <= 12 ? 5 : total <= 24 ? 60 : total <= 30 ? 24 * 60 : 24 * 60;
  const date = new Date(now.getTime() - (total - index - 1) * interval * 60 * 1000);
  if (total <= 12) return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  if (total <= 24) return `${date.getHours()}:00`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function useAdminData() {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [models, setModels] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setDevices(MOCK_DEVICES);
      setDevicesLoading(false);
    }, 600);
    const t2 = setTimeout(() => {
      setAlerts(MOCK_ALERTS);
      setLoading(false);
    }, 500);
    const t3 = setTimeout(() => {
      setModels(MOCK_MODELS);
      setModelsLoading(false);
    }, 700);
    const t4 = setTimeout(() => {
      setUsers(MOCK_USERS);
      setUsersLoading(false);
    }, 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const counts = useMemo(() => ({
    critical: alerts.filter((a) => a.severity === 'CRITICAL' && !a.resolved).length,
    warning: alerts.filter((a) => a.severity === 'WARNING' && !a.resolved).length,
    info: alerts.filter((a) => a.severity === 'INFO' && !a.resolved).length,
    all: alerts.length,
  }), [alerts]);

  return {
    devices,
    devicesLoading,
    alerts,
    loading,
    models,
    modelsLoading,
    users,
    usersLoading,
    counts,
  };
}
