// src/components/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ResetPassword from './ResetPassword';

const ResetPasswordPage = () => {
  const { token } = useParams(); // Lấy token từ URL parameters
  const [autoFilledToken, setAutoFilledToken] = useState('');

  useEffect(() => {
    if (token) {
      setAutoFilledToken(token);
      console.log("🔑 Token from URL:", token);
    }
  }, [token]);

  return (
    <div>
      <h1>Đặt Lại Mật Khẩu</h1>
      <ResetPassword 
        autoFilledToken={autoFilledToken}
        onSwitchToLogin={() => window.location.href = '/login'}
      />
    </div>
  );
};

export default ResetPasswordPage;