// src/components/ForgotPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';
import { API_ENDPOINTS } from '../config/api';

const ForgotPassword = ({ onSwitchToLogin }) => { // Xóa onSwitchToReset
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!email.trim()) {
    setError('Vui lòng nhập email');
    return;
  }

  setLoading(true);
  setError('');
  setMessage('');

  try {
    const response = await axios.post(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD, 
      { email },
      { timeout: 15000 } // Thêm timeout
    );

    // ✅ SỬA: Kiểm tra debugToken thay vì resetToken
    if (response.data.debugToken) {
      setMessage(`${response.data.message} 
        \n\n🔑 Token để test: ${response.data.debugToken}
        \n📎 Link reset: https://group-7-project-amiw.vercel.app/reset-password/${response.data.debugToken}`);
    } else {
      setMessage(response.data.message);
    }
    
  } catch (error) {
    console.error('Forgot password error:', error);
    
    let errorMessage = 'Gửi yêu cầu thất bại. Vui lòng thử lại.';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout - Server đang bận, vui lòng thử lại sau';
    } else if (error.response?.data?.debugToken) {
      // ✅ HIỂN THỊ TOKEN NGAY CẢ KHI CÓ LỖI
      errorMessage = `${error.response.data.message} 
        \n\n🔑 Token để test: ${error.response.data.debugToken}
        \n📎 Link reset: https://group-7-project-amiw.vercel.app/reset-password/${error.response.data.debugToken}`;
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
      <h2>🔐 Quên mật khẩu</h2>
      <p className="auth-description">
        Nhập email của bạn để nhận link đặt lại mật khẩu.
        <br />
        <small>(Token sẽ được hiển thị trong console backend và ở đây để testing)</small>
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            className={error ? 'error' : ''}
          />
        </div>

        {message && (
          <div className="success-message">
            {message}
            {/* ĐÃ XÓA NÚT CHUYỂN HƯỚNG */}
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              <strong>Hướng dẫn:</strong> Sử dụng token trên để truy cập đường link: 
              <code style={{ marginLeft: '5px', background: '#f5f5f5', padding: '2px 5px' }}>
                /reset-password/[token]
              </code>
            </div>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          disabled={loading}
          className={`auth-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? '🔄 Đang gửi...' : '📧 Gửi link đặt lại mật khẩu'}
        </button>
      </form>

      <div className="auth-switch">
        <p>
          Quay lại? 
          <button type="button" className="link-btn" onClick={onSwitchToLogin}>
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;