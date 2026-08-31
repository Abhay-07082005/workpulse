import { AttendanceStatus } from '../types';
import { CONFIG } from '../config/constants';

export function formatDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}
export function getHHMM(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
export function evaluateCheckInStatus(checkInDate: Date): AttendanceStatus {
  const checkInMinutes = checkInDate.getHours() * 60 + checkInDate.getMinutes();
  const graceMinutes = timeStringToMinutes(CONFIG.ATTENDANCE_RULES.GRACE_PERIOD_END); // 9:30 AM -> 570 mins

  if (checkInMinutes <= graceMinutes) {
    return 'PRESENT';
  } else {
    return 'LATE';
  }
}
export function calculateWorkingHoursAndOvertime(
  checkIn: Date,
  checkOut: Date
): { workingHours: number; overtime: number } {
  const diffMs = checkOut.getTime() - checkIn.getTime();
  if (diffMs <= 0) {
    return { workingHours: 0, overtime: 0 };
  }
  const hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  const standardHours = CONFIG.ATTENDANCE_RULES.STANDARD_WORK_HOURS;
  const overtime = hours > standardHours ? Math.round((hours - standardHours) * 100) / 100 : 0;
  return {
    workingHours: hours,
    overtime,
  };
}

export function formatHoursToReadable(hours: number): string {
  if (hours <= 0) return '0h 0m';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}
export function isDateInRange(targetDate: string, startDate?: string, endDate?: string): boolean {
  if (startDate && targetDate < startDate) return false;
  if (endDate && targetDate > endDate) return false;
  return true;
}
export function calculateLeaveDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  if (startDate > endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}

