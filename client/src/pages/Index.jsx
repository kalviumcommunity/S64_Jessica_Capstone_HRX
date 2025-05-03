import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'hr') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, user]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-hrms-blue" />
      <p className="mt-4 text-lg text-gray-600">Loading HRX...</p>
    </div>
  );
};

export default Index; 