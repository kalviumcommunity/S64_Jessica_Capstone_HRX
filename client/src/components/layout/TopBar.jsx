import React from 'react';
import { User, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/ui/theme-provider';
import { motion, AnimatePresence } from 'framer-motion';

const topBarVariants = {
  initial: {
    y: -20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const themeIconVariants = {
  initial: { rotate: 0 },
  hover: { 
    rotate: 360,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const menuItemVariants = {
  initial: { x: -20, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

const TopBar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigateToProfile = () => {
    if (user?.role === 'admin' || user?.role === 'hr') {
      navigate('/admin/profile');
    } else {
      navigate('/employee/profile');
    }
  };

  const navigateToSettings = () => {
    if (user?.role === 'admin' || user?.role === 'hr') {
      navigate('/admin/settings');
    } else {
      navigate('/employee/settings');
    }
  };
  
  return (
    <motion.header 
      className="z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 px-4 sm:px-6 py-4 flex items-center justify-between"
      variants={topBarVariants}
      initial="initial"
      animate="animate"
    >
      <div className="flex items-center">
        <motion.div
          whileHover="hover"
          variants={themeIconVariants}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-full hover:shadow-lg hover:shadow-primary/20"
          >
            <AnimatePresence mode="wait">
              {theme === 'dark' ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sun className="h-5 w-5 hover:text-yellow-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Moon className="h-5 w-5 hover:text-blue-400" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="sr-only">Toggle theme</span>
          </Button>
        </motion.div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              className="relative h-9 w-9 rounded-full hover:shadow-lg hover:shadow-primary/20"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage 
                  src={user?.avatar ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${user.avatar}` : "/placeholder.svg"} 
                  alt={user?.name || 'User'} 
                  onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.svg"; }}
                />
                <AvatarFallback>
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 border border-border/50 bg-white text-black"
          style={{ background: '#fff', color: '#111', zIndex: 99999, fontWeight: 600 }}
          asChild
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <DropdownMenuLabel className="text-primary font-semibold">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                onClick={navigateToProfile}
                className="cursor-pointer"
                style={{ color: '#111', fontWeight: 500 }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={navigateToSettings}
                className="cursor-pointer"
                style={{ color: '#111', fontWeight: 500 }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-500 hover:bg-red-50/50 hover:text-red-600 cursor-pointer"
                style={{ color: '#d32f2f', fontWeight: 500 }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </div>
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.header>
  );
};

export default TopBar;