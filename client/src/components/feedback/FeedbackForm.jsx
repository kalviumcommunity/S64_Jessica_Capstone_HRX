import React, { useState, useEffect } from 'react';
import api from '@/services/apiService';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { MessageSquare, User, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form validation schema
const formSchema = z.object({
  feedback: z.string().min(5, "Feedback must be at least 5 characters"),
  recipient: z.string().min(1, "Recipient is required"),
  isAnonymous: z.boolean(),
  rating: z.string().min(1, "Rating is required"),
});

const FeedbackForm = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feedback: '',
      recipient: '',
      isAnonymous: true,
      rating: '3',
    },
  });
  
  // Fetch employees from the backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/employees');
        setEmployees(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to fetch employees');
        // Fallback to empty array if the API call fails
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);
  
  const onSubmit = async (data) => {
    if (!user?._id && !data.isAnonymous) {
      toast.error('User information not available');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare the feedback data
      const feedbackData = {
        senderId: data.isAnonymous ? null : user._id,
        recipientId: data.recipient,
        content: data.feedback,
        rating: parseInt(data.rating),
        isAnonymous: data.isAnonymous
      };
      
      // Make the API call to submit the feedback
      await api.post('/feedback', feedbackData);
      
      toast.success('Feedback submitted successfully');
      form.reset();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
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
        <CardTitle className="text-lg">Submit Feedback</CardTitle>
        <CardDescription>
          Share your thoughts with your colleagues or department
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hr">HR Department</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem 
                          key={employee._id || employee.id} 
                          value={employee._id || employee.id}
                        >
                          {employee.name} ({employee.department || 'N/A'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select who should receive this feedback
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 - Poor</SelectItem>
                      <SelectItem value="2">2 - Fair</SelectItem>
                      <SelectItem value="3">3 - Average</SelectItem>
                      <SelectItem value="4">4 - Good</SelectItem>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts or suggestions"
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isAnonymous"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Submit anonymously
                    </FormLabel>
                    <FormDescription>
                      Your identity will not be revealed to the recipient
                    </FormDescription>
                  </div>
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
                'Submit Feedback'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm; 