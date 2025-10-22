import React, { useState, useEffect } from "react";
import axios from "axios";
import UserList from "./components/UserList";
import AddUser from "./components/AddUser";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Hàm fetch users từ API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // SỬA URL: bỏ /api
      const response = await axios.get("http://localhost:3000/users");
      setUsers(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(
        "Không thể tải danh sách users. Vui lòng kiểm tra backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch users khi component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 User Management System</h1>
        <p>Quản lý người dùng với React + Node.js</p>
      </header>

      <main className="main-content">
        {/* Component thêm user */}
        <AddUser onUserAdded={fetchUsers} />

        {/* Hiển thị loading hoặc error */}
        {loading && <div className="loading">Đang tải dữ liệu...</div>}
        {error && <div className="error-message">{error}</div>}

        {/* Component hiển thị danh sách users */}
        {!loading && !error && <UserList users={users} />}
      </main>
    </div>
  );
}

export default App;
