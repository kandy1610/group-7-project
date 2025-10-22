import React, { useState } from 'react';
import axios from 'axios';

const AddUser = ({ onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    
    try {
      // SỬA URL: bỏ /api
      const response = await axios.post('http://localhost:3000/users', formData);
      console.log('User added:', response.data);
      
      // Reset form
      setFormData({ name: '', email: '' });
      
      // Gọi callback để refresh danh sách users
      if (onUserAdded) {
        onUserAdded();
      }
      
      alert('Thêm user thành công!');
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Lỗi khi thêm user: ' + (error.response?.data?.message || error.message));
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
            required
          />
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
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="submit-btn"
        >
          {loading ? 'Đang thêm...' : 'Thêm User'}
        </button>
      </form>
    </div>
  );
};

export default AddUser;