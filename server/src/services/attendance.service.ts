import { db } from '../config/db';
import { AttendanceEntity, AttendanceStatus, PaginatedResult } from '../types';
import { formatDate, evaluateCheckInStatus, calculateWorkingHoursAndOvertime } from '../utils/timeUtils';
export class AttendanceService {
  public async checkIn(employeeId: string, options: { location?: string; notes?: string } = {}) {
    const todayStr = formatDate(new Date());
    const existing = db.findAttendanceByEmployeeAndDate(employeeId, todayStr);

    if (existing && existing.checkIn) {
      throw new Error('You have already checked in for today (' + todayStr + ').');
    }
    const now = new Date();
    const evaluatedStatus: AttendanceStatus = evaluateCheckInStatus(now);
    const newAttendance: AttendanceEntity = {
      id: existing ? existing.id : `att_${employeeId}_${todayStr}`,
      employeeId,
      date: todayStr,
      checkIn: now.toISOString(),
      checkOut: null,
      workingHours: 0,
      overtime: 0,
      status: evaluatedStatus === 'LATE' ? 'LATE' : 'IN_PROGRESS',
      location: options.location || 'Office HQ',
      notes: options.notes || (evaluatedStatus === 'LATE' ? 'Late check-in' : undefined),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    if (existing) {
      db.updateAttendance(existing.id, newAttendance);
    } else {
      db.createAttendance(newAttendance);
    }
    return this.enrichAttendance(newAttendance);
  }
  public async checkOut(employeeId: string, options: { notes?: string } = {}) {
    const todayStr = formatDate(new Date());
    const attendance = db.findAttendanceByEmployeeAndDate(employeeId, todayStr);
    if (!attendance || !attendance.checkIn) {
      throw new Error('No active check-in found for today. Please check in first.');
    }
    if (attendance.checkOut) {
      throw new Error('You have already checked out for today.');
    }
    const checkInDate = new Date(attendance.checkIn);
    const checkOutDate = new Date();
    const { workingHours, overtime } = calculateWorkingHoursAndOvertime(checkInDate, checkOutDate);
    let finalStatus: AttendanceStatus = 'COMPLETED';
    if (attendance.status === 'LATE') {
      finalStatus = 'LATE'; 
    } else if (workingHours < 4.0) {
      finalStatus = 'HALF_DAY';
    }
    const updated = db.updateAttendance(attendance.id, {
      checkOut: checkOutDate.toISOString(),
      workingHours,
      overtime,
      status: finalStatus,
      notes: options.notes ? (attendance.notes ? `${attendance.notes}; ${options.notes}` : options.notes) : attendance.notes,
      updatedAt: checkOutDate.toISOString(),
    });

    if (!updated) throw new Error('Failed to update attendance');
    return this.enrichAttendance(updated);
  }
  public async getTodayAttendance(employeeId: string) {
    const todayStr = formatDate(new Date());
    const attendance = db.findAttendanceByEmployeeAndDate(employeeId, todayStr);
    if (!attendance) {
      return {
        hasCheckedIn: false,
        hasCheckedOut: false,
        attendance: null,
        status: 'NOT_CHECKED_IN',
        currentWorkingHours: 0,
      };
    }
    let currentWorkingHours = attendance.workingHours;
    if (attendance.checkIn && !attendance.checkOut) {
      const diffMs = Date.now() - new Date(attendance.checkIn).getTime();
      currentWorkingHours = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);
    }
    return {
      hasCheckedIn: !!attendance.checkIn,
      hasCheckedOut: !!attendance.checkOut,
      attendance: this.enrichAttendance(attendance),
      status: attendance.status,
      currentWorkingHours,
    };
  }
  public async getMyAttendance(
    employeeId: string,
    filters: {
      startDate?: string;
      endDate?: string;
      status?: AttendanceStatus;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<PaginatedResult<AttendanceEntity> & { summary: any }> {
    const { startDate, endDate, status, page = 1, limit = 10 } = filters;
    let records = db.getAttendances().filter((a) => a.employeeId === employeeId);
    if (startDate) records = records.filter((r) => r.date >= startDate);
    if (endDate) records = records.filter((r) => r.date <= endDate);
    if (status) {
      records = records.filter((r) => r.status === status);
    }
    records.sort((a, b) => b.date.localeCompare(a.date));
    const totalPresent = records.filter((r) => r.status === 'PRESENT' || r.status === 'COMPLETED').length;
    const totalLate = records.filter((r) => r.status === 'LATE').length;
    const totalAbsent = records.filter((r) => r.status === 'ABSENT').length;
    const totalOnLeave = records.filter((r) => r.status === 'ON_LEAVE').length;
    const totalWorkingHours = records.reduce((acc, r) => acc + (r.workingHours || 0), 0);
    const totalOvertimeHours = records.reduce((acc, r) => acc + (r.overtime || 0), 0);
    const avgWorkingHours = records.length > 0 ? Math.round((totalWorkingHours / records.length) * 10) / 10 : 0;
    const total = records.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = records.slice(startIndex, startIndex + limit).map((r) => this.enrichAttendance(r));
    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      summary: {
        totalRecords: total,
        totalPresent,
        totalLate,
        totalAbsent,
        totalOnLeave,
        totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
        totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
        avgWorkingHours,
      },
    };
  }
  private enrichAttendance(attendance: AttendanceEntity): AttendanceEntity {
    const emp = db.findUserById(attendance.employeeId);
    if (emp) {
      attendance.employee = {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        employeeCode: emp.employeeCode,
        avatar: emp.avatar,
      };
    }
    return attendance;
  }
}
export const attendanceService = new AttendanceService();
