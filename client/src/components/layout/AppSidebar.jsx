import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  User, 
  FileText, 
  Calendar, 
  DollarSign, 
  Award, 
  Clock, 
  Settings, 
  Users, 
  LayoutDashboard,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getFileUrl } from '@/lib/utils';

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Define navigation links based on user role
  const navLinks = isAdmin 
    ? [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Employees', href: '/admin/employees', icon: Users },
        { name: 'Leave Requests', href: '/admin/leaves', icon: Calendar },
        { name: 'Payroll', href: '/admin/payroll', icon: DollarSign },
        { name: 'Performance', href: '/admin/performance', icon: Award },
        { name: 'Attendance', href: '/admin/attendance', icon: Clock },
        { name: 'Documents', href: '/admin/documents', icon: FileText },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ]
    : [
        { name: 'Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
        { name: 'My Profile', href: '/employee/profile', icon: User },
        { name: 'Leave Management', href: '/employee/leave', icon: Calendar },
        { name: 'Attendance', href: '/employee/attendance', icon: Clock },
        { name: 'Payroll', href: '/employee/payroll', icon: DollarSign },
        { name: 'Performance', href: '/employee/performance', icon: Award },
        { name: 'Documents', href: '/employee/documents', icon: FileText },
        { name: 'Settings', href: '/employee/settings', icon: Settings },
      ];

  return (
    <Sidebar className="border-r border-border h-screen">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-primary">HR</span>
            <span className="text-2xl font-bold text-foreground">X</span>
          </div>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-2">
        <nav className="space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) => cn(
                'flex items-center rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[hsl(172,70%,95%)] text-[hsl(172,100%,34%)]'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <SidebarMenuButton isActive={({ isActive }) => isActive}>
                <link.icon />
                {link.name}
              </SidebarMenuButton>
            </NavLink>
          ))}
        </nav>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border">
        <div className="space-y-4 p-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={getFileUrl(user?.avatar)} 
                alt={user?.name} 
              />
              <AvatarFallback>
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col sidebar-expanded-only">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize truncate">
                {user?.role}
              </p>
            </div>
          </div>
          
          <SidebarMenuButton
            onClick={handleLogout}
            className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 sidebar-expanded-only"
          >
            <LogOut />
            Logout
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
