const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateLogin, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Admin login
router.post('/login',
  validateLogin,
  handleValidationErrors,
  adminController.adminLogin
);

// Get all users
router.get('/users',
  authenticateToken,
  requireAdmin,
  adminController.getUsers
);

// Toggle user activation status
router.put('/users/:userId/toggle',
  authenticateToken,
  requireAdmin,
  adminController.toggleUserStatus
);

module.exports = router;