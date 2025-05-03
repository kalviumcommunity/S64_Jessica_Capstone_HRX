import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/apiService';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const Attendance = () => {
  const { user } = useAuth();
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user is already clocked in today
  useEffect(() => {
    const checkAttendanceStatus = async () => {
      if (!user?._id) return;
      
      try {
        setIsLoading(true);
        const today = new Date().toISOString().slice(0, 10);
        const response = await api.get(`/attendance/employee/${user._id}`);
        
        // Find today's attendance record
        const todayRecord = response.data.find(record => 
          new Date(record.date).toISOString().slice(0, 10) === today
        );
        
        // If there's a record for today
        if (todayRecord) {
          // If check-in exists
          if (todayRecord.checkIn) {
            setClockInTime(new Date(todayRecord.checkIn));
            setIsClockedIn(true);
            
            // If check-out also exists
            if (todayRecord.checkOut) {
              setClockOutTime(new Date(todayRecord.checkOut));
              setIsClockedIn(false);
            }
          }
        }
        
        // Get recent attendance history
        const recentHistory = response.data
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
          
        setAttendanceHistory(recentHistory);
        setError(null);
      } catch (err) {
        console.error('Error checking attendance status:', err);
        setError('Failed to fetch attendance data');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAttendanceStatus();
  }, [user]);

  const handleClockIn = async () => {
    if (!user?._id) {
      toast.error('User information not available');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/attendance/checkin', { employeeId: user._id });
      
      const now = new Date();
      setClockInTime(now);
      setIsClockedIn(true);
      toast.success('Clocked in successfully!');
      
      // Refresh attendance history
      const attendanceResponse = await api.get(`/attendance/employee/${user._id}`);
      const recentHistory = attendanceResponse.data
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setAttendanceHistory(recentHistory);
    } catch (err) {
      console.error('Error clocking in:', err);
      toast.error(err.response?.data?.message || 'Failed to clock in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    if (!user?._id) {
      toast.error('User information not available');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/attendance/checkout', { employeeId: user._id });
      
      const now = new Date();
      setClockOutTime(now);
      setIsClockedIn(false);
      toast.success('Clocked out successfully!');
      
      // Refresh attendance history
      const attendanceResponse = await api.get(`/attendance/employee/${user._id}`);
      const recentHistory = attendanceResponse.data
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setAttendanceHistory(recentHistory);
    } catch (err) {
      console.error('Error clocking out:', err);
      toast.error(err.response?.data?.message || 'Failed to clock out');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format time for display
  const formatTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '--/--/----';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Attendance</h1>
        <p className="text-muted-foreground">
          Record your daily attendance and view your attendance history.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2 border-indigo-100 shadow-md">
              <CardHeader>
                <CardTitle>Clock In/Out</CardTitle>
                <CardDescription>
                  Record your daily attendance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Status</Label>
                    <div className={`text-sm font-medium ${isClockedIn ? 'text-green-600' : 'text-amber-600'}`}>
                      {isClockedIn ? (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Clocked In {clockInTime && formatDistanceToNow(clockInTime, { addSuffix: true })}</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Not Clocked In</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {clockInTime && (
                    <div className="space-y-2">
                      <Label>Clock In Time</Label>
                      <div className="text-sm font-medium">
                        {formatTime(clockInTime)}
                      </div>
                    </div>
                  )}

                  {clockOutTime && (
                    <div className="space-y-2">
                      <Label>Clock Out Time</Label>
                      <div className="text-sm font-medium">
                        {formatTime(clockOutTime)}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      onClick={handleClockIn}
                      disabled={isClockedIn || isSubmitting}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      {isSubmitting && !isClockedIn ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4 mr-2" />
                      )}
                      Clock In
                    </Button>
                    <Button
                      onClick={handleClockOut}
                      disabled={!isClockedIn || isSubmitting}
                      className="flex-1 bg-red-500 hover:bg-red-600"
                    >
                      {isSubmitting && isClockedIn ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4 mr-2" />
                      )}
                      Clock Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
                <CardDescription>
                  Your attendance summary for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className={`text-sm font-medium ${isClockedIn ? 'text-green-600' : clockOutTime ? 'text-blue-600' : 'text-amber-600'}`}>
                        {isClockedIn ? 'Present (Active)' : clockOutTime ? 'Present (Completed)' : 'Not Present'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <div className="text-sm font-medium">
                        {new Date().toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {clockInTime && clockOutTime && (
                    <div className="space-y-2">
                      <Label>Working Hours</Label>
                      <div className="text-sm font-medium">
                        {(() => {
                          const diffMs = clockOutTime - clockInTime;
                          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                          const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                          return `${diffHrs}h ${diffMins}m`;
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance History</CardTitle>
              <CardDescription>
                Your attendance records for the last few days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No attendance records found
                </div>
              ) : (
                <div className="space-y-4">
                  {attendanceHistory.map((record) => {
                    const checkInTime = record.checkIn ? new Date(record.checkIn) : null;
                    const checkOutTime = record.checkOut ? new Date(record.checkOut) : null;
                    
                    // Calculate total hours if both check-in and check-out exist
                    let totalHours = '';
                    if (checkInTime && checkOutTime) {
                      const diffMs = checkOutTime - checkInTime;
                      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                      totalHours = `${diffHrs}h ${diffMins}m`;
                    }
                    
                    return (
                      <div 
                        key={record._id}
                        className="flex items-center justify-between border-b pb-2 last:border-0"
                      >
                        <div>
                          <div className="font-medium">
                            {formatDate(record.date)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {checkInTime ? formatTime(checkInTime) : '--:--'} 
                            {checkOutTime ? ` to ${formatTime(checkOutTime)}` : ' (No checkout)'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{totalHours || 'In progress'}</div>
                          <div className={`text-sm ${
                            record.status === 'Present' ? 'text-green-600' : 
                            record.status === 'Half Day' ? 'text-amber-600' : 
                            'text-red-600'
                          }`}>
                            {record.status || 'Present'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Attendance; 