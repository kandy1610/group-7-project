const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log("=== REQUEST DEBUG ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);z
  console.log("Headers:", {
    authorization: req.headers.authorization,
    'x-auth-token': req.headers['x-auth-token']
  });
  console.log("Body:", req.body);
  console.log("=====================");
  next();
});

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/group7")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const userRoutes = require('./routes/user');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);

// Test routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is working! 🚀",
    endpoints: {
      test: "GET /test",
      signup: "POST /api/auth/signup",
      login: "POST /api/auth/login",
      profile: "GET /api/profile",
      users: "GET /api/users"
    }
  });
});

app.get("/test", (req, res) => {
  res.json({
    message: "Server is working!",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Available routes:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/test`);
  console.log(`   POST http://localhost:${PORT}/api/auth/signup`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/profile`);
  console.log(`   PUT  http://localhost:${PORT}/api/profile`);
  console.log(`   GET  http://localhost:${PORT}/api/users`);
});