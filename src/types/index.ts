export type Role = 'EMPLOYEE' | 'HR_ADMIN';

export type AttendanceStatus =
  | 'PRESENT'
  | 'LATE'
  | 'ABSENT'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ON_LEAVE'
  | 'HALF_DAY';

export type LeaveType = 'CASUAL' | 'SICK' | 'ANNUAL' | 'UNPAID';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  designation: string;
  avatar?: string;
  employeeCode: string;
  phone?: string;
  joinDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  todayStatus?: AttendanceStatus | 'NOT_CHECKED_IN';
  todayCheckIn?: string | null;
  todayCheckOut?: string | null;
  todayWorkingHours?: number;
  leaveBalance?: LeaveBalance | null;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number;
  overtime: number;
  status: AttendanceStatus;
  notes?: string;
  ipAddress?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    name: string;
    email: string;
    department: string;
    designation: string;
    employeeCode: string;
    avatar?: string;
  };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: string | null;
  adminComment?: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    name: string;
    email: string;
    department: string;
    designation: string;
    employeeCode: string;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  casualLeave: number;
  sickLeave: number;
  annualLeave: number;
  usedCasual: number;
  usedSick: number;
  usedAnnual: number;
  year: number;
  availableCasual?: number;
  availableSick?: number;
  availableAnnual?: number;
  totalAvailable?: number;
}

export interface TodayAttendanceStatus {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  attendance: AttendanceRecord | null;
  status: AttendanceStatus | 'NOT_CHECKED_IN';
  currentWorkingHours: number;
}

export interface AttendanceSummary {
  totalRecords: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  totalOnLeave: number;
  totalWorkingHours: number;
  totalOvertimeHours: number;
  avgWorkingHours: number;
}

export interface HRDashboardData {
  metrics: {
    totalEmployees: number;
    presentToday: number;
    lateToday: number;
    absentToday: number;
    onLeaveToday: number;
    inProgressToday: number;
    attendanceRate: number;
    pendingLeaves: number;
    date: string;
  };
  trends: Array<{
    date: string;
    displayDate: string;
    present: number;
    late: number;
    absent: number;
    onLeave: number;
    total: number;
  }>;
  departmentStats: Array<{
    department: string;
    total: number;
    present: number;
    late: number;
    onLeave: number;
    absent: number;
    attendanceRate: number;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}
