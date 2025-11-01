// middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    let token = req.header('Authorization');

    // Xử lý Bearer token
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    // Cho phép mock token để test
    if (token === 'mock_jwt_token_here') {
      req.user = { 
        userId: 'mock_id_123',
        role: 'user'
      };
      return next();
    }

    // Verify real JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

module.exports = auth;