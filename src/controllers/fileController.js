// src/controllers/fileController.js
const path = require("path");

// Require all JSON files in scripts folder dynamically
// JS files will be stored as strings
const fs = require("fs");

const scriptsDir = path.join(__dirname, "scripts");

// Build a map of filename => content at startup
const scripts = {};

// Read all files inside scripts folder
fs.readdirSync(scriptsDir).forEach((file) => {
  const ext = path.extname(file).toLowerCase();

  if (ext === ".json") {
    // Load JSON at build time
    scripts[file] = require(path.join(scriptsDir, file));
  } else if (ext === ".js") {
    // Load JS as string
    scripts[file] = fs.readFileSync(path.join(scriptsDir, file), "utf8");
  }
});

const serveScript = async (req, res) => {
  const { filename } = req.params;

  // Only allow files that exist in scripts folder
  const scriptContent = scripts[filename];
  if (!scriptContent) {
    return res.status(404).json({ error: "Script not found" });
  }

  // Auth check
  if (!req.user?.isActive) {
    return res.status(403).json({ error: "Account not activated. Contact admin." });
  }

  // Serve JSON or JS with correct content-type
  if (filename.endsWith(".json")) {
    res.setHeader("Content-Type", "application/json");
    return res.json(scriptContent);
  } else if (filename.endsWith(".js")) {
    res.setHeader("Content-Type", "application/javascript");
    return res.send(scriptContent);
  } else {
    return res.status(400).json({ error: "Unsupported file type" });
  }
};

module.exports = { serveScript };
