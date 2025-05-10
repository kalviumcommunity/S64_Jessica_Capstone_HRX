const Attendance = require('../models/Attendence');
const redisClient = require('../config/redisClient');

// Mark check-in
exports.checkIn = async (req, res) => {
  const { employeeId } = req.body;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    const existing = await Attendance.findOne({ employee: employeeId, date: today });
    if (existing) return res.status(400).json({ message: 'Already checked in today' });

    const attendance = await Attendance.create({
      employee: employeeId,
      date: today,
      checkIn: new Date()
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark check-out
exports.checkOut = async (req, res) => {
  const { employeeId } = req.body;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const attendance = await Attendance.findOne({ employee: employeeId, date: today });

    if (!attendance || attendance.checkOut) {
      return res.status(400).json({ message: 'Check-in required or already checked out' });
    }

    attendance.checkOut = new Date();
    const hoursWorked = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60); // in hours
    attendance.totalHours = parseFloat(hoursWorked.toFixed(2));
    attendance.status = hoursWorked < 4 ? 'Half Day' : 'Present';

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee attendance
exports.getAttendanceByEmployee = async (req, res) => {
  try {
    const records = await Attendance.find({ employee: req.params.id });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get full attendance list
exports.getAllAttendance = async (req, res) => {
  try {
    const all = await Attendance.find()
      .populate({
        path: 'employee',
        select: 'name employeeId', // Only select the fields we need
        model: 'Employee'
      })
      .sort({ date: -1 }); // Sort by date descending
    res.json(all);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  const cacheKey = 'attendance:list';
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));
    const attendance = await Attendance.find();
    await redisClient.setEx(cacheKey, 600, JSON.stringify(attendance));
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAttendanceById = async (req, res) => {
  const cacheKey = `attendance:${req.params.id}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
    await redisClient.setEx(cacheKey, 600, JSON.stringify(attendance));
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Invalidate cache on add, update, or delete
exports.addAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);
    await redisClient.del('attendance:list');
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await redisClient.del('attendance:list');
    await redisClient.del(`attendance:${req.params.id}`);
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    await redisClient.del('attendance:list');
    await redisClient.del(`attendance:${req.params.id}`);
    res.json({ message: 'Attendance deleted', attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
