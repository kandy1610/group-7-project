// src/components/ForgotPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

const ForgotPassword = ({ onSwitchToLogin, onSwitchToReset }) => {
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
      const response = await axios.post('http://localhost:3000/forgot-password', { email });
      
      setMessage(response.data.message);
      
      // Hiển thị token cho testing
      if (response.data.token) {
        setMessage(prev => prev + ` Token: ${response.data.token}`);
      }
      
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.';
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
            <div style={{ marginTop: '10px' }}>
              <button 
                type="button" 
                className="link-btn"
                onClick={onSwitchToReset}
              >
                Đến trang đặt lại mật khẩu
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