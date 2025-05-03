const express = require('express');
const { getEmployeeNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/employee/:id').get(protect, getEmployeeNotifications);

module.exports = router;