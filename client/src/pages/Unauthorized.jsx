import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-amber-100 p-4 rounded-full">
            <AlertTriangle className="h-12 w-12 text-amber-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        <Button 
          onClick={() => navigate(user ? '/dashboard' : '/login')}
          className="bg-hrms-blue hover:bg-blue-700"
        >
          Return to {user ? 'Dashboard' : 'Login'}
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized; 