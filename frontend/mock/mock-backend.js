// mock-backend.js - ĐẦY ĐỦ CÁC API
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const JWT_SECRET = "your-secret-key";
let users = [];
let passwordResetTokens = []; // Lưu trữ token reset password

// 🔥 THÊM API FORGOT PASSWORD
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Kiểm tra email tồn tại
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    // Tạo token reset password
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" } // Token hết hạn sau 15 phút
    );

    // Lưu token vào bộ nhớ (trong thực tế sẽ lưu vào database)
    passwordResetTokens.push({
      token: resetToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 phút
    });

    // In token ra console (thay vì gửi email)
    console.log("📧 Reset Password Token:", resetToken);
    console.log("📧 Gửi email đến:", email);
    console.log(
      "📧 Link reset: http://localhost:3000/reset-password?token=" + resetToken
    );

    res.json({
      message:
        "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra console để lấy token.",
      token: resetToken, // Chỉ trả về cho testing
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔥 THÊM API RESET PASSWORD
app.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token và mật khẩu mới là bắt buộc" });
    }

    // Tìm token trong danh sách
    const resetTokenData = passwordResetTokens.find(
      (t) => t.token === token && new Date() < new Date(t.expiresAt)
    );

    if (!resetTokenData) {
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // Xác thực token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userIndex = users.findIndex((u) => u.id === decoded.userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // Cập nhật mật khẩu mới
    users[userIndex].password = await bcrypt.hash(newPassword, 10);

    // Xóa token đã sử dụng
    passwordResetTokens = passwordResetTokens.filter((t) => t.token !== token);

    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error("Reset password error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token đã hết hạn" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Token không hợp lệ" });
    }

    res.status(500).json({ message: "Lỗi server" });
  }
});
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Tạo tên file unique
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: function (req, file, cb) {
    // Chỉ chấp nhận file ảnh
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh!"), false);
    }
  },
});
// 🔥 THÊM API UPLOAD AVATAR
app.put("/upload-avatar", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userIndex = users.findIndex((u) => u.id === decoded.userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ message: "URL avatar là bắt buộc" });
    }

    // Cập nhật avatar
    users[userIndex].avatar = avatarUrl;

    // Trả về user đã cập nhật
    const { password, ...updatedUser } = users[userIndex];

    res.json({
      message: "Cập nhật avatar thành công",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(401).json({ message: "Token không hợp lệ" });
  }
});
app.post("/upload-avatar-file", upload.single("avatar"), async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Không có file được tải lên" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userIndex = users.findIndex((u) => u.id === decoded.userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // Tạo URL cho file (trong production sẽ là domain thật)
    const avatarUrl = `http://localhost:3000/uploads/${req.file.filename}`;

    // Cập nhật avatar
    users[userIndex].avatar = avatarUrl;

    // Trả về user đã cập nhật
    const { password, ...updatedUser } = users[userIndex];

    res.json({
      message: "Upload avatar thành công",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(401).json({ message: "Token không hợp lệ" });
  }
});

// ========== CÁC API CƠ BẢN (QUAN TRỌNG - ĐÃ THIẾU) ==========

// API SignUp - THÊM AVATAR
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
      avatar: "", // Thêm avatar mặc định
    };

    users.push(newUser);

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API Login - TRẢ VỀ AVATAR
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
        avatar: user.avatar, // Thêm avatar
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API Get Users - TRẢ VỀ AVATAR
app.get("/users", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Token không tồn tại" });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    const usersWithoutPassword = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPassword);
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
});

// API Add User (QUAN TRỌNG - ĐÃ THIẾU)
app.post("/users", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại" });
    }

    jwt.verify(token, JWT_SECRET);

    const { name, email } = req.body;

    // Kiểm tra email trùng
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      role: "user",
      avatar: "",
    };

    // Tạo mật khẩu mặc định
    users.push({ ...newUser, password: await bcrypt.hash("123456", 10) });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
});

// API Update User (QUAN TRỌNG - ĐÃ THIẾU)
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

    // Kiểm tra email trùng (trừ user hiện tại)
    if (email && email !== users[userIndex].email) {
      const existingUser = users.find(
        (u) => u.email === email && u.id !== userId
      );
      if (existingUser) {
        return res.status(400).json({ message: "Email đã được sử dụng" });
      }
    }

    users[userIndex] = { ...users[userIndex], name, email };

    res.json({
      id: userId,
      name,
      email,
      role: users[userIndex].role,
      avatar: users[userIndex].avatar,
    });
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
});

// API Delete User (QUAN TRỌNG - ĐÃ THIẾU)
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

// API Get Profile
app.get("/profile", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Token không tồn tại" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.id === decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // Trả về thông tin user (không bao gồm password)
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
});

// API Update Profile - CẬP NHẬT AVATAR
app.put("/profile", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Token không tồn tại" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userIndex = users.findIndex((u) => u.id === decoded.userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    const { name, email, password, avatar } = req.body; // Thêm avatar

    // Kiểm tra email trùng (trừ chính user hiện tại)
    if (email && email !== users[userIndex].email) {
      const existingUser = users.find(
        (u) => u.email === email && u.id !== decoded.userId
      );
      if (existingUser) {
        return res.status(400).json({ message: "Email đã được sử dụng" });
      }
    }

    // Cập nhật thông tin
    if (name) users[userIndex].name = name;
    if (email) users[userIndex].email = email;
    if (avatar) users[userIndex].avatar = avatar; // Cập nhật avatar
    if (password) {
      users[userIndex].password = await bcrypt.hash(password, 10);
    }

    const { password: _, ...updatedUser } = users[userIndex];
    res.json({
      message: "Cập nhật thông tin thành công",
      user: updatedUser,
    });
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Mock backend running on http://localhost:3000");
  console.log("✅ SignUp: POST http://localhost:3000/signup");
  console.log("✅ Login: POST http://localhost:3000/login");
  console.log("✅ Get Users: GET http://localhost:3000/users");
  console.log("✅ Add User: POST http://localhost:3000/users");
  console.log("✅ Update User: PUT http://localhost:3000/users/:id");
  console.log("✅ Delete User: DELETE http://localhost:3000/users/:id");
  console.log("✅ Get Profile: GET http://localhost:3000/profile");
  console.log("✅ Update Profile: PUT http://localhost:3000/profile");
  console.log("📧 Forgot Password: POST http://localhost:3000/forgot-password");
  console.log("🔄 Reset Password: POST http://localhost:3000/reset-password");
  console.log("🖼️ Upload Avatar: PUT http://localhost:3000/upload-avatar");
});
