const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5,
  message: { error: 'Too many authentication attempts, try again later' }
});

// Register
router.post('/register', 
  authLimiter,
  validateRegister,
  handleValidationErrors,
  authController.register
);

// Login
router.post('/login',
  authLimiter,
  validateLogin,
  handleValidationErrors,
  authController.login
);

// Refresh token
router.post('/refresh',
  authController.refreshToken
);

// Logout
router.post('/logout',
  authenticateToken,
  authController.logout
);

module.exports = router;