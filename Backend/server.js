// server.js
const express = require("express");
const app = express();
const userRoutes = require("./routes/user");

app.use(express.json()); // Cho phép đọc JSON từ body
app.use("/users", userRoutes); // Gắn route /users

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
