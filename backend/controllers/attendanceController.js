const Attendance = require('../models/Attendence');

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
