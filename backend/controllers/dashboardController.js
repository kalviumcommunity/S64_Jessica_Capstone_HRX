const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Performance = require('../models/Performance');
const redisClient = require('../config/redisClient');

exports.getStats = async (req, res) => {
  const cacheKey = 'dashboard:stats';
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log('Dashboard stats: Serving from Redis cache');
      return res.json(JSON.parse(cached));
    }
    console.log('Dashboard stats: Serving from database');
    const employeeCount = await Employee.countDocuments();
    const pendingLeaveCount = await Leave.countDocuments({ status: 'Pending' });
    const payrolls = await Payroll.find().sort({ payPeriodEnd: -1 });
    const currentPayroll = payrolls.length > 0 ? payrolls[0].netPay : 0;
    const payrollMonth = payrolls.length > 0 ? payrolls[0].payPeriodEnd.toLocaleString('default', { month: 'long', year: 'numeric' }) : '';
    const upcomingReviewCount = await Performance.countDocuments({ reviewDate: { $gte: new Date() } });
    const result = {
      employeeCount,
      pendingLeaveCount,
      currentPayroll,
      payrollMonth,
      upcomingReviewCount,
      employeeChange: '+0%'
    };
    await redisClient.setEx(cacheKey, 600, JSON.stringify(result));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActivities = async (req, res) => {
  const cacheKey = 'dashboard:activities';
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log('Dashboard activities: Serving from Redis cache');
      return res.json(JSON.parse(cached));
    }
    console.log('Dashboard activities: Serving from database');
    const activities = [
      { type: 'employee', title: 'New Employee Added', description: 'Jessica Agarwal joined IT', timeAgo: '2h ago' },
      { type: 'leave', title: 'Leave Approved', description: 'Tara Nair leave approved', timeAgo: '1d ago' }
    ];
    await redisClient.setEx(cacheKey, 600, JSON.stringify(activities));
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEvents = async (req, res) => {
  const cacheKey = 'dashboard:events';
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log('Dashboard events: Serving from Redis cache');
      return res.json(JSON.parse(cached));
    }
    console.log('Dashboard events: Serving from database');
    const events = [
      { type: 'payroll', title: 'Payroll Processing', datetime: 'May 1, 2025' },
      { type: 'performance', title: 'Quarterly Review', datetime: 'May 15, 2025' }
    ];
    await redisClient.setEx(cacheKey, 600, JSON.stringify(events));
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 