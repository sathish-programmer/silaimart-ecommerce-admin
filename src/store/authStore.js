import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('admin_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      
      if (!['admin', 'superadmin'].includes(user.role)) {
        throw new Error('Admin access required');
      }
      
      localStorage.setItem('admin_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      set({ user, token, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: error.response?.data?.message || error.message || 'Login failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ user: null, token: null });
      return false;
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(`${API_URL}/auth/profile`);
      
      if (!['admin', 'superadmin'].includes(response.data.role)) {
        get().logout();
        return false;
      }
      
      set({ user: response.data });
      return true;
    } catch (error) {
      get().logout();
      return false;
    }
  }
}));