import React, { useState } from 'react';
import { AttendanceRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Pagination } from '../common/Pagination';
import { TableSkeleton } from '../common/SkeletonLoader';
import { Modal } from '../common/Modal';
import { UserAvatar } from '../common/UserAvatar';
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Clock,
  MapPin,
  FileText,
  RotateCcw,
  Eye,
} from 'lucide-react';

interface EmployeeAttendanceTableProps {
  records: AttendanceRecord[];
  total: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onFilterChange: (filters: any) => void;
  onExportCSV: () => void;
  departments: string[];
}

export const EmployeeAttendanceTable: React.FC<EmployeeAttendanceTableProps> = ({
  records,
  total,
  currentPage,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onFilterChange,
  onExportCSV,
  departments,
}) => {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      search: search || undefined,
      department: department || undefined,
      status: status || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleReset = () => {
    setSearch('');
    setDepartment('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    onFilterChange({});
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Header & Multi-Filters */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Company-Wide Attendance Logs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time audit log of all employee check-in and check-out events
            </p>
          </div>

          <button
            id="btn-export-csv"
            onClick={onExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export to CSV</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 pt-2">
          {/* Search bar */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, code, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department */}
          <div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late Arrival</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ABSENT">Absent</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="HALF_DAY">Half Day</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              title="Start Date"
            />
          </div>

          {/* End Date & Actions */}
          <div className="flex gap-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              title="End Date"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
              title="Apply Filters"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Punch In</th>
                <th className="py-3.5 px-4">Punch Out</th>
                <th className="py-3.5 px-4">Work Hours</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No matching attendance records found. Try modifying your filter criteria.
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
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar name={rec.employee?.name} size="sm" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">
                              {rec.employee?.name || 'Unknown'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {rec.employee?.employeeCode || rec.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {rec.employee?.department || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {rec.date}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {inTime}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {outTime}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {rec.workingHours > 0 ? `${rec.workingHours.toFixed(2)}h` : '-'}
                        </span>
                        {rec.overtime > 0 && (
                          <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            +{rec.overtime.toFixed(2)}h OT
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={rec.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setSelectedRecord(rec)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="View Attendance Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      {/* Record Inspector Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title="Attendance Punch Details"
          subtitle={`Audit record for ${selectedRecord.employee?.name} on ${selectedRecord.date}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar name={selectedRecord.employee?.name} size="lg" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {selectedRecord.employee?.name}
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    {selectedRecord.employee?.designation} • {selectedRecord.employee?.department}
                  </p>
                </div>
              </div>
              <StatusBadge status={selectedRecord.status} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-slate-400 text-[11px] block">Check-In Timestamp</span>
                <strong className="text-slate-900 dark:text-slate-100 text-sm font-mono">
                  {selectedRecord.checkIn ? new Date(selectedRecord.checkIn).toLocaleString() : 'N/A'}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-slate-400 text-[11px] block">Check-Out Timestamp</span>
                <strong className="text-slate-900 dark:text-slate-100 text-sm font-mono">
                  {selectedRecord.checkOut ? new Date(selectedRecord.checkOut).toLocaleString() : 'N/A'}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-slate-400 text-[11px] block">Total Duration</span>
                <strong className="text-slate-900 dark:text-slate-100 text-sm">
                  {selectedRecord.workingHours.toFixed(2)} hours
                </strong>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-slate-400 text-[11px] block">Calculated Overtime</span>
                <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
                  {selectedRecord.overtime > 0 ? `+${selectedRecord.overtime.toFixed(2)} hours` : '0.00 hours'}
                </strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <span className="text-slate-400 text-[11px] block">Location & Notes</span>
              <p className="text-slate-700 dark:text-slate-300">
                Location: <strong>{selectedRecord.location || 'Office HQ'}</strong>
              </p>
              {selectedRecord.notes && (
                <p className="text-slate-600 dark:text-slate-400 italic">
                  Note: "{selectedRecord.notes}"
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
