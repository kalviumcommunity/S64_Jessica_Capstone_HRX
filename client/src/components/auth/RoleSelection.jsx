import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAppSelector } from '@/redux/hooks';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/apiService';

const HRX_GREEN = 'hsl(172,100%,34%)';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { fetchEmployeeIdAndSetUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'hr') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
      return;
    }
    const storedUser = sessionStorage.getItem('googleUser');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUserData(JSON.parse(storedUser));
  }, [navigate, user]);

  const handleRoleSelection = async (role) => {
    try {
      const response = await api.post('/auth/google', {
        email: userData.email,
        name: userData.displayName,
        photoURL: userData.photoURL,
        uid: userData.uid,
        role: role
      });
      const data = response.data;
      const mergedUser = fetchEmployeeIdAndSetUser
        ? await fetchEmployeeIdAndSetUser(data, data.token)
        : data;
      sessionStorage.removeItem('googleUser');
      if (mergedUser.role === 'admin' || mergedUser.role === 'hr') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (error) {
      console.error('Role selection error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to complete registration. Please try again.');
    }
  };

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="mx-auto w-full max-w-md p-6 bg-white rounded-xl shadow border border-gray-100">
        <div className="flex flex-col space-y-2 text-center mb-6">
          <div className="flex justify-center items-center mb-2">
            <span className="text-3xl font-bold" style={{ color: HRX_GREEN }}>HR</span>
            <span className="text-3xl font-bold text-gray-700">X</span>
          </div>
          <p className="text-gray-600">Human Resource Management System</p>
        </div>
        <div className="flex flex-col space-y-2 text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Select your role</h1>
          <p className="text-sm text-gray-500">
            Please select your role to continue
          </p>
        </div>
        <div className="space-y-4">
          <Button
            onClick={() => handleRoleSelection('admin')}
            className="w-full h-12 text-base font-semibold border border-[hsl(172,100%,34%)] text-[hsl(172,100%,34%)] bg-white hover:bg-[hsl(172,100%,34%)] hover:text-white transition-colors rounded-lg shadow-sm"
            style={{ boxShadow: '0 1px 2px 0 rgb(16 185 129 / 0.05)' }}
          >
            Admin
          </Button>
          <Button
            onClick={() => handleRoleSelection('hr')}
            className="w-full h-12 text-base font-semibold border border-[hsl(172,100%,34%)] text-[hsl(172,100%,34%)] bg-white hover:bg-[hsl(172,100%,34%)] hover:text-white transition-colors rounded-lg shadow-sm"
            style={{ boxShadow: '0 1px 2px 0 rgb(16 185 129 / 0.05)' }}
          >
            HR Manager
          </Button>
          <Button
            onClick={() => handleRoleSelection('employee')}
            className="w-full h-12 text-base font-semibold border border-[hsl(172,100%,34%)] text-[hsl(172,100%,34%)] bg-white hover:bg-[hsl(172,100%,34%)] hover:text-white transition-colors rounded-lg shadow-sm"
            style={{ boxShadow: '0 1px 2px 0 rgb(16 185 129 / 0.05)' }}
          >
            Employee
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;