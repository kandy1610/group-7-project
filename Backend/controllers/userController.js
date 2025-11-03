// controllers/userController.js
const User = require("../models/User");
const mongoose = require("mongoose");

// GET all users - CHỈ ADMIN
exports.getUsers = async (req, res) => {
  try {
    // Kiểm tra role
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD new user - CHỈ ADMIN (hoặc có thể để public cho signup)
exports.addUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    console.log("ADD USER - Request body:", req.body);

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const user = new User({ name, email, password, role });
    const savedUser = await user.save();

    // Không trả về password
    const userResponse = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };

    res.status(201).json(userResponse);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(400).json({ message: err.message });
  }
};

// UPDATE user - ADMIN hoặc chính user đó
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Kiểm tra quyền: admin có thể update bất kỳ user, user chỉ update chính mình
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // User thường không thể thay đổi role
    if (req.user.role !== "admin" && role) {
      return res.status(403).json({ message: "Only admin can change role" });
    }

    // Kiểm tra body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is empty" });
    }

    if (!name && !email && !role) {
      return res
        .status(400)
        .json({ message: "Provide name, email or role to update" });
    }

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role && req.user.role === "admin") updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

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

// DELETE user - ADMIN hoặc chính user đó
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra quyền: admin có thể xóa bất kỳ user, user chỉ xóa chính mình
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Access denied" });
    }

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

// GET user by ID - ADMIN hoặc chính user đó
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra quyền
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
