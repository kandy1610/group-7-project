// const User = require("../models/User");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// exports.signup = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: "Email đã tồn tại" });

//     const hashed = await bcrypt.hash(password, 10);
//     const user = await User.create({ name, email, password: hashed });
//     res.status(201).json({ message: "Đăng ký thành công", user });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Email không tồn tại" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });
//     res.json({ message: "Đăng nhập thành công", token });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// };

// exports.logout = (req, res) => {
//   res.json({ message: "Đã đăng xuất (client xóa token)" });
// };
// Temporary user controller
exports.getUsers = (req, res) => {
  res.json({
    success: true,
    message: "Get users success",
    users: [
      { id: 1, name: "User 1", email: "user1@example.com" },
      { id: 2, name: "User 2", email: "user2@example.com" }
    ]
  });
};

exports.addUser = (req, res) => {
  console.log("Add user:", req.body);
  res.json({ success: true, message: "User added", user: req.body });
};

exports.updateUser = (req, res) => {
  console.log("Update user:", req.params.id, req.body);
  res.json({ success: true, message: "User updated" });
};

exports.deleteUser = (req, res) => {
  console.log("Delete user:", req.params.id);
  res.json({ success: true, message: "User deleted" });
};