import React, { useState } from 'react';
import { AttendanceRecord } from '../../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface AttendanceCalendarViewProps {
  records: AttendanceRecord[];
}

export const AttendanceCalendarView: React.FC<AttendanceCalendarViewProps> = ({ records }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayRecord, setSelectedDayRecord] = useState<AttendanceRecord | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayRecord(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayRecord(null);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Map records by date string YYYY-MM-DD
  const recordsMap = new Map<string, AttendanceRecord>();
  records.forEach((r) => recordsMap.set(r.date, r));

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Monthly Attendance Calendar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Visual day-by-day status distribution</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-cal-prev"
            onClick={prevMonth}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 min-w-32.5 text-center">
            {monthName}
          </span>
          <button
            id="btn-cal-next"
            onClick={nextMonth}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mt-5">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
          {daysOfWeek.map((day, idx) => (
            <div
              key={day}
              className={`text-center text-[11px] font-bold uppercase py-1 ${
                idx === 0 || idx === 6 ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 sm:h-20 bg-slate-50/40 dark:bg-slate-950/20 rounded-xl" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const record = recordsMap.get(dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isWeekend = new Date(year, month, dayNum).getDay() === 0 || new Date(year, month, dayNum).getDay() === 6;

            let badgeColor = '';
            if (record) {
              if (record.status === 'PRESENT' || record.status === 'COMPLETED') {
                badgeColor = 'bg-emerald-500 text-white';
              } else if (record.status === 'LATE') {
                badgeColor = 'bg-amber-500 text-white';
              } else if (record.status === 'ABSENT') {
                badgeColor = 'bg-rose-500 text-white';
              } else if (record.status === 'ON_LEAVE') {
                badgeColor = 'bg-blue-600 text-white';
              } else if (record.status === 'IN_PROGRESS') {
                badgeColor = 'bg-blue-500 text-white animate-pulse';
              }
            }

            return (
              <div
                key={dateStr}
                onClick={() => record && setSelectedDayRecord(record)}
                className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all duration-150 relative cursor-pointer ${
                  isToday
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/40'
                    : isWeekend
                    ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/60 text-slate-400'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {record?.workingHours ? (
                    <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
                      {record.workingHours.toFixed(1)}h
                    </span>
                  ) : null}
                </div>

                {record ? (
                  <div className="mt-auto">
                    <span
                      className={`block w-full py-0.5 px-1 rounded-md text-[9px] sm:text-[10px] font-bold text-center truncate ${badgeColor}`}
                    >
                      {record.status === 'PRESENT'
                        ? 'Present'
                        : record.status === 'LATE'
                        ? 'Late'
                        : record.status === 'ABSENT'
                        ? 'Absent'
                        : record.status === 'ON_LEAVE'
                        ? 'Leave'
                        : record.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ) : isWeekend ? (
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 text-center block mt-auto">
                    Weekend
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Quick Inspector */}
      {selectedDayRecord && (
        <div className="mt-5 p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-slate-900 dark:text-slate-100 font-bold text-sm">
                Log for {selectedDayRecord.date}
              </strong>
              <StatusBadge status={selectedDayRecord.status} size="sm" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Check-in:{' '}
              <strong>
                {selectedDayRecord.checkIn
                  ? new Date(selectedDayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'N/A'}
              </strong>{' '}
              • Check-out:{' '}
              <strong>
                {selectedDayRecord.checkOut
                  ? new Date(selectedDayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'N/A'}
              </strong>{' '}
              • Hours: <strong>{selectedDayRecord.workingHours.toFixed(2)}h</strong>
              {selectedDayRecord.overtime > 0 && ` (Overtime: ${selectedDayRecord.overtime.toFixed(2)}h)`}
            </p>
          </div>

          <button
            onClick={() => setSelectedDayRecord(null)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 transition self-start sm:self-auto cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Late Arrival (&gt; 09:30 AM)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span>Approved Leave</span>
        </div>
      </div>
    </div>
  );
};
