import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Upload, Eye, FileUp, Loader2, AlertCircle, Trash } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/apiService';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { getFileUrl } from '@/lib/utils';

const Documents = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  // State for personal documents
  const [personalDocuments, setPersonalDocuments] = useState([]);
  const [isLoadingPersonal, setIsLoadingPersonal] = useState(true);
  const [personalError, setPersonalError] = useState(null);
  
  // State for payroll documents
  const [payrollDocuments, setPayrollDocuments] = useState([]);
  const [isLoadingPayroll, setIsLoadingPayroll] = useState(true);
  const [payrollError, setPayrollError] = useState(null);
  
  // State for company documents
  const [companyDocuments, setCompanyDocuments] = useState([]);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [companyError, setCompanyError] = useState(null);
  
  // State for document upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // Add state for category
  const [category, setCategory] = useState('personal');
  
  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  
  // Fetch personal documents
  useEffect(() => {
    const fetchPersonalDocuments = async () => {
      if (!user?._id) return;
      
      try {
        setIsLoadingPersonal(true);
        const response = await api.get(`/documents/employee/${user._id}/personal`);
        
        const formattedDocs = response.data.map(doc => ({
          id: doc._id,
          name: doc.name,
          uploadedBy: doc.uploadedBy,
          date: new Date(doc.uploadDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
          size: formatFileSize(doc.size)
        }));
        
        setPersonalDocuments(formattedDocs);
        setPersonalError(null);
      } catch (err) {
        console.error('Error fetching personal documents:', err);
        setPersonalError('Failed to fetch personal documents');
      } finally {
        setIsLoadingPersonal(false);
      }
    };
    
    fetchPersonalDocuments();
  }, [user]);
  
  // Fetch payroll documents
  useEffect(() => {
    const fetchPayrollDocuments = async () => {
      if (!user?._id) return;
      
      try {
        setIsLoadingPayroll(true);
        const response = await api.get(`/documents/employee/${user._id}/payroll`);
        
        const formattedDocs = response.data.map(doc => ({
          id: doc._id,
          name: doc.name,
          uploadedBy: doc.uploadedBy || 'Payroll System',
          date: new Date(doc.uploadDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
          size: formatFileSize(doc.size)
        }));
        
        setPayrollDocuments(formattedDocs);
        setPayrollError(null);
      } catch (err) {
        console.error('Error fetching payroll documents:', err);
        setPayrollError('Failed to fetch payroll documents');
      } finally {
        setIsLoadingPayroll(false);
      }
    };
    
    fetchPayrollDocuments();
  }, [user]);
  
  // Fetch company documents
  useEffect(() => {
    const fetchCompanyDocuments = async () => {
      if (!user?._id) return;
      
      try {
        setIsLoadingCompany(true);
        const response = await api.get('/documents/company');
        
        const formattedDocs = response.data.map(doc => ({
          id: doc._id,
          name: doc.name,
          uploadedBy: doc.uploadedBy,
          date: new Date(doc.uploadDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
          size: formatFileSize(doc.size)
        }));
        
        setCompanyDocuments(formattedDocs);
        setCompanyError(null);
      } catch (err) {
        console.error('Error fetching company documents:', err);
        setCompanyError('Failed to fetch company documents');
      } finally {
        setIsLoadingCompany(false);
      }
    };
    
    fetchCompanyDocuments();
  }, [user]);
  
  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };
  
  // Handle file drop
  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
  };
  
  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  // Handle upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('documents', file);
      });
      
      // In handleUpload, add category to formData
      formData.append('category', category);
      
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      toast.success('Documents uploaded successfully');
      setSelectedFiles([]);
      
      // Refresh personal documents
      const personalResponse = await api.get(`/documents/employee/${user._id}/personal`);
      const formattedDocs = personalResponse.data.map(doc => ({
        id: doc._id,
        name: doc.name,
        uploadedBy: doc.uploadedBy,
        date: new Date(doc.uploadDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        size: formatFileSize(doc.size)
      }));
      
      setPersonalDocuments(formattedDocs);
      
    } catch (err) {
      console.error('Error uploading documents:', err);
      toast.error('Failed to upload documents');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle document view
  const handleViewDocument = async (id) => {
    try {
      const response = await api.get(`/documents/${id}/view`, {
        responseType: 'blob'
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Open in a new tab
      window.open(url, '_blank');
      
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error viewing document:', err);
      toast.error('Failed to view document');
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
      
      toast.success('Document downloaded successfully');
    } catch (err) {
      console.error('Error downloading document:', err);
      toast.error('Failed to download document');
    }
  };

  // Add delete handler
  const handleDeleteDocument = async (id, category) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.delete(`/documents/${id}`);
        toast.success('Document deleted successfully');
        // Remove from relevant state
        if (category === 'personal') {
          setPersonalDocuments(prev => prev.filter(doc => doc.id !== id));
        } else if (category === 'payroll') {
          setPayrollDocuments(prev => prev.filter(doc => doc.id !== id));
        } else if (category === 'company') {
          setCompanyDocuments(prev => prev.filter(doc => doc.id !== id));
        }
      } catch (err) {
        console.error('Error deleting document:', err);
        toast.error('Failed to delete document');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Documents</h1>
        <p className="text-muted-foreground">
          View and manage your personal and company documents
        </p>
      </div>

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">Personal Documents</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Documents</TabsTrigger>
          <TabsTrigger value="company">Company Documents</TabsTrigger>
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Documents</CardTitle>
              <CardDescription>Your employment-related documents</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPersonal ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : personalError ? (
                <div className="text-center text-red-500 py-4">{personalError}</div>
              ) : personalDocuments.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No personal documents available
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personalDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">{doc.name}</span>
                        </TableCell>
                        <TableCell>{doc.uploadedBy}</TableCell>
                        <TableCell>{doc.date}</TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewDocument(doc.id)}
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
                              onClick={() => handleDeleteDocument(doc.id, 'personal')}
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
        
        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Documents</CardTitle>
              <CardDescription>Your payslips and tax documents</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPayroll ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : payrollError ? (
                <div className="text-center text-red-500 py-4">{payrollError}</div>
              ) : payrollDocuments.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No payroll documents available
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Generated By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-green-500" />
                          <span className="font-medium">{doc.name}</span>
                        </TableCell>
                        <TableCell>{doc.uploadedBy}</TableCell>
                        <TableCell>{doc.date}</TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewDocument(doc.id)}
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
                              onClick={() => handleDeleteDocument(doc.id, 'payroll')}
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
        
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Documents</CardTitle>
              <CardDescription>Company-wide policies and handbooks</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCompany ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : companyError ? (
                <div className="text-center text-red-500 py-4">{companyError}</div>
              ) : companyDocuments.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No company documents available
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-purple-500" />
                          <span className="font-medium">{doc.name}</span>
                        </TableCell>
                        <TableCell>{doc.uploadedBy}</TableCell>
                        <TableCell>{doc.date}</TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewDocument(doc.id)}
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
                              onClick={() => handleDeleteDocument(doc.id, 'company')}
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
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>Upload personal documents for HR review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Document Category</label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  disabled={isUploading}
                >
                  <option value="personal">Personal</option>
                  <option value="payroll">Payroll</option>
                  <option value="company">Company</option>
                </select>
              </div>
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center"
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
              >
                <div className="mx-auto flex flex-col items-center justify-center">
                  <FileUp className="h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="font-medium mb-1">
                    {selectedFiles.length > 0 
                      ? `${selectedFiles.length} file(s) selected` 
                      : 'Drag and drop files here'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedFiles.length > 0 
                      ? selectedFiles.map(f => f.name).join(', ') 
                      : 'or click to browse files'}
                  </p>
                  
                  {isUploading && (
                    <div className="w-full mb-4">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploading: {uploadProgress}%
                      </p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                    
                    {selectedFiles.length > 0 && (
                      <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <FileUp className="h-4 w-4 mr-2" />
                        )}
                        Upload
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Upload Guidelines</h3>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                  <li>Maximum file size: 10MB</li>
                  <li>Accepted file types: PDF, JPG, PNG, DOCX</li>
                  <li>Please ensure documents are clear and legible</li>
                  <li>For certificates, include both sides if necessary</li>
                  <li>Documents uploaded will be reviewed by HR before being approved</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documents; 