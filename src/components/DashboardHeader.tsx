import React, { useState } from 'react';
import { Menu, Search, Bell, User as UserIcon, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';
import { User } from '../types';

interface DashboardHeaderProps {
  user: Partial<User>;
  onOpenMobileMenu: () => void;
  title?: string;
  subtitle?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onOpenMobileMenu,
  title,
  subtitle
}) => {
  const [showNotifs, setShowNotifs] = useState(false);

  const defaultNotifications = [
    { id: '1', title: 'Course Update Available', time: '10m ago', read: false },
    { id: '2', title: 'New Assessment Results Ready', time: '1h ago', read: false },
    { id: '3', title: 'Certificate Issued', time: '2h ago', read: true }
  ];

  return (
    <header className="bg-slate-900/60 border-b border-white/10 backdrop-blur-xl sticky top-0 z-20 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      
      {/* Mobile Menu Toggle & Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <span>{title || `Welcome back, ${user.name || 'User'}`}</span>
          </h1>
          <p className="text-[11px] text-slate-300 hidden sm:block">
            {subtitle || `${user.department || 'Computer Science'} • Role: ${user.role || 'STUDENT'}`}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        
        {/* Search Bar */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 w-64 backdrop-blur-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses, tests, skills..."
            className="bg-transparent text-white placeholder:text-slate-500 text-xs focus:outline-none w-full"
          />
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition relative backdrop-blur-md"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/15 rounded-2xl p-4 shadow-2xl z-50 backdrop-blur-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-white">Notifications</span>
                <span className="text-[10px] text-cyan-300 font-semibold cursor-pointer">Mark all as read</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {defaultNotifications.map(n => (
                  <div key={n.id} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-white">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info */}
        <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-2xl backdrop-blur-md">
          {user.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover border border-cyan-400/50 shadow-sm"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-white leading-none">{user.name}</div>
            <div className="text-[10px] font-medium text-cyan-300 leading-none mt-1">{user.role}</div>
          </div>
        </div>

      </div>

    </header>
  );
};
