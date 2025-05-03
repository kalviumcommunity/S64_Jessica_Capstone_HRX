import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Download, Loader2 } from 'lucide-react';
import api from '@/services/apiService';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminAttendance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    present: { count: 0, percentage: 0 },
    late: { count: 0, percentage: 0 },
    absent: { count: 0, percentage: 0 }
  });

  // Fetch attendance data from backend
  useEffect(() => {
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.get('/attendance');
        
        // Format the data for display
        const formattedData = response.data.map(record => {
          // Format date
          const dateObj = new Date(record.date);
          const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          });
          
          // Format times
          const formatTime = (timeString) => {
            if (!timeString) return '';
            const date = new Date(timeString);
            return date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
          };
          
          // Attendance status logic
          let status = 'Absent';
          if (!record.checkIn) {
            status = 'Absent';
          } else {
            const clockIn = new Date(record.checkIn);
            const inHour = clockIn.getHours();
            const inMin = clockIn.getMinutes();
            // Present: clock-in 9:00-9:30
            if (inHour === 9 && inMin >= 0 && inMin <= 30) {
              status = 'Present';
            }
            // Late: clock-in 9:31-11:59
            else if ((inHour === 9 && inMin > 30) || (inHour > 9 && inHour < 12)) {
              status = 'Late';
            } else {
              status = 'Absent';
            }
          }
          
          // Add null checks for employee
          return {
            id: record._id,
            employeeId: record.employee && record.employee._id ? record.employee._id : 'N/A',
            name: record.employee && record.employee.name ? record.employee.name : 'Unknown',
            date: formattedDate,
            rawDate: format(dateObj, 'yyyy-MM-dd'),
            clockIn: formatTime(record.checkIn) || '--:--',
            clockOut: formatTime(record.checkOut) || '--:--',
            status
          };
        });
        
        setAttendanceData(formattedData);
        
        // Calculate statistics
        const total = formattedData.length;
        const presentCount = formattedData.filter(r => r.status === 'Present').length;
        const lateCount = formattedData.filter(r => r.status === 'Late').length;
        const absentCount = formattedData.filter(r => r.status === 'Absent').length;
        
        setStats({
          present: { 
            count: presentCount, 
            percentage: total > 0 ? Math.round((presentCount / total) * 100) : 0 
          },
          late: { 
            count: lateCount, 
            percentage: total > 0 ? Math.round((lateCount / total) * 100) : 0 
          },
          absent: { 
            count: absentCount, 
            percentage: total > 0 ? Math.round((absentCount / total) * 100) : 0 
          }
        });
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setError('Failed to fetch attendance data');
        toast.error('Failed to fetch attendance data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttendanceData();
  }, []);

  // Filter attendance data
  const filteredData = attendanceData.filter(record => {
    const matchesSearch = 
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    const matchesDate = !dateFilter || record.rawDate === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Attendance Management</h1>
        <p className="text-muted-foreground">
          Track and manage employee attendance records
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary Stats</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-600">Present</p>
                <p className="text-3xl font-bold text-green-700">{stats.present.percentage}%</p>
                <p className="text-sm text-green-600">{stats.present.count} Employees</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-600">Late</p>
                <p className="text-3xl font-bold text-yellow-700">{stats.late.percentage}%</p>
                <p className="text-sm text-yellow-600">{stats.late.count} Employees</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-red-600">Absent</p>
                <p className="text-3xl font-bold text-red-700">{stats.absent.percentage}%</p>
                <p className="text-sm text-red-600">{stats.absent.count} Employees</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employee name or ID..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-4">
          <div className="w-[200px]">
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Late">Late</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Half Day">Half Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <input
            type="date"
            className="border rounded px-2 py-1 ml-2"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            style={{ height: '36px' }}
          />
          
          <Button variant="outline" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center p-8 text-red-500">{error}</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No attendance records found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.employeeId}</TableCell>
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.clockIn}</TableCell>
                    <TableCell>{record.clockOut}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'Present' 
                          ? 'bg-green-100 text-green-800' 
                          : record.status === 'Late'
                            ? 'bg-yellow-100 text-yellow-800'
                            : record.status === 'Half Day'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAttendance; 