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

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password?: string;
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
}

export interface AttendanceEntity {
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

export interface LeaveEntity {
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

export interface LeaveBalanceEntity {
  id: string;
  employeeId: string;
  casualLeave: number;
  sickLeave: number;
  annualLeave: number;
  usedCasual: number;
  usedSick: number;
  usedAnnual: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRuleEntity {
  id: string;
  workStartTime: string; 
  gracePeriodEnd: string; 
  lateThresholdEnd: string; 
  standardWorkHours: number;
  allowOvertime: boolean;
}
export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
