// src/App.js (ĐÃ SỬA LỖI)
import React, { useState, useEffect } from "react";
import axios from "axios";
import UserList from "./components/UserList";
import AddUser from "./components/AddUser";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Profile from "./components/Profile";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [authMode, setAuthMode] = useState("login"); // 'login', 'signup', 'forgot', 'reset'

  // Hàm fetch users từ API
  const fetchUsers = async () => {
    console.log("🔄 Fetching users from backend...");
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const config = token
        ? {
            headers: { Authorization: `Bearer ${token}` },
          }
        : {};

      const response = await axios.get("http://localhost:3000/users", config);
      console.log("✅ Users fetched successfully:", response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      setError(
        error.response?.status === 401
          ? "Vui lòng đăng nhập để xem danh sách users"
          : "Không thể tải danh sách users"
      );
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý đăng nhập thành công
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setShowAuth(false);
    fetchUsers();
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setShowAuth(true);
    setAuthMode("login");
    setUsers([]);
    setActiveTab("users");
  };

  // Hàm xóa user - CÓ token
  const handleDeleteUser = async (userId) => {
    console.log("🗑️ Deleting user:", userId);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ User deleted successfully");
      fetchUsers();
      alert("Xóa user thành công!");
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      alert(
        "Lỗi khi xóa user: " + (error.response?.data?.message || error.message)
      );
    }
  };

  // Hàm cập nhật user - CÓ token
  const handleUpdateUser = async (userId, updatedData) => {
    console.log("✏️ Updating user:", userId, updatedData);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3000/users/${userId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ User updated successfully");
      fetchUsers();
      alert("Cập nhật user thành công!");
    } catch (error) {
      console.error("❌ Error updating user:", error);
      alert(
        "Lỗi khi cập nhật user: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // Hàm cập nhật profile thành công
  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
    // Có thể fetch lại users nếu cần
    fetchUsers();
  };

  // Các hàm chuyển đổi auth mode
  const switchToSignUp = () => setAuthMode("signup");
  const switchToLogin = () => setAuthMode("login");
  const switchToForgot = () => setAuthMode("forgot");
  const switchToReset = () => setAuthMode("reset");

  // Render auth form dựa trên authMode
  const renderAuthForm = () => {
    switch (authMode) {
      case "login":
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToSignUp={switchToSignUp}
            onSwitchToForgot={switchToForgot}
          />
        );
      case "signup":
        return <SignUp onSwitchToLogin={switchToLogin} />;
      case "forgot":
        return (
          <ForgotPassword
            onSwitchToLogin={switchToLogin}
            onSwitchToReset={switchToReset}
          />
        );
      case "reset":
        return <ResetPassword onSwitchToLogin={switchToLogin} />;
      default:
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToSignUp={switchToSignUp}
            onSwitchToForgot={switchToForgot}
          />
        );
    }
  };

  // Kiểm tra token khi component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setCurrentUser(JSON.parse(userData));
      setShowAuth(false);
    }
    fetchUsers();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 User Management System</h1>
        <p>Quản lý người dùng với React + Node.js</p>

        {currentUser && (
          <div className="user-info">
            <div className="user-avatar">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt="Avatar"
                  className="avatar-small"
                />
              ) : (
                <span>👤</span>
              )}
              <span>Xin chào, {currentUser.name}</span>
            </div>
            <div className="header-buttons">
              <button
                onClick={() => setActiveTab("profile")}
                className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
              >
                👤 Profile
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
              >
                📋 Users
              </button>
              <button onClick={handleLogout} className="logout-btn">
                🚪 Đăng xuất
              </button>
            </div>
          </div>
        )}

        <div style={{ fontSize: "14px", marginTop: "10px" }}>
          <strong>Backend Status:</strong>
          <span
            style={{ color: error ? "red" : "lightgreen", marginLeft: "10px" }}
          >
            {error ? "❌ Disconnected" : "✅ Connected"}
          </span>
        </div>
      </header>

      <main className="main-content">
        {showAuth ? (
          // Hiển thị form đăng nhập/đăng ký/quên mật khẩu
          <div className="auth-container">{renderAuthForm()}</div>
        ) : (
          // Hiển thị nội dung chính khi đã đăng nhập
          <>
            {activeTab === "users" ? (
              <>
                <AddUser onUserAdded={fetchUsers} />

                {loading && (
                  <div className="loading">🔄 Đang tải dữ liệu...</div>
                )}
                {error && (
                  <div className="error-message">
                    <strong>❌ Lỗi:</strong> {error}
                    <div style={{ marginTop: "10px", fontSize: "14px" }}>
                      <button onClick={fetchUsers} className="btn-retry">
                        🔄 Thử lại
                      </button>
                    </div>
                  </div>
                )}

                {!loading && !error && (
                  <UserList
                    users={users}
                    onDeleteUser={handleDeleteUser}
                    onUpdateUser={handleUpdateUser}
                  />
                )}
              </>
            ) : (
              <Profile
                currentUser={currentUser}
                onUpdateSuccess={handleUpdateProfile}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
