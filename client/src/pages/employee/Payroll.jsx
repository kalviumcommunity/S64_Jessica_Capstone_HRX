import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, DollarSign, Wallet, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/apiService';
import { toast } from 'sonner';

const Payroll = () => {
  const { user } = useAuth();
  
  // State for current payroll
  const [currentPayroll, setCurrentPayroll] = useState(null);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true);
  const [currentError, setCurrentError] = useState(null);
  
  // State for payslip history
  const [payslipHistory, setPayslipHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  
  // State for YTD earnings
  const [ytdEarnings, setYtdEarnings] = useState(0);
  
  // State for bank details
  const [bankDetails, setBankDetails] = useState(null);
  const [isLoadingBank, setIsLoadingBank] = useState(true);
  const [bankError, setBankError] = useState(null);
  
  // Fetch current payroll data
  useEffect(() => {
    const fetchCurrentPayroll = async () => {
      const employeeId = user.employeeProfile?.createdBy || user.createdBy || user._id;
      if (!employeeId) return;
      
      try {
        setIsLoadingCurrent(true);
        const response = await api.get(`/payrolls/employee/${employeeId}`);
        
        // Sort by date (newest first) and get the most recent
        const sortedPayrolls = response.data.sort(
          (a, b) => new Date(b.payPeriodEnd) - new Date(a.payPeriodEnd)
        );
        
        const latestPayroll = sortedPayrolls[0] || null;
        
        if (latestPayroll) {
          // Format the data
          const month = new Date(latestPayroll.payPeriodEnd).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          });
          
          const payDate = new Date(latestPayroll.paymentDate || latestPayroll.payPeriodEnd).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });
          
          setCurrentPayroll({
            id: latestPayroll._id, // Add the ID for download functionality
            month,
            basic: latestPayroll.basicSalary || 0,
            allowances: latestPayroll.allowances || 0,
            bonus: latestPayroll.bonus || 0,
            overtime: latestPayroll.overtime || 0,
            tax: latestPayroll.tax || 0,
            insurance: latestPayroll.insurance || 0,
            netPay: latestPayroll.netPay || 0,
            payDate,
            status: latestPayroll.status || 'Pending'
          });
        }
        
        setCurrentError(null);
      } catch (err) {
        console.error('Error fetching current payroll:', err);
        setCurrentError('Failed to fetch current payroll data');
      } finally {
        setIsLoadingCurrent(false);
      }
    };
    
    fetchCurrentPayroll();
  }, [user]);
  
  // Fetch payslip history
  useEffect(() => {
    const fetchPayslipHistory = async () => {
      const employeeId = user.employeeProfile?.createdBy || user.createdBy || user._id;
      if (!employeeId) return;
      
      try {
        setIsLoadingHistory(true);
        const response = await api.get(`/payrolls/employee/${employeeId}/history`);
        
        // Format the data
        const formattedHistory = response.data.map(payslip => {
          const month = new Date(payslip.payPeriodEnd).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          });
          
          const issueDate = new Date(payslip.paymentDate || payslip.payPeriodEnd).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });
          
          return {
            id: payslip._id,
            month,
            netPay: payslip.netPay || 0,
            issueDate,
            status: payslip.status || 'Pending'
          };
        });
        
        setPayslipHistory(formattedHistory);
        
        // Calculate YTD earnings
        const currentYear = new Date().getFullYear();
        const ytdPayslips = response.data.filter(payslip => 
          new Date(payslip.payPeriodEnd).getFullYear() === currentYear
        );
        
        const totalYtd = ytdPayslips.reduce((total, payslip) => total + (payslip.netPay || 0), 0);
        setYtdEarnings(totalYtd);
        
        setHistoryError(null);
      } catch (err) {
        console.error('Error fetching payslip history:', err);
        setHistoryError('Failed to fetch payslip history');
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    fetchPayslipHistory();
  }, [user]);
  
  // Fetch bank details
  useEffect(() => {
    const fetchBankDetails = async () => {
      // Log user data to see what we're working with
      console.log('User data:', user);
      
      // Get the correct ID - try all possible paths
      const userId = user?.employeeProfile?.createdBy || user?.createdBy || user?._id;
      if (!userId) {
        console.error('No user ID available:', user);
        return;
      }
      
      try {
        setIsLoadingBank(true);
        
        // First get the employee data
        const employeeResponse = await api.get(`/employees/by-user/${userId}`);
        console.log('Employee response:', employeeResponse.data);
        
        // Set bank details from employee data
        setBankDetails({
          bankName: employeeResponse.data.bankName || 'National Bank',
          accountNumber: employeeResponse.data.accountNumber || '**** **** **** 1234',
          accountHolder: employeeResponse.data.name || user?.name || 'Employee'
        });
        setBankError(null);
      } catch (err) {
        console.error('Error fetching bank details:', err);
        setBankError('Failed to fetch bank details');
        
        // Set default bank details if API fails
        setBankDetails({
          bankName: 'National Bank',
          accountNumber: '**** **** **** 1234',
          accountHolder: user?.name || 'Employee'
        });
      } finally {
        setIsLoadingBank(false);
      }
    };
    
    fetchBankDetails();
  }, [user]);
  
  // Handle download payslip
  const handleDownloadPayslip = async (id) => {
    try {
      const response = await api.get(`/payrolls/${id}/download`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success('Payslip downloaded successfully');
    } catch (err) {
      console.error('Error downloading payslip:', err);
      toast.error('Failed to download payslip');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">My Payroll</h1>
        <p className="text-muted-foreground">
          View your salary details and download payslips
        </p>
      </div>

      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current Month</TabsTrigger>
          <TabsTrigger value="history">Payslip History</TabsTrigger>
          <TabsTrigger value="bank">Bank Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-6">
          {isLoadingCurrent ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : currentError ? (
            <div className="text-center text-red-500 py-4">{currentError}</div>
          ) : !currentPayroll ? (
            <div className="text-center text-muted-foreground py-4">
              No current payroll data available
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Net Salary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${currentPayroll.netPay.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">For {currentPayroll.month}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Pay Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currentPayroll.payDate}</div>
                    <p className="text-xs text-muted-foreground mt-1">Status: {currentPayroll.status}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">YTD Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${ytdEarnings.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date().toLocaleDateString('en-US', { month: 'short' })} - {new Date().getFullYear()}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Salary Breakdown</CardTitle>
                  <CardDescription>For {currentPayroll.month}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Earnings</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Basic Salary</span>
                          <span className="text-sm font-medium">${currentPayroll.basic.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Allowances</span>
                          <span className="text-sm font-medium">${currentPayroll.allowances.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Bonus</span>
                          <span className="text-sm font-medium">${currentPayroll.bonus.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Overtime</span>
                          <span className="text-sm font-medium">${currentPayroll.overtime.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm font-semibold">Total Earnings</span>
                          <span className="text-sm font-semibold">
                            ${(currentPayroll.basic + currentPayroll.allowances + currentPayroll.bonus + currentPayroll.overtime).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Deductions</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Tax</span>
                          <span className="text-sm font-medium">${currentPayroll.tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Insurance</span>
                          <span className="text-sm font-medium">${currentPayroll.insurance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm font-semibold">Total Deductions</span>
                          <span className="text-sm font-semibold">
                            ${(currentPayroll.tax + currentPayroll.insurance).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-8 pt-4 border-t">
                    <span className="font-bold">Net Pay</span>
                    <span className="font-bold">${currentPayroll.netPay.toLocaleString()}</span>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      onClick={() => handleDownloadPayslip(currentPayroll.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Payslip
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payslip History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : historyError ? (
                <div className="text-center text-red-500 py-4">{historyError}</div>
              ) : payslipHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No payslip history available
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payslipHistory.map((payslip) => (
                      <TableRow key={payslip.id}>
                        <TableCell>{payslip.month}</TableCell>
                        <TableCell>${payslip.netPay.toLocaleString()}</TableCell>
                        <TableCell>{payslip.issueDate}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payslip.status === 'Paid' ? 'bg-green-100 text-green-800' :
                            payslip.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payslip.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled={payslip.status !== 'Paid'}
                            onClick={() => handleDownloadPayslip(payslip.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>Bank Information</CardTitle>
              <CardDescription>Your salary will be transferred to this account</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBank ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : bankError ? (
                <div className="text-center text-red-500 py-4">{bankError}</div>
              ) : !bankDetails ? (
                <div className="text-center text-muted-foreground py-4">
                  No bank details available
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg flex items-start gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{bankDetails.bankName}</p>
                      <p className="text-sm text-muted-foreground">Account Number: {bankDetails.accountNumber}</p>
                      <p className="text-sm text-muted-foreground">Account Holder: {bankDetails.accountHolder}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>To update your bank information, please contact the HR department.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payroll; 