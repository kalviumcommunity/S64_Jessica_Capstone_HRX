import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import api from '@/services/apiService';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post('/contact/submit', form);
      
      if (response.data.success) {
        toast.success(response.data.message);
        setForm({ name: '', email: '', message: '' });
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card rounded-xl shadow-lg p-8">
        <div className="mb-4 text-center">
          <Link to="/" className="text-primary hover:underline font-medium">
            ← Back to Home
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-primary">Contact Us</h1>
        <p className="text-center text-muted-foreground mb-8">We'd love to hear from you! Fill out the form below and our team will get back to you soon.</p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Name</label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Email</label>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="How can we help you?"
              className="w-full rounded-md border border-border bg-input text-foreground p-3 min-h-[120px] focus:border-primary focus:ring-primary text-sm"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={submitting}
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Contact; 