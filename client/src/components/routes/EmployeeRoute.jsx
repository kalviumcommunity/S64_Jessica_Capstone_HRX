import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const EmployeeRoute = ({ children }) => {
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
  
  // No need to check for employee role specifically, as long as they're authenticated
  // But for future-proofing, we might want to check specific roles:
  if (user && user.role !== 'employee' && user.role !== 'admin' && user.role !== 'hr') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

export default EmployeeRoute; 