import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { LeaveType, LeaveBalance } from '../../types';
import { leaveService } from '../../services/leaveService';
import { useToast } from '../../context/ToastContext';
import { calculateLeaveDays } from '../../lib/dateUtils';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeaveApplied: () => void;
  leaveBalance: LeaveBalance | null;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  onLeaveApplied,
  leaveBalance,
}) => {
  const { success, error } = useToast();
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [daysCount, setDaysCount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (startDate && endDate) {
      const days = calculateLeaveDays(startDate, endDate);
      setDaysCount(days);
    } else if (startDate) {
      setDaysCount(1);
    } else {
      setDaysCount(0);
    }
  }, [startDate, endDate]);

  const getAvailableForType = (type: LeaveType): number => {
    if (!leaveBalance) return 0;
    if (type === 'CASUAL') return leaveBalance.casualLeave - leaveBalance.usedCasual;
    if (type === 'SICK') return leaveBalance.sickLeave - leaveBalance.usedSick;
    if (type === 'ANNUAL') return leaveBalance.annualLeave - leaveBalance.usedAnnual;
    return 0;
  };

  const availableDays = getAvailableForType(leaveType);
  const isOverQuota = daysCount > availableDays;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      error('Dates Required', 'Please select both start and end dates.');
      return;
    }
    if (daysCount <= 0) {
      error('Invalid Date Range', 'End date must be after or on start date.');
      return;
    }
    if (reason.trim().length < 5) {
      error('Reason Required', 'Please provide a descriptive reason for time-off.');
      return;
    }
    if (isOverQuota) {
      error(
        'Insufficient Leave Balance',
        `You only have ${availableDays} days of ${leaveType} leave remaining.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await leaveService.applyLeave({
        leaveType,
        startDate,
        endDate,
        reason,
      });

      success('Leave Application Submitted!', 'Your request has been routed to HR for review.');
      setReason('');
      setStartDate('');
      setEndDate('');
      onLeaveApplied();
      onClose();
    } catch (err: any) {
      error('Application Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Leave of Absence"
      subtitle="Submit request for casual, sick, or annual time-off"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Leave Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Leave Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['CASUAL', 'SICK', 'ANNUAL'] as LeaveType[]).map((type) => {
              const rem = getAvailableForType(type);
              const isSelected = leaveType === type;
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => setLeaveType(type)}
                  className={`p-3 rounded-xl border text-center transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="block font-bold text-xs">{type}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    {rem} days rem.
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Ranges */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (!endDate || e.target.value > endDate) {
                  setEndDate(e.target.value);
                }
              }}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              required
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Duration Calculation & Warning */}
        {daysCount > 0 && (
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              isOverQuota
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {isOverQuota ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>
                Requested Duration: <strong>{daysCount} {daysCount === 1 ? 'day' : 'days'}</strong>
              </span>
            </div>
            <span>
              {isOverQuota
                ? `Exceeds balance by ${daysCount - availableDays} days`
                : `${availableDays - daysCount} days will remain`}
            </span>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Reason for Absence
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please detail reason (e.g. personal family event, medical checkup, traveling)..."
            className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isOverQuota || daysCount <= 0}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
