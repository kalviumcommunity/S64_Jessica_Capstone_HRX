const express = require('express');
const { register, login, googleAuth, googleCheck, checkPhoneAuth } = require('../controllers/authController');
const { sensitiveLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.post('/register', register);
router.post('/login', sensitiveLimiter, login);
router.post('/google', googleAuth);
router.post('/google/check', googleCheck);
router.post('/phone/check', checkPhoneAuth);

module.exports = router;