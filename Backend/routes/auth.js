// routes/auth.js
z

// Temporary auth routes với JWT thật
router.post("/signup", (req, res) => {
  console.log("✅ SIGNUP called with data:", req.body);
  
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng điền đầy đủ thông tin"
    });
  }
  
  // Tạo JWT token thật
  const token = jwt.sign(
    { 
      userId: 'mock_id_123', 
      name: name,
      email: email,
      role: 'user' 
    }, 
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' }
  );
  
  res.status(201).json({
    success: true,
    message: "Đăng ký thành công!",
    user: {
      id: "mock_id_123",
      name: name,
      email: email,
      role: 'user'
    },
    token: token // JWT token thật
  });
});

router.post("/login", (req, res) => {
  console.log("✅ LOGIN called with data:", req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập email và mật khẩu"
    });
  }
  
  // Tạo JWT token thật
  const token = jwt.sign(
    { 
      userId: 'mock_id_123', 
      name: 'Mock User',
      email: email,
      role: 'user' 
    }, 
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' }
  );
  
  res.json({
    success: true,
    message: "Đăng nhập thành công!",
    user: {
      id: "mock_id_123",
      name: "Mock User",
      email: email,
      role: 'user'
    },
    token: token // JWT token thật
  });
});

router.post('/logout', (req, res) => {
  console.log('✅ LOGOUT called');
  res.json({
    success: true,
    message: 'Đã đăng xuất'
  });
});

module.exports = router;