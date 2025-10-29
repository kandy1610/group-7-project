// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// MIDDLEWARE - ĐẶT ĐẦU TIÊN
app.use(cors());
app.use(express.json()); // QUAN TRỌNG

// Debug middleware
app.use((req, res, next) => {
  console.log("=== REQUEST DEBUG ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Body:", req.body);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("=====================");
  next();
});

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Import routes
const userRoutes = require("./routes/user");
app.use("/", userRoutes);

// Test route - kiểm tra server
app.get("/test", (req, res) => {
  res.json({
    message: "Server is working!",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
