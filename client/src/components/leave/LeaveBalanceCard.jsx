import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import api from '@/services/apiService';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const LeaveBalanceCard = () => {
  const { user } = useAuth();
  const [leaveBalance, setLeaveBalance] = useState({
    annual: { total: 0, used: 0, remaining: 0 },
    sick: { total: 0, used: 0, remaining: 0 },
    unpaid: { total: 0, used: 0, remaining: 0 }
  });
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchLeaveData = async () => {
      if (!user?._id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch leave balance
        const balanceResponse = await api.get(`/leaves/balance/${user._id}`);
        
        // Format balance data
        const balanceData = {
          annual: {
            total: balanceResponse.data.annualTotal || 20,
            used: balanceResponse.data.annualUsed || 0,
            remaining: balanceResponse.data.annual || 0
          },
          sick: {
            total: balanceResponse.data.sickTotal || 10,
            used: balanceResponse.data.sickUsed || 0,
            remaining: balanceResponse.data.sick || 0
          },
          unpaid: {
            total: 0, // Unpaid leave doesn't have a limit
            used: balanceResponse.data.unpaidUsed || 0,
            remaining: 0
          }
        };
        
        setLeaveBalance(balanceData);
        
        // Fetch leave history
        const historyResponse = await api.get(`/leaves/employee/${user._id}`);
        
        // Sort by date (newest first) and get only the 3 most recent
        const recentLeaves = historyResponse.data
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
          .slice(0, 3)
          .map(leave => ({
            id: leave._id,
            type: leave.leaveType,
            startDate: new Date(leave.startDate),
            endDate: new Date(leave.endDate),
            status: leave.status
          }));
        
        setLeaveHistory(recentLeaves);
        setError(null);
      } catch (err) {
        console.error('Error fetching leave data:', err);
        setError('Failed to fetch leave data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaveData();
  }, [user]);
  
  // Helper function to get icon color based on leave type
  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'annual':
        return 'text-blue-500';
      case 'sick':
        return 'text-red-500';
      case 'personal':
      case 'unpaid':
        return 'text-amber-500';
      default:
        return 'text-gray-500';
    }
  };
  
  // Format date range for display
  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return 'N/A';
    
    const start = format(startDate, 'MMM d, yyyy');
    
    // If start and end dates are the same, just show one date
    if (startDate.getTime() === endDate.getTime()) {
      return start;
    }
    
    const end = format(endDate, 'MMM d, yyyy');
    return `${start} - ${end}`;
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64 text-red-500">
          {error}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Leave Balance</CardTitle>
        <CardDescription>
          Your current leave balance and usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-5 bg-blue-500 rounded-sm mr-2"></div>
                <div className="text-sm font-medium">Annual Casual Leave</div>
              </div>
              <div className="text-sm font-semibold">
                {leaveBalance.annual.remaining}/{leaveBalance.annual.total} days remaining
              </div>
            </div>
            <Progress 
              value={(leaveBalance.annual.used / leaveBalance.annual.total) * 100} 
              className="h-2" 
            />
            <div className="text-xs text-muted-foreground">
              Used: {leaveBalance.annual.used} days
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-5 bg-red-500 rounded-sm mr-2"></div>
                <div className="text-sm font-medium">Sick Leave</div>
              </div>
              <div className="text-sm font-semibold">
                {leaveBalance.sick.remaining}/{leaveBalance.sick.total} days remaining
              </div>
            </div>
            <Progress 
              value={(leaveBalance.sick.used / leaveBalance.sick.total) * 100} 
              className="h-2" 
            />
            <div className="text-xs text-muted-foreground">
              Used: {leaveBalance.sick.used} days
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-5 bg-amber-500 rounded-sm mr-2"></div>
                <div className="text-sm font-medium">Loss of Pay (LOP)</div>
              </div>
              <div className="text-sm font-semibold">
                {leaveBalance.unpaid.used} days
              </div>
            </div>
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2" />
                <div className="text-xs text-amber-700">
                  LOP leaves will be deducted from your salary
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-2">Leave History</div>
          {leaveHistory.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-2">
              No recent leave history
            </div>
          ) : (
            <div className="space-y-2">
              {leaveHistory.map(leave => (
                <div key={leave.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Calendar className={`h-4 w-4 mr-2 ${getLeaveTypeColor(leave.type)}`} />
                    <div className="text-sm">
                      {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave
                    </div>
                  </div>
                  <div className="text-sm">
                    {formatDateRange(leave.startDate, leave.endDate)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveBalanceCard; 