import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Menu,
  Sun,
  Moon,
  Bell,
  Plus,
  Share2,
  User,
  Settings,
  LogOut,
  Command,
} from 'lucide-react';
import { cn, getInitials } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border',
        'bg-background/80 backdrop-blur-md px-4 sm:px-6',
      )}
    >
      <Button variant="ghost" size="icon" onClick={onMenuToggle} className="md:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          placeholder="Search..."
          className="pl-9 pr-12 h-9"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            <Command className="h-3 w-3" />
            K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 ml-auto">
        <div className="hidden lg:block text-sm text-muted-foreground tabular-nums min-w-[90px] text-right mr-2">
          {time.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>

        <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
          <Plus className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
          <Share2 className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
            3
          </Badge>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8">
                {user?.avatar && <AvatarImage src={user.avatar} alt={user?.firstName || ''} />}
                <AvatarFallback className="text-xs">
                  {user ? getInitials(`${user.firstName} ${user.lastName}`) : '?'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
