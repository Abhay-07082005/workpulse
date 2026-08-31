import React from 'react';

interface UserAvatarProps {
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'User',
  size = 'md',
  className = '',
}) => {
  const getInitials = (fullName: string): string => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  const getPalette = (str: string) => {
    const palettes = [
      'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700',
      'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % palettes.length;
    return palettes[index];
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px] rounded-md font-bold',
    sm: 'w-7 h-7 text-[11px] rounded-lg font-bold',
    md: 'w-8 h-8 text-xs rounded-xl font-bold',
    lg: 'w-10 h-10 text-sm rounded-xl font-bold',
    xl: 'w-12 h-12 text-base rounded-2xl font-bold',
  };

  const paletteClass = getPalette(name);

  return (
    <div
      className={`inline-flex items-center justify-center border font-mono tracking-tight shrink-0 select-none ${sizeClasses[size]} ${paletteClass} ${className}`}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
};
