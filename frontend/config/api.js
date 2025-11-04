const API_BASE_URL = "https://group-7-project-tqac.onrender.com";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    UPLOAD_AVATAR: `${API_BASE_URL}/api/auth/upload-avatar`,
    UPLOAD_AVATAR_URL: `${API_BASE_URL}/api/auth/upload-avatar-url`,
  },
  USERS: {
    BASE: `${API_BASE_URL}/api`,
    GET_ALL: `${API_BASE_URL}/api`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/api/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/${id}`,
  },
};

export default API_BASE_URL;
