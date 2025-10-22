const User = require("../models/User");

// GET all users - LẤY TẤT CẢ USER TỪ MONGODB
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST new user - THÊM USER MỚI VÀO MONGODB
exports.addUser = async (req, res) => {
  const { name, email } = req.body;

  // Validation
  if (!name || !email) {
    return res.status(400).json({ message: "Thiếu thông tin người dùng!" });
  }

  try {
    // Tạo user mới - MongoDB sẽ tự tạo _id
    const newUser = new User({
      name: name,
      email: email,
    });

    // Lưu vào database
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    // Xử lý lỗi duplicate email
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }
    res.status(400).json({ message: err.message });
  }
};
