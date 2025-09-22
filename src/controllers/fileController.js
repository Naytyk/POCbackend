const path = require('path');
const fs = require('fs');

const serveScript = async (req, res, next) => {
  try {
    const { filename } = req.params;
    
    // Security check - prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    // Check if user is active
    if (!req.user.isActive) {
      return res.status(403).json({ error: 'Account not activated. Contact admin.' });
    }

    const scriptsPath = process.env.SCRIPTS_PATH || './public/scripts';
    const filePath = path.join(scriptsPath, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Script not found' });
    }

    // Check if it's a JavaScript file
    if (!filename.endsWith('.js')) {
      return res.status(400).json({ error: 'Only JavaScript files are served' });
    }

    // Log access
    console.log(`Script accessed: ${filename} by user: ${req.user.email}`);

    // Serve the file
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  serveScript
};