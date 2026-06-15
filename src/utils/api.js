import axios from 'axios';

const API = axios.create({
  // baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  baseURL: process.env.REACT_APP_API_URL || 'https://backend-dashboard-d8z5.onrender.com/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
