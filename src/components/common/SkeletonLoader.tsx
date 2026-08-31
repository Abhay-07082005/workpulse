import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full animate-pulse space-y-3 p-4">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-full mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className={`h-6 bg-slate-100 dark:bg-slate-800/60 rounded-md ${
                j === 0 ? 'w-1/4' : 'flex-1'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="h-3 w-40 bg-slate-100 dark:bg-slate-800/60 rounded" />
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-8 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      </div>
      <div className="h-64 bg-slate-100 dark:bg-slate-800/40 rounded-xl w-full flex items-end gap-3 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-200 dark:bg-slate-800 rounded-t flex-1"
            style={{ height: `${25 + ((i * 13) % 65)}%` }}
          />
        ))}
      </div>
    </div>
  );
};
