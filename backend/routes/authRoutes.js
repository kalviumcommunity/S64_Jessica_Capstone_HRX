const express = require('express');
const { register, login, googleAuth, googleCheck } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/google/check', googleCheck);

module.exports = router;