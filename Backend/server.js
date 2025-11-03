const express = require("express");
<<<<<<< HEAD
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
=======
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const userRoutes = require("./routes/user");

// DEBUG: Kiểm tra biến môi trường
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("Current directory:", __dirname);

app.use(cors());
app.use(express.json());

// KẾT NỐI MONGODB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Đã kết nối MongoDB Atlas"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// Route chính để test
app.get("/", (req, res) => {
  res.json({ message: "Backend API is running!" });
});

app.use("/users", userRoutes);
>>>>>>> ef4b561d466714b09448729e4a6fcc8d22a54fae

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
