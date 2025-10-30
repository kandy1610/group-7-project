// src/components/Profile.jsx - CẬP NHẬT ĐẦY ĐỦ
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = ({ currentUser, onUpdateSuccess }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' hoặc 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  // Khởi tạo form data từ currentUser
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        password: '',
        confirmPassword: '',
        avatar: currentUser.avatar || ''
      });
      setImagePreview(currentUser.avatar || '');
    }
  }, [currentUser]);

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

  // Xử lý chọn file từ máy
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      setErrors({ submit: 'Vui lòng chọn file ảnh (JPEG, PNG, GIF)' });
      return;
    }

    // Kiểm tra kích thước file (tối đa 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors({ submit: 'Kích thước ảnh không được vượt quá 2MB' });
      return;
    }

    setSelectedFile(file);
    setErrors({});

    // Tạo preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Kích hoạt input file
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  // Upload avatar từ file
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setErrors({ submit: 'Vui lòng chọn file ảnh' });
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const token = localStorage.getItem('token');
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = await axios.post('http://localhost:3000/upload-avatar-file', formData, config);
      
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage('Upload avatar thành công!');
      setFormData(prev => ({ ...prev, avatar: updatedUser.avatar }));
      setImagePreview(updatedUser.avatar);
      
      if (onUpdateSuccess) {
        onUpdateSuccess(updatedUser);
      }
      
    } catch (error) {
      console.error('Upload avatar error:', error);
      setErrors({ submit: error.response?.data?.message || 'Upload avatar thất bại' });
    } finally {
      setLoading(false);
    }
  };

  // Upload avatar từ URL
  const handleUrlUpload = async () => {
    if (!formData.avatar.trim()) {
      setErrors({ submit: 'Vui lòng nhập URL avatar' });
      return;
    }

    // Validate URL
    try {
      new URL(formData.avatar);
    } catch (error) {
      setErrors({ submit: 'URL không hợp lệ' });
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.put('http://localhost:3000/upload-avatar', 
        { avatarUrl: formData.avatar }, 
        config
      );
      
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage('Cập nhật avatar thành công!');
      setImagePreview(formData.avatar);
      
      if (onUpdateSuccess) {
        onUpdateSuccess(updatedUser);
      }
      
    } catch (error) {
      console.error('Upload avatar error:', error);
      setErrors({ submit: error.response?.data?.message || 'Upload avatar thất bại' });
    } finally {
      setLoading(false);
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

    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
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
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const submitData = {
        name: formData.name,
        email: formData.email
      };

      if (formData.password) {
        submitData.password = formData.password;
      }

      const response = await axios.put('http://localhost:3000/profile', submitData, config);
      
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage('Cập nhật thông tin thành công!');
      setIsEditing(false);
      
      if (onUpdateSuccess) {
        onUpdateSuccess(updatedUser);
      }
      
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setErrors({});
    setMessage('');
    setSelectedFile(null);
    setUploadMethod('url');
  };

  if (!currentUser) {
    return <div>Vui lòng đăng nhập để xem thông tin cá nhân</div>;
  }

  return (
    <div className="profile">
      <h2>👤 Thông tin cá nhân</h2>
      
      {message && <div className="success-message">{message}</div>}

      {!isEditing ? (
        // Chế độ xem thông tin
        <div className="profile-info">
          <div className="avatar-section">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt="Avatar" className="avatar" />
            ) : (
              <div className="avatar-placeholder">🖼️</div>
            )}
          </div>

          <div className="info-item">
            <strong>Họ và tên:</strong>
            <span>{currentUser.name}</span>
          </div>
          <div className="info-item">
            <strong>Email:</strong>
            <span>{currentUser.email}</span>
          </div>
          <div className="info-item">
            <strong>Vai trò:</strong>
            <span className={`role ${currentUser.role}`}>
              {currentUser.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
            </span>
          </div>
          <div className="info-item">
            <strong>ID:</strong>
            <span className="user-id">{currentUser.id}</span>
          </div>
          
          <button onClick={handleEditToggle} className="btn-edit">
            ✏️ Chỉnh sửa thông tin
          </button>
        </div>
      ) : (
        // Chế độ chỉnh sửa
        <form onSubmit={handleSubmit} className="profile-form">
          
          {/* Preview avatar */}
          <div className="avatar-preview-section">
            <label>Preview Avatar:</label>
            <div className="avatar-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="avatar-preview-img" />
              ) : (
                <div className="avatar-placeholder">🖼️</div>
              )}
            </div>
          </div>

          {/* Phương thức upload avatar */}
          <div className="upload-method-selector">
            <label>Chọn phương thức upload avatar:</label>
            <div className="method-buttons">
              <button
                type="button"
                className={`method-btn ${uploadMethod === 'url' ? 'active' : ''}`}
                onClick={() => setUploadMethod('url')}
              >
                🌐 URL
              </button>
              <button
                type="button"
                className={`method-btn ${uploadMethod === 'file' ? 'active' : ''}`}
                onClick={() => setUploadMethod('file')}
              >
                📁 File từ máy
              </button>
            </div>
          </div>

          {/* Upload bằng URL */}
          {uploadMethod === 'url' && (
            <div className="form-group">
              <label htmlFor="avatar">Avatar URL:</label>
              <div className="avatar-upload">
                <input
                  type="text"
                  id="avatar"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="Nhập URL avatar (VD: https://example.com/avatar.jpg)"
                />
                <button 
                  type="button" 
                  onClick={handleUrlUpload}
                  className="btn-upload"
                  disabled={loading}
                >
                  {loading ? '🔄' : '📤 Upload URL'}
                </button>
              </div>
              <small>Nhập URL ảnh và nhấn nút upload</small>
            </div>
          )}

          {/* Upload bằng file */}
          {uploadMethod === 'file' && (
            <div className="form-group">
              <label>Chọn file từ máy:</label>
              <div className="file-upload">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button 
                  type="button" 
                  onClick={handleSelectFile}
                  className="btn-select-file"
                >
                  📁 Chọn file
                </button>
                {selectedFile && (
                  <span className="file-name">{selectedFile.name}</span>
                )}
                <button 
                  type="button" 
                  onClick={handleFileUpload}
                  className="btn-upload"
                  disabled={loading || !selectedFile}
                >
                  {loading ? '🔄' : '📤 Upload File'}
                </button>
              </div>
              <small>Chọn file ảnh (JPEG, PNG, GIF) tối đa 2MB</small>
            </div>
          )}

          {/* Các trường thông tin khác */}
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
            <label htmlFor="password">Mật khẩu mới (để trống nếu không đổi):</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
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
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={loading}
              className={`btn-save ${loading ? 'loading' : ''}`}
            >
              {loading ? '🔄 Đang cập nhật...' : '💾 Lưu thông tin'}
            </button>
            <button 
              type="button" 
              onClick={handleEditToggle}
              className="btn-cancel"
            >
              ❌ Hủy
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;