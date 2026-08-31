import React, { useState, useEffect, useCallback } from 'react';
import { leaveService } from '../services/leaveService';
import { LeaveRequest } from '../types';
import { LeaveRequestsManager } from '../components/hr/LeaveRequestsManager';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const HRLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaves = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await leaveService.getAllLeaves();
      setLeaves(data);
    } catch (err: any) {
      setError(err?.message || 'Unable to load leave requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          Leave Management & Authorizations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review pending employee time-off requests, authorize leaves, and maintain audit records
        </p>
      </div>

      {error ? (
        <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-bold text-sm">Error Loading Leave Requests</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchLeaves}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <LeaveRequestsManager
          leaves={leaves}
          onLeavesUpdated={fetchLeaves}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
