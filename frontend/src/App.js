// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// API base URL - SỬA THÀNH PORT 5000
const API_BASE_URL = 'http://localhost:3000/api';

// Component để test API connection
const ApiTest = () => {
  const [testResult, setTestResult] = useState('');

  const testApi = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/test`);
      setTestResult(`✅ Backend Working: ${response.data.message}`);
    } catch (error) {
      setTestResult(`❌ Backend Error: ${error.message}`);
    }
  };

  return (
    <div className="api-test">
      <h3>Backend Connection Test</h3>
      <button onClick={testApi} className="test-btn">
        Test Backend Connection
      </button>
      {testResult && (
        <div className={`message ${testResult.includes('✅') ? 'success' : 'error'}`}>
          {testResult}
        </div>
      )}
    </div>
  );
};

// Profile Component
const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('🔐 Token:', token);
      
      if (!token) {
        setMessage('No token found. Please login again.');
        return;
      }

      console.log('🌐 Fetching profile from:', `${API_BASE_URL}/profile`);

      const response = await axios.get(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        }
      });
      
      console.log('📨 Profile response:', response.data);
      
      if (response.data.success) {
        setUser(response.data.user);
        setFormData({
          name: response.data.user.name,
          email: response.data.user.email
        });
        setMessage(''); // Clear any previous errors
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      console.error('📋 Error details:', error.response?.data);
      
      if (error.response?.status === 401) {
        setMessage('Token expired. Please login again.');
        localStorage.removeItem('token');
      } else if (error.response?.status === 404) {
        setMessage('Profile not found. Please check backend routes.');
      } else {
        setMessage(error.response?.data?.message || 'Failed to load profile. Check backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/profile`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token
          }
        }
      );

      if (response.data.success) {
        setUser(response.data.user);
        setEditMode(false);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading && !user) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <p>{message || 'No user data available'}</p>
          <button onClick={fetchProfile} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      
      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="profile-card">
        {!editMode ? (
          <div className="profile-view">
            <div className="profile-field">
              <label>Name:</label>
              <span>{user.name}</span>
            </div>
            <div className="profile-field">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="profile-field">
              <label>Role:</label>
              <span className={`role ${user.role}`}>{user.role}</span>
            </div>
            <div className="profile-field">
              <label>User ID:</label>
              <span className="user-id">{user.id}</span>
            </div>
            <button 
              className="edit-btn"
              onClick={() => setEditMode(true)}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Edit Profile'}
            </button>
          </div>
        ) : (
          <form className="profile-edit" onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="button-group">
              <button 
                type="submit" 
                className="save-btn"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    name: user.name,
                    email: user.email
                  });
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Login Component
const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: 'phangjathinh@example.com',
    password: '123456'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);
      
      console.log('🔑 Login response:', response.data);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setMessage('Login successful! Redirecting...');
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage(error.response?.data?.message || 'Login failed! Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {message && (
        <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

// Main App Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>User Management System</h1>
        <p>Authentication & Profile Management</p>
      </header>

      <nav className="app-nav">
        {isLoggedIn && (
          <div className="nav-buttons">
            <button className="nav-btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </nav>

      <main className="main-content">
        <ApiTest />
        {!isLoggedIn ? (
          <Login onLoginSuccess={() => setIsLoggedIn(true)} />
        ) : (
          <Profile />
        )}
      </main>
    </div>
  );
}

export default App;