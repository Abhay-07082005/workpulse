import React from 'react';
import { AttendanceStatus, LeaveStatus, LeaveType } from '../../types';

interface StatusBadgeProps {
  status: AttendanceStatus | LeaveStatus | LeaveType | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showDot = true }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'PRESENT':
      case 'COMPLETED':
      case 'APPROVED':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
          dot: 'bg-emerald-500',
          label: status === 'PRESENT' ? 'Present' : status === 'COMPLETED' ? 'Completed' : 'Approved',
        };
      case 'LATE':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
          dot: 'bg-amber-500',
          label: 'Late Arrival',
        };
      case 'IN_PROGRESS':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60 animate-pulse',
          dot: 'bg-blue-500',
          label: 'In Progress',
        };
      case 'ABSENT':
      case 'REJECTED':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
          dot: 'bg-rose-500',
          label: status === 'ABSENT' ? 'Absent' : 'Rejected',
        };
      case 'ON_LEAVE':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60',
          dot: 'bg-blue-600',
          label: 'On Leave',
        };
      case 'HALF_DAY':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60',
          dot: 'bg-purple-500',
          label: 'Half Day',
        };
      case 'PENDING':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
          dot: 'bg-amber-500',
          label: 'Pending Review',
        };
      case 'CASUAL':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60',
          dot: 'bg-sky-500',
          label: 'Casual Leave',
        };
      case 'SICK':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
          dot: 'bg-rose-500',
          label: 'Sick Leave',
        };
      case 'ANNUAL':
        return {
          bg: 'bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60',
          dot: 'bg-teal-500',
          label: 'Annual Leave',
        };
      case 'NOT_CHECKED_IN':
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
          dot: 'bg-slate-400',
          label: 'Not Checked In',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          dot: 'bg-slate-400',
          label: status.replace(/_/g, ' '),
        };
    }
  };

  const config = getBadgeConfig();
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-medium'
      : size === 'lg'
      ? 'px-3 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors whitespace-nowrap ${sizeClasses} ${config.bg}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />}
      <span>{config.label}</span>
    </span>
  );
};
