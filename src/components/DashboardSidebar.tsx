import React from 'react';
import {
  LayoutDashboard, BookOpen, Award, Briefcase, FileText, CheckSquare,
  BarChart2, Users, Shield, MessageSquare, Video, Settings, LogOut,
  Target, Cpu, Compass, Bell, X, Sparkles, TrendingUp
} from 'lucide-react';
import { UserRole } from '../types';

interface DashboardSidebarProps {
  role: UserRole;
  activeSection: string;
  onSelectSection: (section: string) => void;
  onLogout: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  role,
  activeSection,
  onSelectSection,
  onLogout,
  mobileOpen = false,
  onCloseMobile
}) => {

  const getMenuItems = () => {
    if (role === 'STUDENT') {
      return [
        { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
        { id: 'learning', label: 'My Learning & Courses', icon: BookOpen },
        { id: 'skills', label: 'Skill Benchmarks & Gaps', icon: Target },
        { id: 'recommendations', label: 'AI Recommendations', icon: Sparkles },
        { id: 'practice', label: 'Aptitude Practice Hub', icon: CheckSquare },
        { id: 'interview', label: 'AI Interview Simulator', icon: Cpu },
        { id: 'jobs', label: 'Job Matches & Applications', icon: Briefcase },
        { id: 'certificates', label: 'My Certificates', icon: Award },
        { id: 'notes', label: 'Personal Study Notes', icon: FileText }
      ];
    } else if (role === 'STAFF') {
      return [
        { id: 'overview', label: 'Staff Dashboard', icon: LayoutDashboard },
        { id: 'students', label: 'Student Performance', icon: Users },
        { id: 'courses', label: 'Course Analytics', icon: BookOpen },
        { id: 'analytics', label: 'Learning Analytics', icon: BarChart2 },
        { id: 'assessments', label: 'Assessment Performance', icon: CheckSquare },
        { id: 'questions', label: 'Question Bank Manager', icon: FileText },
        { id: 'certificates', label: 'Certificates Report', icon: Award },
        { id: 'activity', label: 'Learner Activity Feed', icon: TrendingUp }
      ];
    } else {
      // ADMIN
      return [
        { id: 'overview', label: 'Governance Overview', icon: LayoutDashboard },
        { id: 'users', label: 'User Directory & Roles', icon: Users },
        { id: 'courses', label: 'Course & Lesson Admin', icon: BookOpen },
        { id: 'assessments', label: 'Assessment Management', icon: CheckSquare },
        { id: 'jobs', label: 'Job Board Directory', icon: Briefcase },
        { id: 'videos', label: 'Video Content Manager', icon: Video },
        { id: 'announcements', label: 'Announcements Broadcast', icon: Bell },
        { id: 'reports', label: 'System Reports & Export', icon: BarChart2 },
        { id: 'audit', label: 'Security & Audit Logs', icon: Shield }
      ];
    }
  };

  const menuItems = getMenuItems();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900/80 border-r border-white/10 backdrop-blur-xl p-4 w-64 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 py-3 mb-4 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-cyan-300" />
            </div>
          </div>
          <div>
            <span className="text-base font-black text-white tracking-tight">SkillForge</span>
            <div className="flex items-center space-x-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                role === 'ADMIN'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : role === 'STAFF'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              }`}>
                {role} PORTAL
              </span>
            </div>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Navigation
        </div>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectSection(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                isActive
                  ? 'bg-white/15 text-white shadow-lg border border-white/20 backdrop-blur-md'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-slate-200'
              }`} />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="pt-4 mt-auto border-t border-white/10 space-y-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 transition duration-200 backdrop-blur-md"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
