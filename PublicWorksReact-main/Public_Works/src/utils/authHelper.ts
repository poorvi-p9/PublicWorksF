// export const setAuthData = (token: string, role: string) => {
//   localStorage.setItem('token', token);
//   localStorage.setItem('role', role);
// };

// export const getAuthToken = () => localStorage.getItem('token');
// export const getAuthRole = () => localStorage.getItem('role');
// export const clearAuthData = () => {
//   localStorage.removeItem('token');
//   localStorage.removeItem('role');
// };

// src/utils/authHelper.ts

// Simple function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Check if user is logged in
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Logout helper
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};