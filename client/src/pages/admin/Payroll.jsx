import React, { useState, useEffect } from 'react';
import api from '@/services/apiService';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, FileText, Download, Plus, Search, Filter, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminPayroll = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for current payroll
  const [payrollData, setPayrollData] = useState([]);
  const [isLoadingPayroll, setIsLoadingPayroll] = useState(true);
  const [payrollError, setPayrollError] = useState(null);
  
  // State for payroll history
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  
  // State for payroll stats
  const [payrollStats, setPayrollStats] = useState({
    totalPayroll: 0,
    averageSalary: 0,
    employeeCount: 0,
    nextPayDate: '',
    payrollStatus: ''
  });
  
  // State for payroll settings
  const [payrollSettings, setPayrollSettings] = useState({
    defaultPayDay: 'last-working-day',
    taxCalculationMethod: 'progressive',
    emailTemplate: 'standard'
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  
  // State for payroll generation
  const [isGeneratingPayroll, setIsGeneratingPayroll] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Fetch current payroll data
  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        setIsLoadingPayroll(true);
        // Fetch all payrolls for admin view
        const response = await api.get('/payrolls');
        
        // Format the data
        const formattedPayroll = response.data.map(payroll => ({
          id: payroll._id,
          employeeId: payroll.employee?.employeeId || 'N/A',
          name: payroll.employee?.name || 'Unknown',
          designation: payroll.employee?.designation || payroll.employee?.position || 'N/A',
          salary: payroll.netPay || 0,
          payDate: payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'N/A',
          status: payroll.status
        }));
        
        setPayrollData(formattedPayroll);
        setPayrollError(null);
      } catch (err) {
        console.error('Error fetching payroll data:', err);
        setPayrollError('Failed to fetch payroll data');
        toast.error('Failed to fetch payroll data');
      } finally {
        setIsLoadingPayroll(false);
      }
    };
    
    fetchPayrollData();
  }, []);
  
  // Fetch payroll history
  useEffect(() => {
    const fetchPayrollHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const response = await api.get('/payrolls/history');
        
        // Format the data
        const formattedHistory = response.data.map(history => ({
          id: history._id,
          month: new Date(history.periodStart).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
          }),
          totalEmployees: history.employeeCount || 0,
          totalAmount: history.totalAmount || 0,
          processedDate: new Date(history.processedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          status: history.status
        }));
        
        setPayrollHistory(formattedHistory);
        setHistoryError(null);
      } catch (err) {
        console.error('Error fetching payroll history:', err);
        setHistoryError('Failed to fetch payroll history');
        // Don't show toast for this error to avoid multiple error messages
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    fetchPayrollHistory();
  }, []);
  
  // Calculate payroll stats from filtered payroll data
  useEffect(() => {
    if (!isLoadingPayroll && payrollData.length > 0) {
      const totalPayroll = payrollData.reduce((sum, emp) => sum + (emp.salary || 0), 0);
      const averageSalary = totalPayroll / payrollData.length;
      // Find the next pay date (latest pay date in payroll data)
      const payDates = payrollData.map(emp => new Date(emp.payDate)).filter(d => !isNaN(d));
      const nextPayDate = payDates.length > 0 ? new Date(Math.max(...payDates)).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '';
      setPayrollStats(prev => ({
        ...prev,
        totalPayroll,
        averageSalary,
        employeeCount: payrollData.length,
        nextPayDate
      }));
    } else if (!isLoadingPayroll) {
      setPayrollStats(prev => ({ ...prev, totalPayroll: 0, averageSalary: 0, employeeCount: 0, nextPayDate: '' }));
    }
  }, [payrollData, isLoadingPayroll]);
  
  // Fetch payroll settings
  useEffect(() => {
    const fetchPayrollSettings = async () => {
      try {
        setIsLoadingSettings(true);
        const response = await api.get('/payrolls/settings');
        
        setPayrollSettings({
          defaultPayDay: response.data.defaultPayDay || 'last-working-day',
          taxCalculationMethod: response.data.taxCalculationMethod || 'progressive',
          emailTemplate: response.data.emailTemplate || 'standard'
        });
      } catch (err) {
        console.error('Error fetching payroll settings:', err);
        // Don't show error toast for settings to avoid multiple error messages
      } finally {
        setIsLoadingSettings(false);
      }
    };
    
    fetchPayrollSettings();
  }, []);
  
  // Handle payroll generation
  const handleGeneratePayroll = async () => {
    if (window.confirm(`Generate payroll for ${format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}?`)) {
      try {
        setIsGeneratingPayroll(true);
        await api.post('/payrolls', { month: selectedMonth, year: selectedYear });
        toast.success('Payroll generated successfully');
        // Refresh payroll data
        const response = await api.get('/payrolls');
        setPayrollData(response.data);
        // Refresh payroll stats
        const statsResponse = await api.get('/payrolls/stats');
        setPayrollStats({
          totalPayroll: statsResponse.data.totalPayroll || 0,
          averageSalary: statsResponse.data.averageSalary || 0,
          employeeCount: statsResponse.data.employeeCount || 0,
          nextPayDate: new Date(statsResponse.data.nextPayDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          payrollStatus: statsResponse.data.payrollStatus || 'Pending'
        });
      } catch (err) {
        console.error('Error generating payroll:', err);
        toast.error(err.response?.data?.message || 'Failed to generate payroll');
      } finally {
        setIsGeneratingPayroll(false);
      }
    }
  };
  
  // Handle view payslip
  const handleViewPayslip = async (id) => {
    try {
      const response = await api.get(`/payrolls/${id}/payslip`);
      
      // Open payslip in a new window
      const payslipUrl = response.data.payslipUrl;
      window.open(payslipUrl, '_blank');
    } catch (err) {
      console.error('Error viewing payslip:', err);
      toast.error('Failed to view payslip');
    }
  };
  
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
    } catch (err) {
      console.error('Error downloading payslip:', err);
      toast.error('Failed to download payslip');
    }
  };
  
  // Handle download payroll history
  const handleDownloadPayrollHistory = async (id) => {
    try {
      const response = await api.get(`/payrolls/history/${id}/download`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payroll-history-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading payroll history:', err);
      toast.error('Failed to download payroll history');
    }
  };
  
  // Handle save settings
  const handleSaveSettings = async () => {
    try {
      setIsUpdatingSettings(true);
      await api.put('/payrolls/settings', payrollSettings);
      
      toast.success('Payroll settings saved successfully');
    } catch (err) {
      console.error('Error saving payroll settings:', err);
      toast.error('Failed to save payroll settings');
    } finally {
      setIsUpdatingSettings(false);
    }
  };
  
  // Filter payroll data based on search term
  const filteredPayroll = payrollData.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Payroll Management</h1>
        <p className="text-muted-foreground">
          Process and manage employee payroll
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${payrollStats.totalPayroll.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">For {payrollStats.employeeCount} employees</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${payrollStats.averageSalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Per employee</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Next Payroll Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollStats.nextPayDate}</div>
            <p className="text-xs text-muted-foreground mt-1">Status: {payrollStats.payrollStatus}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current Payroll</TabsTrigger>
          <TabsTrigger value="history">Payroll History</TabsTrigger>
          <TabsTrigger value="settings">Payroll Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employee or ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Select value={selectedMonth} onValueChange={v => setSelectedMonth(Number(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i+1} value={i+1}>{format(new Date(2000, i), 'MMMM')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={v => setSelectedYear(Number(v))}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return <SelectItem key={year} value={year}>{year}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleGeneratePayroll}
                disabled={isGeneratingPayroll}
              >
                {isGeneratingPayroll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Payroll
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              {isLoadingPayroll ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : payrollError ? (
                <div className="flex justify-center items-center h-64 text-red-500">
                  {payrollError}
                </div>
              ) : filteredPayroll.length === 0 ? (
                <div className="flex justify-center items-center h-64 text-muted-foreground">
                  No payroll data found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Pay Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayroll.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>{employee.employeeId}</TableCell>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.designation}</TableCell>
                        <TableCell>${employee.salary.toLocaleString()}</TableCell>
                        <TableCell>{employee.payDate}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            employee.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            employee.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {employee.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewPayslip(employee.id)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDownloadPayslip(employee.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
              <CardDescription>View past payroll processing</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : historyError ? (
                <div className="flex justify-center items-center h-64 text-red-500">
                  {historyError}
                </div>
              ) : payrollHistory.length === 0 ? (
                <div className="flex justify-center items-center h-64 text-muted-foreground">
                  No payroll history found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Processed Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollHistory.map((history) => (
                      <TableRow key={history.id}>
                        <TableCell className="font-medium">{history.month}</TableCell>
                        <TableCell>{history.totalEmployees}</TableCell>
                        <TableCell>${history.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>{history.processedDate}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {history.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDownloadPayrollHistory(history.id)}
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
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Settings</CardTitle>
              <CardDescription>Configure general payroll settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingSettings ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Default Pay Day</label>
                      <Select 
                        value={payrollSettings.defaultPayDay}
                        onValueChange={(value) => setPayrollSettings(prev => ({ ...prev, defaultPayDay: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select pay day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last-working-day">Last Working Day</SelectItem>
                          <SelectItem value="last-day">Last Day of Month</SelectItem>
                          <SelectItem value="first-day">1st Day of Next Month</SelectItem>
                          <SelectItem value="custom">Custom Date</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tax Calculation Method</label>
                      <Select 
                        value={payrollSettings.taxCalculationMethod}
                        onValueChange={(value) => setPayrollSettings(prev => ({ ...prev, taxCalculationMethod: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tax method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="progressive">Progressive</SelectItem>
                          <SelectItem value="flat">Flat Rate</SelectItem>
                          <SelectItem value="custom">Custom Rules</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Email Template</label>
                    <Select 
                      value={payrollSettings.emailTemplate}
                      onValueChange={(value) => setPayrollSettings(prev => ({ ...prev, emailTemplate: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select email template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Template</SelectItem>
                        <SelectItem value="detailed">Detailed Template</SelectItem>
                        <SelectItem value="custom">Custom Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSaveSettings}
                      disabled={isUpdatingSettings}
                    >
                      {isUpdatingSettings ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Settings'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPayroll; 