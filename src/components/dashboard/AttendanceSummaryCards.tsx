import React from 'react';
import { AttendanceSummary, LeaveBalance } from '../../types';
import { StatCard } from '../common/StatCard';
import {
  CalendarCheck,
  ClockAlert,
  CalendarX,
  Hourglass,
  CalendarDays,
  Flame,
} from 'lucide-react';

interface AttendanceSummaryCardsProps {
  summary: AttendanceSummary | null;
  leaveBalance: LeaveBalance | null;
}

export const AttendanceSummaryCards: React.FC<AttendanceSummaryCardsProps> = ({
  summary,
  leaveBalance,
}) => {
  const totalDays = summary?.totalRecords || 0;
  const presentDays = summary?.totalPresent || 0;
  const lateDays = summary?.totalLate || 0;
  const absentDays = summary?.totalAbsent || 0;
  const totalHours = summary?.totalWorkingHours || 0;
  const totalOvertime = summary?.totalOvertimeHours || 0;

  const totalLeaveAvailable = leaveBalance
    ? (leaveBalance.casualLeave - leaveBalance.usedCasual) +
      (leaveBalance.sickLeave - leaveBalance.usedSick) +
      (leaveBalance.annualLeave - leaveBalance.usedAnnual)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        id="stat-present"
        title="Days Present"
        value={`${presentDays} days`}
        subtitle={`${Math.round((presentDays / (totalDays || 1)) * 100)}% attendance rate`}
        icon={CalendarCheck}
        colorScheme="emerald"
        trend={{
          value: `${presentDays} of ${totalDays} working days`,
          isPositive: true,
        }}
      />

      <StatCard
        id="stat-late"
        title="Late Arrivals"
        value={`${lateDays} days`}
        subtitle="Checked in after 09:30 AM"
        icon={ClockAlert}
        colorScheme="amber"
        trend={{
          value: lateDays === 0 ? 'Punctual streak!' : `${lateDays} instances recorded`,
          isPositive: lateDays === 0,
        }}
      />

      <StatCard
        id="stat-hours"
        title="Working Hours"
        value={`${totalHours.toFixed(1)} hrs`}
        subtitle={`Avg ${summary?.avgWorkingHours || 0} hrs/day`}
        icon={Hourglass}
        colorScheme="blue"
        trend={{
          value: totalOvertime > 0 ? `+${totalOvertime.toFixed(1)}h overtime logged` : 'Standard work schedule',
          isPositive: true,
        }}
      />

      <StatCard
        id="stat-leaves"
        title="Leave Balance"
        value={`${totalLeaveAvailable} days`}
        subtitle={`Casual: ${leaveBalance ? leaveBalance.casualLeave - leaveBalance.usedCasual : 0} • Sick: ${leaveBalance ? leaveBalance.sickLeave - leaveBalance.usedSick : 0}`}
        icon={CalendarDays}
        colorScheme="sky"
        trend={{
          value: 'Annual allotment active',
          isPositive: true,
        }}
      />
    </div>
  );
};
