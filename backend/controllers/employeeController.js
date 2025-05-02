const Employee = require('../models/Employee');
const User = require('../models/User');
const Performance = require('../models/Performance');

// Get employee by user ID
exports.getEmployeeByUserId = async (req, res) => {
  try {
    const employee = await Employee.findOne({ createdBy: req.params.userId });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new employee
exports.addEmployee = async (req, res) => {
  try {
    const employee = await Employee.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single employee
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete employee (soft delete)
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    res.json({ message: 'Employee archived', employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create employee with credentials
exports.createEmployeeWithCredentials = async (req, res) => {
  try {
    const { name, email, password, ...otherFields } = req.body;
    // Check if user/email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    // 1. Create User for login
    const user = new User({ name, email, password, role: 'employee' });
    await user.save();
    // 2. Create Employee profile
    // Generate a unique employeeId if not provided
    let employeeId = otherFields.employeeId;
    if (!employeeId) {
      employeeId = 'EMP' + Date.now();
    }
    const employee = new Employee({
      name,
      email,
      employeeId,
      createdBy: user._id, // Link to the new employee's user ID
      user: user._id, // link User and Employee
      ...otherFields
    });
    try {
      await employee.save();
      res.status(201).json({ message: 'Employee created successfully', employee });
    } catch (employeeError) {
      // If Employee creation fails, delete the created User
      await User.findByIdAndDelete(user._id);
      throw employeeError;
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employees for HR
exports.getEmployeesForHR = async (req, res) => {
  try {
    const employees = await Employee.find({ createdBy: req.user._id });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Utility endpoint to fix existing employees' createdBy field
exports.fixEmployeeCreatedBy = async (req, res) => {
  try {
    const employees = await Employee.find({ user: { $exists: true, $ne: null } });
    let updated = 0;
    for (const emp of employees) {
      if (emp.createdBy.toString() !== emp.user.toString()) {
        emp.createdBy = emp.user;
        await emp.save();
        updated++;
      }
    }
    res.json({ message: `Updated ${updated} employees' createdBy field to match user field.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Utility endpoint to set up performance records for existing employees
exports.setupPerformanceRecords = async (req, res) => {
  try {
    const employees = await Employee.find();
    let created = 0;
    let skipped = 0;
    const createdRecords = [];

    for (const emp of employees) {
      // Check if employee already has a performance record
      const existingRecord = await Performance.findOne({ employee: emp._id });
      if (existingRecord) {
        skipped++;
        continue;
      }

      // Create default performance record
      const record = await createDefaultPerformanceRecord(emp._id, emp.createdBy);
      createdRecords.push({
        employee: {
          name: emp.name,
          email: emp.email,
          employeeId: emp.employeeId
        },
        skills: record.kpis,
        goals: JSON.parse(record.nextGoals)
      });
      created++;
    }

    res.json({ 
      message: `Created ${created} performance records. Skipped ${skipped} employees who already had records.`,
      createdRecords
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Utility endpoint to view all performance records
exports.viewPerformanceRecords = async (req, res) => {
  try {
    const records = await Performance.find()
      .populate('employee', 'name email employeeId')
      .populate('reviewer', 'name email')
      .lean();

    const formattedRecords = records.map(record => ({
      employee: {
        name: record.employee?.name,
        email: record.employee?.email,
        employeeId: record.employee?.employeeId
      },
      reviewer: record.reviewer?.name,
      reviewPeriod: record.reviewPeriod,
      skills: record.kpis.map(kpi => ({
        name: kpi.metric,
        score: kpi.score,
        weightage: kpi.weightage
      })),
      goals: JSON.parse(record.nextGoals || '[]'),
      overallRating: record.overallRating,
      reviewDate: record.reviewDate,
      status: record.status
    }));

    res.json({
      totalRecords: records.length,
      records: formattedRecords
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Utility endpoint to reset performance records
exports.resetPerformanceRecords = async (req, res) => {
  try {
    await Performance.deleteMany({});
    res.json({ message: 'All performance records have been reset.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
