import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSidebarToggle = useCallback(() => {
    setSidebarExpanded((prev) => !prev);
  }, []);

  const handleMobileClose = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  const handleMenuToggle = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isExpanded={sidebarExpanded}
        onToggle={handleSidebarToggle}
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={handleMobileClose}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuToggle={handleMenuToggle} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
