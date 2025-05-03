import React from 'react';
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

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const LoginForm = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
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
      // The login function in useAuth already dispatches the setCredentials action
      // with the user and token from the API response, so we don't need to do it here
      
      if (user) {
        if (user.role === 'admin' || user.role === 'hr') {
          navigate('/admin/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      // Error is already handled by the useAuth hook with toast notifications
    }
  };

  const handleGoogleSignIn = () => {
    toast.info('Google Sign-In coming soon!');
  };

  return (
    <div className="mx-auto w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to sign in to your account
        </p>
      </div>

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
      >
        <GoogleIcon className="h-5 w-5" />
        Sign in with Google
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
