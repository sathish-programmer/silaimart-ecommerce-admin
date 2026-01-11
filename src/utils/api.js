const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('admin_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  return response;
};