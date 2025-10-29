// mock-backend.js - Chạy tạm để test frontend
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "your-secret-key";
let users = [];

// 🔥 THIẾU API SIGNUP - THÊM VÀO ĐÂY
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email trùng
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role: "user",
    };

    users.push(newUser);

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API Get Users (cần token)
app.get("/users", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Token không tồn tại" });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    // Trả về danh sách users (không có password)
    const usersWithoutPassword = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPassword);
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
});

// API Add User
app.post("/users", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại" });
    }

    jwt.verify(token, JWT_SECRET);

    const { name, email } = req.body;

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      role: "user",
    };

    users.push({ ...newUser, password: await bcrypt.hash("123456", 10) });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
});

// API Update User
app.put("/users/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại" });
    }

    jwt.verify(token, JWT_SECRET);

    const userId = req.params.id;
    const { name, email } = req.body;

    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    users[userIndex] = { ...users[userIndex], name, email };

    res.json({
      id: userId,
      name,
      email,
      role: users[userIndex].role,
    });
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
});

// API Delete User
app.delete("/users/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại" });
    }

    jwt.verify(token, JWT_SECRET);

    const userId = req.params.id;

    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    users.splice(userIndex, 1);

    res.json({ message: "Xóa user thành công" });
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
});

app.listen(3000, () => {
  console.log("Mock backend running on http://localhost:3000");
});
