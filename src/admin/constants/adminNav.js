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
      { label: 'Overview', icon: LayoutDashboard, path: '/', exact: true },
      { label: 'Devices', icon: Cpu, path: '/devices' },
      { label: 'AI Models', icon: BrainCircuit, path: '/aimodels' },
      { label: 'Alerts', icon: Bell, path: '/alerts', badgeKey: 'critical' },
    ],
  },
  {
    group: 'Intelligence',
    items: [
      { label: 'Analytics', icon: BarChart2, path: '/analytics' },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'Users', icon: Users, path: '/users' },
      { label: 'Settings', icon: Settings, path: '/settings' },
    ],
  },
];
