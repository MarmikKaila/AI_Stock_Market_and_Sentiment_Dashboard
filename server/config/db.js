// server/config/db.js
const mongoose = require("mongoose");

// Disable Mongoose buffering - fail fast instead of waiting 10s
mongoose.set('bufferCommands', false);

// Track connection state explicitly
let isConnected = false;

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn("⚠️ MONGO_URI not set — app will run without database caching.");
      isConnected = false;
      return;
    }
    await mongoose.connect(uri);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    isConnected = false;
    console.error("❌ MongoDB connection error:", err.message);
    console.warn("   → App will continue without database caching.");
  }
};

const isDbConnected = () => isConnected;

module.exports = { connectDB, isDbConnected };
