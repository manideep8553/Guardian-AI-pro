import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  HardHat,
  Factory,
  Cpu,
  BarChart3,
  Calendar,
  CheckSquare,
  BookOpen,
  MessageSquare,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn, getInitials } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui/tooltip';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/incidents', icon: AlertTriangle, label: 'Incidents' },
  { to: '/workers', icon: HardHat, label: 'Workers' },
  { to: '/factories', icon: Factory, label: 'Factories' },
  { to: '/devices', icon: Cpu, label: 'Devices' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/resources', icon: BookOpen, label: 'Resources' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ isExpanded, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderNavLink = (to: string, Icon: React.ElementType, label: string) =>
    isExpanded ? (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )
        }
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{label}</span>
      </NavLink>
    ) : (
      <div key={to} className="flex justify-center">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )
                }
              >
                <Icon className="h-4 w-4" />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );

  const desktopSidebar = (
    <motion.aside
      animate={{ width: isExpanded ? 256 : 64 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden md:flex h-screen shrink-0 overflow-hidden bg-card border-r border-border"
    >
      <div className="flex h-full w-64 shrink-0 flex-col">
        <div
          className={cn(
            'flex items-center border-b border-border h-16 shrink-0',
            isExpanded ? 'gap-3 px-6' : 'justify-center px-0',
          )}
        >
          <Shield className="h-7 w-7 shrink-0 text-primary" />
          {isExpanded && (
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent whitespace-nowrap">
              GuardianAI
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => renderNavLink(item.to, item.icon, item.label))}
        </nav>

        <div className="border-t border-border p-3 space-y-2">
          {user &&
            (isExpanded ? (
              <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                <Avatar className="h-8 w-8 shrink-0">
                  {user.avatar && <AvatarImage src={user.avatar} alt={user.firstName} />}
                  <AvatarFallback>{getInitials(`${user.firstName} ${user.lastName}`)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize truncate">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Avatar className="h-8 w-8">
                          {user.avatar && <AvatarImage src={user.avatar} alt={user.firstName} />}
                          <AvatarFallback>
                            {getInitials(`${user.firstName} ${user.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          <Separator />
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </motion.aside>
  );

  const mobileSidebar = (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onMobileClose}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-64 md:hidden bg-card border-r border-border"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-3 border-b border-border h-16 shrink-0 px-6">
                <Shield className="h-7 w-7 shrink-0 text-primary" />
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                  GuardianAI
                </span>
              </div>

              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onMobileClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </NavLink>
                ))}
              </nav>

              {user && (
                <div className="border-t border-border p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      {user.avatar && <AvatarImage src={user.avatar} alt={user.firstName} />}
                      <AvatarFallback>{getInitials(`${user.firstName} ${user.lastName}`)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize truncate">{user.role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
}
