import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import { leaveService } from '../services/leaveService';
import {
  TodayAttendanceStatus,
  AttendanceSummary,
  AttendanceRecord,
  LeaveBalance,
} from '../types';
import { LiveClockCard } from '../components/dashboard/LiveClockCard';
import { CheckInOutCard } from '../components/dashboard/CheckInOutCard';
import { AttendanceSummaryCards } from '../components/dashboard/AttendanceSummaryCards';
import { AttendanceCalendarView } from '../components/dashboard/AttendanceCalendarView';
import { RecentAttendanceTable } from '../components/dashboard/RecentAttendanceTable';
import { LeaveBalanceCard } from '../components/leaves/LeaveBalanceCard';
import { ApplyLeaveModal } from '../components/leaves/ApplyLeaveModal';
import { CardSkeleton, TableSkeleton } from '../components/common/SkeletonLoader';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [statusData, setStatusData] = useState<TodayAttendanceStatus | null>(null);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState<boolean>(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [todayRes, summaryRes, historyRes, balanceRes] = await Promise.all([
        attendanceService.getTodayStatus(),
        attendanceService.getMySummary(),
        attendanceService.getMyAttendance({ limit: 30 }),
        leaveService.getMyBalance(),
      ]);

      setStatusData(todayRes);
      setSummary(summaryRes);
      setRecords(historyRes.records);
      setLeaveBalance(balanceRes);
    } catch (err) {
      console.error('Error fetching employee dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Live Clock */}
      <LiveClockCard />

      {/* Primary Actions Grid: Punch Card & Leave Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 xl:col-span-7">
          <CheckInOutCard
            statusData={statusData}
            onStatusUpdated={loadDashboardData}
          />
        </div>
        <div className="lg:col-span-6 xl:col-span-5">
          <LeaveBalanceCard
            balance={leaveBalance}
            onApplyLeaveClick={() => setIsApplyLeaveOpen(true)}
          />
        </div>
      </div>

      {/* Top 4 Performance & Attendance Metric Cards */}
      <AttendanceSummaryCards summary={summary} leaveBalance={leaveBalance} />

      {/* Visual Monthly Calendar View */}
      <AttendanceCalendarView records={records} />

      {/* Recent History Table */}
      <RecentAttendanceTable records={records.slice(0, 7)} isLoading={isLoading} />

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyLeaveOpen}
        onClose={() => setIsApplyLeaveOpen(false)}
        onLeaveApplied={loadDashboardData}
        leaveBalance={leaveBalance}
      />
    </div>
  );
};
