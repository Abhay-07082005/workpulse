import api from './api';
import { User, ApiResponse } from '../types';

export const authService = {
  async login(email: string, password: string):Promise<{ user: User; token: string }> {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      email,
      password,
    });
    if (res.data.data?.token) {
      localStorage.setItem('workpulse_token', res.data.data.token);
    }
    return res.data.data!;
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    department: string;
    designation: string;
    role?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
    if (res.data.data?.token) {
      localStorage.setItem('workpulse_token', res.data.data.token);
    }
    return res.data.data!;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('workpulse_token');
    }
  },

  async getMe(): Promise<{ user: User; leaveBalance?: any }> {
    const res = await api.get<ApiResponse<{ user: User; leaveBalance?: any }>>('/auth/me');
    return res.data.data!;
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const res = await api.patch<ApiResponse<User>>('/auth/profile', updates);
    return res.data.data!;
  },
};
