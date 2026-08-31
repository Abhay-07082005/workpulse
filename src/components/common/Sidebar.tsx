
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  Users,
  BarChart3,
  FileCheck2,
  Clock,
  X,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, user } = useAuth();

  const employeeLinks = [
    {
      to: '/dashboard',
      label: 'Employee Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/my-attendance',
      label: 'My Attendance & Logs',
      icon: CalendarCheck,
    },
    {
      to: '/leaves',
      label: 'Leave Management',
      icon: CalendarDays,
    },
  ];

  const hrLinks = [
    {
      to: '/hr/dashboard',
      label: 'HR Analytics Dashboard',
      icon: BarChart3,
    },
    {
      to: '/hr/attendance',
      label: 'All Attendance Records',
      icon: Clock,
    },
    {
      to: '/hr/leaves',
      label: 'Leave Approvals Queue',
      icon: FileCheck2,
    },
    {
      to: '/hr/employees',
      label: 'Employee Directory',
      icon: Users,
    },
  ];

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Clock className="w-4 h-4" />
            </div>

            <div>
              <span className="font-bold text-base tracking-tight text-white">
                Work<span className="text-blue-400">Pulse</span>
              </span>

              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 -mt-0.5">
                Attendance & Leave OS
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Employee Workspace Nav */}
          <div>
            <div className="px-3 pb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Employee Portal</span>

              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <nav className="space-y-1">
              {employeeLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={navClass}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* HR Management Nav */}
          {role === 'HR_ADMIN' ? (
            <div>
              <div className="px-3 pb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>HR & Administration</span>

                <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-950 text-blue-300 font-bold border border-blue-800/60">
                  Admin
                </span>
              </div>

              <nav className="space-y-1">
                {hrLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={navClass}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-800/30 border border-slate-800/70 text-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
                <span>Employee Account</span>

                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                You are currently signed in as an Employee. Use the top bar
                switcher to test HR Admin features.
              </p>
            </div>
          )}

          {/* Office Rules Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>HQ Attendance Policy</span>
            </div>

            <ul className="text-[11px] space-y-1 text-slate-400 leading-tight">
              <li>
                • In before <strong>09:30 AM</strong>: On Time
              </li>

              <li>
                • <strong>09:31 - 10:00 AM</strong>: Late Arrival
              </li>

              <li>
                • Standard day: <strong>8.0 Hours</strong>
              </li>

              <li>• Overtime credited &gt; 8h</li>
            </ul>
          </div>
        </div>

        {/* Footer User Info */}
        {user && (
          <div className="p-3 m-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center gap-2.5">
            <UserAvatar name={user.name} size="md" />

            <div className="overflow-hidden flex-1">
              <p className="font-bold text-slate-100 text-xs truncate">
                {user.name}
              </p>

              <p className="text-[10px] text-slate-400 truncate">
                {user.department}
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

