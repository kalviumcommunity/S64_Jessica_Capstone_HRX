import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Download, Eye, Loader2 } from 'lucide-react';
import api from '@/services/apiService';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const PayrollDetails = ({ payrollId }) => {
  const { user } = useAuth();
  const [payrollData, setPayrollData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPayrollData = async () => {
      if (!user?._id) return;
      
      try {
        setIsLoading(true);
        
        // If a specific payroll ID is provided, fetch that payroll
        // Otherwise, fetch the latest payroll for the user
        const endpoint = payrollId 
          ? `/payrolls/${payrollId}` 
          : `/payrolls/employee/${user._id}/latest`;
        
        const response = await api.get(endpoint);
        setPayrollData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching payroll data:', err);
        setError('Failed to fetch payroll data');
        toast.error('Failed to fetch payroll data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayrollData();
  }, [user, payrollId]);
  
  // Format date as Month DD, YYYY
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <Card className="border shadow-md">
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error || !payrollData) {
    return (
      <Card className="border shadow-md">
        <CardContent className="flex justify-center items-center h-64 text-red-500">
          {error || 'No payroll data available'}
        </CardContent>
      </Card>
    );
  }
  
  // Extract month and year from pay period end date
  const payPeriodEnd = new Date(payrollData.payPeriodEnd);
  const month = payPeriodEnd.toLocaleString('default', { month: 'long' });
  const year = payPeriodEnd.getFullYear();
  
  // Calculate totals
  const totalEarnings = (
    (payrollData.basicSalary || 0) +
    (payrollData.houseRentAllowance || 0) +
    (payrollData.conveyanceAllowance || 0) +
    (payrollData.medicalAllowance || 0) +
    (payrollData.specialAllowance || 0)
  );
  
  const totalDeductions = (
    (payrollData.providentFund || 0) +
    (payrollData.professionalTax || 0) +
    (payrollData.incomeTax || 0) +
    (payrollData.lopDeduction || 0)
  );
  
  const netSalary = totalEarnings - totalDeductions;
  
  return (
    <Card className="border shadow-md">
      <CardHeader className="bg-gray-50 border-b pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Salary Slip</CardTitle>
            <CardDescription>
              {month} {year}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Employee Name</div>
              <div className="font-medium">{payrollData.employee?.name || user?.name || 'Employee Name'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Employee ID</div>
              <div className="font-medium">{payrollData.employee?._id || user?._id || 'EMP001'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Pay Date</div>
              <div className="font-medium">{formatDate(payrollData.paymentDate)}</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-green-700">Earnings</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="text-sm">Basic Salary</div>
                  <div className="font-medium">${(payrollData.basicSalary || 0).toFixed(2)}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm">House Rent Allowance</div>
                  <div className="font-medium">${(payrollData.houseRentAllowance || 0).toFixed(2)}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm">Conveyance Allowance</div>
                  <div className="font-medium">${(payrollData.conveyanceAllowance || 0).toFixed(2)}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm">Medical Allowance</div>
                  <div className="font-medium">${(payrollData.medicalAllowance || 0).toFixed(2)}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm">Special Allowance</div>
                  <div className="font-medium">${(payrollData.specialAllowance || 0).toFixed(2)}</div>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-green-700">
                  <div>Total Earnings</div>
                  <div>${totalEarnings.toFixed(2)}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-red-700">Deductions</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="text-sm">Provident Fund</div>
                  <div className="font-medium">${(payrollData.providentFund || 0).toFixed(2)}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm">Professional Tax</div>
                  <div className="font-medium">${(payrollData.professionalTax || 0).toFixed(2)}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm">Income Tax</div>
                  <div className="font-medium">${(payrollData.incomeTax || 0).toFixed(2)}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm">LOP Deduction</div>
                  <div className="font-medium">${(payrollData.lopDeduction || 0).toFixed(2)}</div>
                </div>
                {payrollData.lopDays > 0 && (
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      ({payrollData.lopDays} day{payrollData.lopDays > 1 ? 's' : ''} @ ${(payrollData.lopDeduction / payrollData.lopDays).toFixed(2)}/day)
                    </div>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-red-700">
                  <div>Total Deductions</div>
                  <div>${totalDeductions.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
            <div className="font-semibold text-lg">Net Salary</div>
            <div className="font-bold text-lg">${netSalary.toFixed(2)}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t flex justify-between items-center py-3">
        <div className="text-xs text-muted-foreground">
          <span>*This is a computer-generated payslip and does not require a signature.</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PayrollDetails; 