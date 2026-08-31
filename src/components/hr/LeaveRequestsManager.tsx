import React, { useState } from 'react';
import { LeaveRequest } from '../../types';
import { leaveService } from '../../services/leaveService';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Modal } from '../common/Modal';
import { UserAvatar } from '../common/UserAvatar';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

interface LeaveRequestsManagerProps {
  leaves: LeaveRequest[];
  onLeavesUpdated: () => void;
  isLoading: boolean;
}

export const LeaveRequestsManager: React.FC<LeaveRequestsManagerProps> = ({
  leaves,
  onLeavesUpdated,
  isLoading,
}) => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;
  const approvedCount = leaves.filter((l) => l.status === 'APPROVED').length;
  const rejectedCount = leaves.filter((l) => l.status === 'REJECTED').length;

  const filteredLeaves = leaves.filter((l) => {
    if (activeTab === 'ALL') return true;
    return l.status === activeTab;
  });

  const handleReviewSubmit = async () => {
    if (!selectedLeave || !actionType) return;
    setIsProcessing(true);
    try {
      await leaveService.reviewLeave(selectedLeave.id, {
        status: actionType,
        adminComment: adminComment || undefined,
      });

      success(
        actionType === 'APPROVED' ? 'Leave Request Approved!' : 'Leave Request Rejected',
        `The application for ${selectedLeave.employee?.name} has been updated.`
      );

      setSelectedLeave(null);
      setActionType(null);
      setAdminComment('');
      onLeavesUpdated();
    } catch (err: any) {
      error('Action Failed', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Header & Tabs */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Leave Approvals Queue</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review and authorize employee time-off requests
            </p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Pending</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'APPROVED'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Approved ({approvedCount})
          </button>

          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'REJECTED'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Rejected ({rejectedCount})
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'ALL'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All ({leaves.length})
          </button>
        </div>
      </div>

      {/* Leave List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {filteredLeaves.length === 0 ? (
          <div className="py-14 text-center text-slate-400 dark:text-slate-500 text-xs">
            No {activeTab.toLowerCase()} leave applications found.
          </div>
        ) : (
          filteredLeaves.map((leave) => (
            <div
              key={leave.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
            >
              <div className="flex items-start gap-3.5 flex-1">
                <UserAvatar name={leave.employee?.name} size="md" />
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {leave.employee?.name || 'Employee'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ({leave.employee?.department} • {leave.employee?.designation})
                    </span>
                    <StatusBadge status={leave.leaveType} size="sm" />
                    <StatusBadge status={leave.status} size="sm" />
                  </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>
                      {leave.startDate} to {leave.endDate}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block text-[10px] uppercase">
                    Reason
                  </span>
                  <p className="mt-0.5 leading-relaxed">{leave.reason}</p>
                </div>

                {leave.adminComment && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>HR Comment: "{leave.adminComment}"</span>
                  </div>
                )}
              </div>
            </div>

              {/* Action Buttons for Pending */}
              {leave.status === 'PENDING' && (
                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  <button
                    onClick={() => {
                      setSelectedLeave(leave);
                      setActionType('APPROVED');
                      setAdminComment('Approved. Enjoy your time off!');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs shadow-emerald-500/20 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLeave(leave);
                      setActionType('REJECTED');
                      setAdminComment('Unfortunately this conflicts with scheduled release.');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Dialog Modal */}
      {selectedLeave && actionType && (
        <Modal
          isOpen={!!selectedLeave}
          onClose={() => setSelectedLeave(null)}
          title={`${actionType === 'APPROVED' ? 'Approve' : 'Reject'} Leave Request`}
          subtitle={`Review application from ${selectedLeave.employee?.name} for ${selectedLeave.daysCount} days`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {selectedLeave.leaveType} Leave: {selectedLeave.startDate} to {selectedLeave.endDate} ({selectedLeave.daysCount} days)
              </p>
              <p className="text-slate-600 dark:text-slate-300 mt-1 italic">
                "{selectedLeave.reason}"
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                HR Review Comment / Handoff Note
              </label>
              <textarea
                rows={3}
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Optional note visible to employee..."
                className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-xl font-bold text-white shadow-xs transition ${
                  actionType === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                }`}
              >
                {isProcessing ? 'Submitting...' : `Confirm ${actionType === 'APPROVED' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
