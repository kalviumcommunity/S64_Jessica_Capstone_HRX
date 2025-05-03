import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import ProtectedRoute from "@/components/routes/ProtectedRoute";
import AdminRoute from "@/components/routes/AdminRoute";
import EmployeeRoute from "@/components/routes/EmployeeRoute";
import AppLayout from "@/components/layout/AppLayout";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/admin/Dashboard";
import Employees from "./pages/admin/Employees";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import LeaveManagement from "./pages/employee/LeaveManagement";
import AdminLeaves from "./pages/admin/Leaves";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Attendance from "./pages/employee/Attendance";
import AdminAttendance from "./pages/admin/Attendance";
import Payroll from "./pages/employee/Payroll";
import AdminPayroll from "./pages/admin/Payroll";
import Performance from "./pages/employee/Performance";
import AdminPerformance from "./pages/admin/Performance";
import Documents from "./pages/employee/Documents";
import AdminDocuments from "./pages/admin/Documents";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Root redirect based on role */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    {({ user }) => 
                      user?.role === 'hr' || user?.role === 'admin' ? 
                        <Navigate to="/admin/dashboard" replace /> : 
                        <Navigate to="/employee/dashboard" replace />
                    }
                  </ProtectedRoute>
                } />
                
                {/* Admin/HR Routes */}
                <Route path="/admin" element={<AdminRoute><AppLayout /></AdminRoute>}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="employees" element={<Employees />} />
                  <Route path="leaves" element={<AdminLeaves />} />
                  <Route path="payroll" element={<AdminPayroll />} />
                  <Route path="performance" element={<AdminPerformance />} />
                  <Route path="attendance" element={<AdminAttendance />} />
                  <Route path="documents" element={<AdminDocuments />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
                
                {/* Employee Routes */}
                <Route path="/employee" element={<EmployeeRoute><AppLayout /></EmployeeRoute>}>
                  <Route path="dashboard" element={<EmployeeDashboard />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="leave" element={<LeaveManagement />} />
                  <Route path="attendance" element={<Attendance />} />
                  <Route path="payroll" element={<Payroll />} />
                  <Route path="performance" element={<Performance />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);

export default App;
