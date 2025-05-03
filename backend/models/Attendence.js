const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date
  },
  totalHours: {
    type: Number // in decimal (e.g., 7.5 hours)
  },
  status: {
    type: String,
    enum: ['Present', 'Half Day', 'Absent'],
    default: 'Present'
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
