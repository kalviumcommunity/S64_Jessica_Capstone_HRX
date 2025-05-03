import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to unauthorized if not admin/hr
  if (user && user.role !== 'admin' && user.role !== 'hr') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

export default AdminRoute; 