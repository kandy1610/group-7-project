<<<<<<< HEAD
// controllers/userController.js
const User = require("../models/User");
const mongoose = require("mongoose");

// GET all users
=======
const User = require("../models/User");

// GET all users - LẤY TẤT CẢ USER TỪ MONGODB
>>>>>>> ef4b561d466714b09448729e4a6fcc8d22a54fae
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
<<<<<<< HEAD
=======
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
>>>>>>> ef4b561d466714b09448729e4a6fcc8d22a54fae
  }
};

// ADD new user
exports.addUser = async (req, res) => {
  try {
    console.log("ADD USER - Request body:", req.body);

    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const user = new User({ name, email });
    const savedUser = await user.save();

    res.status(201).json(savedUser);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(400).json({ message: err.message });
  }
};

// UPDATE user
exports.updateUser = async (req, res) => {
  try {
    console.log("UPDATE USER - Request body:", req.body);
    console.log("UPDATE USER - Params ID:", req.params.id);

    const { id } = req.params;
    const { name, email } = req.body;

    // Kiểm tra body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is empty" });
    }

    if (!name && !email) {
      return res
        .status(400)
        .json({ message: "Provide name or email to update" });
    }

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Update error:", err);

    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: err.message });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};