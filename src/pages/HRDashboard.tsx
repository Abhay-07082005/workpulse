
import React, { useState, useEffect, useCallback } from 'react';
import { hrService } from '../services/hrService';
import { leaveService } from '../services/leaveService';
import { HRDashboardData, LeaveRequest } from '../types';

import { HRMetricsGrid } from '../components/hr/HRMetricsGrid';
import { AttendanceTrendChart } from '../components/hr/AttendanceTrendChart';
import { DepartmentWiseChart } from '../components/hr/DepartmentWiseChart';
import { LeaveRequestsManager } from '../components/hr/LeaveRequestsManager';

import { StatusBadge } from '../components/common/StatusBadge';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { UserAvatar } from '../components/common/UserAvatar';

import {
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

import { Link } from 'react-router-dom';

export const HRDashboard: React.FC = () => {
  const [data, setData] = useState<HRDashboardData | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHRData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [dashData, leavesData] = await Promise.all([
        hrService.getDashboardData(),
        leaveService.getAllLeaves(),
      ]);

      setData(dashData);
      setLeaves(leavesData);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to load HR dashboard analytics';

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHRData();
  }, [fetchHRData]);

  /* -------------------- Loading State -------------------- */

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  /* -------------------- Error State -------------------- */

  if (error || !data) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-sm text-rose-800 dark:text-rose-300">
            Error Loading HR Analytics
          </p>

          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
            {error || 'Data is currently unavailable'}
          </p>
        </div>

        <button
          onClick={fetchHRData}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          Retry
        </button>
      </div>
    );
  }

  /*
   * These values are read safely from the API response.
   *
   * The current HRDashboardData type does not declare
   * departmentBreakdown or todayAttendance, so we use
   * safe fallbacks here.
   */

  const dashboardData = data as HRDashboardData & {
    departmentBreakdown?: unknown[];
    todayAttendance?: any[];
  };

  const departmentBreakdown =
    dashboardData.departmentBreakdown ?? [];

  const todayAttendance =
    dashboardData.todayAttendance ?? [];

  /* -------------------- Dashboard -------------------- */

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />

            <span>
              Human Resources Administration
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Company Attendance Overview
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time workplace telemetry, punctuality KPIs, and leave approval pipeline
          </p>
        </div>

        <div className="flex items-center gap-2">

          <Link
            to="/hr/attendance"
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition shadow-2xs"
          >
            All Attendance Logs
          </Link>

          <Link
            to="/hr/employees"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/20 transition"
          >
            Staff Directory
          </Link>

        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <HRMetricsGrid metrics={data.metrics} />

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <AttendanceTrendChart
          data={data.trends}
        />

        <DepartmentWiseChart
          data={departmentBreakdown as any}
        />

      </div>

      {/* Leave Approvals Queue */}
      <LeaveRequestsManager
        leaves={leaves}
        onLeavesUpdated={fetchHRData}
        isLoading={isLoading}
      />

      {/* Today's Live Attendance Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">

        {/* Section Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">

          <div className="flex items-center gap-2.5">

            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <Clock className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Today's Real-Time Presence Snapshot
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest punch-ins and shift statuses for today
              </p>
            </div>

          </div>

          <Link
            to="/hr/attendance"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>
              View Full Audit Log
            </span>

            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs">

            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">

              <tr>
                <th className="py-3.5 px-5">
                  Employee
                </th>

                <th className="py-3.5 px-4">
                  Department
                </th>

                <th className="py-3.5 px-4">
                  Punch In
                </th>

                <th className="py-3.5 px-4">
                  Punch Out
                </th>

                <th className="py-3.5 px-4">
                  Working Hours
                </th>

                <th className="py-3.5 px-4">
                  Status
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">

              {todayAttendance.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-slate-400 dark:text-slate-500"
                  >
                    No punch records recorded for today yet.
                  </td>
                </tr>

              ) : (

                todayAttendance
                  .slice(0, 8)
                  .map((rec: any) => {

                    const inTime = rec.checkIn
                      ? new Date(rec.checkIn).toLocaleTimeString(
                          [],
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )
                      : '-- : --';

                    const outTime = rec.checkOut
                      ? new Date(rec.checkOut).toLocaleTimeString(
                          [],
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )
                      : '-- : --';

                    return (
                      <tr
                        key={rec.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >

                        {/* Employee */}
                        <td className="py-3.5 px-5">

                          <div className="flex items-center gap-2.5">

                            <UserAvatar
                              name={rec.employee?.name || 'Unknown Employee'}
                              size="sm"
                            />

                            <div>

                              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                                {rec.employee?.name || 'Unknown Employee'}
                              </span>

                              <span className="text-[10px] text-slate-400 font-mono">
                                {rec.employee?.employeeCode || '--'}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* Department */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {rec.employee?.department || '--'}
                        </td>

                        {/* Punch In */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {inTime}
                        </td>

                        {/* Punch Out */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {outTime}
                        </td>

                        {/* Working Hours */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 font-mono">
                          {typeof rec.workingHours === 'number' &&
                          rec.workingHours > 0
                            ? `${rec.workingHours.toFixed(2)}h`
                            : '-'}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <StatusBadge
                            status={rec.status}
                            size="sm"
                          />
                        </td>

                      </tr>
                    );
                  })
              )}

            </tbody>

          </table>

        </div>
      </div>
    </div>
  );
};
