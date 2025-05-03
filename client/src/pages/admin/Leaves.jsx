import React, { useState, useEffect } from 'react';
import api from '@/services/apiService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Check, X, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

const LeaveRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // State for leave requests
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch leave requests
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/leaves');
        
        // Format the data
        const formattedRequests = response.data.map(leave => ({
          id: leave._id,
          employee: leave.employee?.name || 'Unknown',
          employeeId: leave.employee?._id || '',
          type: leave.type || 'Unknown',
          startDate: new Date(leave.startDate).toISOString().split('T')[0],
          endDate: new Date(leave.endDate).toISOString().split('T')[0],
          days: leave.days || 0,
          reason: leave.reason || '',
          status: leave.status || 'Pending'
        }));
        
        setLeaveRequests(formattedRequests);
        setError(null);
      } catch (err) {
        console.error('Error fetching leave requests:', err);
        setError('Failed to fetch leave requests');
        toast.error('Failed to fetch leave requests');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaveRequests();
  }, []);
  
  // Filter leave requests based on search and filters
  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = 
      request.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };
  
  const handleApprove = async () => {
    try {
      await api.put(`/leaves/${selectedRequest.id}/approve`, { status: 'Approved' });
      // Update the local state
      setLeaveRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: 'Approved' } 
            : req
        )
      );
      setDialogOpen(false);
      toast.success(`Leave request for ${selectedRequest.employee} has been approved`);
    } catch (err) {
      console.error('Error approving leave request:', err);
      toast.error('Failed to approve leave request');
    }
  };
  
  const handleReject = async () => {
    try {
      await api.put(`/leaves/${selectedRequest.id}/reject`, { status: 'Rejected' });
      // Update the local state
      setLeaveRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: 'Rejected' } 
            : req
        )
      );
      setDialogOpen(false);
      toast.success(`Leave request for ${selectedRequest.employee} has been rejected`);
    } catch (err) {
      console.error('Error rejecting leave request:', err);
      toast.error('Failed to reject leave request');
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Leave Requests
        </h1>
        <p className="text-muted-foreground">
          Manage employee leave applications.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employee or leave type..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select 
          value={statusFilter} 
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-red-500">
              {error}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.employee}</TableCell>
                      <TableCell>{request.type}</TableCell>
                      <TableCell>{request.startDate}</TableCell>
                      <TableCell>{request.endDate}</TableCell>
                      <TableCell>{request.days}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          request.status === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : request.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No leave requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedRequest && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Leave Request Details</DialogTitle>
              <DialogDescription>
                Review the leave request information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee:</span>
                <span className="font-medium">{selectedRequest.employee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Leave Type:</span>
                <span>{selectedRequest.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period:</span>
                <span>{selectedRequest.startDate} to {selectedRequest.endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span>{selectedRequest.days} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reason:</span>
                <span>{selectedRequest.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  selectedRequest.status === 'Approved' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedRequest.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {selectedRequest.status}
                </span>
              </div>
            </div>
            <DialogFooter>
              {selectedRequest.status === 'Pending' && (
                <>
                  <Button variant="outline" onClick={handleReject}>
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button onClick={handleApprove}>
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default LeaveRequests; 