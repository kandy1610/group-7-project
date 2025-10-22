let users = [{
  "name": "Minh Ky",
  "email": "ky@example.com"
}
];

exports.getUsers = (req, res) => {
  res.json(users);
};

exports.addUser = (req, res) => {
  const newUser = req.body;
  if (!newUser.name || !newUser.email) {
    return res.status(400).json({ message: "thông tin người dùng!" });
  }
  users.push(newUser);
  res.status(201).json(newUser);
};
