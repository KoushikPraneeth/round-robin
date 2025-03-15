// Authentication service for admin users

import axios from 'axios';

// Backend API URL
const API_URL = 'https://couponhub-backend-n67k.onrender.com/api';

// LocalStorage key
const AUTH_KEY = 'adminAuth';

// Check if admin is logged in
export const isAdminLoggedIn = (): boolean => {
  const auth = localStorage.getItem(AUTH_KEY);
  if (!auth) return false;
  
  try {
    const { expiry } = JSON.parse(auth);
    return new Date().getTime() < expiry;
  } catch (e) {
    return false;
  }
};

// Get auth token
export const getAuthToken = (): string | null => {
  const auth = localStorage.getItem(AUTH_KEY);
  if (!auth) return null;
  
  try {
    const { token } = JSON.parse(auth);
    return token;
  } catch (e) {
    return null;
  }
};

// Admin login
export const adminLogin = async (username: string, password: string): Promise<boolean> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { username, password });
    const token = response.data.token;
    
    if (token) {
      // Set auth with 8-hour expiry
      const expiry = new Date().getTime() + (8 * 60 * 60 * 1000);
      localStorage.setItem(AUTH_KEY, JSON.stringify({ token, username, expiry }));
      window.location.href = '/admin'; // Redirect to /admin page
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

// Admin logout
export const adminLogout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

// Create axios instance with auth header
export const authAxios = axios.create({
  baseURL: API_URL
});

// Add auth token to requests
authAxios.interceptors.request.use(
  config => {
    const token = getAuthToken();
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
