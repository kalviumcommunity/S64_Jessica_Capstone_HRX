import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import api from '@/services/apiService';
import { getFileUrl } from '@/lib/utils';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Building, 
  GraduationCap,
  Wallet,
  CreditCard,
  Landmark,
  Loader2
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  
  // Personal information form state
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: '',
    emergencyPhone: '',
  });
  
  // Professional information form state
  const [professionalInfo, setProfessionalInfo] = useState({
    department: '',
    position: '',
    employeeId: '',
    joinDate: '',
    manager: '',
    workLocation: '',
    workEmail: user?.email || '',
    workPhone: '',
    education: '',
    skills: '',
  });
  
  // Bank information form state
  const [bankInfo, setBankInfo] = useState({
    accountName: user?.name || '',
    accountNumber: '',
    bankName: '',
    branch: '',
    ifscCode: '',
    panCard: '',
    salary: '',
    taxInformation: '',
  });
  
  // Loading states for save operations
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingProfessional, setIsSavingProfessional] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      const userId = user.employeeProfile?.createdBy || user.createdBy || user._id;
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const response = await api.get(`/profile/${userId}`);
        
        // Update personal info
        if (response.data.personal) {
          setPersonalInfo({
            name: response.data.personal.name || user?.name || '',
            email: response.data.personal.email || user?.email || '',
            phone: response.data.personal.phone || '',
            address: response.data.personal.address || '',
            dateOfBirth: response.data.personal.dateOfBirth || '',
            gender: response.data.personal.gender || '',
            emergencyContact: response.data.personal.emergencyContact || '',
            emergencyPhone: response.data.personal.emergencyPhone || '',
          });
        }
        
        // Update professional info
        if (response.data.professional) {
          setProfessionalInfo({
            department: response.data.professional.department || '',
            position: response.data.professional.position || '',
            employeeId: response.data.professional.employeeId || '',
            joinDate: response.data.professional.joinDate || '',
            manager: response.data.professional.manager || '',
            workLocation: response.data.professional.workLocation || '',
            workEmail: response.data.professional.workEmail || user?.email || '',
            workPhone: response.data.professional.workPhone || '',
            education: response.data.professional.education || '',
            skills: response.data.professional.skills || '',
          });
        }
        
        // Update bank info
        if (response.data.bank) {
          setBankInfo({
            accountName: response.data.bank.accountName || user?.name || '',
            accountNumber: response.data.bank.accountNumber || '',
            bankName: response.data.bank.bankName || '',
            branch: response.data.bank.branch || '',
            ifscCode: response.data.bank.ifscCode || '',
            panCard: response.data.bank.panCard || '',
            salary: response.data.bank.salary || '',
            taxInformation: response.data.bank.taxInformation || '',
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to fetch profile data');
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);
  
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProfessionalInfoChange = (e) => {
    const { name, value } = e.target;
    setProfessionalInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBankInfoChange = (e) => {
    const { name, value } = e.target;
    if (name === 'salary') {
      // Remove currency symbol and commas, then convert to number
      const numericValue = value.replace(/[₹,]/g, '');
      setBankInfo(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setBankInfo(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };
  
  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      toast.error('Please select an image to upload');
      return;
    }
    
    try {
      setIsUploadingAvatar(true);
      
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await api.post(`/profile/${user._id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update user object in localStorage with new avatar URL
      if (response.data && response.data.avatarUrl) {
        // Get current user data from localStorage
        const savedUser = localStorage.getItem('hrms_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          // Update avatar URL
          userData.avatar = response.data.avatarUrl;
          // Save updated user data back to localStorage
          localStorage.setItem('hrms_user', JSON.stringify(userData));
          
          // Update user in state (this would refresh the UI)
          if (user) {
            user.avatar = response.data.avatarUrl;
          }
        }
      }
      
      toast.success('Avatar updated successfully');
      setAvatarFile(null);
      
      // Force refresh the page to show the new avatar
      window.location.reload();
    } catch (err) {
      console.error('Error uploading avatar:', err);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };
  
  const handleSavePersonalInfo = async () => {
    try {
      setIsSavingPersonal(true);
      
      await api.put(`/profile/${user._id}/personal`, personalInfo);
      
      toast.success('Personal information updated successfully');
    } catch (err) {
      console.error('Error updating personal information:', err);
      toast.error('Failed to update personal information');
    } finally {
      setIsSavingPersonal(false);
    }
  };
  
  const handleSaveProfessionalInfo = async () => {
    try {
      setIsSavingProfessional(true);
      
      await api.put(`/profile/${user._id}/professional`, professionalInfo);
      
      toast.success('Professional information updated successfully');
    } catch (err) {
      console.error('Error updating professional information:', err);
      toast.error('Failed to update professional information');
    } finally {
      setIsSavingProfessional(false);
    }
  };
  
  const handleSaveBankInfo = async () => {
    try {
      setIsSavingBank(true);
      
      // Format salary as number before sending
      const formattedBankInfo = {
        ...bankInfo,
        salary: bankInfo.salary ? Number(bankInfo.salary) : null
      };
      
      await api.put(`/profile/${user._id}/bank`, formattedBankInfo);
      
      toast.success('Bank information updated successfully');
    } catch (err) {
      console.error('Error updating bank information:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update bank information';
      toast.error(errorMessage);
    } finally {
      setIsSavingBank(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">
          {error}
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={getFileUrl(user?.avatar)} 
                alt={user?.name} 
                onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.svg"; }}
              />
              <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="mt-2 flex flex-col items-center">
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="cursor-pointer"
                  disabled={isUploadingAvatar}
                  onClick={() => document.getElementById('avatar-upload').click()}
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Select Image
                </Button>
              </label>
              {avatarFile && (
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={handleUploadAvatar}
                  disabled={isUploadingAvatar}
                >
                  Upload
                </Button>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-gray-600 capitalize">{user?.role} at HRX</p>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 max-w-md">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="bank">Bank Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="name"
                        name="name"
                        value={personalInfo.name}
                        onChange={handlePersonalInfoChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={personalInfo.email}
                        onChange={handlePersonalInfoChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="phone"
                        name="phone"
                        value={personalInfo.phone}
                        onChange={handlePersonalInfoChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={personalInfo.dateOfBirth}
                        onChange={handlePersonalInfoChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="address"
                      name="address"
                      value={personalInfo.address}
                      onChange={handlePersonalInfoChange}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      value={personalInfo.emergencyContact}
                      onChange={handlePersonalInfoChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="emergencyPhone"
                        name="emergencyPhone"
                        value={personalInfo.emergencyPhone}
                        onChange={handlePersonalInfoChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSavePersonalInfo}
                  disabled={isSavingPersonal}
                >
                  {isSavingPersonal ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="professional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="department"
                        name="department"
                        value={professionalInfo.department}
                        onChange={handleProfessionalInfoChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="position"
                        name="position"
                        value={professionalInfo.position}
                        onChange={handleProfessionalInfoChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      name="employeeId"
                      value={professionalInfo.employeeId}
                      onChange={handleProfessionalInfoChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="joinDate">Join Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="joinDate"
                        name="joinDate"
                        type="date"
                        value={professionalInfo.joinDate}
                        onChange={handleProfessionalInfoChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manager">Manager</Label>
                    <Input
                      id="manager"
                      name="manager"
                      value={professionalInfo.manager}
                      onChange={handleProfessionalInfoChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workLocation">Work Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="workLocation"
                        name="workLocation"
                        value={professionalInfo.workLocation}
                        onChange={handleProfessionalInfoChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workEmail">Work Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="workEmail"
                        name="workEmail"
                        type="email"
                        value={professionalInfo.workEmail}
                        onChange={handleProfessionalInfoChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workPhone">Work Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="workPhone"
                        name="workPhone"
                        value={professionalInfo.workPhone}
                        onChange={handleProfessionalInfoChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="education"
                      name="education"
                      value={professionalInfo.education}
                      onChange={handleProfessionalInfoChange}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <Input
                    id="skills"
                    name="skills"
                    value={professionalInfo.skills}
                    onChange={handleProfessionalInfoChange}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSaveProfessionalInfo}
                  disabled={isSavingProfessional}
                >
                  {isSavingProfessional ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="bank" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="h-5 w-5 mr-2" />
                  Bank Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="accountName"
                        name="accountName"
                        value={bankInfo.accountName}
                        onChange={handleBankInfoChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="accountNumber"
                        name="accountNumber"
                        value={bankInfo.accountNumber}
                        onChange={handleBankInfoChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="bankName"
                        name="bankName"
                        value={bankInfo.bankName}
                        onChange={handleBankInfoChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Input
                      id="branch"
                      name="branch"
                      value={bankInfo.branch}
                      onChange={handleBankInfoChange}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input
                      id="ifscCode"
                      name="ifscCode"
                      value={bankInfo.ifscCode}
                      onChange={handleBankInfoChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="panCard">PAN Card</Label>
                    <Input
                      id="panCard"
                      name="panCard"
                      value={bankInfo.panCard}
                      onChange={handleBankInfoChange}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary</Label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="salary"
                        name="salary"
                        value={bankInfo.salary}
                        onChange={handleBankInfoChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="taxInformation">Tax Information</Label>
                    <Input
                      id="taxInformation"
                      name="taxInformation"
                      value={bankInfo.taxInformation}
                      onChange={handleBankInfoChange}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSaveBankInfo}
                  disabled={isSavingBank}
                >
                  {isSavingBank ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile; 