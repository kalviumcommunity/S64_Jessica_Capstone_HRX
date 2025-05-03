const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const User = require('../models/User');
const generatePayslip = require('../utils/payslipGenerator');
const path = require('path');
const fs = require('fs');

// Get current payroll for employee
exports.getCurrentPayroll = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
    
    // Find the most recent payroll for this employee
    let payrolls = await Payroll.find({ employee: employee._id })
      .sort({ payPeriodEnd: -1 })
      .limit(1);
    
    // If no payroll exists, create a default one
    if (payrolls.length === 0) {
      const currentDate = new Date();
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const basicSalary = employee.salary || 5000;
      const allowances = 500;
      const bonus = 200;
      const overtime = 100;
      const tax = 500;
      const insurance = 250;
      const netPay = basicSalary + allowances + bonus + overtime - tax - insurance;
      
      const newPayroll = new Payroll({
        employee: employee._id,
        payPeriodEnd: lastDayOfMonth,
        paymentDate: lastDayOfMonth,
        basicSalary,
        allowances,
        bonus,
        overtime,
        tax,
        insurance,
        netPay,
        status: 'Paid',
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      });
      
      await newPayroll.save();
      payrolls = [newPayroll];
    }
    
    // Format the response
    const formattedPayrolls = payrolls.map(payroll => ({
      _id: payroll._id,
      payPeriodEnd: payroll.payPeriodEnd,
      paymentDate: payroll.paymentDate,
      basicSalary: payroll.basicSalary,
      allowances: payroll.allowances,
      bonus: payroll.bonus,
      overtime: payroll.overtime,
      tax: payroll.tax,
      insurance: payroll.insurance,
      netPay: payroll.netPay,
      status: payroll.status || 'Paid'
    }));
    
    res.json(formattedPayrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payroll history for employee
exports.getPayrollHistory = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
    
    // Find all payrolls for this employee, sorted by date
    let payrolls = await Payroll.find({ employee: employee._id })
      .sort({ payPeriodEnd: -1 });
    
    // If no payrolls exist, create some default ones
    if (payrolls.length === 0) {
      const currentDate = new Date();
      const payrolls = [];
      
      // Create payrolls for the last 3 months
      for (let i = 1; i <= 3; i++) {
        const month = currentDate.getMonth() - i;
        const year = currentDate.getFullYear() + Math.floor(month / 12);
        const adjustedMonth = ((month % 12) + 12) % 12; // Handle negative months
        
        const lastDayOfMonth = new Date(year, adjustedMonth + 1, 0);
        
        const basicSalary = 5000 - (i > 2 ? 200 : 0); // Slightly lower salary for older months
        const allowances = 500 - (i > 2 ? 20 : 0);
        const bonus = i === 1 ? 100 : (i === 2 ? 100 : 0); // No bonus for oldest month
        const overtime = i === 1 ? 50 : (i === 2 ? 50 : 0); // No overtime for oldest month
        const tax = basicSalary * 0.1;
        const insurance = basicSalary * 0.05;
        const netPay = basicSalary + allowances + bonus + overtime - tax - insurance;
        
        const newPayroll = new Payroll({
          employee: employee._id,
          payPeriodEnd: lastDayOfMonth,
          paymentDate: lastDayOfMonth,
          basicSalary,
          allowances,
          bonus,
          overtime,
          tax,
          insurance,
          netPay,
          status: 'Paid'
        });
        
        await newPayroll.save();
        payrolls.push(newPayroll);
      }
      
      // Re-fetch the payrolls to get them in the right order
      payrolls = await Payroll.find({ employee: employee._id })
        .sort({ payPeriodEnd: -1 });
    }
    
    // Format the response
    const formattedPayrolls = payrolls.map(payroll => ({
      _id: payroll._id,
      payPeriodEnd: payroll.payPeriodEnd,
      paymentDate: payroll.paymentDate,
      basicSalary: payroll.basicSalary,
      allowances: payroll.allowances,
      bonus: payroll.bonus,
      overtime: payroll.overtime,
      tax: payroll.tax,
      insurance: payroll.insurance,
      netPay: payroll.netPay,
      status: payroll.status
    }));
    
    res.json(formattedPayrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate Payroll for all employees for a given month
exports.generatePayroll = async (req, res) => {
  const { month, year } = req.body; // month: 1-12, year: 4-digit
  try {
    // Get all active employees
    const employees = await Employee.find({ isActive: true });
    const payrolls = [];
    const workingDays = 22;
    // Calculate period start and end
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59, 999);
    for (const emp of employees) {
      // Get attendance for this employee in the period
      const attendance = await require('../models/Attendence').find({
        employee: emp._id,
        date: { $gte: periodStart, $lte: periodEnd }
      });
      const absents = attendance.filter(a => a.status === 'Absent').length;
      const halfDays = attendance.filter(a => a.status === 'Half Day').length;
      // Calculate deductions
      const perDaySalary = (emp.salary || 0) / workingDays;
      const deduction = (absents * perDaySalary) + (halfDays * perDaySalary * 0.5);
      // Mock values
      const allowances = 500;
      const bonus = 200;
      const overtime = 100;
      const gross = (emp.salary || 0) + allowances + bonus + overtime;
      const tax = gross * 0.10;
      const insurance = gross * 0.05;
      // Calculate netPay
      const netPay = gross - tax - insurance - deduction;
      // Calculate paymentDate and payPeriodEnd (last day of month)
      const lastDayOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      // Save payroll record
      const payroll = await Payroll.create({
        employee: emp._id,
        salaryMonth: `${year}-${String(month).padStart(2, '0')}`,
        month: month,
        year: year,
        basicSalary: emp.salary || 0,
        allowances,
        bonus,
        overtime,
        tax: Math.round(tax * 100) / 100,
        insurance: Math.round(insurance * 100) / 100,
        netPay: Math.round(netPay * 100) / 100,
        paymentDate: lastDayOfMonth,
        payPeriodEnd: lastDayOfMonth,
        status: 'Pending'
      });
      payrolls.push(payroll);
    }
    res.status(201).json({ message: 'Payroll generated', payrolls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View all payrolls (HR/Admin)
exports.getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find().populate('employee');
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View employee payroll history
exports.getEmployeePayroll = async (req, res) => {
  try {
    let employeeId = req.params.id;
    if (employeeId === 'current') {
      // Use the logged-in user's employee record
      const userId = req.user._id;
      const employee = await Employee.findOne({ createdBy: userId });
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      employeeId = employee._id;
    }
    const payrolls = await Payroll.find({ employee: employeeId });
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update status to Paid
exports.markAsPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(req.params.id, { status: 'Paid' }, { new: true });
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download payslip
exports.downloadPayslip = async (req, res) => {
  let payslipPath;
  try {
    const payslipId = req.params.id;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Get payroll and employee data
    const payroll = await Payroll.findById(payslipId);
    if (!payroll) {
      return res.status(404).json({ message: 'Payslip not found' });
    }

    const employee = await Employee.findById(payroll.employee);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Create a PDF file using pdfkit
    const PDFDocument = require('pdfkit');
    payslipPath = path.join(uploadsDir, `payslip-${payslipId}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    
    // Pipe the PDF to a file
    const writeStream = fs.createWriteStream(payslipPath);
    doc.pipe(writeStream);
    
    // Add company header
    doc.fontSize(20).text('HRX COMPANY', { align: 'center' });
    doc.fontSize(16).text(`PAYSLIP #${payslipId}`, { align: 'center' });
    doc.fontSize(12).text(`Date: ${new Date(payroll.paymentDate).toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);
    
    // Add employee information
    doc.fontSize(14).text('Employee Information', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Name: ${employee.name}`);
    doc.text(`Position: ${employee.position || 'Staff'}`);
    doc.text(`Department: ${employee.department || 'General'}`);
    doc.moveDown(1);
    
    // Add earnings section
    doc.fontSize(14).text('Earnings', { underline: true });
    doc.moveDown(0.5);
    
    // Helper function to add a row with two columns
    const addRow = (label, value) => {
      doc.text(label, { continued: true, width: 300 });
      doc.text(`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, { align: 'right' });
    };
    
    addRow('Basic Salary:', payroll.basicSalary);
    addRow('Allowances:', payroll.allowances);
    addRow('Bonus:', payroll.bonus);
    addRow('Overtime:', payroll.overtime);
    
    // Add a line
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    doc.moveDown(0.5);
    
    // Total earnings
    const totalEarnings = payroll.basicSalary + payroll.allowances + payroll.bonus + payroll.overtime;
    addRow('Total Earnings:', totalEarnings);
    doc.moveDown(1);
    
    // Add deductions section
    doc.fontSize(14).text('Deductions', { underline: true });
    doc.moveDown(0.5);
    
    addRow('Tax:', payroll.tax);
    addRow('Insurance:', payroll.insurance);
    
    // Add a line
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    doc.moveDown(0.5);
    
    // Total deductions
    const totalDeductions = payroll.tax + payroll.insurance;
    addRow('Total Deductions:', totalDeductions);
    doc.moveDown(1);
    
    // Net pay
    doc.fontSize(14).text('Net Pay', { underline: true });
    doc.moveDown(0.5);
    
    // Add a line
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    doc.moveDown(0.5);
    
    // Net salary in bold
    doc.font('Helvetica-Bold');
    addRow('Net Salary:', payroll.netPay);
    doc.font('Helvetica');
    doc.moveDown(2);
    
    // Footer
    doc.fontSize(10).text('This payslip is generated by HRX Company.', { align: 'center', italic: true });
    
    // Finalize the PDF
    doc.end();
    
    // Wait for the PDF to be created
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Set headers for PDF content
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="payslip-${payslipId}.pdf"`);
    
    // Send the file
    const fileStream = fs.createReadStream(payslipPath);
    fileStream.pipe(res);
    
    // Clean up the file after sending
    fileStream.on('end', () => {
      try {
        if (fs.existsSync(payslipPath)) {
          fs.unlinkSync(payslipPath);
        }
      } catch (err) {
        console.error('Error cleaning up payslip file:', err);
      }
    });
    
  } catch (error) {
    console.error('Error downloading payslip:', error);
    // Clean up the file if it exists
    if (payslipPath && fs.existsSync(payslipPath)) {
      try {
        fs.unlinkSync(payslipPath);
      } catch (err) {
        console.error('Error cleaning up payslip file:', err);
      }
    }
    res.status(500).json({ message: 'Failed to download payslip' });
  }
};

// Admin: Get payroll stats
exports.getPayrollStats = async (req, res) => {
  try {
    // Example: count employees, sum payroll, etc.
    const employeeCount = await require('../models/Employee').countDocuments();
    const payrolls = await require('../models/Payroll').find();
    const totalPayroll = payrolls.reduce((sum, p) => sum + (p.netPay || 0), 0);
    const averageSalary = payrolls.length > 0 ? totalPayroll / payrolls.length : 0;
    const nextPayDate = payrolls.length > 0 ? payrolls[0].payPeriodEnd : null;
    res.json({
      totalPayroll,
      averageSalary,
      employeeCount,
      nextPayDate,
      payrollStatus: 'Pending'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get current payroll (all payrolls)
exports.getAllCurrentPayroll = async (req, res) => {
  try {
    const payrolls = await Payroll.find().populate('employee');
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get payroll history (all payrolls)
exports.getAllPayrollHistory = async (req, res) => {
  try {
    const payrolls = await Payroll.find();
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};