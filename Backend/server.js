const express = require("express");
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
