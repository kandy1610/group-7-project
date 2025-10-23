import React, { useState } from 'react';

const UserList = ({ users, onDeleteUser, onUpdateUser }) => {
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [loadingStates, setLoadingStates] = useState({
    update: false,
    delete: null // id của user đang được xóa
  });

  // Bắt đầu chỉnh sửa user
  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email
    });
  };

  // Hủy chỉnh sửa
  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ name: '', email: '' });
  };

  // Validation cho form edit
  const validateEditForm = () => {
    if (!editForm.name.trim()) return 'Tên không được để trống';
    if (!editForm.email.trim()) return 'Email không được để trống';
    if (!/\S+@\S+\.\S+/.test(editForm.email)) return 'Email không hợp lệ';
    return null;
  };

  // Xác nhận cập nhật user
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const validationError = validateEditForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setLoadingStates(prev => ({ ...prev, update: true }));

    await onUpdateUser(editingUser._id || editingUser.id, editForm);
    
    setEditingUser(null);
    setEditForm({ name: '', email: '' });
    setLoadingStates(prev => ({ ...prev, update: false }));
  };

  // Xóa user
  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa user này?')) {
      setLoadingStates(prev => ({ ...prev, delete: userId }));
      await onDeleteUser(userId);
      setLoadingStates(prev => ({ ...prev, delete: null }));
    }
  };

  if (!users || users.length === 0) {
    return (
      <div className="user-list">
        <h2>Danh sách Users</h2>
        <p>📭 Không có user nào.</p>
      </div>
    );
  }

  return (
    <div className="user-list">
      <h2>📋 Danh sách Users ({users.length})</h2>
      
      {/* Form chỉnh sửa user */}
      {editingUser && (
        <div className="edit-form">
          <h3>✏️ Chỉnh sửa User</h3>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Tên:</label>
              <input
                type="text"
                placeholder="Nhập tên user"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                placeholder="Nhập email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-update"
                disabled={loadingStates.update}
              >
                {loadingStates.update ? '🔄 Đang cập nhật...' : '✅ Cập nhật'}
              </button>
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={handleCancelEdit}
                disabled={loadingStates.update}
              >
                ❌ Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách users */}
      <div className="users-container">
        {users.map(user => (
          <div key={user._id || user.id} className="user-card">
            <div className="user-info">
              <h3>{user.name}</h3>
              <p className="user-email">📧 {user.email}</p>
              <div className="user-id">
                🆔 {user._id || user.id}
              </div>
            </div>
            <div className="user-actions">
              <button 
                className="btn-edit"
                onClick={() => handleEdit(user)}
                disabled={loadingStates.delete === (user._id || user.id)}
              >
                ✏️ Sửa
              </button>
              <button 
                className="btn-delete"
                onClick={() => handleDelete(user._id || user.id)}
                disabled={loadingStates.delete === (user._id || user.id)}
              >
                {loadingStates.delete === (user._id || user.id) ? '🔄 Đang xóa...' : '🗑️ Xóa'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;