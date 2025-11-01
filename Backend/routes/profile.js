// routes/profile.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Mock user data
const mockUser = {
  id: 'mock_id_123',
  name: 'Mock User',
  email: 'phangjathinh@example.com',
  role: 'user',
  avatar: null,
  createdAt: new Date()
};

// GET /api/profile - Lấy thông tin user
router.get('/', auth, async (req, res) => {
  try {
    // Nếu là mock user
    if (req.user.userId === 'mock_id_123') {
      return res.json({
        success: true,
        user: mockUser
      });
    }

    // Code cho real user (giữ nguyên)
    const User = require('../models/User');
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// PUT /api/profile - Cập nhật thông tin user
router.put('/', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Nếu là mock user
    if (req.user.userId === 'mock_id_123') {
      mockUser.name = name || mockUser.name;
      mockUser.email = email || mockUser.email;
      
      return res.json({
        success: true,
        message: 'Profile updated successfully (mock)',
        user: mockUser
      });
    }

    // Code cho real user (giữ nguyên)
    const User = require('../models/User');
    
    // Kiểm tra email trùng
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user.userId } 
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;