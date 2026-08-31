import { db } from '../config/db';
import { UserEntity, Role } from '../types';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { signToken } from '../utils/jwtUtils';
import { CONFIG } from '../config/constants';
interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
  department?: string;
  designation?: string;
  employeeCode?: string;
  phone?: string;
}
export class AuthService {
  public async register(input: RegisterInput) {
    const existing = db.findUserByEmail(input.email);
    if (existing) {
      throw new Error('An account with this email address already exists');
    }
    const hashedPassword = await hashPassword(input.password);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const empCode = input.employeeCode || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser: UserEntity = {
      id: userId,
      name: input.name,
      email: input.email.toLowerCase(),
      password: hashedPassword,
      role: input.role || 'EMPLOYEE',
      department: input.department || 'Engineering',
      designation: input.designation || 'Software Engineer',
      employeeCode: empCode,
      phone: input.phone || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(input.name)}`,
      joinDate: new Date().toISOString().split('T')[0],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.createUser(newUser);
    db.createLeaveBalance({
      id: `bal_${newUser.id}`,
      employeeId: newUser.id,
      casualLeave: CONFIG.LEAVE_DEFAULTS.CASUAL,
      sickLeave: CONFIG.LEAVE_DEFAULTS.SICK,
      annualLeave: CONFIG.LEAVE_DEFAULTS.ANNUAL,
      usedCasual: 0,
      usedSick: 0,
      usedAnnual: 0,
      year: new Date().getFullYear(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    const { password, ...safeUser } = newUser;
    return { user: safeUser, token };
  }
  public async login(email: string, passwordPlain: string) {
    const user = db.findUserByEmail(email);
    if (!user || !user.password) {
      throw new Error('Invalid email or password');
    }
    if (!user.isActive) {
      throw new Error('Your account has been deactivated. Please contact HR.');
    }
    const isMatch = await comparePassword(passwordPlain, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    const { password, ...safeUser } = user;
    return { user: safeUser, token };
  }
  public async getMe(userId: string) {
    const user = db.findUserById(userId);
    if (!user) {
      throw new Error('User profile not found');
    }
    const { password, ...safeUser } = user;
    const leaveBalance = db.findLeaveBalanceByEmployee(userId);
    return { user: safeUser, leaveBalance };
  }

  public async updateProfile(userId: string, updates: Partial<UserEntity>) {
    const safeUpdates: Partial<UserEntity> = {};
    if (updates.name) safeUpdates.name = updates.name;
    if (updates.phone !== undefined) safeUpdates.phone = updates.phone;
    if (updates.avatar) safeUpdates.avatar = updates.avatar;
    const updated = db.updateUser(userId, safeUpdates);
    if (!updated) throw new Error('User not found');
    const { password, ...safeUser } = updated;
    return safeUser;
  }
}
export const authService = new AuthService();
