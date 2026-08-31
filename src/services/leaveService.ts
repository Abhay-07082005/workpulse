import api from './api';
import { LeaveRequest, LeaveBalance, LeaveType, ApiResponse } from '../types';

export const leaveService = {
  async applyLeave(data: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }): Promise<LeaveRequest> {
    const res = await api.post<ApiResponse<LeaveRequest>>('/leaves', data);
    return res.data.data!;
  },

  async getMyLeaves(): Promise<{
    leaves: LeaveRequest[];
    balance: LeaveBalance;
  }> {
    const res = await api.get<ApiResponse<{ leaves: LeaveRequest[]; balance: LeaveBalance }>>('/leaves/my-leaves');
    return res.data.data!;
  },

  async getMyBalance(): Promise<LeaveBalance> {
    const res = await this.getMyLeaves();
    return res.balance;
  },

  async getAllLeaves(filters: { status?: string; department?: string } = {}): Promise<LeaveRequest[]> {
    const res = await api.get<ApiResponse<LeaveRequest[]>>('/leaves', { params: filters });
    return res.data.data!;
  },

  async reviewLeave(
    leaveId: string,
    review: { status: 'APPROVED' | 'REJECTED'; adminComment?: string }
  ): Promise<LeaveRequest> {
    const res = await api.patch<ApiResponse<LeaveRequest>>(`/leaves/${leaveId}/status`, review);
    return res.data.data!;
  },
};
