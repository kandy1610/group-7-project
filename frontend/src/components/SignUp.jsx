// src/components/SignUp.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

const SignUp = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên không được để trống';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Tên phải có ít nhất 2 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

// SỬA phần handleSubmit trong SignUp.jsx:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  setLoading(true);
  
  try {
    const { confirmPassword, ...submitData } = formData;
    const response = await axios.post('http://localhost:3000/signup', submitData);
    
    // SỬA: Không setSuccess(true) vì component sẽ chuyển sang login
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    
    alert('Đăng ký thành công! Vui lòng đăng nhập.');
    onSwitchToLogin(); // Chuyển sang form login
    
  } catch (error) {
    console.error('Sign up error:', error);
    const errorMessage = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
    setErrors({ submit: errorMessage });
  } finally {
    setLoading(false);
  }
};

// XÓA phần success condition vì không cần thiết
// if (success) {
//   return (...)
// }

  // if (success) {
  //   return (
  //     <div className="auth-form">
  //       <div className="success-message">
  //         <h2>✅ Đăng ký thành công!</h2>
  //         <p>Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.</p>
  //         <button type="button" className="auth-btn" onClick={onSwitchToLogin}>
  //           Đăng nhập ngay
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="auth-form">
      <h2>📝 Đăng ký tài khoản</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Họ và tên:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập họ và tên"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email"
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
            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Nhập lại mật khẩu"
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

        <button 
          type="submit" 
          disabled={loading}
          className={`auth-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? '🔄 Đang đăng ký...' : '✅ Đăng ký'}
        </button>
      </form>

      <div className="auth-switch">
        <p>Đã có tài khoản? 
          <button type="button" className="link-btn" onClick={onSwitchToLogin}>
            Đăng nhập ngay
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;