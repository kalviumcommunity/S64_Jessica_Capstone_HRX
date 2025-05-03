import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow, differenceInMinutes, differenceInHours } from 'date-fns';

const AttendanceTracker = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  
  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Check if user is already checked in today
  useEffect(() => {
    const checkAttendanceStatus = async () => {
      if (!user?._id) return;
      
      try {
        const today = new Date().toISOString().slice(0, 10);
        const response = await api.get(`/attendance/employee/${user._id}`);
        
        // Find today's attendance record
        const todayRecord = response.data.find(record => 
          new Date(record.date).toISOString().slice(0, 10) === today
        );
        
        // If there's a record for today and no checkout time, user is checked in
        if (todayRecord && todayRecord.checkIn && !todayRecord.checkOut) {
          setIsCheckedIn(true);
          setCheckInTime(new Date(todayRecord.checkIn));
        }
      } catch (err) {
        console.error('Error checking attendance status:', err);
      }
    };
    
    checkAttendanceStatus();
  }, [user]);
  
  // Fetch attendance history
  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      if (!user?._id) return;
      
      try {
        setIsLoading(true);
        const response = await api.get(`/attendance/employee/${user._id}`);
        
        // Format the data for display
        const formattedHistory = response.data
          .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date (newest first)
          .slice(0, 5) // Get only the 5 most recent records
          .map(record => {
            // Calculate total hours if both check-in and check-out exist
            let totalHours = '';
            if (record.checkIn && record.checkOut) {
              const checkInTime = new Date(record.checkIn);
              const checkOutTime = new Date(record.checkOut);
              const hours = differenceInHours(checkOutTime, checkInTime);
              const minutes = differenceInMinutes(checkOutTime, checkInTime) % 60;
              totalHours = `${hours}h ${minutes}m`;
            }
            
            return {
              id: record._id,
              date: new Date(record.date).toISOString().split('T')[0],
              checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '',
              checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '',
              totalHours,
              status: record.status || 'Present'
            };
          });
        
        setAttendanceHistory(formattedHistory);
        setError(null);
      } catch (err) {
        console.error('Error fetching attendance history:', err);
        setError('Failed to fetch attendance history');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttendanceHistory();
  }, [user, isCheckedIn]); // Re-fetch when check-in status changes
  
  // Fetch employee profile on mount
  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      if (!user?._id) return;
      try {
        const res = await api.get(`/employees/user/${user._id}`);
        setEmployeeId(res.data._id);
      } catch (err) {
        console.error('Error fetching employee profile:', err);
      }
    };
    fetchEmployeeProfile();
  }, [user]);
  
  const handleCheckIn = async () => {
    if (!employeeId) {
      toast({
        title: "Error",
        description: "Employee profile not found",
        variant: "destructive"
      });
      return;
    }
    try {
      const response = await api.post('/attendance/checkin', { employeeId });
      
      const now = new Date();
      setIsCheckedIn(true);
      setCheckInTime(now);
      
      toast({
        title: "Checked In",
        description: `You've checked in at ${now.toLocaleTimeString()}`,
      });
    } catch (err) {
      console.error('Error checking in:', err);
      toast({
        title: "Check-in Failed",
        description: err.response?.data?.message || "Failed to check in",
        variant: "destructive"
      });
    }
  };
  
  const handleCheckOut = async () => {
    if (!employeeId) {
      toast({
        title: "Error",
        description: "Employee profile not found",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await api.post('/attendance/checkout', { employeeId });
      
      const now = new Date();
      
      if (checkInTime) {
        const durationMs = now.getTime() - checkInTime.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        
        toast({
          title: "Checked Out",
          description: `You worked for ${hours}h ${minutes}m today`,
        });
      }
      
      setIsCheckedIn(false);
      setCheckInTime(null);
    } catch (err) {
      console.error('Error checking out:', err);
      toast({
        title: "Check-out Failed",
        description: err.response?.data?.message || "Failed to check out",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="border-2 border-indigo-100 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Today's Attendance</CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              {isCheckedIn ? (
                <div className="flex items-center justify-center text-green-600 mb-4">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span>
                    Checked in {checkInTime && formatDistanceToNow(checkInTime, { addSuffix: true })}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center text-amber-600 mb-4">
                  <AlertCircle className="h-5 w-5 mr-1" />
                  <span>Not checked in yet</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          {isCheckedIn ? (
            <Button 
              onClick={handleCheckOut}
              className="w-32 bg-red-500 hover:bg-red-600"
            >
              <Clock className="mr-2 h-4 w-4" />
              Check Out
            </Button>
          ) : (
            <Button 
              onClick={handleCheckIn}
              className="w-32 bg-green-500 hover:bg-green-600"
            >
              <Clock className="mr-2 h-4 w-4" />
              Check In
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Attendance History</CardTitle>
          <CardDescription>
            Your attendance records for the last few days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : attendanceHistory.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No attendance records found
            </div>
          ) : (
            <div className="space-y-4">
              {attendanceHistory.map((record) => (
                <div 
                  key={record.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <div className="font-medium">
                      {new Date(record.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {record.checkIn} {record.checkOut ? `to ${record.checkOut}` : '(No checkout)'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{record.totalHours || 'In progress'}</div>
                    <div className={`text-sm ${
                      record.status === 'Present' ? 'text-green-600' : 
                      record.status === 'Half Day' ? 'text-amber-600' : 
                      'text-red-600'
                    }`}>
                      {record.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View Full Attendance History
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AttendanceTracker; 