import { db } from '../config/db';
import { LeaveEntity, LeaveType, LeaveStatus, AttendanceEntity } from '../types';
import { formatDate } from '../utils/timeUtils';
interface ApplyLeaveInput {
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}
export class LeaveService {

  public async applyLeave(input: ApplyLeaveInput) {
    if (input.startDate > input.endDate) {
      throw new Error('Start date cannot be after end date.');
    }

    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    let balance = db.findLeaveBalanceByEmployee(input.employeeId);
    if (!balance) {
      balance = db.createLeaveBalance({
        id: `bal_${input.employeeId}`,
        employeeId: input.employeeId,
        casualLeave: 12,
        sickLeave: 10,
        annualLeave: 15,
        usedCasual: 0,
        usedSick: 0,
        usedAnnual: 0,
        year: new Date().getFullYear(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (input.leaveType === 'CASUAL') {
      const remaining = balance.casualLeave - balance.usedCasual;
      if (daysCount > remaining) {
        throw new Error(`Insufficient Casual Leave balance. Remaining: ${remaining} days, Requested: ${daysCount} days.`);
      }
    } else if (input.leaveType === 'SICK') {
      const remaining = balance.sickLeave - balance.usedSick;
      if (daysCount > remaining) {
        throw new Error(`Insufficient Sick Leave balance. Remaining: ${remaining} days, Requested: ${daysCount} days.`);
      }
    } else if (input.leaveType === 'ANNUAL') {
      const remaining = balance.annualLeave - balance.usedAnnual;
      if (daysCount > remaining) {
        throw new Error(`Insufficient Annual Leave balance. Remaining: ${remaining} days, Requested: ${daysCount} days.`);
      }
    }

    const newLeave: LeaveEntity = {
      id: `lv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      employeeId: input.employeeId,
      leaveType: input.leaveType,
      startDate: input.startDate,
      endDate: input.endDate,
      daysCount,
      reason: input.reason,
      status: 'PENDING',
      reviewedBy: null,
      adminComment: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createLeave(newLeave);
    return this.enrichLeave(newLeave);
  }
  public async getMyLeaves(employeeId: string) {
    const leaves = db.getLeaves().filter((l) => l.employeeId === employeeId);
    leaves.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    let balance = db.findLeaveBalanceByEmployee(employeeId);
    if (!balance) {
      balance = {
        id: `bal_${employeeId}`,
        employeeId,
        casualLeave: 12,
        sickLeave: 10,
        annualLeave: 15,
        usedCasual: 0,
        usedSick: 0,
        usedAnnual: 0,
        year: new Date().getFullYear(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      leaves: leaves.map((l) => this.enrichLeave(l)),
      balance: {
        ...balance,
        availableCasual: balance.casualLeave - balance.usedCasual,
        availableSick: balance.sickLeave - balance.usedSick,
        availableAnnual: balance.annualLeave - balance.usedAnnual,
        totalAvailable: (balance.casualLeave - balance.usedCasual) + (balance.sickLeave - balance.usedSick) + (balance.annualLeave - balance.usedAnnual),
      },
    };
  }

  public async getAllLeaves(filters: { status?: LeaveStatus; department?: string } = {}) {
    let leaves = db.getLeaves();

    if (filters.status) {
      leaves = leaves.filter((l) => l.status === filters.status);
    }

    leaves.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    let enriched = leaves.map((l) => this.enrichLeave(l));

    if (filters.department) {
      enriched = enriched.filter((l) => l.employee?.department === filters.department);
    }

    return enriched;
  }

  public async reviewLeave(
    leaveId: string,
    reviewerId: string,
    review: { status: 'APPROVED' | 'REJECTED'; adminComment?: string }
  ) {
    const leave = db.findLeaveById(leaveId);
    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== 'PENDING') {
      throw new Error(`This leave request has already been ${leave.status.toLowerCase()}`);
    }

    const updated = db.updateLeave(leaveId, {
      status: review.status,
      reviewedBy: reviewerId,
      adminComment: review.adminComment || (review.status === 'APPROVED' ? 'Approved by HR' : 'Rejected by HR'),
      updatedAt: new Date().toISOString(),
    });

    if (!updated) throw new Error('Failed to update leave status');

    if (review.status === 'APPROVED') {
      const balance = db.findLeaveBalanceByEmployee(leave.employeeId);
      if (balance) {
        const updates: Partial<typeof balance> = {};
        if (leave.leaveType === 'CASUAL') {
          updates.usedCasual = balance.usedCasual + leave.daysCount;
        } else if (leave.leaveType === 'SICK') {
          updates.usedSick = balance.usedSick + leave.daysCount;
        } else if (leave.leaveType === 'ANNUAL') {
          updates.usedAnnual = balance.usedAnnual + leave.daysCount;
        }
        db.updateLeaveBalance(leave.employeeId, updates);
      }

      const curr = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      while (curr <= end) {
        if (curr.getDay() !== 0 && curr.getDay() !== 6) {
          const dateStr = formatDate(curr);
          const existingAtt = db.findAttendanceByEmployeeAndDate(leave.employeeId, dateStr);

          if (existingAtt) {
            db.updateAttendance(existingAtt.id, {
              status: 'ON_LEAVE',
              notes: `Approved Leave (${leave.leaveType})`,
            });
          } else {
            db.createAttendance({
              id: `att_${leave.employeeId}_${dateStr}`,
              employeeId: leave.employeeId,
              date: dateStr,
              checkIn: null,
              checkOut: null,
              workingHours: 0,
              overtime: 0,
              status: 'ON_LEAVE',
              notes: `Approved Leave (${leave.leaveType})`,
              location: 'Remote/Leave',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
        curr.setDate(curr.getDate() + 1);
      }
    }

    return this.enrichLeave(updated);
  }

  private enrichLeave(leave: LeaveEntity): LeaveEntity {
    const emp = db.findUserById(leave.employeeId);
    if (emp) {
      leave.employee = {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        employeeCode: emp.employeeCode,
      };
    }

    if (leave.reviewedBy) {
      const rev = db.findUserById(leave.reviewedBy);
      if (rev) {
        leave.reviewer = {
          id: rev.id,
          name: rev.name,
          email: rev.email,
        };
      }
    }

    return leave;
  }
}

export const leaveService = new LeaveService();
