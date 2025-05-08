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
import { motion } from 'framer-motion';

const sidebarVariants = {
  initial: {
    x: -20,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const logoVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.1,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

const navItemVariants = {
  initial: { x: -20, opacity: 0 },
  animate: (index) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: index * 0.1,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

const footerVariants = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

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
    <motion.div
      variants={sidebarVariants}
      initial="initial"
      animate="animate"
    >
      <Sidebar className="border-r border-border/50 h-screen bg-card/80 backdrop-blur-sm">
        <SidebarHeader className="border-b border-border/50">
          <motion.div 
            className="flex items-baseline"
            variants={logoVariants}
            whileHover="hover"
          >
            <span className="text-2xl font-bold text-primary">HR</span>
            <span className="text-2xl font-bold text-foreground">X</span>
          </motion.div>
        </SidebarHeader>
        
        <SidebarContent className="px-2 py-2">
          <nav className="space-y-1">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                custom={index}
                variants={navItemVariants}
                whileHover="hover"
              >
                <NavLink
                  to={link.href}
                  className={({ isActive }) => cn(
                    'flex items-center rounded-md text-sm font-medium',
                    isActive
                      ? 'bg-[hsl(172,70%,95%)] text-[hsl(172,100%,34%)] shadow-md shadow-primary/20'
                      : 'text-gray-700 hover:bg-gray-100/50 hover:shadow-md'
                  )}
                >
                  <SidebarMenuButton 
                    isActive={({ isActive }) => isActive}
                    className="group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <link.icon className="group-hover:text-primary" />
                    </motion.div>
                    <motion.span
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.name}
                    </motion.span>
                  </SidebarMenuButton>
                </NavLink>
              </motion.div>
            ))}
          </nav>
        </SidebarContent>
        
        <motion.div
          variants={footerVariants}
          initial="initial"
          animate="animate"
        >
          <SidebarFooter className="border-t border-border/50">
            <div className="space-y-4 p-2">
              <motion.div 
                className="flex items-center gap-2 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user?.avatar ? getFileUrl(user.avatar) : '/placeholder.svg'} 
                    alt={user?.name}
                  />
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col sidebar-expanded-only">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize truncate group-hover:text-primary/80">
                    {user?.role}
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="w-full text-red-500 hover:bg-red-50/50 hover:text-red-600 sidebar-expanded-only group"
                >
                  <motion.div
                    whileHover={{ rotate: 12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <LogOut className="group-hover:scale-110" />
                  </motion.div>
                  <motion.span
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Logout
                  </motion.span>
                </SidebarMenuButton>
              </motion.div>
            </div>
          </SidebarFooter>
        </motion.div>
      </Sidebar>
    </motion.div>
  );
};

export default AppSidebar;
