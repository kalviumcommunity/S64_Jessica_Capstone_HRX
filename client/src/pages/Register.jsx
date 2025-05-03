import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gray-50">
      <div className="w-full max-w-md mb-6 text-center">
        <div className="flex justify-center items-center mb-2">
          <span className="text-3xl font-bold text-hrms-blue">HRMS</span>
          <span className="text-3xl font-bold text-gray-700">Pro</span>
        </div>
        <p className="text-gray-600">Human Resource Management System</p>
      </div>
      <RegisterForm />
    </div>
  );
};

export default Register; 