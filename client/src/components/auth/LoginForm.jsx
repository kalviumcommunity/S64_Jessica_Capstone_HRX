import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch } from '@/redux/hooks';
import { setCredentials } from '@/redux/authSlice';
import GoogleIcon from '@/components/common/GoogleIcon';
import { signInWithGoogle } from '@/Firebase';
import api from '@/services/apiService';
import PhoneAuth from './PhoneAuth';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const LoginForm = () => {
  const { login, isLoading, fetchEmployeeIdAndSetUser } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      if (user) {
        if (user.role === 'admin' || user.role === 'hr') {
          navigate('/admin/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const userData = await signInWithGoogle();
      const response = await api.post('/auth/google/check', {
        email: userData.email,
        uid: userData.uid,
      });
      const data = response.data;
      if (data && data.role) {
        const mergedUser = fetchEmployeeIdAndSetUser
          ? await fetchEmployeeIdAndSetUser(data, data.token)
          : data;
        if (mergedUser.role === 'admin' || mergedUser.role === 'hr') {
          navigate('/admin/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      } else {
        sessionStorage.setItem('googleUser', JSON.stringify(userData));
        navigate('/role-selection');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePhoneAuthSuccess = async (userData) => {
    try {
      const response = await api.post('/auth/phone/check', {
        phoneNumber: userData.phoneNumber,
        uid: userData.uid,
      });
      const data = response.data;
      if (data && data.role) {
        localStorage.setItem('hrms_token', data.token);
        const mergedUser = fetchEmployeeIdAndSetUser
          ? await fetchEmployeeIdAndSetUser(data, data.token)
          : data;
        if (mergedUser.role === 'admin' || mergedUser.role === 'hr') {
          navigate('/admin/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      } else {
        sessionStorage.setItem('phoneUser', JSON.stringify(userData));
        navigate('/role-selection');
      }
    } catch (error) {
      console.error('Phone sign-in error:', error);
      toast.error('Failed to sign in with phone. Please try again.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to sign in to your account
        </p>
      </div>
      <div className="mb-4 text-center">
        <Link to="/" className="text-hrms-blue hover:underline font-medium">
          ← Back to Home
        </Link>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        <Button
          type="button"
          variant={loginMethod === 'email' ? 'default' : 'outline'}
          onClick={() => setLoginMethod('email')}
          className="flex-1"
        >
          Email
        </Button>
        <Button
          type="button"
          variant={loginMethod === 'phone' ? 'default' : 'outline'}
          onClick={() => setLoginMethod('phone')}
          className="flex-1"
        >
          Phone
        </Button>
      </div>

      {loginMethod === 'email' ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="you@example.com" 
                      {...field} 
                      type="email"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="••••••••" 
                      {...field} 
                      type="password"
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-hrms-blue hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Form>
      ) : (
        <PhoneAuth onSuccess={handlePhoneAuthSuccess} />
      )}

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
      >
        {googleLoading ? 'Signing in...' : (
          <>
            <GoogleIcon className="h-5 w-5" />
            Sign in with Google
          </>
        )}
      </Button>
      
      <div className="mt-4 text-center text-sm">
        <p>
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="font-medium text-hrms-blue hover:text-blue-700"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
