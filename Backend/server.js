const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // ĐẢM BẢO ĐÃ IMPORT PATH
require("dotenv").config();

const app = express();

// MIDDLEWARE
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "https://group-7-project-xi.vercel.app",
      "https://group-7-project-git-main-minhkys-projects-1275da88.vercel.app",
      "https://group-7-project-mmw4c4rx5-minhkys-projects-1275da88.vercel.app",
      "https://group-7-project-amiw-e14tdpsrn-minhkys-projects-1275da88.vercel.app",
      "https://group-7-project-*.vercel.app",
      /\.vercel\.app$/,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// QUAN TRỌNG: ĐẶT STATIC FILE SERVING TRƯỚC app.listen()
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware khác
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware (có thể tắt bớt để giảm log)
app.use((req, res, next) => {
  if (!req.url.includes("/uploads")) {
    // Không log request ảnh
    console.log("=== REQUEST DEBUG ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Headers:", req.headers);
    if (req.method !== "GET") {
      console.log("Body:", req.body);
    }
    console.log("=====================");
  }
  next();
});

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    console.log("🔍 MONGO_URI:", process.env.MONGO_URI ? "Exists" : "Missing");
  });
app.use("/api/users", (req, res, next) => {
  console.log(`🎯 USERS ROUTE HIT: ${req.method} ${req.originalUrl}`);
  console.log(`🎯 Route params:`, req.params);
  console.log(`🎯 Query params:`, req.query);
  next();
});

// Import routes
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Test routes
app.get("/api/debug", (req, res) => {
  res.json({
    message: "Backend is working!",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
    env: {
      hasMongoUri: !!process.env.MONGO_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      port: process.env.PORT,
    },
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Server is working!",
    database: "MongoDB Atlas",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/auth/test", (req, res) => {
  res.json({ message: "Auth routes are working!" });
});

// THÊM ROUTE ĐỂ KIỂM TRA STATIC FILES
app.get("/api/check-uploads", (req, res) => {
  const fs = require("fs");
  const uploadsPath = path.join(__dirname, "uploads");

  try {
    const files = fs.readdirSync(uploadsPath);
    res.json({
      message: "Uploads directory exists",
      fileCount: files.length,
      files: files,
    });
  } catch (error) {
    res.status(500).json({
      message: "Uploads directory error",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `📁 Static files serving from: ${path.join(__dirname, "uploads")}`
  );
});
