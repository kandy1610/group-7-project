import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import UserList from "./components/UserList";
import AddUser from "./components/AddUser";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Profile from "./components/Profile";
import ForgotPassword from "./components/ForgotPassword";
import ResetPasswordPage from "./components/ResetPasswordPage";
import { API_ENDPOINTS } from "./config/api";
import "./App.css";

// Tách MainApp component để sử dụng với Router
function MainApp() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [authMode, setAuthMode] = useState("login");
  const navigate = useNavigate();

  // Hàm fetchUsers - THÊM DEBUG CHI TIẾT
  const fetchUsers = async () => {
    console.log("🔄 Fetching users from backend...");
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      console.log("🔑 Token:", token);

      if (!token) {
        setError("Vui lòng đăng nhập để xem danh sách users");
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      console.log("📤 Sending request to:", API_ENDPOINTS.USERS.GET_ALL);

      const response = await axios.get(API_ENDPOINTS.USERS.GET_ALL, config);
      console.log("✅ Users fetched successfully:", response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("❌ Error fetching users:", error);

      // DEBUG CHI TIẾT HƠN
      if (error.response) {
        console.error("📊 Response data:", error.response.data);
        console.error("🔢 Status code:", error.response.status);
        console.error("📋 Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("🌐 No response received:", error.request);
      }

      if (error.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setCurrentUser(null);
        setShowAuth(true);
      } else if (error.response?.status === 403) {
        setError("Bạn không có quyền truy cập tính năng này.");
      } else if (error.response?.status === 400) {
        const errorMsg =
          error.response?.data?.message ||
          "Bad request - Kiểm tra token và quyền truy cập";
        setError(`Lỗi request: ${errorMsg}`);
      } else {
        setError(
          "Không thể tải danh sách users: " + (error.message || "Lỗi kết nối")
        );
      }
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
    navigate("/");
  };

  // Hàm xóa user
  const handleDeleteUser = async (userId) => {
    console.log("🗑️ Deleting user:", userId);
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.delete(API_ENDPOINTS.USERS.DELETE(userId), config);
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

  // Hàm cập nhật user
  const handleUpdateUser = async (userId, updatedData) => {
    console.log("✏️ Updating user:", userId, updatedData);
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.put(API_ENDPOINTS.USERS.UPDATE(userId), updatedData, config);
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

  // Hàm cập nhật profile
  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
    fetchUsers();
  };

  // Các hàm chuyển đổi auth mode
  const switchToSignUp = () => setAuthMode("signup");
  const switchToLogin = () => setAuthMode("login");
  const switchToForgot = () => setAuthMode("forgot");

  // Render auth form
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
        return <ForgotPassword onSwitchToLogin={switchToLogin} />;
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

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(API_ENDPOINTS.AUTH.PROFILE, config);
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    console.log("🔑 Token from storage:", token);
    console.log("👤 User data from storage:", userData);

    if (token && userData && userData !== "undefined" && userData !== "null") {
      const loadUser = async () => {
        try {
          const freshUser = await fetchCurrentUser();
          const parsedUser = freshUser || JSON.parse(userData);

          console.log("👑 User role:", parsedUser.role);
          console.log("🆔 User ID:", parsedUser._id);

          setCurrentUser(parsedUser);
          setShowAuth(false);
          console.log("✅ User authenticated:", parsedUser);

          // CHỈ FETCH USERS NẾU LÀ ADMIN
          if (parsedUser.role === "admin") {
            fetchUsers();
          } else {
            console.log("ℹ️ User is not admin, skipping users fetch");
            setError("Bạn cần quyền admin để xem danh sách users");
          }

          if (freshUser) {
            localStorage.setItem("user", JSON.stringify(freshUser));
          }
        } catch (error) {
          console.error("❌ Error loading user data:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      };

      loadUser();
    } else {
      console.log("ℹ️ No valid token or user data found");
      setShowAuth(true);
    }
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
          <div className="auth-container">{renderAuthForm()}</div>
        ) : (
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

// Component App chính với Router
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;
