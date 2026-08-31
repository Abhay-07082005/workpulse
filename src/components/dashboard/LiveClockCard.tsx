import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, Calendar, Sun, Moon, Sunrise, Sunset, Sparkles } from 'lucide-react';

export const LiveClockCard: React.FC = () => {
  const { user } = useAuth();
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return { text: 'Good morning', icon: Sunrise };
    if (hour < 17) return { text: 'Good afternoon', icon: Sun };
    if (hour < 21) return { text: 'Good evening', icon: Sunset };
    return { text: 'Good night', icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-md">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 backdrop-blur-md border border-slate-700/60 text-xs font-semibold text-blue-300 mb-3">
            <GreetingIcon className="w-4 h-4 text-amber-400" />
            <span>{greeting.text}, {user?.name.split(' ')[0] || 'Team Member'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Ready to log your workday?
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            Shift window: 09:00 AM – 05:00 PM • Standard hours: 8.0 hrs/day
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-700/60 shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>HQ Local Time</span>
          </div>
          <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-white mt-1">
            {formattedTime}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
