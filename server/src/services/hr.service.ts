import { db } from '../config/db';
import { AttendanceEntity, AttendanceStatus, PaginatedResult } from '../types';
import { formatDate } from '../utils/timeUtils';
import { exportAttendanceToCSV } from '../utils/csvExporter';
export class HRService {
  public async getDashboardMetrics() {
    const todayStr = formatDate(new Date());
    const employees = db.getUsers().filter((u) => u.isActive);
    const totalEmployees = employees.length;
    const todayAttendances = db.getAttendances().filter((a) => a.date === todayStr);
    let presentToday = 0;
    let lateToday = 0;
    let absentToday = 0;
    let onLeaveToday = 0;
    let inProgressToday = 0;
    for (const emp of employees) {
      const att = todayAttendances.find((a) => a.employeeId === emp.id);
      if (!att) {
        absentToday++;
      } else {
        if (att.status === 'PRESENT' || att.status === 'COMPLETED') {
          presentToday++;
        } else if (att.status === 'LATE') {
          lateToday++;
          presentToday++; // Late employees are present
        } else if (att.status === 'IN_PROGRESS') {
          inProgressToday++;
          presentToday++;
        } else if (att.status === 'ON_LEAVE') {
          onLeaveToday++;
        } else if (att.status === 'ABSENT') {
          absentToday++;
        }
      }
    }
    const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;
    const pendingLeaves = db.getLeaves().filter((l) => l.status === 'PENDING').length;
    return {
      totalEmployees,
      presentToday,
      lateToday,
      absentToday,
      onLeaveToday,
      inProgressToday,
      attendanceRate,
      pendingLeaves,
      date: todayStr,
    };
  }
  public async getAttendanceTrends(days: number = 7) {
    const trends: Array<{
      date: string;
      displayDate: string;
      present: number;
      late: number;
      absent: number;
      onLeave: number;
      total: number;
    }> = [];

    const employees = db.getUsers().filter((u) => u.isActive);
    const totalEmp = employees.length;
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      if (isWeekend && days <= 7) continue;
      const dateStr = formatDate(d);
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayRecords = db.getAttendances().filter((a) => a.date === dateStr);
      let present = 0;
      let late = 0;
      let absent = 0;
      let onLeave = 0;
      for (const emp of employees) {
        const rec = dayRecords.find((r) => r.employeeId === emp.id);
        if (!rec) {
          if (!isWeekend) absent++;
        } else {
          if (rec.status === 'PRESENT' || rec.status === 'COMPLETED' || rec.status === 'IN_PROGRESS') {
            present++;
          } else if (rec.status === 'LATE') {
            late++;
            present++;
          } else if (rec.status === 'ON_LEAVE') {
            onLeave++;
          } else if (rec.status === 'ABSENT') {
            absent++;
          }
        }
      }
      trends.push({
        date: dateStr,
        displayDate,
        present,
        late,
        absent,
        onLeave,
        total: totalEmp,
      });
    }

    return trends;
  }
  public async getDepartmentBreakdown() {
    const employees = db.getUsers().filter((u) => u.isActive);
    const todayStr = formatDate(new Date());
    const todayRecords = db.getAttendances().filter((a) => a.date === todayStr);
    const deptMap: Record<string, { total: number; present: number; late: number; onLeave: number }> = {};
    employees.forEach((emp) => {
      if (!deptMap[emp.department]) {
        deptMap[emp.department] = { total: 0, present: 0, late: 0, onLeave: 0 };
      }
      deptMap[emp.department].total++;
      const rec = todayRecords.find((r) => r.employeeId === emp.id);
      if (rec) {
        if (rec.status === 'PRESENT' || rec.status === 'COMPLETED' || rec.status === 'IN_PROGRESS') {
          deptMap[emp.department].present++;
        } else if (rec.status === 'LATE') {
          deptMap[emp.department].late++;
          deptMap[emp.department].present++;
        } else if (rec.status === 'ON_LEAVE') {
          deptMap[emp.department].onLeave++;
        }
      }
    });
    return Object.keys(deptMap).map((department) => {
      const data = deptMap[department];
      const rate = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
      return {
        department,
        total: data.total,
        present: data.present,
        late: data.late,
        onLeave: data.onLeave,
        absent: data.total - data.present - data.onLeave,
        attendanceRate: rate,
      };
    });
  }
  public async getAllAttendance(filters: {
    startDate?: string;
    endDate?: string;
    status?: AttendanceStatus;
    department?: string;
    employeeId?: string;
    search?: string;
    page?: number;
    limit?: number;
    exportCSV?: boolean;
  }): Promise<{ csv?: string } | PaginatedResult<AttendanceEntity>> {
    let records = db.getAttendances().map((a) => this.enrichAttendance(a));
    if (filters.startDate) {
      records = records.filter((r) => r.date >= filters.startDate!);
    }
    if (filters.endDate) {
      records = records.filter((r) => r.date <= filters.endDate!);
    }
    if (filters.status) {
      records = records.filter((r) => r.status === filters.status);
    }
    if (filters.department) {
      records = records.filter((r) => r.employee?.department === filters.department);
    }
    if (filters.employeeId) {
      records = records.filter((r) => r.employeeId === filters.employeeId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      records = records.filter(
        (r) =>
          r.employee?.name.toLowerCase().includes(q) ||
          r.employee?.employeeCode.toLowerCase().includes(q) ||
          r.employee?.email.toLowerCase().includes(q) ||
          r.employee?.department.toLowerCase().includes(q)
      );
    }
    records.sort((a, b) => b.date.localeCompare(a.date));

    if (filters.exportCSV) {
      const csv = exportAttendanceToCSV(records);
      return { csv };
    }
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const total = records.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = records.slice(startIndex, startIndex + limit);
    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
  public async getEmployees() {
    const todayStr = formatDate(new Date());
    const employees = db.getUsers().filter((u) => u.isActive);
    const todayAttendances = db.getAttendances().filter((a) => a.date === todayStr);

    return employees.map((emp) => {
      const { password, ...safeUser } = emp;
      const todayAtt = todayAttendances.find((a) => a.employeeId === emp.id);
      const balance = db.findLeaveBalanceByEmployee(emp.id);

      return {
        ...safeUser,
        todayStatus: todayAtt ? todayAtt.status : 'NOT_CHECKED_IN',
        todayCheckIn: todayAtt?.checkIn || null,
        todayCheckOut: todayAtt?.checkOut || null,
        todayWorkingHours: todayAtt?.workingHours || 0,
        leaveBalance: balance || null,
      };
    });
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
export const hrService = new HRService();
