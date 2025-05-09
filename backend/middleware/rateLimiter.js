const rateLimit = require('express-rate-limit');

// Stricter limiter for sensitive endpoints (login, OTP)
const sensitiveLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again after a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General limiter for all APIs (optional, more relaxed)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  sensitiveLimiter,
  generalLimiter,
}; 