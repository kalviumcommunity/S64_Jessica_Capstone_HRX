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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, FileText, Download, Eye, Trash, Upload, Filter, Loader2 } from 'lucide-react';

const AdminDocuments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  
  // State for documents
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [documentsError, setDocumentsError] = useState(null);
  
  // State for pending approvals
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(true);
  const [approvalsError, setApprovalsError] = useState(null);
  
  // State for document stats
  const [documentStats, setDocumentStats] = useState({
    totalCount: 0,
    storageUsed: '0 MB',
    pendingCount: 0
  });
  
  // State for file upload
  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: '',
    sharedWith: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoadingDocuments(true);
        const response = await api.get('/documents');
        
        // Format the data
        const formattedDocs = response.data.map(doc => ({
          id: doc._id,
          name: doc.name,
          category: doc.category,
          uploadedBy: doc.uploadedBy?.name || 'System',
          date: new Date(doc.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          size: formatFileSize(doc.size),
          shared: doc.sharedWith?.join(', ') || 'None',
          status: doc.status,
          fileUrl: doc.fileUrl
        }));
        
        setDocuments(formattedDocs);
        setDocumentsError(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setDocumentsError('Failed to fetch documents');
        toast.error('Failed to fetch documents');
      } finally {
        setIsLoadingDocuments(false);
      }
    };
    
    fetchDocuments();
  }, []);
  
  // Fetch pending approvals
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        setIsLoadingApprovals(true);
        const response = await api.get('/documents/pending');
        
        // Format the data
        const formattedApprovals = response.data.map(doc => ({
          id: doc._id,
          name: doc.name,
          category: doc.category,
          uploadedBy: doc.uploadedBy?.name || 'Unknown',
          date: new Date(doc.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          size: formatFileSize(doc.size),
          status: doc.status,
          fileUrl: doc.fileUrl
        }));
        
        setPendingApprovals(formattedApprovals);
        setApprovalsError(null);
        
        // Update document stats
        setDocumentStats(prev => ({
          ...prev,
          pendingCount: formattedApprovals.length
        }));
      } catch (err) {
        console.error('Error fetching pending approvals:', err);
        setApprovalsError('Failed to fetch pending approvals');
        // Don't show toast for this error to avoid multiple error messages
      } finally {
        setIsLoadingApprovals(false);
      }
    };
    
    fetchPendingApprovals();
  }, []);
  
  // Fetch document stats
  useEffect(() => {
    const fetchDocumentStats = async () => {
      try {
        const response = await api.get('/documents/stats');
        setDocumentStats({
          totalCount: response.data.totalCount || 0,
          storageUsed: formatFileSize(response.data.storageUsed || 0),
          pendingCount: response.data.pendingCount || 0
        });
      } catch (err) {
        console.error('Error fetching document stats:', err);
        // Don't show error toast for stats to avoid multiple error messages
      }
    };
    
    fetchDocumentStats();
  }, []);
  
  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };
  
  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle document upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (!uploadForm.name || !uploadForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', uploadForm.name);
      formData.append('category', uploadForm.category);
      formData.append('sharedWith', uploadForm.sharedWith);
      
      // Upload the document
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Document uploaded successfully');
      
      // Reset form
      setUploadForm({
        name: '',
        category: '',
        sharedWith: ''
      });
      setSelectedFile(null);
      
      // Refresh documents
      const response = await api.get('/documents');
      setDocuments(response.data);
      
      // Switch to all documents tab
      setActiveTab('all');
    } catch (err) {
      console.error('Error uploading document:', err);
      toast.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle document approval
  const handleApproveDocument = async (id) => {
    try {
      await api.put(`/documents/${id}/approve`);
      toast.success('Document approved successfully');
      
      // Update pending approvals
      setPendingApprovals(prev => prev.filter(doc => doc.id !== id));
      
      // Update document stats
      setDocumentStats(prev => ({
        ...prev,
        pendingCount: prev.pendingCount - 1
      }));
    } catch (err) {
      console.error('Error approving document:', err);
      toast.error('Failed to approve document');
    }
  };
  
  // Handle document rejection
  const handleRejectDocument = async (id) => {
    try {
      await api.put(`/documents/${id}/reject`);
      toast.success('Document rejected successfully');
      
      // Update pending approvals
      setPendingApprovals(prev => prev.filter(doc => doc.id !== id));
      
      // Update document stats
      setDocumentStats(prev => ({
        ...prev,
        pendingCount: prev.pendingCount - 1
      }));
    } catch (err) {
      console.error('Error rejecting document:', err);
      toast.error('Failed to reject document');
    }
  };
  
  // Handle document deletion
  const handleDeleteDocument = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.delete(`/documents/${id}`);
        toast.success('Document deleted successfully');
        
        // Update documents
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        
        // Update document stats
        setDocumentStats(prev => ({
          ...prev,
          totalCount: prev.totalCount - 1
        }));
      } catch (err) {
        console.error('Error deleting document:', err);
        toast.error('Failed to delete document');
      }
    }
  };
  
  // Handle document download
  const handleDownloadDocument = async (id, name) => {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading document:', err);
      toast.error('Failed to download document');
    }
  };
  
  // Handle document view
  const handleViewDocument = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };
  
  // Filter documents based on search and category
  const filteredDocuments = documents.filter(doc => {
    const name = doc.name || '';
    const uploadedBy = doc.uploadedBy || '';
    const category = doc.category || '';
    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Document Management</h1>
        <p className="text-muted-foreground">
          Manage, organize, and share company and employee documents
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{documentStats.totalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{documentStats.storageUsed}</div>
            <p className="text-xs text-muted-foreground mt-1">Of 10 GB total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{documentStats.pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Documents needing review</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals ({documentStats.pendingCount})</TabsTrigger>
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-4">
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="Policy">Policy</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={() => setActiveTab('upload')}>
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              {isLoadingDocuments ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : documentsError ? (
                <div className="flex justify-center items-center h-64 text-red-500">
                  {documentsError}
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="flex justify-center items-center h-64 text-muted-foreground">
                  No documents found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Shared With</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">{doc.name}</span>
                        </TableCell>
                        <TableCell>{doc.category}</TableCell>
                        <TableCell>{doc.uploadedBy}</TableCell>
                        <TableCell>{doc.date}</TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell>{doc.shared}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewDocument(doc.fileUrl)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDownloadDocument(doc.id, doc.name)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <Trash className="h-4 w-4" />
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
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Documents Pending Approval</CardTitle>
              <CardDescription>Review and approve employee document submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingApprovals ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : approvalsError ? (
                <div className="flex justify-center items-center h-64 text-red-500">
                  {approvalsError}
                </div>
              ) : pendingApprovals.length === 0 ? (
                <div className="flex justify-center items-center h-64 text-muted-foreground">
                  No pending approvals
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApprovals.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-orange-500" />
                          <span className="font-medium">{doc.name}</span>
                        </TableCell>
                        <TableCell>{doc.category}</TableCell>
                        <TableCell>{doc.uploadedBy}</TableCell>
                        <TableCell>{doc.date}</TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {doc.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewDocument(doc.fileUrl)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleApproveDocument(doc.id)}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleRejectDocument(doc.id)}
                            >
                              Reject
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
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Document</CardTitle>
              <CardDescription>Upload and share documents with your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop your files here, or click to browse
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button variant="outline" onClick={() => document.getElementById('file-upload').click()}>
                    Select Files
                  </Button>
                  {selectedFile && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>
                
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium">Document Name</label>
                    <Input 
                      placeholder="Enter document name" 
                      name="name"
                      value={uploadForm.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select 
                      value={uploadForm.category}
                      onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Company">Company</SelectItem>
                        <SelectItem value="Policy">Policy</SelectItem>
                        <SelectItem value="Employee">Employee</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Share With</label>
                    <Select
                      value={uploadForm.sharedWith}
                      onValueChange={(value) => setUploadForm(prev => ({ ...prev, sharedWith: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select groups or individuals" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        <SelectItem value="management">Management Only</SelectItem>
                        <SelectItem value="hr">HR Department</SelectItem>
                        <SelectItem value="finance">Finance Department</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Document'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDocuments; 