const Employee = require('../models/Employee');
const User = require('../models/User');

// Get profile data
exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'employee') {
      // Get employee data or create if it doesn't exist
      let employee = await Employee.findOne({ createdBy: userId });
      if (!employee) {
        employee = await Employee.create({
          name: user.name,
          email: user.email,
          createdBy: userId
        });
      }
      // Build profile from Employee
      return res.json({
        personal: {
          name: user.name,
          email: user.email,
          phone: employee.phone || '',
          address: employee.address || '',
          dateOfBirth: employee.dateOfBirth || '',
          gender: employee.gender || '',
          emergencyContact: employee.emergencyContact || '',
          emergencyPhone: employee.emergencyPhone || ''
        },
        professional: {
          department: employee.department || '',
          position: employee.position || '',
          employeeId: employee._id.toString(),
          joinDate: employee.joinDate || '',
          manager: employee.manager || '',
          workLocation: employee.workLocation || '',
          workEmail: employee.workEmail || user.email,
          workPhone: employee.workPhone || '',
          education: employee.education || '',
          skills: employee.skills || ''
        },
        bank: {
          accountName: employee.accountName || user.name,
          accountNumber: employee.accountNumber || '',
          bankName: employee.bankName || '',
          branch: employee.branch || '',
          ifscCode: employee.ifscCode || '',
          panCard: employee.panCard || '',
          salary: employee.salary || '',
          taxInformation: employee.taxInformation || ''
        }
      });
    } else {
      // HR/admin: Build profile from User
      return res.json({
        personal: {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          address: user.address || '',
          dateOfBirth: user.dateOfBirth || '',
          gender: user.gender || '',
          emergencyContact: user.emergencyContact || '',
          emergencyPhone: user.emergencyPhone || ''
        },
        professional: {
          department: user.department || '',
          position: user.position || '',
          employeeId: user._id.toString(),
          joinDate: user.joinDate || '',
          manager: user.manager || '',
          workLocation: user.workLocation || '',
          workEmail: user.workEmail || user.email,
          workPhone: user.workPhone || '',
          education: user.education || '',
          skills: user.skills || ''
        },
        bank: {
          accountName: user.accountName || user.name,
          accountNumber: user.accountNumber || '',
          bankName: user.bankName || '',
          branch: user.branch || '',
          ifscCode: user.ifscCode || '',
          panCard: user.panCard || '',
          salary: user.salary || '',
          taxInformation: user.taxInformation || ''
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update personal information
exports.updatePersonalInfo = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, address, dateOfBirth, gender, emergencyContact, emergencyPhone } = req.body;
    // Update user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.name = name;
    user.email = email;
    // For HR/admin, store all personal info in User
    if (user.role !== 'employee') {
      user.phone = phone;
      user.address = address;
      user.dateOfBirth = dateOfBirth;
      user.gender = gender;
      user.emergencyContact = emergencyContact;
      user.emergencyPhone = emergencyPhone;
      await user.save();
      return res.json({ message: 'Personal information updated successfully (user)' });
    }
    await user.save();
    // Update employee data or create if it doesn't exist
    let employee = await Employee.findOne({ createdBy: userId });
    if (!employee) {
      employee = await Employee.create({
        name: user.name,
        email: user.email,
        createdBy: userId
      });
    }
    employee.phone = phone;
    employee.address = address;
    employee.dateOfBirth = dateOfBirth;
    employee.gender = gender;
    employee.emergencyContact = emergencyContact;
    employee.emergencyPhone = emergencyPhone;
    await employee.save();
    res.json({ message: 'Personal information updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update professional information
exports.updateProfessionalInfo = async (req, res) => {
  try {
    const userId = req.params.id;
    const { department, position, joinDate, manager, workLocation, workEmail, workPhone, education, skills } = req.body;
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // For HR/admin, store all professional info in User
    if (user.role !== 'employee') {
      user.department = department;
      user.position = position;
      user.joinDate = joinDate;
      user.manager = manager;
      user.workLocation = workLocation;
      user.workEmail = workEmail;
      user.workPhone = workPhone;
      user.education = education;
      user.skills = skills;
      await user.save();
      return res.json({ message: 'Professional information updated successfully (user)' });
    }
    // Update employee data or create if it doesn't exist
    let employee = await Employee.findOne({ createdBy: userId });
    if (!employee) {
      employee = await Employee.create({
        name: user.name,
        email: user.email,
        createdBy: userId
      });
    }
    employee.department = department;
    employee.position = position;
    employee.joinDate = joinDate;
    employee.manager = manager;
    employee.workLocation = workLocation;
    employee.workEmail = workEmail;
    employee.workPhone = workPhone;
    employee.education = education;
    employee.skills = skills;
    await employee.save();
    res.json({ message: 'Professional information updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update bank information
exports.updateBankInfo = async (req, res) => {
  try {
    const userId = req.params.id;
    const { accountName, accountNumber, bankName, branch, ifscCode, panCard, salary, taxInformation } = req.body;
    
    // Validate salary is a number
    if (salary !== undefined && salary !== null && isNaN(Number(salary))) {
      return res.status(400).json({ message: 'Salary must be a valid number' });
    }
    
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role === 'employee') {
      // Update employee data or create if it doesn't exist
      let employee = await Employee.findOne({ createdBy: userId });
      if (!employee) {
        employee = await Employee.create({
          name: user.name,
          email: user.email,
          createdBy: userId
        });
      }
      
      // Update employee fields
      employee.accountName = accountName;
      employee.accountNumber = accountNumber;
      employee.bankName = bankName;
      employee.branch = branch;
      employee.ifscCode = ifscCode;
      employee.panCard = panCard;
      employee.salary = salary ? Number(salary) : null;
      employee.taxInformation = taxInformation;
      
      try {
        await employee.save();
        res.json({ message: 'Bank information updated successfully' });
      } catch (error) {
        console.error('Error saving employee:', error);
        res.status(400).json({ message: 'Error updating bank information', error: error.message });
      }
    } else {
      res.status(403).json({ message: 'Only employees can update bank information' });
    }
  } catch (error) {
    console.error('Error in updateBankInfo:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get employee data or create if it doesn't exist
    let employee = await Employee.findOne({ createdBy: userId });
    if (!employee) {
      // Create a new employee record with default values
      employee = await Employee.create({
        name: user.name,
        email: user.email,
        createdBy: userId
      });
    }
    
    // Create avatar URL
    const avatarUrl = `/uploads/${req.file.filename}`;
    
    // Update employee with avatar URL
    employee.avatar = avatarUrl;
    await employee.save();
    
    // Also update the user record with the avatar URL
    user.avatar = avatarUrl;
    await user.save();
    
    res.json({ 
      message: 'Avatar uploaded successfully',
      avatarUrl: avatarUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};