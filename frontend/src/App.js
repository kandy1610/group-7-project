import React, { useState, useEffect } from "react";
import axios from "axios";
import UserList from "./components/UserList";
import AddUser from "./components/AddUser";
import { API_ENDPOINTS } from "./config/api";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Hàm fetch users từ API
  const fetchUsers = async () => {
    console.log("🔄 Fetching users from backend...");
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_ENDPOINTS.USERS.GET_ALL);
      console.log("✅ Users fetched successfully:", response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      setError(
        error.response?.status === 404
          ? "Backend server không khả dụng. Hãy chắc chắn backend đang chạy trên port 3000!"
          : "Không thể tải danh sách users. Vui lòng kiểm tra backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  // Hàm xóa user
  const handleDeleteUser = async (userId) => {
    console.log("🗑️ Deleting user:", userId);
    try {
      await axios.delete(API_ENDPOINTS.USERS.DELETE(userId));
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
      await axios.put(API_ENDPOINTS.USERS.UPDATE(userId), updatedData);
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

  // Fetch users khi component mount
  useEffect(() => {
    console.log("🏁 App component mounted, fetching users...");
    fetchUsers();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 User Management System</h1>
        <p>Quản lý người dùng với React + Node.js</p>
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
        {/* Component thêm user */}
        <AddUser onUserAdded={fetchUsers} />

        {/* Hiển thị loading hoặc error */}
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

        {/* Component hiển thị danh sách users */}
        {!loading && !error && (
          <UserList
            users={users}
            onDeleteUser={handleDeleteUser}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </main>
    </div>
  );
}

export default App;