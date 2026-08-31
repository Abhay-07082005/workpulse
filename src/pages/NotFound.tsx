import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="inline-flex p-4 rounded-3xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <Clock className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">404</h1>
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">Page Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The view or resource you are seeking does not exist or has been shifted in the directory.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
