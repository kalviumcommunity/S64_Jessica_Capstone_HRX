import React, { useState, useEffect } from 'react';
import { Clock, CalendarIcon, Loader2 } from 'lucide-react';
import api from '@/services/apiService';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form validation schema
const formSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  checkInTime: z.string().min(1, "Check-in time is required"),
  checkOutTime: z.string().min(1, "Check-out time is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  supervisor: z.string().min(1, "Supervisor is required"),
});

const MissedAttendanceForm = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      checkInTime: '',
      checkOutTime: '',
      reason: '',
      supervisor: '',
    },
  });
  
  // Fetch supervisors from the backend
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would have an endpoint to fetch supervisors
        // This is an example of what the endpoint might be
        const response = await api.get('/employees/supervisors');
        setSupervisors(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching supervisors:', err);
        setError('Failed to fetch supervisors');
        // Fallback to some default supervisors if the API call fails
        setSupervisors([
          { _id: '1', name: 'Default Supervisor' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSupervisors();
  }, []);
  
  const onSubmit = async (data) => {
    if (!user?._id) {
      toast.error('User information not available');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert the form data to the format expected by the API
      const formattedData = {
        employeeId: user._id,
        date: format(data.date, 'yyyy-MM-dd'),
        checkInTime: `${format(data.date, 'yyyy-MM-dd')}T${data.checkInTime}:00`,
        checkOutTime: `${format(data.date, 'yyyy-MM-dd')}T${data.checkOutTime}:00`,
        reason: data.reason,
        supervisorId: data.supervisor
      };
      
      // Make the API call to submit the missed attendance
      await api.post('/attendance/missed', formattedData);
      
      toast.success('Missed attendance request submitted successfully');
      form.reset();
    } catch (err) {
      console.error('Error submitting missed attendance:', err);
      toast.error(err.response?.data?.message || 'Failed to submit missed attendance request');
    } finally {
      setIsSubmitting(false);
    }
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Report Missed Attendance</CardTitle>
        <CardDescription>
          If you forgot to mark your attendance, fill this form to report your actual working hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date(new Date().setDate(new Date().getDate() - 30))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    You can only report for the last 30 days
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="checkInTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        placeholder="09:00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="checkOutTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        placeholder="17:00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="supervisor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supervisor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your supervisor for verification" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supervisors.map((supervisor) => (
                        <SelectItem 
                          key={supervisor._id || supervisor.id} 
                          value={supervisor._id || supervisor.id}
                        >
                          {supervisor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Your supervisor will verify your work hours
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please explain why you were unable to mark your attendance"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-hrms-blue hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MissedAttendanceForm; 