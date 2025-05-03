const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// Get leave balance
exports.getLeaveBalance = async (req, res) => {
  try {
    // In a real app, this would query a leave balance table or calculate from leave records
    // For now, we'll return a simple mock response
    res.json({
      annual: 20,
      sick: 10,
      personal: 5,
      annualUsed: 0,
      sickUsed: 0,
      personalUsed: 0,
      annualTotal: 20,
      sickTotal: 10,
      personalTotal: 5
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply for leave
exports.applyLeave = async (req, res) => {
  try {
    // Find the employee document for the current user
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(400).json({ message: 'Employee profile not found for this user.' });
    }

    // Map leaveType from frontend to type for backend schema
    const typeMap = {
      annual: 'Casual',
      sick: 'Sick',
      personal: 'Paid'
    };
    const type = typeMap[req.body.leaveType] || 'Other';

    const leave = await Leave.create({
      ...req.body,
      type, // use mapped type
      employee: employee._id, // Set the employee reference
      requestedBy: req.user._id
    });
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all leave requests (Admin/HR)
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employee')
      .populate('requestedBy')
      .populate('reviewedBy');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get personal leave history (Employee)
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ requestedBy: req.user._id });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee leave history
exports.getEmployeeLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      $or: [
        { employee: req.params.id },
        { requestedBy: req.params.id }
      ]
    });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve/Reject leave (HR/Admin only)
exports.updateLeaveStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, reviewedBy: req.user._id },
      { new: true }
    );
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
