import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../services/apiService';
import { useDispatch } from 'react-redux';
import { setCredentials, clearCredentials, setLoading as setReduxLoading } from '../redux/authSlice';

// Create context
const AuthContext = createContext(undefined);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const savedUser = localStorage.getItem('hrms_user');
    const savedToken = localStorage.getItem('hrms_token');

    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setToken(savedToken);
      dispatch(setCredentials({ user: parsedUser, token: savedToken }));
    }

    setIsLoading(false);
    dispatch(setReduxLoading(false));
  }, [dispatch]);

  const fetchEmployeeIdAndSetUser = async (userData, token) => {
    try {
      let mergedUser = userData;

      if (userData.role === 'employee') {
        const response = await api.get(`/employees/by-user/${userData._id}`);
        if (response.data && response.data._id) {
          mergedUser = { ...userData, employeeProfile: response.data };
        }
      }

      setUser(mergedUser);
      setToken(token);
      localStorage.setItem('hrms_user', JSON.stringify(mergedUser));
      localStorage.setItem('hrms_token', token);
      dispatch(setCredentials({ user: mergedUser, token }));
      return mergedUser;
    } catch (err) {
      setUser(userData);
      setToken(token);
      localStorage.setItem('hrms_user', JSON.stringify(userData));
      localStorage.setItem('hrms_token', token);
      dispatch(setCredentials({ user: userData, token }));
      return userData;
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    dispatch(setReduxLoading(true));

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;

      setToken(token);
      localStorage.setItem('hrms_token', token);

      const mergedUser = await fetchEmployeeIdAndSetUser(userData, token);
      toast.success('Login successful!');
      return mergedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
      dispatch(setReduxLoading(false));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hrms_user');
    localStorage.removeItem('hrms_token');
    dispatch(clearCredentials());
    toast.success('Logged out successfully');
  };

  const register = async (name, email, password, role = 'employee') => {
    setIsLoading(true);

    try {
      await api.post('/auth/register', { name, email, password, role });
      toast.success('Registration successful! Please login.');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        register,
        fetchEmployeeIdAndSetUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
