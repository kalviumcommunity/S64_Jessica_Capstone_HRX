import React, { useState } from 'react';
import api from '@/services/apiService';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { addDays, format } from 'date-fns';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form validation schema
const formSchema = z.object({
  resignationReason: z.string().min(1, "Reason is required"),
  lastWorkingDate: z.date({
    required_error: "Last working date is required",
  }),
  feedback: z.string().optional(),
  exitSurvey: z.string().optional(),
});

// Static list of resignation reasons
const resignationReasons = [
  'Better opportunity elsewhere',
  'Career change',
  'Relocation',
  'Family reasons',
  'Health issues',
  'Work environment',
  'Compensation',
  'Other'
];

const ResignationFormModal = ({ children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resignationReason: '',
      lastWorkingDate: addDays(new Date(), 30),
      feedback: '',
      exitSurvey: '',
    },
  });
  
  const onSubmit = async (data) => {
    if (!user?._id) {
      toast.error('User information not available');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format the data for the API
      const resignationData = {
        employeeId: user._id,
        reason: data.resignationReason,
        lastWorkingDate: format(data.lastWorkingDate, 'yyyy-MM-dd'),
        feedback: data.feedback,
        exitSurvey: data.exitSurvey
      };
      
      // Make the API call to submit the resignation
      await api.post('/resignations', resignationData);
      
      toast.success('Resignation submitted successfully');
      setIsOpen(false);
      form.reset();
    } catch (err) {
      console.error('Error submitting resignation:', err);
      toast.error(err.response?.data?.message || 'Failed to submit resignation');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Submit Resignation</DialogTitle>
          <DialogDescription>
            We're sorry to see you go. Please provide details about your resignation.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="resignationReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Resignation</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resignationReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastWorkingDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Last Working Date</FormLabel>
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
                            <span>Select date</span>
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
                        disabled={(date) => date < addDays(new Date(), 14)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Your last working date should be at least 2 weeks from today
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide any additional details or comments about your resignation"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="exitSurvey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exit Survey</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What could we have done better? Your feedback helps us improve."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This information is confidential and will only be used for improvement purposes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-red-500 hover:bg-red-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Resignation'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ResignationFormModal; 