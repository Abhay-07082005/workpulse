import React, { useState, useEffect, useCallback } from 'react';
import { hrService } from '../services/hrService';
import { AttendanceRecord } from '../types';
import { EmployeeAttendanceTable } from '../components/hr/EmployeeAttendanceTable';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const HRAttendance: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [filters, setFilters] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([
    'Engineering',
    'Human Resources',
    'Product & Design',
    'Marketing',
    'Sales',
    'Operations',
  ]);

  const loadAttendance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await hrService.getAllAttendance({
        page: currentPage,
        limit: pageSize,
        ...filters,
      });
      setRecords(res.records);
      setTotal(res.total);
    } catch (err: any) {
      setError(err?.message || 'Unable to load attendance records');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleExportCSV = async () => {
    try {
      await hrService.exportAttendanceCSV(filters);
    } catch (err) {
      console.error('Error exporting CSV', err);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          All Attendance & Audit Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Search, filter, inspect and export complete company attendance data
        </p>
      </div>

      {error ? (
        <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-bold text-sm">Error Loading Attendance Logs</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
          <button
            onClick={loadAttendance}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <EmployeeAttendanceTable
          records={records}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          isLoading={isLoading}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          onFilterChange={handleFilterChange}
          onExportCSV={handleExportCSV}
          departments={departments}
        />
      )}
    </div>
  );
};
