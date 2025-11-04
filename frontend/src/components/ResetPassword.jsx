// src/components/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Auth.css';
import { API_ENDPOINTS } from '../config/api';

const ResetPassword = ({ autoFilledToken, onSwitchToLogin }) => {
  const { token: urlToken } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Ưu tiên token từ URL, sau đó từ prop
    const token = urlToken || autoFilledToken;
    if (token) {
      setFormData(prev => ({ ...prev, token }));
      console.log("✅ Auto-filled token:", token);
    }
  }, [urlToken, autoFilledToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.token.trim()) {
      setError('Token là bắt buộc');
      return false;
    }

    if (!formData.newPassword) {
      setError('Mật khẩu mới là bắt buộc');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  setLoading(true);
  setError('');
  setMessage('');

  try {
    // ✅ ĐẢM BẢO ENDPOINT ĐÚNG
    const response = await axios.put(
      `${API_ENDPOINTS.AUTH.RESET_PASSWORD}/${formData.token}`, 
      { 
        password: formData.newPassword 
      },
      { timeout: 10000 }
    );
    
    setMessage(response.data.message || 'Đặt lại mật khẩu thành công!');
    
    // Reset form
    setFormData({
      token: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    setTimeout(() => {
      navigate('/');
    }, 3000);
    
  } catch (error) {
    console.error('Reset password error:', error);
    
    let errorMessage = 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout - Vui lòng thử lại';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-form">
      <h2>🔄 Đặt lại mật khẩu</h2>
      <p className="auth-description">
        Nhập token và mật khẩu mới của bạn.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="token">Token reset:</label>
          <input
            type="text"
            id="token"
            name="token"
            value={formData.token}
            onChange={handleChange}
            placeholder="Nhập token bạn nhận được qua email"
            className={error ? 'error' : ''}
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">Mật khẩu mới:</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
            className={error ? 'error' : ''}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu mới:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Nhập lại mật khẩu mới"
            className={error ? 'error' : ''}
          />
        </div>

        {message && (
          <div className="success-message">
            {message}
            <div style={{ marginTop: '10px' }}>
              <p>Bạn sẽ được chuyển hướng về trang chủ sau 3 giây...</p>
              <button 
                type="button" 
                className="link-btn"
                onClick={() => navigate('/')}
              >
                Đến trang chủ ngay
              </button>
            </div>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          disabled={loading}
          className={`auth-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? '🔄 Đang đặt lại...' : '✅ Đặt lại mật khẩu'}
        </button>
      </form>

      <div className="auth-switch">
        <p>
          Quay lại? 
          <button type="button" className="link-btn" onClick={() => navigate('/')}>
            Trang chủ
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;