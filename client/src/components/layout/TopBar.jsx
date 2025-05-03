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
    <header className="z-10 bg-card border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between transition-colors">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="rounded-full"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage 
                src={user?.avatar ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${user.avatar}` : "/placeholder.svg"} 
                alt={user?.name || 'User'} 
                onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.svg"; }}
              />
              <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={navigateToProfile}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={navigateToSettings}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default TopBar;