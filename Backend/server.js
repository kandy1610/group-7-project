const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
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
      /\.vercel\.app$/, // Regex để match tất cả subdomain vercel
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
app.options("*", cors());
// Middleware khác
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log("=== REQUEST DEBUG ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("=====================");
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

// Import routes
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");

app.use("/api", userRoutes);
app.use("/api/auth", authRoutes);

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

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    message: "Server is working!",
    database: "MongoDB Atlas",
    timestamp: new Date().toISOString(),
  });
});
// Test auth route không cần token
app.get("/api/auth/test", (req, res) => {
  res.json({ message: "Auth routes are working!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
