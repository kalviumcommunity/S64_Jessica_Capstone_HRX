const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Performance = require('../models/Performance');

exports.getStats = async (req, res) => {
  try {
    const employeeCount = await Employee.countDocuments();
    const pendingLeaveCount = await Leave.countDocuments({ status: 'Pending' });
    const payrolls = await Payroll.find().sort({ payPeriodEnd: -1 });
    const currentPayroll = payrolls.length > 0 ? payrolls[0].netPay : 0;
    const payrollMonth = payrolls.length > 0 ? payrolls[0].payPeriodEnd.toLocaleString('default', { month: 'long', year: 'numeric' }) : '';
    const upcomingReviewCount = await Performance.countDocuments({ reviewDate: { $gte: new Date() } });

    res.json({
      employeeCount,
      pendingLeaveCount,
      currentPayroll,
      payrollMonth,
      upcomingReviewCount,
      employeeChange: '+0%' // Placeholder, implement logic if needed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActivities = async (req, res) => {
  // Return mock or real recent activities
  res.json([
    { type: 'employee', title: 'New Employee Added', description: 'Jessica Agarwal joined IT', timeAgo: '2h ago' },
    { type: 'leave', title: 'Leave Approved', description: 'Tara Nair leave approved', timeAgo: '1d ago' }
  ]);
};

exports.getEvents = async (req, res) => {
  // Return mock or real upcoming events
  res.json([
    { type: 'payroll', title: 'Payroll Processing', datetime: 'May 1, 2025' },
    { type: 'performance', title: 'Quarterly Review', datetime: 'May 15, 2025' }
  ]);
}; 