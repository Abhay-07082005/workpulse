import React from 'react';
import { LeaveBalance } from '../../types';
import { CalendarDays, HeartPulse, SunMedium, Plus } from 'lucide-react';

interface LeaveBalanceCardProps {
  balance: LeaveBalance | null;
  onApplyLeaveClick?: () => void;
}

export const LeaveBalanceCard: React.FC<LeaveBalanceCardProps> = ({
  balance,
  onApplyLeaveClick,
}) => {
  const casualTotal = balance?.casualLeave || 12;
  const casualUsed = balance?.usedCasual || 0;
  const casualRemaining = Math.max(0, casualTotal - casualUsed);

  const sickTotal = balance?.sickLeave || 10;
  const sickUsed = balance?.usedSick || 0;
  const sickRemaining = Math.max(0, sickTotal - sickUsed);

  const annualTotal = balance?.annualLeave || 15;
  const annualUsed = balance?.usedAnnual || 0;
  const annualRemaining = Math.max(0, annualTotal - annualUsed);

  const totalRemaining = casualRemaining + sickRemaining + annualRemaining;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Annual Leave Allotment</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Available balances & automatic deduction tracking for {balance?.year || new Date().getFullYear()}
          </p>
        </div>

        {onApplyLeaveClick && (
          <button
            id="btn-open-apply-leave"
            onClick={onApplyLeaveClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs shadow-blue-500/20 transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Leave</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
        {/* Casual Leave */}
        <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-800 dark:text-sky-300">Casual Leave</span>
            <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400">
              <SunMedium className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-3xl font-extrabold text-sky-950 dark:text-sky-100 tracking-tight">
              {casualRemaining} <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">days left</span>
            </div>
            <p className="text-[11px] text-sky-700 dark:text-sky-400 mt-0.5">
              {casualUsed} of {casualTotal} days utilized
            </p>
          </div>

          <div className="w-full h-1.5 bg-sky-200 dark:bg-sky-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full"
              style={{ width: `${(casualUsed / casualTotal) * 100}%` }}
            />
          </div>
        </div>

        {/* Sick Leave */}
        <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300">Sick Leave</span>
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-3xl font-extrabold text-rose-950 dark:text-rose-100 tracking-tight">
              {sickRemaining} <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">days left</span>
            </div>
            <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
              {sickUsed} of {sickTotal} days utilized
            </p>
          </div>

          <div className="w-full h-1.5 bg-rose-200 dark:bg-rose-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full"
              style={{ width: `${(sickUsed / sickTotal) * 100}%` }}
            />
          </div>
        </div>

        {/* Annual Leave */}
        <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300">Annual Paid Leave</span>
            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-400">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-3xl font-extrabold text-teal-950 dark:text-teal-100 tracking-tight">
              {annualRemaining} <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">days left</span>
            </div>
            <p className="text-[11px] text-teal-700 dark:text-teal-400 mt-0.5">
              {annualUsed} of {annualTotal} days utilized
            </p>
          </div>

          <div className="w-full h-1.5 bg-teal-200 dark:bg-teal-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full"
              style={{ width: `${(annualUsed / annualTotal) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
