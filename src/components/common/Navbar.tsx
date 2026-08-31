import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserAvatar } from './UserAvatar';
import {
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Briefcase,
  Clock,
  Menu,
  Users,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, role, logout, quickDemoLogin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showDemoMenu, setShowDemoMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleSwitch = async (targetRole: 'HR' | 'EMPLOYEE') => {
    setShowDemoMenu(false);
    try {
      await quickDemoLogin(targetRole);
      if (targetRole === 'HR') {
        navigate('/hr/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to switch demo persona', err);
    }
  };

  return (
    <header className="h-16 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between transition-colors">
      {/* Left items: Mobile toggle + Breadcrumb / Live clock */}
      <div className="flex items-center gap-3">
        <button
          id="btn-sidebar-toggle"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="font-mono font-semibold tracking-tight">{timeStr || '00:00:00'}</span>
          <span className="text-slate-400 dark:text-slate-500">|</span>
          <span className="text-slate-600 dark:text-slate-400">{dateStr}</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher (For technical assignment reviewers) */}
        <div className="relative">
          <button
            id="btn-demo-role-switcher"
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shadow-2xs cursor-pointer"
            title="Quick Demo Role Switcher"
          >
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden md:inline">Demo Persona:</span>
            <span className="font-bold">{role === 'HR_ADMIN' ? 'HR Admin' : 'Employee'}</span>
            <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
          </button>

          {showDemoMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 text-xs">
              <p className="px-3 py-1.5 font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                Switch Assessment Persona
              </p>
              <button
                onClick={() => handleRoleSwitch('HR')}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition ${
                  role === 'HR_ADMIN'
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  HR
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Sunita Sharma (HR Admin)</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Head of People & Culture</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSwitch('EMPLOYEE')}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 mt-1 transition ${
                  role === 'EMPLOYEE'
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  EM
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Aarav Sharma (Employee)</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Senior Full Stack Engineer</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          id="btn-theme-toggle"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
          aria-label="Toggle Dark Mode"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* User Profile Menu */}
        {user && (
          <div className="relative">
            <button
              id="btn-user-profile-menu"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
            >
              <UserAvatar name={user.name} size="md" />
              <div className="hidden lg:block text-left text-xs">
                <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{user.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-30">{user.designation}</p>
              </div>
              <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 text-xs">
                <div className="pb-3 mb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                  <UserAvatar name={user.name} size="lg" />
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{user.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {user.role === 'HR_ADMIN' ? 'HR / Admin' : 'Employee'} ({user.employeeCode})
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="px-2.5 py-1.5 flex items-center gap-2 text-[11px]">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Department: <strong>{user.department}</strong></span>
                  </div>
                  <div className="px-2.5 py-1.5 flex items-center gap-2 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Role: <strong>{user.role}</strong></span>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    id="btn-logout"
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 font-semibold transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
