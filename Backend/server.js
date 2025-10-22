const express = require("express");
const cors = require("cors"); // THÊM DÒNG NÀY
const app = express();
const userRoutes = require("./routes/user");

// THÊM CORS MIDDLEWARE
app.use(cors());
app.use(express.json());

// Route chính để test
app.get("/", (req, res) => {
  res.json({ message: "Backend API is running!" });
});

app.use("/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
