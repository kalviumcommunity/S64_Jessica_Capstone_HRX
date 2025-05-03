const express = require('express');
const { getEmployeeEvents } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/employee/:id').get(protect, getEmployeeEvents);

module.exports = router;