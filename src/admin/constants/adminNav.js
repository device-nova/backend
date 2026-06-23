import {
  LayoutDashboard,
  Cpu,
  BrainCircuit,
  Bell,
  BarChart2,
  Users,
  Settings,
} from 'lucide-react';

export const ADMIN_NAV = [
  {
    group: 'Operations',
    items: [
      { label: 'Overview', icon: LayoutDashboard, path: '/admin', exact: true },
      { label: 'Devices', icon: Cpu, path: '/admin/devices' },
      { label: 'AI Models', icon: BrainCircuit, path: '/admin/aimodels' },
      { label: 'Alerts', icon: Bell, path: '/admin/alerts', badgeKey: 'critical' },
    ],
  },
  {
    group: 'Intelligence',
    items: [
      { label: 'Analytics', icon: BarChart2, path: '/admin/analytics' },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'Users', icon: Users, path: '/admin/users' },
      { label: 'Settings', icon: Settings, path: '/admin/settings' },
    ],
  },
];
