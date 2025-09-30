require('dotenv').config();
const app = require('./src/app');
const mongoose = require('mongoose');

// Connect to MongoDB for serverless
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

// Initialize connection
connectDB();

// Export for Vercel
module.exports = app;