import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/apiService';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Plus, Loader2 } from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Schema for leave application form
const leaveFormSchema = z.object({
  leaveType: z.string({
    required_error: "Please select a leave type",
  }),
  startDate: z.date({
    required_error: "Please select a start date",
  }),
  endDate: z.date({
    required_error: "Please select an end date",
  }).refine(
    (endDate) => endDate > new Date(),
    {
      message: "End date cannot be in the past",
    }
  ),
  reason: z.string().min(5, {
    message: "Reason must be at least 5 characters",
  }),
});

const LeaveManagement = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for leave balance
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState(null);
  
  // State for leave history
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  const form = useForm({
    resolver: zodResolver(leaveFormSchema),
  });
  
  // Fetch leave balance
  useEffect(() => {
    const fetchLeaveBalance = async () => {
      if (!user?._id) return;
      
      try {
        setBalanceLoading(true);
        const response = await api.get(`/leaves/balance/${user._id}`);
        
        // Transform the data for display
        const balanceData = [
          { 
            type: 'Annual Leave', 
            used: response.data.annualUsed || 0, 
            total: response.data.annualTotal || 20, 
            remaining: response.data.annual || 0 
          },
          { 
            type: 'Sick Leave', 
            used: response.data.sickUsed || 0, 
            total: response.data.sickTotal || 10, 
            remaining: response.data.sick || 0 
          },
          { 
            type: 'Personal Leave', 
            used: response.data.personalUsed || 0, 
            total: response.data.personalTotal || 5, 
            remaining: response.data.personal || 0 
          }
        ];
        
        setLeaveBalance(balanceData);
        setBalanceError(null);
      } catch (error) {
        console.error('Error fetching leave balance:', error);
        setBalanceError('Failed to fetch leave balance');
      } finally {
        setBalanceLoading(false);
      }
    };
    
    fetchLeaveBalance();
  }, [user]);
  
  // Fetch leave history
  useEffect(() => {
    const fetchLeaveHistory = async () => {
      if (!user?._id) return;
      
      try {
        setHistoryLoading(true);
        const response = await api.get(`/leaves/employee/${user._id}`);
        console.log('Leave history response:', response.data);
        
        // Transform the data for display
        const historyData = response.data.map(leave => {
          const startDate = new Date(leave.startDate);
          const endDate = new Date(leave.endDate);
          const days = differenceInDays(endDate, startDate) + 1;
          
          return {
            id: leave._id,
            type: leave.type,
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            status: leave.status,
            days
          };
        });
        
        setLeaveHistory(historyData);
        setHistoryError(null);
      } catch (error) {
        console.error('Error fetching leave history:', error);
        setHistoryError('Failed to fetch leave history');
      } finally {
        setHistoryLoading(false);
      }
    };
    
    fetchLeaveHistory();
  }, [user]);

  const onSubmit = async (data) => {
    if (!user?._id) {
      toast.error('User information not available');
      return;
    }
    setIsSubmitting(true);
    try {
      // Calculate number of days
      const days = differenceInDays(data.endDate, data.startDate) + 1;
      // Prepare leave data
      const leaveData = {
        employee: user._id,
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        days
      };
      // Submit leave application
      const response = await api.post('/leaves', leaveData);
      if (response.status === 201) {
        toast.success("Leave application submitted successfully!");
        setShowForm(false);
        form.reset();
        // Only refresh after backend confirms save
        await fetchLeaveHistory();
        await fetchLeaveBalance();
      } else {
        toast.error('Failed to submit leave application');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit leave application';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Leave Management</h1>
          <p className="text-muted-foreground">
            Apply for leave and view your leave history.
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className={showForm ? "bg-gray-500" : ""}
          disabled={isSubmitting}
        >
          {showForm ? "Cancel" : <>
            <Plus className="mr-2 h-4 w-4" />
            Apply for Leave
          </>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Leave Application</CardTitle>
            <CardDescription>
              Submit your leave request for approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="leaveType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leave Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select leave type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="annual">Annual Leave</SelectItem>
                          <SelectItem value="sick">Sick Leave</SelectItem>
                          <SelectItem value="personal">Personal Leave</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
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
                                  <span>Pick a date</span>
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
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
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
                                  <span>Pick a date</span>
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
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide details for your leave request"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Leave Balance</CardTitle>
            <CardDescription>Your current leave entitlements</CardDescription>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : balanceError ? (
              <div className="text-center p-8 text-red-500">{balanceError}</div>
            ) : leaveBalance.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No leave balance data available
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Remaining</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveBalance.map((leave) => (
                    <TableRow key={leave.type}>
                      <TableCell>{leave.type}</TableCell>
                      <TableCell>{leave.used}</TableCell>
                      <TableCell>{leave.total}</TableCell>
                      <TableCell>{leave.remaining}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave History</CardTitle>
            <CardDescription>Your recent leave applications</CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : historyError ? (
              <div className="text-center p-8 text-red-500">{historyError}</div>
            ) : leaveHistory.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No leave history available
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveHistory.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>{leave.type}</TableCell>
                      <TableCell>{leave.startDate}</TableCell>
                      <TableCell>{leave.endDate}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {leave.status}
                        </span>
                      </TableCell>
                      <TableCell>{leave.days}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaveManagement; 