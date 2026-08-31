import React from 'react';
import { HRDashboardData } from '../../types';
import { StatCard } from '../common/StatCard';
import {
  Users,
  UserCheck,
  UserX,
  ClockAlert,
  Percent,
  CalendarDays,
  FileQuestion,
} from 'lucide-react';

interface HRMetricsGridProps {
  metrics: HRDashboardData['metrics'];
}

export const HRMetricsGrid: React.FC<HRMetricsGridProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        id="hr-stat-total"
        title="Total Headcount"
        value={metrics.totalEmployees}
        subtitle="Active personnel"
        icon={Users}
        colorScheme="indigo"
      />

      <StatCard
        id="hr-stat-present"
        title="Present Today"
        value={metrics.presentToday}
        subtitle={`${metrics.inProgressToday} currently active`}
        icon={UserCheck}
        colorScheme="emerald"
        trend={{
          value: `${metrics.attendanceRate}% company attendance`,
          isPositive: metrics.attendanceRate >= 80,
        }}
      />

      <StatCard
        id="hr-stat-late"
        title="Late Arrivals"
        value={metrics.lateToday}
        subtitle="Checked in > 09:30 AM"
        icon={ClockAlert}
        colorScheme="amber"
      />

      <StatCard
        id="hr-stat-absent"
        title="Absent Today"
        value={metrics.absentToday}
        subtitle="Unexcused / No punch"
        icon={UserX}
        colorScheme="rose"
      />

      <StatCard
        id="hr-stat-leave"
        title="On Approved Leave"
        value={metrics.onLeaveToday}
        subtitle="Excused absence"
        icon={CalendarDays}
        colorScheme="sky"
      />

      <StatCard
        id="hr-stat-pending"
        title="Pending Leaves"
        value={metrics.pendingLeaves}
        subtitle="Awaiting HR review"
        icon={FileQuestion}
        colorScheme="purple"
        trend={{
          value: metrics.pendingLeaves > 0 ? 'Requires attention' : 'Queue clear',
          isPositive: metrics.pendingLeaves === 0,
        }}
      />
    </div>
  );
};
