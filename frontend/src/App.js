import React, { useState, useEffect } from "react";
import axios from "axios";
import UserList from "./components/UserList";
import AddUser from "./components/AddUser";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(true);
  const [isLogin, setIsLogin] = useState(true);

  // Hàm fetch users từ API - CÓ token
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
    setIsLogin(true);
    setUsers([]);
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

  const switchToSignUp = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 User Management System</h1>
        <p>Quản lý người dùng với React + Node.js</p>

        {currentUser && (
          <div className="user-info">
            <span>👤 Xin chào, {currentUser.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Đăng xuất
            </button>
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
          // Hiển thị form đăng nhập/đăng ký
          <div className="auth-container">
            {isLogin ? (
              <Login
                onLoginSuccess={handleLoginSuccess}
                onSwitchToSignUp={switchToSignUp}
              />
            ) : (
              <SignUp onSwitchToLogin={switchToLogin} />
            )}
          </div>
        ) : (
          // Hiển thị nội dung chính khi đã đăng nhập
          <>
            <AddUser onUserAdded={fetchUsers} />

            {loading && <div className="loading">🔄 Đang tải dữ liệu...</div>}
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
        )}
      </main>
    </div>
  );
}

export default App;
