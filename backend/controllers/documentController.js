const Document = require('../models/Document');
const Employee = require('../models/Employee');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const redisClient = require('../config/redisClient'); // ✅ Redis client import

exports.uploadDocument = async (req, res) => {
  const { title, category } = req.body;
  try {
    const userId = req.user._id;
    let employee = await Employee.findOne({ createdBy: userId });

    if (!employee) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      employee = await Employee.create({
        name: user.name,
        email: user.email,
        createdBy: userId
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const documents = [];
    for (const file of req.files) {
      const docData = {
        title: title || file.originalname,
        fileUrl: file.path,
        uploadedBy: userId,
        category: category || 'personal'
      };
      if ((category || 'personal') !== 'company') {
        docData.employee = employee._id;
      }
      const doc = await Document.create(docData);
      documents.push(doc);
    }

    // ✅ Invalidate related caches
    await redisClient.del(`personalDocs:${userId}`);
    await redisClient.del(`payrollDocs:${userId}`);
    await redisClient.del('companyDocs');
    await redisClient.del('allDocuments');

    res.status(201).json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    let employee = await Employee.findOne({ createdBy: userId });

    if (!employee) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      employee = await Employee.create({
        name: user.name,
        email: user.email,
        createdBy: userId
      });
    }

    const documents = await Document.find({ employee: req.params.id }).populate('uploadedBy');
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeePersonalDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const cacheKey = `personalDocs:${userId}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const employee = await Employee.findOne({ createdBy: userId });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const documents = await Document.find({ employee: employee._id, category: 'personal' }).populate('uploadedBy');

    const formattedDocs = documents.map(doc => ({
      _id: doc._id,
      name: doc.title,
      uploadedBy: doc.uploadedBy ? doc.uploadedBy.name : 'System',
      uploadDate: doc.createdAt,
      size: 1024 * 1024
    }));

    await redisClient.setEx(cacheKey, 600, JSON.stringify(formattedDocs));
    res.json(formattedDocs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeePayrollDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const cacheKey = `payrollDocs:${userId}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const employee = await Employee.findOne({ createdBy: userId });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const documents = await Document.find({ employee: employee._id, category: 'payroll' }).populate('uploadedBy');

    const formattedDocs = documents.map(doc => ({
      _id: doc._id,
      name: doc.title.includes('Payslip') ? doc.title : `Payslip - ${new Date(doc.createdAt).toLocaleDateString()}`,
      uploadedBy: 'Payroll System',
      uploadDate: doc.createdAt,
      size: 512 * 1024
    }));

    await redisClient.setEx(cacheKey, 600, JSON.stringify(formattedDocs));
    res.json(formattedDocs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCompanyDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const cacheKey = 'companyDocs';

    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    let employee = await Employee.findOne({ createdBy: userId });
    if (!employee) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      employee = await Employee.create({
        name: user.name,
        email: user.email,
        createdBy: userId
      });
    }

    const documents = await Document.find({ category: 'company' }).populate('uploadedBy').limit(5);

    const formattedDocs = documents.map(doc => ({
      _id: doc._id,
      name: doc.title.includes('Company') ? doc.title : `Company Policy - ${doc.title}`,
      uploadedBy: doc.uploadedBy ? doc.uploadedBy.name : 'HR Department',
      uploadDate: doc.createdAt,
      size: 2 * 1024 * 1024
    }));

    await redisClient.setEx(cacheKey, 600, JSON.stringify(formattedDocs));
    res.json(formattedDocs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.viewDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    let employee = await Employee.findOne({ createdBy: userId });

    if (!employee) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      employee = await Employee.create({
        name: user.name,
        email: user.email,
        createdBy: userId
      });
    }

    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    res.json({ fileUrl: document.fileUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    res.redirect(document.fileUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    const cloudinary = require('../config/cloudinary');
    const publicId = document.fileUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`hrx/${publicId}`);
    await document.deleteOne();

    const userId = req.user._id;
    await redisClient.del(`personalDocs:${userId}`);
    await redisClient.del(`payrollDocs:${userId}`);
    await redisClient.del('companyDocs');
    await redisClient.del('allDocuments');

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingDocuments = async (req, res) => {
  try {
    const pendingDocs = await Document.find({ status: 'pending' }).populate('uploadedBy');
    res.json(pendingDocs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocumentStats = async (req, res) => {
  try {
    const totalCount = await Document.countDocuments();
    const pendingCount = await Document.countDocuments({ status: 'pending' });
    const storageUsed = 0;
    res.json({ totalCount, pendingCount, storageUsed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllDocuments = async (req, res) => {
  try {
    const cacheKey = 'allDocuments';

    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const documents = await Document.find().populate('uploadedBy');
    await redisClient.setEx(cacheKey, 600, JSON.stringify(documents));

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
