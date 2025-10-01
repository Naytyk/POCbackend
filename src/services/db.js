const mongoose = require("mongoose");

// Cache variable stored in global object
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // If already connected, just return the cached connection
  if (cached.conn) return cached.conn;

  // If not connected, create a new connection
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: "test",             // ⬅️ put your actual DB name here
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    }).then((mongoose) => mongoose);
  }

  // Wait for connection to be established
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
