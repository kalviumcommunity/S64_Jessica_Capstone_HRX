import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, Award, DollarSign, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/services/apiService';
import { toast } from 'sonner';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for attendance
  const [clockedIn, setClockedIn] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    rate: 0,
    isLoading: true,
    error: null
  });
  
  // State for leave balance
  const [leaveData, setLeaveData] = useState({
    balance: 0,
    percentage: 0,
    isLoading: true,
    error: null
  });
  
  // State for payroll
  const [payrollData, setPayrollData] = useState({
    nextPayDate: '',
    estimatedAmount: 0,
    isLoading: true,
    error: null
  });
  
  // State for events
  const [eventsData, setEventsData] = useState({
    events: [],
    isLoading: true,
    error: null
  });
  
  // State for notifications
  const [notificationsData, setNotificationsData] = useState({
    notifications: [],
    isLoading: true,
    error: null
  });
  
  // Check if user is already clocked in today
  const checkClockInStatus = async () => {
    const employeeId = user?.employeeProfile?._id;
    if (!employeeId) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const response = await api.get(`/attendance/employee/${employeeId}`);
      // Find today's attendance record
      const todayRecord = response.data.find(record => 
        new Date(record.date).toISOString().slice(0, 10) === today
      );
      // If there's a record for today and no checkout time, user is clocked in
      setClockedIn(todayRecord && !todayRecord.checkOut);
    } catch (error) {
      console.error('Error checking clock-in status:', error);
    }
  };
  
  useEffect(() => {
    checkClockInStatus();
  }, [user]);
  
  // Re-check clock-in status when navigating to this page
  useEffect(() => {
    checkClockInStatus();
    // eslint-disable-next-line
  }, [location.pathname]);
  
  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      const employeeId = user?.employeeId || user?.employeeProfile?._id;
      if (!employeeId) return;
      
      try {
        const response = await api.get(`/attendance/employee/${employeeId}`);
        
        // Calculate attendance rate
        const totalDays = response.data.length;
        const presentDays = response.data.filter(record => record.status === 'Present').length;
        const halfDays = response.data.filter(record => record.status === 'Half Day').length;
        
        const rate = totalDays > 0 
          ? Math.round(((presentDays + (halfDays * 0.5)) / totalDays) * 100) 
          : 100;
        
        setAttendanceData({
          rate,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setAttendanceData({
          rate: 0,
          isLoading: false,
          error: 'Failed to fetch attendance data'
        });
      }
    };
    
    fetchAttendanceData();
  }, [user]);
  
  // Fetch leave balance
  useEffect(() => {
    const fetchLeaveBalance = async () => {
      const employeeId = user?.employeeProfile?._id || user?.employeeId || user?._id;
      if (!employeeId) return;
      
      try {
        const response = await api.get(`/leaves/balance/${employeeId}`);
        const annualLeave = response.data.annual || 0;
        const totalAnnual = 20; // Assuming total annual leave is 20 days
        const percentage = Math.round((annualLeave / totalAnnual) * 100);
        
        setLeaveData({
          balance: annualLeave,
          percentage,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching leave balance:', error);
        setLeaveData({
          balance: 0,
          percentage: 0,
          isLoading: false,
          error: 'Failed to fetch leave balance'
        });
      }
    };
    
    fetchLeaveBalance();
  }, [user]);
  
  // Fetch payroll data
  useEffect(() => {
    const fetchPayrollData = async () => {
      const employeeId = user.employeeProfile?.createdBy || user.createdBy || user._id;
      if (!employeeId) return;
      
      try {
        setPayrollData(prev => ({ ...prev, isLoading: true }));
        const response = await api.get(`/payrolls/employee/${employeeId}`);
        
        // Sort by date (newest first) and get the most recent
        const sortedPayrolls = response.data.sort(
          (a, b) => new Date(b.payPeriodEnd) - new Date(a.payPeriodEnd)
        );
        
        const latestPayroll = sortedPayrolls[0] || null;
        const nextPayDate = latestPayroll 
          ? new Date(new Date(latestPayroll.payPeriodEnd).getTime() + 30 * 24 * 60 * 60 * 1000) 
          : new Date();
        
        // Format date as Month DD, YYYY
        const formattedDate = nextPayDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
        
        setPayrollData({
          nextPayDate: formattedDate,
          estimatedAmount: latestPayroll?.netPay || 0,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching payroll data:', error);
        setPayrollData({
          nextPayDate: 'Not available',
          estimatedAmount: 0,
          isLoading: false,
          error: 'Failed to fetch payroll data'
        });
      }
    };
    
    fetchPayrollData();
  }, [user]);
  
  // Fetch upcoming events
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?._id) return;
      
      try {
        const response = await api.get(`/events/employee/${user._id}`);
        
        // Format the events data
        const formattedEvents = response.data.map(event => ({
          id: event._id,
          title: event.title,
          date: event.date,
          time: event.time,
          type: event.type || 'general',
          formattedDate: new Date(event.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })
        }));
        
        setEventsData({
          events: formattedEvents,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching events data:', error);
        setEventsData({
          events: [],
          isLoading: false,
          error: 'Failed to fetch events data'
        });
      }
    };
    
    fetchEvents();
  }, [user]);
  
  // Fetch recent notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?._id) return;
      
      try {
        const response = await api.get(`/notifications/employee/${user._id}`);
        
        // Format the notifications data
        const formattedNotifications = response.data.map(notification => ({
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type || 'general',
          createdAt: notification.createdAt,
          timeAgo: formatTimeAgo(new Date(notification.createdAt))
        }));
        
        setNotificationsData({
          notifications: formattedNotifications,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching notifications data:', error);
        setNotificationsData({
          notifications: [],
          isLoading: false,
          error: 'Failed to fetch notifications data'
        });
      }
    };
    
    fetchNotifications();
  }, [user]);
  
  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Handle clock in/out
  const handleClockInOut = async () => {
    const employeeId = user?.employeeProfile?._id;
    if (!employeeId) {
      toast.error('User information not available');
      return;
    }
    try {
      if (clockedIn) {
        // Clock out
        await api.post('/attendance/checkout', { employeeId });
        toast.success('Clocked out successfully');
      } else {
        // Clock in
        await api.post('/attendance/checkin', { employeeId });
        toast.success('Clocked in successfully');
      }
      // Toggle state after successful API call
      setClockedIn(!clockedIn);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        (clockedIn ? 'Failed to clock out' : 'Failed to clock in');
      toast.error(errorMessage);
    }
  };
  
  const navigateToLeave = () => {
    navigate('/employee/leave');
  };
  
  const navigateToPayroll = () => {
    navigate('/employee/payroll');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's your personal dashboard - everything you need at a glance.
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleClockInOut} 
              variant={clockedIn ? "destructive" : "default"}
              className="w-full"
            >
              <Clock className="mr-2 h-4 w-4" />
              {clockedIn ? 'Clock Out' : 'Clock In'}
            </Button>
            
            <Button variant="outline" className="w-full" onClick={navigateToLeave}>
              <Calendar className="mr-2 h-4 w-4" />
              Apply for Leave
            </Button>
            
            <Button variant="outline" className="w-full" onClick={navigateToPayroll}>
              <FileText className="mr-2 h-4 w-4" />
              Latest Payslip
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceData.isLoading ? (
              <div className="flex justify-center items-center h-12">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : attendanceData.error ? (
              <div className="text-sm text-red-500">Error loading data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{attendanceData.rate}%</div>
                <Progress value={attendanceData.rate} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">This month</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {leaveData.isLoading ? (
              <div className="flex justify-center items-center h-12">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : leaveData.error ? (
              <div className="text-sm text-red-500">Error loading data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{leaveData.balance} days</div>
                <Progress value={leaveData.percentage} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">Annual leave remaining</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            {payrollData.isLoading ? (
              <div className="flex justify-center items-center h-12">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : payrollData.error ? (
              <div className="text-sm text-red-500">Error loading data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{payrollData.nextPayDate}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Estimated: ${payrollData.estimatedAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {eventsData.isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : eventsData.error ? (
              <div className="text-center text-red-500 py-4">
                {eventsData.error}
              </div>
            ) : eventsData.events.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No upcoming events found
              </div>
            ) : (
              <div className="space-y-4">
                {eventsData.events.map((event, idx) => {
                  // Determine icon based on event type
                  let Icon = Calendar;
                  let bgColor = "bg-blue-100";
                  let textColor = "text-blue-700";
                  
                  if (event.type === 'performance') {
                    Icon = Award;
                    bgColor = "bg-purple-100";
                    textColor = "text-purple-700";
                  } else if (event.type === 'payroll') {
                    Icon = DollarSign;
                    bgColor = "bg-green-100";
                    textColor = "text-green-700";
                  }
                  
                  return (
                    <div key={event.id || idx} className="flex items-center">
                      <div className={`h-9 w-9 rounded-full ${bgColor} flex items-center justify-center mr-3`}>
                        <Icon className={`h-5 w-5 ${textColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.formattedDate}{event.time ? `, ${event.time}` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;