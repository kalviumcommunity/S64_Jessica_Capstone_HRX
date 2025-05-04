const express = require('express');
const {
  generatePayroll,
  getAllPayrolls,
  getEmployeePayroll,
  markAsPaid,
  getCurrentPayroll,
  getPayrollHistory,
  downloadPayslip,
  getAllCurrentPayroll,
  getAllPayrollHistory,
  getPayrollStats,
  getPayrollSettings,
  updatePayrollSettings
} = require('../controllers/payrollController');

const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Specific routes first
router.get('/current', protect, getAllCurrentPayroll);
router.get('/history', protect, getAllPayrollHistory);
router.get('/stats', protect, getPayrollStats);
router.get('/settings', protect, getPayrollSettings);
router.put('/settings', protect, updatePayrollSettings);

// Parameterized routes last
router.route('/').post(protect, generatePayroll).get(protect, getAllPayrolls);
router.route('/employee/:id').get(protect, getCurrentPayroll);
router.route('/employee/:id/history').get(protect, getPayrollHistory);
router.route('/:id').get(protect, getEmployeePayroll).put(protect, markAsPaid);
router.route('/:id/download').get(protect, downloadPayslip);

module.exports = router;
