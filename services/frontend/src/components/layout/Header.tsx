import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { LogOut, Bell, User } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        <h1 className="text-lg font-semibold">Welcome, {user?.firstName || 'User'}</h1>
        <p className="text-sm text-muted-foreground">
          {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'} • {user?.department || 'N/A'}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={logout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
