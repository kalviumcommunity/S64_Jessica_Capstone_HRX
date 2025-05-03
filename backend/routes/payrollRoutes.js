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
  getPayrollStats
} = require('../controllers/payrollController');

const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, generatePayroll).get(protect, getAllPayrolls);
router.route('/employee/:id').get(protect, getCurrentPayroll);
router.route('/employee/:id/history').get(protect, getPayrollHistory);
router.route('/:id').get(protect, getEmployeePayroll).put(protect, markAsPaid);
router.route('/:id/download').get(protect, downloadPayslip);
router.get('/current', protect, getAllCurrentPayroll);
router.get('/history', protect, getAllPayrollHistory);
router.get('/stats', protect, getPayrollStats);

module.exports = router;
