import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  Shield,
  AlertTriangle,
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  Factory,
  Cpu,
  HardHat,
  Building2,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/incidents', icon: AlertTriangle, label: 'Incidents' },
  { to: '/workers', icon: HardHat, label: 'Workers' },
  { to: '/factories', icon: Factory, label: 'Factories' },
  { to: '/devices', icon: Cpu, label: 'Devices' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex items-center gap-2 border-b px-6 py-4">
        <Shield className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold">GuardianAI</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
