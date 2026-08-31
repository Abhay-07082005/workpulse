import api from './api';
import { AttendanceRecord, TodayAttendanceStatus, AttendanceSummary, ApiResponse } from '../types';

export const attendanceService = {
  async checkIn(location: string = 'Office HQ', notes?: string): Promise<AttendanceRecord> {
    const res = await api.post<ApiResponse<AttendanceRecord>>('/attendance/check-in', {
      location,
      notes,
    });
    return res.data.data!;
  },

  async checkOut(notes?: string): Promise<AttendanceRecord> {
    const res = await api.post<ApiResponse<AttendanceRecord>>('/attendance/check-out', {
      notes,
    });
    return res.data.data!;
  },

  async getTodayStatus(): Promise<TodayAttendanceStatus> {
    const res = await api.get<ApiResponse<TodayAttendanceStatus>>('/attendance/today');
    return res.data.data!;
  },

  async getMyAttendance(params: {
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    items: AttendanceRecord[];
    records: AttendanceRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    summary: AttendanceSummary;
  }> {
    const res = await api.get<ApiResponse<any>>('/attendance/my-attendance', {
      params,
    });
    const data = res.data.data!;
    return {
      ...data,
      records: data.records || data.items || [],
      items: data.items || data.records || [],
    };
  },

  async getMySummary(): Promise<AttendanceSummary> {
    const data = await this.getMyAttendance({ limit: 1 });
    return data.summary;
  },

  async exportMyAttendanceCSV(params: {
    startDate?: string;
    endDate?: string;
    status?: string;
  } = {}): Promise<void> {
    const queryParams = new URLSearchParams({ ...params, format: 'csv' } as any).toString();
    const token = localStorage.getItem('workpulse_token');
    
    const response = await fetch(`/api/attendance/my-attendance?${queryParams}`, {
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
    a.download = `my_attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
