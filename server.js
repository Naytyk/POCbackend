require("dotenv").config();
const connectDB = require("./src/services/db");
const app = require("./src/app");

// Initialize connection once when cold-started
connectDB();

module.exports = async (req, res) => {
  await connectDB();   // ✅ ensures DB connection before handling requests
  return app(req, res);
};
