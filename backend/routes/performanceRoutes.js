const express = require('express');
const {
  addReview,
  getAllReviews,
  getEmployeeReviews,
  getEmployeePerformance,
  getEmployeeSkills,
  getEmployeeGoals,
  getEmployeeFeedback,
  getPerformanceStats,
  getUpcomingReviews,
  getReviewTemplates
} = require('../controllers/performanceController');

const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Performance review routes
router.post('/reviews', protect, addReview);
router.get('/reviews', protect, getAllReviews);
router.get('/employee/:id', protect, getEmployeePerformance);
router.get('/employee/:id/skills', protect, getEmployeeSkills);
router.get('/employee/:id/goals', protect, getEmployeeGoals);
router.get('/employee/:id/feedback', protect, getEmployeeFeedback);
router.get('/employee/:id/reviews', protect, getEmployeeReviews);
router.get('/stats', protect, getPerformanceStats);
router.get('/upcoming', protect, getUpcomingReviews);
router.get('/templates', protect, getReviewTemplates);

module.exports = router;
