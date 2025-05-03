const express = require('express');
const {
  checkIn,
  checkOut,
  getAttendanceByEmployee,
  getAllAttendance
} = require('../controllers/attendanceController');

const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/employee/:id', protect, getAttendanceByEmployee);
router.get('/', protect, getAllAttendance);

module.exports = router;
