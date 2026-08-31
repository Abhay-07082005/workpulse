import React from 'react';
import { AttendanceRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Clock, MapPin, FileText, Calendar } from 'lucide-react';

interface RecentAttendanceTableProps {
  records: AttendanceRecord[];
  isLoading?: boolean;
}

export const RecentAttendanceTable: React.FC<RecentAttendanceTableProps> = ({
  records,
  isLoading = false,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Recent Attendance History</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your latest logged punches and hours</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
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
                <td colSpan={7} className="py-10 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No attendance records found.
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
                      {rec.workingHours > 0 ? `${rec.workingHours.toFixed(2)}h` : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {rec.overtime > 0 ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                          +{rec.overtime.toFixed(2)}h
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={rec.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 truncate max-w-50">
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
      </div>
    </div>
  );
};
