// src/components/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

const Login = ({ onLoginSuccess, onSwitchToSignUp, onSwitchToForgot }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Hàm fetch user profile đầy đủ (có avatar)
  const fetchUserProfile = async (token, basicUser) => {
    try {
      const response = await axios.get('http://localhost:3000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Full user profile:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      // Nếu không lấy được profile, trả về basic user
      return basicUser;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error khi user bắt đầu sửa
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', formData);
      console.log('✅ Login response:', response.data);

      const responseData = response.data;
      
      if (responseData.token && responseData._id) {
        // Tạo basic user object từ login response
        const basicUser = {
          _id: responseData._id,
          name: responseData.name,
          email: responseData.email,
          role: responseData.role,
          avatar: responseData.avatar || null
        };

        // 🆕 FETCH USER PROFILE ĐẦY ĐỦ (CÓ AVATAR)
        const fullUser = await fetchUserProfile(responseData.token, basicUser);
        
        // Lưu vào localStorage
        localStorage.setItem('token', responseData.token);
        localStorage.setItem('user', JSON.stringify(fullUser));

        console.log('✅ Full user data saved:', fullUser);
        
        alert('Đăng nhập thành công!');
        onLoginSuccess(fullUser); // Truyền full user data
      } else {
        throw new Error('Dữ liệu đăng nhập không hợp lệ từ server');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-form">
      <h2>🔐 Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email của bạn"
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Mật khẩu:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu"
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

        <button 
          type="submit" 
          disabled={loading}
          className={`auth-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? '🔄 Đang đăng nhập...' : '🚀 Đăng nhập'}
        </button>
      </form>

       <div className="auth-switch">
        <p>Chưa có tài khoản? 
          <button type="button" className="link-btn" onClick={onSwitchToSignUp}>
            Đăng ký ngay
          </button>
        </p>
        <p>
          <button type="button" className="link-btn" onClick={onSwitchToForgot}>
            🔐 Quên mật khẩu?
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;