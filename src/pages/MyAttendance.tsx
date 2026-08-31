import React, { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../services/attendanceService';
import { AttendanceRecord, AttendanceSummary } from '../types';
import { AttendanceCalendarView } from '../components/dashboard/AttendanceCalendarView';
import { AttendanceSummaryCards } from '../components/dashboard/AttendanceSummaryCards';
import { StatusBadge } from '../components/common/StatusBadge';
import { Pagination } from '../components/common/Pagination';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import {
  Calendar,
  Download,
  Filter,
  Clock,
  MapPin,
  FileText,
  RotateCcw,
} from 'lucide-react';

export const MyAttendance: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const [res, sumRes] = await Promise.all([
        attendanceService.getMyAttendance({
          page,
          limit: pageSize,
          status: statusFilter || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
        attendanceService.getMySummary(),
      ]);

      setRecords(res.records);
      setTotal(res.total);
      setSummary(sumRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleExportCSV = async () => {
    try {
      await attendanceService.exportMyAttendanceCSV({
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            My Attendance & Timesheets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit your daily check-in times, working hours, and punctuality record
          </p>
        </div>

        <button
          id="btn-export-my-csv"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export My Logs (.CSV)</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <AttendanceSummaryCards summary={summary} leaveBalance={null} />

      {/* Monthly Interactive Calendar */}
      <AttendanceCalendarView records={records} />

      {/* Detailed Logs Table with Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Attendance Log Records
          </h3>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="LATE">Late Arrival</option>
                <option value="ABSENT">Absent</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="HALF_DAY">Half Day</option>
              </select>
            </div>

            <div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                title="Start Date"
              />
            </div>

            <div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                title="End Date"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-4">Punch In</th>
                  <th className="py-3.5 px-4">Punch Out</th>
                  <th className="py-3.5 px-4">Working Hours</th>
                  <th className="py-3.5 px-4">Overtime</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5">Location / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  records.map((rec) => {
                    const inTime = rec.checkIn
                      ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '-- : --';
                    const outTime = rec.checkOut
                      ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '-- : --';

                    return (
                      <tr
                        key={rec.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rec.date}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {inTime}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {outTime}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 font-mono">
                          {rec.workingHours > 0 ? `${rec.workingHours.toFixed(2)} hrs` : '-'}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {rec.overtime > 0 ? (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              +{rec.overtime.toFixed(2)} hrs
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={rec.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5 truncate max-w-xs">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{rec.location || 'Office HQ'}</span>
                            {rec.notes && (
                              <span className="text-[10px] text-slate-400 italic">({rec.notes})</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
};
