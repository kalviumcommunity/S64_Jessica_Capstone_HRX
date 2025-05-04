import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Lock, Bell, Shield, Moon, Sun, Languages, Smartphone, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ui/theme-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import api from '@/services/apiService';
import { getFileUrl } from '@/lib/utils';

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const [error, setError] = useState(null);
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: '',
    position: '',
    joinDate: '',
  });
  
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    loginNotifications: false,
  });
  
  const [notificationPrefs, setNotificationPrefs] = useState({
    leaveRequests: false,
    performanceReviews: false,
    payrollUpdates: false,
    companyAnnouncements: false,
    pushNotifications: false,
    attendanceReminders: false,
  });
  
  const [appPrefs, setAppPrefs] = useState({
    darkMode: false,
    systemLanguage: false,
    highContrast: false,
    reducedMotion: false,
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  useEffect(() => {
    setAppPrefs(prev => ({
      ...prev,
      darkMode: theme === 'dark'
    }));
    // eslint-disable-next-line
  }, [theme]);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      const userId = user.employeeProfile?.createdBy || user.createdBy || user._id;
      if (!userId) return;
      try {
        setIsLoading(true);
        const response = await api.get(`/profile/${userId}`);
        setProfile({
          name: response.data.personal.name || '',
          email: response.data.personal.email || '',
          phone: response.data.personal.phone || '',
          department: response.data.professional.department || '',
          position: response.data.professional.position || '',
          joinDate: response.data.professional.joinDate || '',
        });
        setError(null);
      } catch (err) {
        setError('Failed to load profile data');
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);
  
  useEffect(() => {
    const fetchSettings = async () => {
      const userId = user.employeeProfile?.createdBy || user.createdBy || user._id;
      if (!userId) {
        setError('User ID not found');
        toast.error('User ID not found');
        return;
      }
      try {
        setIsLoading(true);
        
        const profileResponse = await api.get(`/settings/${userId}/profile`);
        if (!profileResponse.data) {
          throw new Error('No profile data received');
        }

        // Check if user has required role
        // (Removed: allow all users to access their settings)
        
        // Support new backend structure for HR/admins
        if (profileResponse.data.personal && profileResponse.data.professional) {
          setProfile({
            name: profileResponse.data.personal.name || user?.name || '',
            email: profileResponse.data.personal.email || user?.email || '',
            phone: profileResponse.data.personal.phone || '',
            department: profileResponse.data.professional.department || '',
            position: profileResponse.data.professional.position || '',
            joinDate: profileResponse.data.professional.joinDate || '',
            employeeId: profileResponse.data.employeeId || '',
          });
        } else {
          setProfile({
            name: profileResponse.data.name || user?.name || '',
            email: profileResponse.data.email || user?.email || '',
            phone: profileResponse.data.phone || '',
            department: profileResponse.data.department || '',
            position: profileResponse.data.position || '',
            joinDate: profileResponse.data.joinDate || '',
            employeeId: profileResponse.data.employeeId || '',
          });
        }
        
        const securityResponse = await api.get(`/settings/${userId}/security`);
        setSecurity({
          twoFactorEnabled: securityResponse.data.twoFactorEnabled || false,
          loginNotifications: securityResponse.data.loginNotifications || false,
        });
        
        const notificationResponse = await api.get(`/settings/${userId}/notifications`);
        setNotificationPrefs({
          leaveRequests: notificationResponse.data.leaveRequests || false,
          performanceReviews: notificationResponse.data.performanceReviews || false,
          payrollUpdates: notificationResponse.data.payrollUpdates || false,
          companyAnnouncements: notificationResponse.data.companyAnnouncements || false,
          pushNotifications: notificationResponse.data.pushNotifications || false,
          attendanceReminders: notificationResponse.data.attendanceReminders || false,
        });
        
        const preferencesResponse = await api.get(`/settings/${userId}/preferences`);
        setAppPrefs({
          darkMode: preferencesResponse.data.darkMode || false,
          systemLanguage: preferencesResponse.data.systemLanguage || false,
          highContrast: preferencesResponse.data.highContrast || false,
          reducedMotion: preferencesResponse.data.reducedMotion || false,
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching settings:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load settings';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [user]);
  
  const handleProfileChange = (e) => {
    const { id, value } = e.target;
    setProfile(prev => ({ ...prev, [id]: value }));
  };
  
  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    const fieldName = id.replace('-', '');
    setPasswordData(prev => ({ ...prev, [fieldName]: value }));
  };
  
  const handleSecurityToggle = (key) => {
    setSecurity(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleNotificationToggle = (key) => {
    setNotificationPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handlePrefToggle = (key) => {
    const newValue = !appPrefs[key];
    setAppPrefs(prev => ({ ...prev, [key]: newValue }));
    
    if (key === 'darkMode') {
      // Update theme in theme provider and localStorage
      setTheme(newValue ? 'dark' : 'light');
      localStorage.setItem('hrms-theme', newValue ? 'dark' : 'light');
    }
  };
  
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };
  
  const handleAvatarUpload = async () => {
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
        const savedUser = localStorage.getItem('hrms_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          userData.avatar = response.data.avatarUrl;
          localStorage.setItem('hrms_user', JSON.stringify(userData));
          if (user) {
            user.avatar = response.data.avatarUrl;
          }
        }
      }
      toast.success('Avatar updated successfully');
      setAvatarFile(null);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };
  
  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      
      await api.put(`/settings/${user._id}/profile`, profile);
      
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };
  
  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    
    try {
      setIsSavingSecurity(true);
      
      await api.put(`/settings/${user._id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      toast.success('Password updated successfully');
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('Error updating password:', err);
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSavingSecurity(false);
    }
  };
  
  const handleSaveSecurity = async () => {
    try {
      setIsSavingSecurity(true);
      
      await api.put(`/settings/${user._id}/security`, security);
      
      toast.success('Security settings updated successfully');
    } catch (err) {
      console.error('Error updating security settings:', err);
      toast.error('Failed to update security settings');
    } finally {
      setIsSavingSecurity(false);
    }
  };
  
  const handleSaveNotifications = async () => {
    try {
      setIsSavingNotifications(true);
      
      await api.put(`/settings/${user._id}/notifications`, notificationPrefs);
      
      toast.success('Notification preferences updated successfully');
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      toast.error('Failed to update notification preferences');
    } finally {
      setIsSavingNotifications(false);
    }
  };
  
  const handleSavePreferences = async () => {
    try {
      setIsSavingPreferences(true);
      
      await api.put(`/settings/${user._id}/preferences`, appPrefs);
      
      toast.success('App preferences updated successfully');
    } catch (err) {
      console.error('Error updating app preferences:', err);
      toast.error('Failed to update app preferences');
    } finally {
      setIsSavingPreferences(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
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
    );
  }
  
  return (
    <div className="space-y-6 transition-colors duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Account Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 max-w-md">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-start">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage 
                      src={user?.avatar ? getFileUrl(user.avatar) : '/placeholder.svg'} 
                      alt={profile.name} 
                      onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.svg"; }}
                    />
                    <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center">
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      ref={fileInputRef}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Select Image
                    </Button>
                    
                    {avatarFile && (
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={handleAvatarUpload}
                        disabled={isUploadingAvatar}
                      >
                        Upload
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-4 flex-1">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Your name" 
                      value={profile.name}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Your email" 
                      value={profile.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      placeholder="Your phone number" 
                      value={profile.phone}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Input 
                    id="department" 
                    placeholder="Department" 
                    value={profile.department} 
                    onChange={handleProfileChange}
                    readOnly={user.role === 'employee'}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="position">Position</Label>
                  <Input 
                    id="position" 
                    placeholder="Job Position" 
                    value={profile.position} 
                    onChange={handleProfileChange}
                    readOnly={user.role === 'employee'}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="joinDate">Join Date</Label>
                  <Input 
                    id="joinDate" 
                    placeholder="Join Date" 
                    type="date"
                    value={profile.joinDate ? new Date(profile.joinDate).toISOString().slice(0,10) : ''}
                    onChange={handleProfileChange}
                    readOnly={user.role === 'employee'}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>Update your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                </div>
                
                <Button 
                  className="mt-2"
                  onClick={handleUpdatePassword}
                  disabled={isSavingSecurity}
                >
                  {isSavingSecurity ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Update Password
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div>Two-factor authentication</div>
                    <div className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </div>
                  </div>
                  <Switch 
                    checked={security.twoFactorEnabled}
                    onCheckedChange={() => handleSecurityToggle('twoFactorEnabled')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div>Login notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive notifications for new login attempts
                    </div>
                  </div>
                  <Switch 
                    checked={security.loginNotifications}
                    onCheckedChange={() => handleSecurityToggle('loginNotifications')}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSaveSecurity}
                disabled={isSavingSecurity}
              >
                {isSavingSecurity ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save Security Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div>Leave requests</div>
                      <div className="text-sm text-muted-foreground">
                        Updates on leave request status
                      </div>
                    </div>
                    <Switch 
                      checked={notificationPrefs.leaveRequests}
                      onCheckedChange={() => handleNotificationToggle('leaveRequests')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div>Performance reviews</div>
                      <div className="text-sm text-muted-foreground">
                        Notifications for upcoming performance reviews
                      </div>
                    </div>
                    <Switch 
                      checked={notificationPrefs.performanceReviews}
                      onCheckedChange={() => handleNotificationToggle('performanceReviews')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div>Payroll updates</div>
                      <div className="text-sm text-muted-foreground">
                        Notifications when salary is processed
                      </div>
                    </div>
                    <Switch 
                      checked={notificationPrefs.payrollUpdates}
                      onCheckedChange={() => handleNotificationToggle('payrollUpdates')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div>Company announcements</div>
                      <div className="text-sm text-muted-foreground">
                        General company news and updates
                      </div>
                    </div>
                    <Switch 
                      checked={notificationPrefs.companyAnnouncements}
                      onCheckedChange={() => handleNotificationToggle('companyAnnouncements')}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">App Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div>Push notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive push notifications on your device
                      </div>
                    </div>
                    <Switch 
                      checked={notificationPrefs.pushNotifications}
                      onCheckedChange={() => handleNotificationToggle('pushNotifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div>Attendance reminders</div>
                      <div className="text-sm text-muted-foreground">
                        Reminders to check-in and check-out
                      </div>
                    </div>
                    <Switch 
                      checked={notificationPrefs.attendanceReminders}
                      onCheckedChange={() => handleNotificationToggle('attendanceReminders')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSaveNotifications}
                disabled={isSavingNotifications}
              >
                {isSavingNotifications ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>Customize your application experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    {theme === 'dark' ? (
                      <Moon className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Sun className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span>Dark mode</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Switch between light and dark theme
                  </div>
                </div>
                <Switch 
                  checked={appPrefs.darkMode}
                  onCheckedChange={() => handlePrefToggle('darkMode')}
                  className="transition-opacity"
                />
              </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Language</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div>System language</div>
                    <div className="text-sm text-muted-foreground">
                      Use your system's language settings
                    </div>
                  </div>
                  <Switch 
                    checked={appPrefs.systemLanguage}
                    onCheckedChange={() => handlePrefToggle('systemLanguage')}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Accessibility</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div>High contrast mode</div>
                    <div className="text-sm text-muted-foreground">
                      Increase contrast for better visibility
                    </div>
                  </div>
                  <Switch 
                    checked={appPrefs.highContrast}
                    onCheckedChange={() => handlePrefToggle('highContrast')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div>Reduced motion</div>
                    <div className="text-sm text-muted-foreground">
                      Minimize animations and transitions
                    </div>
                  </div>
                  <Switch 
                    checked={appPrefs.reducedMotion}
                    onCheckedChange={() => handlePrefToggle('reducedMotion')}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSavePreferences}
                disabled={isSavingPreferences}
              >
                {isSavingPreferences ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
