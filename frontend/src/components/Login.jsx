// src/components/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

const Login = ({ onLoginSuccess, onSwitchToSignUp }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
      const response = await axios.post('http://localhost:3000/login', formData);
      const { token, user } = response.data;

      // Lưu token và user info vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Thông báo thành công và chuyển hướng
      alert('Đăng nhập thành công!');
      onLoginSuccess(user);
      
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
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
      </div>
    </div>
  );
};

export default Login;