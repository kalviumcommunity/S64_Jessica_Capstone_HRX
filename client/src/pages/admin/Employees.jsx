import React, { useState, useEffect } from 'react';
import api from '@/services/apiService';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, UserPlus, Edit, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', department: '', status: 'Active', role: 'employee' });
  const [isAdding, setIsAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', name: '', email: '', department: '', status: 'Active', role: 'employee' });
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch employees when component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/employees');
        setEmployees(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch employees. Please try again later.');
        console.error('Error fetching employees:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);
  
  // Handle delete employee
  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        setEmployees(employees.filter(emp => emp._id !== id && emp.id !== id));
        toast.success('Employee deleted successfully');
      } catch (err) {
        toast.error('Failed to delete employee');
        console.error('Error deleting employee:', err);
      }
    }
  };
  
  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });
  
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await api.post('/employees/create-with-credentials', addForm);
      toast.success('Employee added successfully');
      setDialogOpen(false);
      setAddForm({ name: '', email: '', password: '', department: '', status: 'Active', role: 'employee' });
      // Refresh list
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleEditClick = (employee) => {
    setEditForm({
      id: employee._id || employee.id,
      name: employee.name || '',
      email: employee.email || '',
      department: employee.department || '',
      status: employee.status || 'Active',
      role: employee.role || 'employee',
    });
    setEditDialogOpen(true);
  };
  
  const handleEditEmployee = async (e) => {
    e.preventDefault();
    setIsEditing(true);
    try {
      await api.put(`/employees/${editForm.id}`, {
        name: editForm.name,
        email: editForm.email,
        department: editForm.department,
        status: editForm.status,
        role: editForm.role,
      });
      toast.success('Employee updated successfully');
      setEditDialogOpen(false);
      // Refresh list
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setIsEditing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Employees</h1>
          <p className="text-muted-foreground">
            Manage your company personnel and their information.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Employee</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new employee.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <Input
                placeholder="Full Name"
                value={addForm.name}
                onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <Input
                placeholder="Email"
                type="email"
                value={addForm.email}
                onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                required
              />
              <Input
                placeholder="Password"
                type="password"
                value={addForm.password}
                onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <Input
                placeholder="Department"
                value={addForm.department}
                onChange={e => setAddForm(f => ({ ...f, department: e.target.value }))}
                list="department-options"
              />
              <datalist id="department-options">
                <option value="Engineering" />
                <option value="Design" />
                <option value="Marketing" />
                <option value="HR" />
                <option value="Finance" />
                <option value="Sales" />
              </datalist>
              <Select value={addForm.status} onValueChange={v => setAddForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={addForm.role} onValueChange={v => setAddForm(f => ({ ...f, role: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isAdding}>Cancel</Button>
                <Button type="submit" disabled={isAdding}>{isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select 
          value={departmentFilter} 
          onValueChange={setDepartmentFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={statusFilter} 
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="On Leave">On Leave</SelectItem>
            <SelectItem value="Terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee._id || employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        employee.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : employee.status === 'On Leave'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(employee)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteEmployee(employee._id || employee.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No employees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update the details for this employee.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEmployee} className="space-y-4">
            <Input
              placeholder="Full Name"
              value={editForm.name}
              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              placeholder="Email"
              type="email"
              value={editForm.email}
              onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              placeholder="Department"
              value={editForm.department}
              onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))}
              list="department-options"
            />
            <datalist id="department-options">
              <option value="Engineering" />
              <option value="Design" />
              <option value="Marketing" />
              <option value="HR" />
              <option value="Finance" />
              <option value="Sales" />
            </datalist>
            <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={editForm.role} onValueChange={v => setEditForm(f => ({ ...f, role: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isEditing}>Cancel</Button>
              <Button type="submit" disabled={isEditing}>{isEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeesPage; 