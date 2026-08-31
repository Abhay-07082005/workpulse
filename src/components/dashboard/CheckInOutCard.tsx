import React, { useState, useEffect } from 'react';
import { TodayAttendanceStatus } from '../../types';
import { attendanceService } from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../common/StatusBadge';
import confetti from 'canvas-confetti';
import {
  LogIn,
  LogOut,
  MapPin,
  Timer,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';

interface CheckInOutCardProps {
  statusData: TodayAttendanceStatus | null;
  onStatusUpdated: () => void;
}

export const CheckInOutCard: React.FC<CheckInOutCardProps> = ({
  statusData,
  onStatusUpdated,
}) => {
  const { success, error, info } = useToast();
  const [location, setLocation] = useState<string>('Office HQ');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Live timer tick when checked in but not checked out
  useEffect(() => {
    if (statusData?.hasCheckedIn && !statusData?.hasCheckedOut && statusData.attendance?.checkIn) {
      const checkInMs = new Date(statusData.attendance.checkIn).getTime();

      const updateElapsed = () => {
        const nowMs = Date.now();
        const diffSec = Math.max(0, Math.floor((nowMs - checkInMs) / 1000));
        setElapsedSeconds(diffSec);
      };

      updateElapsed();
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedSeconds(0);
    }
  }, [statusData]);

  const formatElapsed = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const rec = await attendanceService.checkIn(location, notes);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
      success(
        'Check-In Successful!',
        rec.status === 'LATE'
          ? 'Recorded as Late Arrival (Checked in after 09:30 AM)'
          : 'You are marked as Present. Have a productive day!'
      );
      setNotes('');
      onStatusUpdated();
    } catch (err: any) {
      error('Check-in Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const rec = await attendanceService.checkOut(notes);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      success(
        'Check-Out Complete!',
        `Logged ${rec.workingHours.toFixed(2)} working hours today${
          rec.overtime > 0 ? ` (${rec.overtime.toFixed(2)}h overtime!)` : ''
        }`
      );
      setNotes('');
      onStatusUpdated();
    } catch (err: any) {
      error('Check-out Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasCheckedIn = statusData?.hasCheckedIn;
  const hasCheckedOut = statusData?.hasCheckedOut;
  const attendance = statusData?.attendance;
  const elapsedHours = elapsedSeconds / 3600;
  const progressPercent = Math.min(100, Math.round((elapsedHours / 8.0) * 100));

  return (
    <div
      id="card-attendance-action"
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Daily Punch In/Out</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track and calculate today's working session</p>
            </div>
          </div>

          <StatusBadge
            status={attendance?.status || (hasCheckedIn ? 'IN_PROGRESS' : 'NOT_CHECKED_IN')}
            size="md"
          />
        </div>

        {/* Live Timer / Shift Status */}
        <div className="my-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {hasCheckedOut
              ? 'Today Shift Completed'
              : hasCheckedIn
              ? 'Active Working Session'
              : 'Shift Not Started Yet'}
          </p>

          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 my-2 tracking-tight">
            {hasCheckedOut
              ? `${attendance?.workingHours.toFixed(2)} hrs`
              : hasCheckedIn
              ? formatElapsed(elapsedSeconds)
              : '-- : -- : --'}
          </div>

          {hasCheckedIn && !hasCheckedOut && (
            <div className="space-y-1.5 max-w-xs mx-auto mt-3">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span>Shift Progress (8h standard)</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {elapsedHours > 8.0 && (
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-1">
                  <Flame className="w-3.5 h-3.5" />
                  Overtime accruing: {(elapsedHours - 8.0).toFixed(2)}h
                </p>
              )}
            </div>
          )}

          {attendance?.checkIn && (
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/40 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 block text-[11px]">Check-in time</span>
                <strong>{new Date(attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Check-out time</span>
                <strong>
                  {attendance.checkOut
                    ? new Date(attendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Pending...'}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Inputs (Location / Note) when not fully checked out */}
        {!hasCheckedOut && (
          <div className="space-y-3 mb-5">
            {!hasCheckedIn && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Working Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Office HQ">Office HQ (Main Campus)</option>
                    <option value="Remote / Home">Remote / Work from Home</option>
                    <option value="Client Site">Client Site / On-field</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {hasCheckedIn ? 'Check-out Notes / Handoff (Optional)' : 'Workday Note (Optional)'}
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={hasCheckedIn ? 'e.g. Completed API endpoints & sprint tasks' : 'e.g. Attending morning sprint standup'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2">
        {!hasCheckedIn ? (
          <button
            id="btn-check-in"
            onClick={handleCheckIn}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Recording Punch In...' : 'Check In Now'}</span>
          </button>
        ) : !hasCheckedOut ? (
          <button
            id="btn-check-out"
            onClick={handleCheckOut}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{loading ? 'Recording Punch Out...' : 'Check Out & Complete Day'}</span>
          </button>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>You have completed attendance for today. Great work!</span>
          </div>
        )}
      </div>
    </div>
  );
};
