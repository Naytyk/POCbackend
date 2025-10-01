// routes/fileRoutes.js
const express = require('express');
const fileController = require('../controllers/fileController');
const { authenticateToken, requireActive } = require('../middleware/auth');

const router = express.Router();

// Serve protected script files
router.get(
  '/scripts/:filename',
  authenticateToken,
  requireActive,
  fileController.serveScript
);

module.exports = router;
