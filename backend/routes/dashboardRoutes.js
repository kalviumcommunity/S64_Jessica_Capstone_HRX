const express = require('express');
const { getStats, getActivities, getEvents } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/stats', protect, getStats);
router.get('/activities', protect, getActivities);
router.get('/events', protect, getEvents);

module.exports = router; 