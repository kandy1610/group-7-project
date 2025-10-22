let users = [
  {
    name: "Minh Ky",
    email: "ky@example.com",
  },
];

exports.getUsers = (req, res) => {
  res.json(users);
};

exports.addUser = (req, res) => {
  const newUser = req.body;
  if (!newUser.name || !newUser.email) {
    return res.status(400).json({ message: "Thiếu thông tin người dùng!" });
  }

  // THÊM ID cho user
  const userWithId = {
    id: Date.now(), // Tạo ID duy nhất
    ...newUser,
  };

  users.push(userWithId);
  res.status(201).json(userWithId);
};
