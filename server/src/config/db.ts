import fs from 'fs';
import path from 'path';
import {
  UserEntity,
  AttendanceEntity,
  LeaveEntity,
  LeaveBalanceEntity,
  AttendanceRuleEntity,
} from '../types';
import { hashPassword } from '../utils/passwordUtils';
import { formatDate } from '../utils/timeUtils';

interface DatabaseSchema {
  users: UserEntity[];
  attendances: AttendanceEntity[];
  leaves: LeaveEntity[];
  leaveBalances: LeaveBalanceEntity[];
  rules: AttendanceRuleEntity[];
}

class Database {
  private data: DatabaseSchema = {
    users: [],
    attendances: [],
    leaves: [],
    leaveBalances: [],
    rules: [],
  };

private storageFile = path.join(
  process.cwd(),
  'data',
  '.workpulse_db.json'
);  private initialized = false;

  public async init() {
    if (this.initialized) return;

    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        this.data = JSON.parse(raw);
        this.initialized = true;
        return;
      }
    } catch (e) {
      console.warn(
        'Could not read existing database file, reseeding initial data...'
      );
    }

    await this.seedInitialData();
    this.save();
    this.initialized = true;
  }

  private save() {
    try {
      const directory = path.dirname(this.storageFile);

      // Make sure the directory exists before writing the database file
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      fs.writeFileSync(
        this.storageFile,
        JSON.stringify(this.data, null, 2),
        'utf-8'
      );
    } catch (e) {
      console.error('Failed to persist database state:', e);
    }
  }

  public getUsers(): UserEntity[] {
    return this.data.users;
  }

  public findUserById(id: string): UserEntity | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByEmail(email: string): UserEntity | undefined {
    return this.data.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  public createUser(user: UserEntity): UserEntity {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(
    id: string,
    updates: Partial<UserEntity>
  ): UserEntity | undefined {
    const index = this.data.users.findIndex((u) => u.id === id);

    if (index === -1) return undefined;

    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.save();

    return this.data.users[index];
  }

  public getAttendances(): AttendanceEntity[] {
    return this.data.attendances;
  }

  public findAttendanceById(id: string): AttendanceEntity | undefined {
    return this.data.attendances.find((a) => a.id === id);
  }

  public findAttendanceByEmployeeAndDate(
    employeeId: string,
    date: string
  ): AttendanceEntity | undefined {
    return this.data.attendances.find(
      (a) => a.employeeId === employeeId && a.date === date
    );
  }

  public createAttendance(
    attendance: AttendanceEntity
  ): AttendanceEntity {
    this.data.attendances.push(attendance);
    this.save();
    return attendance;
  }

  public updateAttendance(
    id: string,
    updates: Partial<AttendanceEntity>
  ): AttendanceEntity | undefined {
    const index = this.data.attendances.findIndex((a) => a.id === id);

    if (index === -1) return undefined;

    this.data.attendances[index] = {
      ...this.data.attendances[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.save();

    return this.data.attendances[index];
  }

  public getLeaves(): LeaveEntity[] {
    return this.data.leaves;
  }

  public findLeaveById(id: string): LeaveEntity | undefined {
    return this.data.leaves.find((l) => l.id === id);
  }

  public createLeave(leave: LeaveEntity): LeaveEntity {
    this.data.leaves.push(leave);
    this.save();
    return leave;
  }

  public updateLeave(
    id: string,
    updates: Partial<LeaveEntity>
  ): LeaveEntity | undefined {
    const index = this.data.leaves.findIndex((l) => l.id === id);

    if (index === -1) return undefined;

    this.data.leaves[index] = {
      ...this.data.leaves[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.save();

    return this.data.leaves[index];
  }

  public getLeaveBalances(): LeaveBalanceEntity[] {
    return this.data.leaveBalances;
  }

  public findLeaveBalanceByEmployee(
    employeeId: string
  ): LeaveBalanceEntity | undefined {
    return this.data.leaveBalances.find(
      (b) => b.employeeId === employeeId
    );
  }

  public createLeaveBalance(
    balance: LeaveBalanceEntity
  ): LeaveBalanceEntity {
    this.data.leaveBalances.push(balance);
    this.save();
    return balance;
  }

  public updateLeaveBalance(
    employeeId: string,
    updates: Partial<LeaveBalanceEntity>
  ): LeaveBalanceEntity | undefined {
    const index = this.data.leaveBalances.findIndex(
      (b) => b.employeeId === employeeId
    );

    if (index === -1) return undefined;

    this.data.leaveBalances[index] = {
      ...this.data.leaveBalances[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.save();

    return this.data.leaveBalances[index];
  }

  public async seedInitialData() {
    const defaultPasswordHash = await hashPassword('password123');

    const users: UserEntity[] = [
      {
        id: 'usr_hr_01',
        name: 'Sarah Jenkins',
        email: 'hr@workpulse.io',
        password: defaultPasswordHash,
        role: 'HR_ADMIN',
        department: 'Human Resources',
        designation: 'Head of People & Culture',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        employeeCode: 'EMP-HR01',
        phone: '+1 (555) 234-5678',
        joinDate: '2023-01-15',
        isActive: true,
        createdAt: new Date('2023-01-15').toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr_emp_01',
        name: 'Alex Rivera',
        email: 'alex@workpulse.io',
        password: defaultPasswordHash,
        role: 'EMPLOYEE',
        department: 'Engineering',
        designation: 'Senior Full Stack Engineer',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        employeeCode: 'EMP-ENG01',
        phone: '+1 (555) 345-6789',
        joinDate: '2023-03-01',
        isActive: true,
        createdAt: new Date('2023-03-01').toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr_emp_02',
        name: 'David Chen',
        email: 'david@workpulse.io',
        password: defaultPasswordHash,
        role: 'EMPLOYEE',
        department: 'Engineering',
        designation: 'Frontend Developer',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        employeeCode: 'EMP-ENG02',
        phone: '+1 (555) 456-7890',
        joinDate: '2023-05-10',
        isActive: true,
        createdAt: new Date('2023-05-10').toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr_emp_03',
        name: 'Elena Rostova',
        email: 'elena@workpulse.io',
        password: defaultPasswordHash,
        role: 'EMPLOYEE',
        department: 'Design',
        designation: 'Lead Product Designer',
        avatar:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        employeeCode: 'EMP-DES01',
        phone: '+1 (555) 567-8901',
        joinDate: '2023-06-15',
        isActive: true,
        createdAt: new Date('2023-06-15').toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr_emp_04',
        name: 'Marcus Vance',
        email: 'marcus@workpulse.io',
        password: defaultPasswordHash,
        role: 'EMPLOYEE',
        department: 'Marketing',
        designation: 'Growth Marketing Manager',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        employeeCode: 'EMP-MKT01',
        phone: '+1 (555) 678-9012',
        joinDate: '2023-08-01',
        isActive: true,
        createdAt: new Date('2023-08-01').toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr_emp_05',
        name: 'Priya Sharma',
        email: 'priya@workpulse.io',
        password: defaultPasswordHash,
        role: 'EMPLOYEE',
        department: 'Product Management',
        designation: 'Principal Product Manager',
        avatar:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        employeeCode: 'EMP-PRD01',
        phone: '+1 (555) 789-0123',
        joinDate: '2023-09-12',
        isActive: true,
        createdAt: new Date('2023-09-12').toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr_emp_06',
        name: 'James Wilson',
        email: 'james@workpulse.io',
        password: defaultPasswordHash,
        role: 'EMPLOYEE',
        department: 'Sales',
        designation: 'Enterprise Account Executive',
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        employeeCode: 'EMP-SLS01',
        phone: '+1 (555) 890-1234',
        joinDate: '2023-11-20',
        isActive: true,
        createdAt: new Date('2023-11-20').toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const leaveBalances: LeaveBalanceEntity[] = users.map((u) => ({
      id: `bal_${u.id}`,
      employeeId: u.id,
      casualLeave: 12,
      sickLeave: 10,
      annualLeave: 15,
      usedCasual:
        u.id === 'usr_emp_01'
          ? 2
          : u.id === 'usr_emp_03'
            ? 4
            : 1,
      usedSick:
        u.id === 'usr_emp_01'
          ? 1
          : u.id === 'usr_emp_04'
            ? 3
            : 0,
      usedAnnual: u.id === 'usr_emp_02' ? 5 : 2,
      year: 2026,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const leaves: LeaveEntity[] = [
      {
        id: 'lv_01',
        employeeId: 'usr_emp_01',
        leaveType: 'CASUAL',
        startDate: '2026-08-10',
        endDate: '2026-08-11',
        daysCount: 2,
        reason: 'Attending family anniversary celebration.',
        status: 'APPROVED',
        reviewedBy: 'usr_hr_01',
        adminComment: 'Approved. Enjoy your time off!',
        createdAt: new Date('2026-08-01').toISOString(),
        updatedAt: new Date('2026-08-02').toISOString(),
      },
      {
        id: 'lv_02',
        employeeId: 'usr_emp_02',
        leaveType: 'SICK',
        startDate: '2026-08-20',
        endDate: '2026-08-20',
        daysCount: 1,
        reason: 'Severe migraine headache and medical checkup.',
        status: 'APPROVED',
        reviewedBy: 'usr_hr_01',
        adminComment: 'Get well soon David.',
        createdAt: new Date('2026-08-19').toISOString(),
        updatedAt: new Date('2026-08-19').toISOString(),
      },
      {
        id: 'lv_03',
        employeeId: 'usr_emp_03',
        leaveType: 'ANNUAL',
        startDate: '2026-09-05',
        endDate: '2026-09-09',
        daysCount: 5,
        reason: 'Annual vacation trip to Europe.',
        status: 'PENDING',
        reviewedBy: null,
        adminComment: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'lv_04',
        employeeId: 'usr_emp_04',
        leaveType: 'CASUAL',
        startDate: '2026-09-02',
        endDate: '2026-09-03',
        daysCount: 2,
        reason: 'Moving to new apartment.',
        status: 'PENDING',
        reviewedBy: null,
        adminComment: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const attendances: AttendanceEntity[] = [];

    const today = new Date();
    const todayStr = formatDate(today);

    for (let dayOffset = 25; dayOffset >= 0; dayOffset--) {
      const targetDate = new Date();

      targetDate.setDate(today.getDate() - dayOffset);

      const isWeekend =
        targetDate.getDay() === 0 || targetDate.getDay() === 6;

      if (isWeekend) continue;

      const dateStr = formatDate(targetDate);
      const isToday = dateStr === todayStr;

      for (const emp of users) {
        let checkInHour = 9;
        let checkInMinute = 15;
        let checkOutHour = 17;
        let checkOutMinute = 30;
        let status: AttendanceEntity['status'] = 'PRESENT';

        const matchingLeave = leaves.find(
          (l) =>
            l.employeeId === emp.id &&
            l.status === 'APPROVED' &&
            dateStr >= l.startDate &&
            dateStr <= l.endDate
        );

        if (matchingLeave) {
          attendances.push({
            id: `att_${emp.id}_${dateStr}`,
            employeeId: emp.id,
            date: dateStr,
            checkIn: null,
            checkOut: null,
            workingHours: 0,
            overtime: 0,
            status: 'ON_LEAVE',
            notes: `Approved Leave (${matchingLeave.leaveType})`,
            location: 'Remote',
            createdAt: new Date(targetDate).toISOString(),
            updatedAt: new Date(targetDate).toISOString(),
          });

          continue;
        }

        if (isToday) {
          if (emp.id === 'usr_emp_01') {
            const checkInDate = new Date(targetDate);

            checkInDate.setHours(8, 50, 0, 0);

            attendances.push({
              id: `att_${emp.id}_${dateStr}`,
              employeeId: emp.id,
              date: dateStr,
              checkIn: checkInDate.toISOString(),
              checkOut: null,
              workingHours: 0,
              overtime: 0,
              status: 'IN_PROGRESS',
              location: 'Office HQ - Floor 4',
              createdAt: checkInDate.toISOString(),
              updatedAt: checkInDate.toISOString(),
            });
          } else if (emp.id === 'usr_emp_02') {
            const checkInDate = new Date(targetDate);

            checkInDate.setHours(9, 45, 0, 0);

            attendances.push({
              id: `att_${emp.id}_${dateStr}`,
              employeeId: emp.id,
              date: dateStr,
              checkIn: checkInDate.toISOString(),
              checkOut: null,
              workingHours: 0,
              overtime: 0,
              status: 'LATE',
              notes: 'Traffic congestion on bridge route',
              location: 'Office HQ - Floor 4',
              createdAt: checkInDate.toISOString(),
              updatedAt: checkInDate.toISOString(),
            });
          } else if (emp.id === 'usr_emp_03') {
            const checkInDate = new Date(targetDate);

            checkInDate.setHours(8, 40, 0, 0);

            attendances.push({
              id: `att_${emp.id}_${dateStr}`,
              employeeId: emp.id,
              date: dateStr,
              checkIn: checkInDate.toISOString(),
              checkOut: null,
              workingHours: 0,
              overtime: 0,
              status: 'PRESENT',
              location: 'Design Studio',
              createdAt: checkInDate.toISOString(),
              updatedAt: checkInDate.toISOString(),
            });
          } else if (emp.id === 'usr_emp_04') {
            attendances.push({
              id: `att_${emp.id}_${dateStr}`,
              employeeId: emp.id,
              date: dateStr,
              checkIn: null,
              checkOut: null,
              workingHours: 0,
              overtime: 0,
              status: 'ABSENT',
              notes: 'No check-in recorded',
              location: 'Office HQ',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          } else if (emp.id === 'usr_hr_01') {
            const checkInDate = new Date(targetDate);

            checkInDate.setHours(8, 30, 0, 0);

            attendances.push({
              id: `att_${emp.id}_${dateStr}`,
              employeeId: emp.id,
              date: dateStr,
              checkIn: checkInDate.toISOString(),
              checkOut: null,
              workingHours: 0,
              overtime: 0,
              status: 'PRESENT',
              location: 'Executive Suite',
              createdAt: checkInDate.toISOString(),
              updatedAt: checkInDate.toISOString(),
            });
          }

          continue;
        }

        const rand =
          (Math.sin(
            dayOffset *
              17 +
              parseInt(emp.id.replace(/\D/g, '') || '1')
          ) +
            1) /
          2;

        if (rand > 0.9) {
          attendances.push({
            id: `att_${emp.id}_${dateStr}`,
            employeeId: emp.id,
            date: dateStr,
            checkIn: null,
            checkOut: null,
            workingHours: 0,
            overtime: 0,
            status: 'ABSENT',
            notes: 'Unplanned absence',
            location: 'Office HQ',
            createdAt: new Date(targetDate).toISOString(),
            updatedAt: new Date(targetDate).toISOString(),
          });
        } else if (rand > 0.7) {
          checkInHour = 9;
          checkInMinute = 35 + Math.floor(rand * 20);
          checkOutHour = 18;
          checkOutMinute = 15;
          status = 'LATE';

          const inDate = new Date(targetDate);

          inDate.setHours(
            checkInHour,
            checkInMinute,
            0,
            0
          );

          const outDate = new Date(targetDate);

          outDate.setHours(
            checkOutHour,
            checkOutMinute,
            0,
            0
          );

          const diffHours =
            Math.round(
              ((outDate.getTime() - inDate.getTime()) /
                (1000 * 60 * 60)) *
                100
            ) / 100;

          const overtime =
            diffHours > 8
              ? Math.round((diffHours - 8) * 100) / 100
              : 0;

          attendances.push({
            id: `att_${emp.id}_${dateStr}`,
            employeeId: emp.id,
            date: dateStr,
            checkIn: inDate.toISOString(),
            checkOut: outDate.toISOString(),
            workingHours: diffHours,
            overtime,
            status,
            notes: 'Late arrival',
            location: 'Office HQ',
            createdAt: inDate.toISOString(),
            updatedAt: outDate.toISOString(),
          });
        } else {
          checkInHour = 8;
          checkInMinute = 45 + Math.floor(rand * 35);
          checkOutHour = 17;
          checkOutMinute = 30 + Math.floor(rand * 45);
          status = 'PRESENT';

          const inDate = new Date(targetDate);

          inDate.setHours(
            checkInHour,
            checkInMinute,
            0,
            0
          );

          const outDate = new Date(targetDate);

          outDate.setHours(
            checkOutHour,
            checkOutMinute,
            0,
            0
          );

          const diffHours =
            Math.round(
              ((outDate.getTime() - inDate.getTime()) /
                (1000 * 60 * 60)) *
                100
            ) / 100;

          const overtime =
            diffHours > 8
              ? Math.round((diffHours - 8) * 100) / 100
              : 0;

          attendances.push({
            id: `att_${emp.id}_${dateStr}`,
            employeeId: emp.id,
            date: dateStr,
            checkIn: inDate.toISOString(),
            checkOut: outDate.toISOString(),
            workingHours: diffHours,
            overtime,
            status,
            location: 'Office HQ',
            createdAt: inDate.toISOString(),
            updatedAt: outDate.toISOString(),
          });
        }
      }
    }

    this.data = {
      users,
      attendances,
      leaves,
      leaveBalances,
      rules: [
        {
          id: 'rule_default',
          workStartTime: '09:00',
          gracePeriodEnd: '09:30',
          lateThresholdEnd: '10:00',
          standardWorkHours: 8.0,
          allowOvertime: true,
        },
      ],
    };
  }
}

export const db = new Database();