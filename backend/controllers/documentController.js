const Document = require('../models/Document');
const Employee = require('../models/Employee');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

exports.uploadDocument = async (req, res) => {
  const { title, category } = req.body;
  try {
    // Get user data
    const userId = req.user._id;
    
    // Get employee data or create if it doesn't exist
    let employee = await Employee.findOne({ createdBy: userId });
    if (!employee) {
      // Get user data
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Create a new employee record with default values
      employee = await Employee.create({
        name: user.name,
        email: user.email,
        createdBy: userId
      });
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Handle multiple files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    // Create document records for each file
    const documents = [];
    for (const file of req.files) {
      const fileUrl = `/uploads/${file.filename}`;
      const docData = {
        title: title || file.originalname,
        fileUrl,
        uploadedBy: userId,
        category: category || 'personal'
      };
      if ((category || 'personal') !== 'company') {
        docData.employee = employee._id;
      }
      const doc = await Document.create(docData);
      documents.push(doc);
    }
    
    res.status(201).json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};