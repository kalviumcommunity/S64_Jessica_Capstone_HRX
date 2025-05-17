import React from 'react';
import { Link } from 'react-router-dom';
import {
  Check as CheckIcon,
  User as UserIcon,
  Users as UsersIcon,
  Calendar as CalendarDaysIcon,
  DollarSign as DollarSignIcon,
  Star as StarIcon,
  LogIn as LogInIcon,
  ArrowRight as ArrowRightIcon,
  Clock as ClockIcon,
  Linkedin as LinkedinIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/landing/FeatureCard';
import AccessItem from '@/components/landing/AccessItem';
import WorkStep from '@/components/landing/WorkStep';
import TestimonialCard from '@/components/landing/TestimonialCard';
import { motion, useScroll, useTransform } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="relative bg-gradient-to-br from-background to-secondary py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <motion.div 
          className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none z-0"
          style={{ opacity, scale }}
        />
        
        <div className="flex flex-col lg:flex-row items-center">
          <motion.div 
            className="lg:w-1/2 mb-12 lg:mb-0"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Empowering Workplaces. <motion.span 
                className="text-primary"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >Simplifying HR.</motion.span>
            </motion.h1>
            <motion.p 
              className="mt-6 text-xl text-muted-foreground max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              HRX is your all-in-one platform to manage employees, payroll, performance, and more.
            </motion.p>
            <motion.div 
              className="mt-10 flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Link to="/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-md text-lg">
                    <LogInIcon size={20} />
                    Login
                  </Button>
                </motion.div>
              </Link>
              <Link to="/contact">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" className="gap-2 px-8 py-3 rounded-md text-lg border-primary text-primary hover:bg-primary/10">
                    Request Demo
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div 
              className="relative rounded-lg shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="HRX Dashboard"
                className="w-full object-cover rounded-lg"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              <motion.div 
                className="absolute inset-0 bg-primary/10 pointer-events-none rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Key Features Section */}
      <section 
        id="features" 
        className="py-20 px-4 bg-background sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Key Features</h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-xl mx-auto">
              Everything you need to streamline your HR operations
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <FeatureCard 
                icon={<UsersIcon size={40} className="text-primary" />}
                title="Employee Management"
                description="Track employee data, roles, and documents in one secure location."
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <FeatureCard 
                icon={<CalendarDaysIcon size={40} className="text-primary" />}
                title="Leave Tracking"
                description="Manage leave applications, approvals, and balances seamlessly."
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <FeatureCard 
                icon={<ClockIcon size={40} className="text-primary" />}
                title="Attendance Tracking"
                description="Seamlessly manage clock-in/out, mark absences, & monitor staff attendance."
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <FeatureCard 
                icon={<DollarSignIcon size={40} className="text-primary" />}
                title="Payroll Automation"
                description="Generate payslips, manage salaries, and automate tax calculations."
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <FeatureCard 
                icon={<StarIcon size={40} className="text-primary" />}
                title="Performance Reviews"
                description="Set goals, track progress, and conduct structured evaluations."
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Role-Based Access Section */}
      <section 
        id="roles" 
        className="py-20 px-4 bg-background sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Role-Based Access</h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-xl mx-auto">
              Tailored experiences for every role in your organization
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <UsersIcon className="h-10 w-10 text-primary mr-4" />
                    <h3 className="text-2xl font-bold text-foreground">Admin/HR Dashboard</h3>
                  </div>
                  <ul className="space-y-4">
                    <AccessItem text="Add, edit, and delete users" />
                    <AccessItem text="Approve or reject leave requests" />
                    <AccessItem text="Track and monitor employee attendance" />
                    <AccessItem text="Generate and manage payroll" />
                    <AccessItem text="Conduct performance reviews" />
                    <AccessItem text="Set company policies" />
                  </ul>
                  <motion.div 
                    className="mt-8 bg-background p-4 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                      alt="Admin Dashboard" 
                      className="rounded-lg shadow-sm"
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <UserIcon className="h-10 w-10 text-primary mr-4" />
                    <h3 className="text-2xl font-bold text-foreground">Employee Dashboard</h3>
                  </div>
                  <ul className="space-y-4">
                    <AccessItem text="View and update personal profile" />
                    <AccessItem text="Clock in/out and view attendance record" />
                    <AccessItem text="Apply for leave and check balances" />
                    <AccessItem text="View payslips and tax documents" />
                    <AccessItem text="Track performance and goals" />
                    <AccessItem text="Access company resources" />
                  </ul>
                  <motion.div 
                    className="mt-8 bg-background p-4 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                      alt="Employee Dashboard" 
                      className="rounded-lg shadow-sm"
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        id="howitworks" 
        className="py-20 px-4 bg-background sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">How It Works</h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-xl mx-auto">
              Get started with HRX in three simple steps
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-col md:flex-row items-center justify-between gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <WorkStep 
                number="01"
                icon={<LogInIcon size={32} className="text-white" />}
                title="Login Securely" 
                description="Access your account with secure JWT authentication or Google OAuth."
              />
            </motion.div>
            <motion.div 
              className="hidden md:block"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ArrowRightIcon size={40} className="text-primary" />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <WorkStep 
                number="02"
                icon={<UsersIcon size={32} className="text-white" />}
                title="Access Dashboard" 
                description="View your personalized dashboard based on your role in the organization."
              />
            </motion.div>
            <motion.div 
              className="hidden md:block"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <ArrowRightIcon size={40} className="text-primary" />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <WorkStep 
                number="03"
                icon={<StarIcon size={32} className="text-white" />}
                title="Manage Tasks" 
                description="Handle daily tasks, track performance, and manage workflows efficiently."
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose HRX */}
      <section 
        id="whyhrx" 
        className="py-20 px-4 bg-background sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Why Choose HRX</h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-xl mx-auto">
              Modern solutions for modern workplaces
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start">
                  <motion.div 
                    className="bg-primary rounded-full p-2 mr-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckIcon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Secure Authentication</h3>
                    <p className="text-muted-foreground">JWT authentication and Google OAuth integration for maximum security.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start">
                  <motion.div 
                    className="bg-primary rounded-full p-2 mr-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckIcon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Fully Responsive Interface</h3>
                    <p className="text-muted-foreground">Access HRX from any device - desktop, tablet, or mobile phone.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start">
                  <motion.div 
                    className="bg-primary rounded-full p-2 mr-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckIcon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Modern Tech Stack</h3>
                    <p className="text-muted-foreground">Built with React, Tailwind CSS, and Node.js for optimal performance.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start">
                  <motion.div 
                    className="bg-primary rounded-full p-2 mr-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckIcon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Designed for Scalability</h3>
                    <p className="text-muted-foreground">Grows with your organization from startups to enterprise-level businesses.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        id="testimonials" 
        className="py-20 px-4 bg-background sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">What Our Clients Say</h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-xl mx-auto">
              Join hundreds of satisfied companies using HRX
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <TestimonialCard 
                quote="HRX has transformed our HR processes. What used to take days now takes minutes."
                name="Sarah Johnson"
                role="HR Director, TechCorp"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <TestimonialCard 
                quote="The employee dashboard is intuitive and makes managing my information incredibly simple."
                name="Michael Chen"
                role="Software Engineer, Innovation Labs"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <TestimonialCard 
                quote="The payroll automation feature has saved us countless hours and eliminated errors."
                name="Emily Rodriguez"
                role="CFO, GrowthStart Inc."
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 px-4 bg-primary dark:bg-[#0e7c6b] sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Ready to Transform Your HR Management?
          </motion.h2>
          <motion.p 
            className="text-xl text-white/90 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join thousands of organizations that have simplified their HR processes with HRX.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="flex items-center gap-2 bg-white text-primary font-semibold px-8 py-3 rounded-full text-lg shadow-lg transition transform hover:scale-105 hover:bg-primary/10 hover:text-primary-foreground hover:shadow-xl dark:bg-card dark:text-foreground dark:border dark:border-border">
                  <LogInIcon size={20} />
                  Login Now
                </Button>
              </motion.div>
            </Link>
            <Link to="/contact">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="flex items-center gap-2 border-2 border-white text-white font-semibold px-8 py-3 rounded-full text-lg bg-transparent transition transform hover:scale-105 hover:bg-white hover:text-primary hover:shadow-xl dark:border-border dark:text-foreground dark:hover:bg-card dark:hover:text-foreground">
                  Contact Us
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 border-t border-border"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div 
              className="mb-6 md:mb-0"
              variants={fadeInUp}
            >
              <div className="flex items-center">
                <span className="text-2xl font-bold">HR</span>
                <span className="text-2xl font-bold text-primary">X</span>
              </div>
              <p className="mt-2 text-muted-foreground">Empowering workplaces. Simplifying HR.</p>
            </motion.div>
            <motion.div 
              className="flex flex-wrap gap-8"
              variants={fadeInUp}
            >
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#hero" className="text-muted-foreground hover:text-primary transition-colors">Home</a>
                  </li>
                  <li>
                    <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
                  </li>
                  <li>
                    <a href="#roles" className="text-muted-foreground hover:text-primary transition-colors">Access</a>
                  </li>
                  <li>
                    <a href="#howitworks" className="text-muted-foreground hover:text-primary transition-colors">How it works</a>
                  </li>
                  <li>
                    <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">Testimonials</a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Connect</h3>
                <ul className="space-y-2">
                  <li>
                    <motion.a 
                      href="https://www.linkedin.com/in/jessica-agarwal-00b6b7225/"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <LinkedinIcon className="w-4 h-4" />
                      LinkedIn
                    </motion.a>
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
          <motion.div 
            className="border-t border-border mt-12 pt-8 text-center text-muted-foreground flex flex-col gap-2"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <span>
              &copy; {new Date().getFullYear()} HRX. All rights reserved.
            </span>
            <span>
              Made with <motion.span 
                className="text-red-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >❤</motion.span> by Jessica Agarwal
            </span>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
