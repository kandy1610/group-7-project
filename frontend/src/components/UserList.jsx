// src/components/UserList.jsx
import React from 'react';

const UserList = ({ users }) => {
  if (!users || users.length === 0) {
    return (
      <div className="user-list">
        <h2>Danh sách Users</h2>
        <p>Không có user nào.</p>
      </div>
    );
  }

  return (
    <div className="user-list">
      <h2>Danh sách Users</h2>
      <div className="users-container">
        {users.map(user => (
          <div key={user._id || user.id} className="user-card">
            <div className="user-info">
              <h3>{user.name}</h3>
              <p className="user-email">{user.email}</p>
            </div>
            <div className="user-id">
              ID: {user._id || user.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;