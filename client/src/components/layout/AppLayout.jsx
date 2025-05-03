import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import TopBar from './TopBar';
import { useAuth } from '@/hooks/useAuth';

const AppLayout = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background text-foreground transition-colors duration-300">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-auto p-4 sm:p-6 bg-background transition-colors duration-300">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;