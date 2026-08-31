import React, { useState, useEffect, useCallback } from 'react';
import { leaveService } from '../services/leaveService';
import { LeaveBalance, LeaveRequest } from '../types';
import { LeaveBalanceCard } from '../components/leaves/LeaveBalanceCard';
import { ApplyLeaveModal } from '../components/leaves/ApplyLeaveModal';
import { MyLeaveRequestsTable } from '../components/leaves/MyLeaveRequestsTable';
import { Info, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const LeaveManagement: React.FC = () => {
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadLeaveData = useCallback(async () => {
    setIsLoading(true);
    try {
      const leavesRes = await leaveService.getMyLeaves();
      setBalance(leavesRes.balance);
      setLeaves(leavesRes.leaves || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaveData();
  }, [loadLeaveData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          Leave Management & Deductions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Apply for time off, monitor remaining quotas, and review HR approval statuses
        </p>
      </div>

      {/* Leave Quota Cards */}
      <LeaveBalanceCard
        balance={balance}
        onApplyLeaveClick={() => setIsApplyModalOpen(true)}
      />

      {/* Policy Explanation Box */}
      <div className="p-5 rounded-3xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 text-xs">
        <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200 mb-2">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Leave Policy & Automatic Deduction Rules</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-white dark:bg-slate-900/80 rounded-2xl border border-blue-100/80 dark:border-blue-900/40 space-y-1">
            <strong className="text-slate-900 dark:text-slate-100 block">Automatic Balance Updates</strong>
            <p className="text-[11px] leading-relaxed">
              When an HR administrator approves your leave request, the exact requested days are automatically deducted from your respective category balance.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900/80 rounded-2xl border border-blue-100/80 dark:border-blue-900/40 space-y-1">
            <strong className="text-slate-900 dark:text-slate-100 block">Deduction Calculation</strong>
            <p className="text-[11px] leading-relaxed">
              Leave days are calculated inclusive of business working days. Consecutive dates count automatically towards total leave days requested.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900/80 rounded-2xl border border-blue-100/80 dark:border-blue-900/40 space-y-1">
            <strong className="text-slate-900 dark:text-slate-100 block">Attendance Calendar Sync</strong>
            <p className="text-[11px] leading-relaxed">
              Approved leave days automatically reflect on your monthly attendance timeline with the <span className="font-semibold text-blue-600 dark:text-blue-400">On Leave</span> status.
            </p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <MyLeaveRequestsTable leaves={leaves} isLoading={isLoading} />

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onLeaveApplied={loadLeaveData}
        leaveBalance={balance}
      />
    </div>
  );
};
