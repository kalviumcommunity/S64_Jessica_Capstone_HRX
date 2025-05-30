const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP } = require('../controllers/otpController');
const { sensitiveLimiter } = require('../middleware/rateLimiter');

// Middleware to validate request body
const validateRequestBody = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Request body is required'
        });
    }
    next();
};

// Route to initiate phone number verification
router.post('/send', sensitiveLimiter, validateRequestBody, sendOTP);

// Route to verify the OTP and get the ID token
router.post('/verify', sensitiveLimiter, validateRequestBody, verifyOTP);

module.exports = router; 