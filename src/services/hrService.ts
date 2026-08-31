import api from './api';
import { HRDashboardData, User, AttendanceRecord, ApiResponse } from '../types';

export const hrService = {
  async getDashboard(): Promise<HRDashboardData> {
    const res = await api.get<ApiResponse<HRDashboardData>>('/hr/dashboard');
    return res.data.data!;
  },

  async getDashboardData(): Promise<HRDashboardData> {
    return this.getDashboard();
  },

  async getEmployees(): Promise<User[]> {
    const res = await api.get<ApiResponse<User[]>>('/hr/employees');
    return res.data.data!;
  },

  async getAttendance(params: {
    startDate?: string;
    endDate?: string;
    status?: string;
    department?: string;
    employeeId?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    items: AttendanceRecord[];
    records: AttendanceRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const res = await api.get<ApiResponse<any>>('/hr/attendance', { params });
    const data = res.data.data!;
    return {
      ...data,
      records: data.records || data.items || [],
      items: data.items || data.records || [],
    };
  },

  async getAllAttendance(params: {
    startDate?: string;
    endDate?: string;
    status?: string;
    department?: string;
    employeeId?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    items: AttendanceRecord[];
    records: AttendanceRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAttendance(params);
  },

  async exportAttendanceCSV(params: {
    startDate?: string;
    endDate?: string;
    status?: string;
    department?: string;
    employeeId?: string;
    search?: string;
  } = {}): Promise<void> {
    const queryParams = new URLSearchParams({ ...params, format: 'csv' } as any).toString();
    const token = localStorage.getItem('workpulse_token');
    
    // Direct trigger download via fetch with headers
    const response = await fetch(`/api/hr/attendance?${queryParams}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate CSV export');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
