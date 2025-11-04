import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
  
const AddUser = ({ onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
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

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Tên không được để trống';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Tên phải có ít nhất 2 ký tự';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
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
    const token = localStorage.getItem("token");
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};

    // SỬA ENDPOINT
    const userData = {
      ...formData,
      password: "123456" // Password mặc định
    };

    const response = await axios.post(API_ENDPOINTS.USERS.BASE, userData, config);
    console.log('User added:', response.data);
    
    setFormData({ name: '', email: '' });
    setErrors({});
    
    if (onUserAdded) {
      onUserAdded();
    }
    
    alert('Thêm user thành công!');
  } catch (error) {
    console.error('Error adding user:', error);
    const errorMessage = error.response?.data?.message || error.message;
    setErrors({ submit: `Lỗi khi thêm user: ${errorMessage}` });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="add-user">
      <h2>Thêm User Mới</h2>
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="name">Tên:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên user"
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
        
        {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
        
        <button 
          type="submit" 
          disabled={loading}
          className={`submit-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? '🔄 Đang thêm...' : '➕ Thêm User'}
        </button>
      </form>
    </div>
  );
};

export default AddUser;