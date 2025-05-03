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
    // Check for saved auth data in localStorage
    const savedUser = localStorage.getItem('hrms_user');
    const savedToken = localStorage.getItem('hrms_token');
    
    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setToken(savedToken);
      
      // Also update Redux store
      dispatch(setCredentials({ user: parsedUser, token: savedToken }));
    }
    
    setIsLoading(false);
    dispatch(setReduxLoading(false));
  }, [dispatch]);
  
  // Helper to fetch employee _id and merge into user object
  const fetchEmployeeIdAndSetUser = async (userData, token) => {
    try {
      // Only for employees
      if (userData.role === 'employee') {
        // Fetch employee record by createdBy
        const response = await api.get(`/employees/by-user/${userData._id}`);
        if (response.data && response.data._id) {
          // Do NOT overwrite user._id; store employee profile separately
          const mergedUser = { ...userData, employeeProfile: response.data };
          setUser(mergedUser);
          localStorage.setItem('hrms_user', JSON.stringify(mergedUser));
          dispatch(setCredentials({ user: mergedUser, token }));
          return mergedUser;
        }
      }
      // Fallback: just set user as is
      setUser(userData);
      localStorage.setItem('hrms_user', JSON.stringify(userData));
      dispatch(setCredentials({ user: userData, token }));
      return userData;
    } catch (err) {
      setUser(userData);
      localStorage.setItem('hrms_user', JSON.stringify(userData));
      dispatch(setCredentials({ user: userData, token }));
      return userData;
    }
  };
  
  const login = async (email, password) => {
    setIsLoading(true);
    dispatch(setReduxLoading(true));
    
    try {
      // Make real API call to login endpoint
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      // Set token first so it's available for API requests
      setToken(token);
      localStorage.setItem('hrms_token', token);
      // Now fetch and set employee _id if needed
      const mergedUser = await fetchEmployeeIdAndSetUser(userData, token);
      
      toast.success('Login successful!');
      return mergedUser; // Return the user object for navigation in the component
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
    
    // Update Redux store
    dispatch(clearCredentials());
    
    toast.success('Logged out successfully');
    // Navigation will be handled by the component that calls this function
  };
  
  const register = async (name, email, password, role = 'employee') => {
    setIsLoading(true);
    
    try {
      // Make real API call to register endpoint
      await api.post('/auth/register', { name, email, password, role });
      
      toast.success('Registration successful! Please login.');
      return true; // Return success for navigation in the component
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
