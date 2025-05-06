import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Your message has been sent!');
      setForm({ name: '', email: '', message: '' });
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow p-8">
        <div className="mb-4 text-center">
          <Link to="/" className="text-primary hover:underline font-medium">
            ← Back to Home
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-primary">Contact Us</h1>
        <p className="text-center text-gray-600 mb-8">We'd love to hear from you! Fill out the form below and our team will get back to you soon.</p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
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
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="How can we help you?"
              className="w-full rounded-md border border-gray-300 p-3 min-h-[120px] focus:border-primary focus:ring-primary text-sm"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Contact; 