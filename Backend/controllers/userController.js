const User = require("../models/User");

// Mảng tạm dùng khi chưa có MongoDB
let users = [];

/* =============================
   GET all users - LẤY TOÀN BỘ USER
============================= */
exports.getUsers = async (req, res) => {
  try {
    // Nếu có model MongoDB thì lấy từ DB
    if (User) {
      const usersFromDB = await User.find();
      return res.json(usersFromDB);
    }

    // Nếu chưa có DB, trả về mảng tạm
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =============================
   POST - THÊM USER MỚI
============================= */
exports.addUser = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email)
    return res.status(400).json({ message: "Thiếu thông tin người dùng!" });

  try {
    if (User) {
      // Tạo và lưu vào MongoDB
      const newUser = new User({ name, email });
      const savedUser = await newUser.save();
      return res.status(201).json(savedUser);
    }

    // Nếu chưa có DB, lưu vào mảng tạm
    const newUser = { id: Date.now().toString(), name, email };
    users.push(newUser);
    res.status(201).json(newUser);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: "Email đã tồn tại!" });
    res.status(400).json({ message: err.message });
  }
};

/* =============================
   PUT - CẬP NHẬT USER
============================= */
exports.updateUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (User) {
      const updatedUser = await User.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!updatedUser)
        return res.status(404).json({ message: "User không tồn tại!" });
      return res.json(updatedUser);
    }

    // Nếu chưa có DB thì sửa trong mảng tạm
    const index = users.findIndex((u) => u.id == id);
    if (index === -1)
      return res.status(404).json({ message: "User không tồn tại!" });

    users[index] = { ...users[index], ...req.body };
    res.json(users[index]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =============================
   DELETE - XÓA USER
============================= */
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (User) {
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser)
        return res.status(404).json({ message: "User không tồn tại!" });
      return res.json({ message: "Đã xóa user khỏi MongoDB" });
    }

    // Nếu chưa có DB, xóa trong mảng tạm
    users = users.filter((u) => u.id != id);
    res.json({ message: "User đã bị xóa khỏi mảng tạm" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
