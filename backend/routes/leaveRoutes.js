const express = require('express');
const {
  applyLeave,
  getAllLeaves,
  getMyLeaves,
  updateLeaveStatus,
  getLeaveBalance,
  getEmployeeLeaves
} = require('../controllers/leaveController');

const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Leave application & personal view
router.route('/').post(protect, applyLeave).get(protect, getAllLeaves);
router.route('/my').get(protect, getMyLeaves);

// Leave balance
router.route('/balance/:id').get(protect, getLeaveBalance);

// Employee leave history
router.route('/employee/:id').get(protect, getEmployeeLeaves);

// Update leave status
router.route('/:id').put(protect, updateLeaveStatus);
router.put('/:id/approve', protect, updateLeaveStatus);
router.put('/:id/reject', protect, updateLeaveStatus);

module.exports = router;
