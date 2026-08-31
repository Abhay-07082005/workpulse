import React from 'react';
import { LeaveRequest } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Calendar, FileText, MessageSquare, Clock } from 'lucide-react';

interface MyLeaveRequestsTableProps {
  leaves: LeaveRequest[];
  isLoading?: boolean;
}

export const MyLeaveRequestsTable: React.FC<MyLeaveRequestsTableProps> = ({
  leaves,
  isLoading = false,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">My Leave Applications</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">History of requested time-off and approval status</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-5">Leave Category</th>
              <th className="py-3.5 px-4">Duration Range</th>
              <th className="py-3.5 px-4">Days</th>
              <th className="py-3.5 px-5">Reason</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-5">HR Response</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {leaves.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                  You have not submitted any leave applications yet.
                </td>
              </tr>
            ) : (
              leaves.map((l) => (
                <tr
                  key={l.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-5">
                    <StatusBadge status={l.leaveType} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {l.startDate} → {l.endDate}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {l.daysCount} {l.daysCount === 1 ? 'day' : 'days'}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {l.reason}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={l.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400">
                    {l.adminComment ? (
                      <span className="flex items-center gap-1.5 italic text-[11px]">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-45">{l.adminComment}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
