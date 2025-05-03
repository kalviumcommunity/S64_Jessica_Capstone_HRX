import React, { useState, useEffect } from 'react';
import api from '@/services/apiService';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  
  // State for dashboard stats
  const [stats, setStats] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);
  
  // State for recent activities
  const [activities, setActivities] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [activitiesError, setActivitiesError] = useState(null);
  
  // State for upcoming events
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  
  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await api.get('/dashboard/stats');
        
        // Format the data
        const formattedStats = [
          { 
            title: 'Total Employees', 
            value: response.data.employeeCount.toString(), 
            icon: Users, 
            change: response.data.employeeChange, 
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50'
          },
          { 
            title: 'Leave Requests', 
            value: response.data.pendingLeaveCount.toString(), 
            icon: Calendar, 
            change: 'Pending approval', 
            iconColor: 'text-yellow-500',
            bgColor: 'bg-yellow-50' 
          },
          { 
            title: 'Payroll', 
            value: `$${response.data.currentPayroll.toLocaleString()}`, 
            icon: DollarSign, 
            change: `For ${response.data.payrollMonth}`, 
            iconColor: 'text-green-500',
            bgColor: 'bg-green-50'
          },
          { 
            title: 'Performance Reviews', 
            value: response.data.upcomingReviewCount.toString(), 
            icon: Award, 
            change: 'Due this month', 
            iconColor: 'text-purple-500',
            bgColor: 'bg-purple-50'
          },
        ];
        
        setStats(formattedStats);
        setStatsError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setStatsError('Failed to fetch dashboard stats');
        
        // Fallback to empty stats if the API call fails
        setStats([
          { 
            title: 'Total Employees', 
            value: '0', 
            icon: Users, 
            change: 'No data available', 
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50'
          },
          { 
            title: 'Leave Requests', 
            value: '0', 
            icon: Calendar, 
            change: 'No data available', 
            iconColor: 'text-yellow-500',
            bgColor: 'bg-yellow-50' 
          },
          { 
            title: 'Payroll', 
            value: '$0', 
            icon: DollarSign, 
            change: 'No data available', 
            iconColor: 'text-green-500',
            bgColor: 'bg-green-50'
          },
          { 
            title: 'Performance Reviews', 
            value: '0', 
            icon: Award, 
            change: 'No data available', 
            iconColor: 'text-purple-500',
            bgColor: 'bg-purple-50'
          },
        ]);
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchDashboardStats();
  }, []);
  
  // Fetch recent activities
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        setIsLoadingActivities(true);
        const response = await api.get('/dashboard/activities');
        
        setActivities(response.data);
        setActivitiesError(null);
      } catch (err) {
        console.error('Error fetching recent activities:', err);
        setActivitiesError('Failed to fetch recent activities');
        setActivities([]);
      } finally {
        setIsLoadingActivities(false);
      }
    };
    
    fetchRecentActivities();
  }, []);
  
  // Fetch upcoming events
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setIsLoadingEvents(true);
        const response = await api.get('/dashboard/events');
        
        setEvents(response.data);
        setEventsError(null);
      } catch (err) {
        console.error('Error fetching upcoming events:', err);
        setEventsError('Failed to fetch upcoming events');
        setEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    
    fetchUpcomingEvents();
  }, []);
  
  // Helper function to get icon component based on type
  const getIconComponent = (type) => {
    switch (type) {
      case 'employee':
        return Users;
      case 'leave':
        return Calendar;
      case 'payroll':
        return DollarSign;
      case 'performance':
        return Award;
      default:
        return Users;
    }
  };
  
  // Helper function to get icon color based on type
  const getIconColor = (type) => {
    switch (type) {
      case 'employee':
        return 'text-blue-700';
      case 'leave':
        return 'text-green-700';
      case 'payroll':
        return 'text-blue-700';
      case 'performance':
        return 'text-yellow-700';
      default:
        return 'text-gray-700';
    }
  };
  
  // Helper function to get background color based on type
  const getBgColor = (type) => {
    switch (type) {
      case 'employee':
        return 'bg-blue-100';
      case 'leave':
        return 'bg-green-100';
      case 'payroll':
        return 'bg-blue-100';
      case 'performance':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Welcome, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening in your HR dashboard today.
        </p>
      </div>

      {isLoadingStats ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : statsError ? (
        <div className="text-center text-red-500 py-4">
          {statsError}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-full`}>
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingActivities ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : activitiesError ? (
              <div className="text-center text-red-500 py-4">
                {activitiesError}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No recent activities found
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const IconComponent = getIconComponent(activity.type);
                  const iconColor = getIconColor(activity.type);
                  const bgColor = getBgColor(activity.type);
                  
                  return (
                    <div key={index} className="flex items-center">
                      <div className={`h-9 w-9 rounded-full ${bgColor} flex items-center justify-center mr-3`}>
                        <IconComponent className={`h-5 w-5 ${iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      </div>
                      <div className="ml-auto text-xs text-muted-foreground">{activity.timeAgo}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingEvents ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : eventsError ? (
              <div className="text-center text-red-500 py-4">
                {eventsError}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No upcoming events found
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event, index) => {
                  const IconComponent = getIconComponent(event.type);
                  const iconColor = getIconColor(event.type);
                  const bgColor = getBgColor(event.type);
                  
                  return (
                    <div key={index} className="flex items-center">
                      <div className={`h-9 w-9 rounded-full ${bgColor} flex items-center justify-center mr-3`}>
                        <IconComponent className={`h-5 w-5 ${iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.datetime}</p>
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

export default Dashboard; 