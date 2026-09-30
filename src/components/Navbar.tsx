import React, { useState } from 'react';
import {
  Sparkles, Bell, User as UserIcon, BookOpen, Code, Brain, Award, Briefcase, FileText,
  ShieldCheck, LogOut, Wifi, WifiOff, CheckCircle2, Search, X, Menu
} from 'lucide-react';
import { User, NotificationItem } from '../types';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOfflineAI: boolean;
  setIsOfflineAI: (val: boolean) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onVerifyCertificate: (code: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  isOfflineAI,
  setIsOfflineAI,
  notifications,
  onMarkNotificationRead,
  onVerifyCertificate
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyCodeInput.trim()) {
      onVerifyCertificate(verifyCodeInput.trim());
      setShowVerifyModal(false);
      setVerifyCodeInput('');
    }
  };

  const navTo = (tab: string) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navTo('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/20 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  SKILL FORGE <span className="text-indigo-400">AI</span>
                </span>
                {user && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border backdrop-blur-md hidden sm:inline-block ${
                    user.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    user.role === 'STAFF' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                    'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  }`}>
                    {user.role}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-medium hidden sm:block">LEARN • PRACTICE • BUILD • GET JOB-READY</p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          {user && (
            <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
              {user.role === 'STUDENT' && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition backdrop-blur-md border ${
                      activeTab === 'dashboard'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                        : 'text-slate-300 border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('courses')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition backdrop-blur-md border ${
                      activeTab === 'courses'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                        : 'text-slate-300 border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'
                    }`}
                  >
                    Courses
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('aptitude')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition backdrop-blur-md border ${
                      activeTab === 'aptitude'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                        : 'text-slate-300 border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'
                    }`}
                  >
                    Aptitude Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('compiler')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition backdrop-blur-md border ${
                      activeTab === 'compiler'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                        : 'text-slate-300 border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'
                    }`}
                  >
                    Compiler
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('skills')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition backdrop-blur-md border ${
                      activeTab === 'skills'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                        : 'text-slate-300 border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'
                    }`}
                  >
                    Skill Analyzer
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('interview')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition backdrop-blur-md border ${
                      activeTab === 'interview'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                        : 'text-slate-300 border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'
                    }`}
                  >
                    Mock Interview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('jobs')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition backdrop-blur-md border ${
                      activeTab === 'jobs'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                        : 'text-slate-300 border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'
                    }`}
                  >
                    Jobs & Matcher
                  </button>
                </>
              )}

              {user.role === 'STAFF' && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('staff-dashboard')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition backdrop-blur-md border ${
                      activeTab === 'staff-dashboard'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                        : 'text-slate-300 border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'
                    }`}
                  >
                    Staff Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('aptitude-manage')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition backdrop-blur-md border ${
                      activeTab === 'aptitude-manage'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                        : 'text-slate-300 border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'
                    }`}
                  >
                    Aptitude Posting
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('courses')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition backdrop-blur-md border ${
                      activeTab === 'courses'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                        : 'text-slate-300 border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'
                    }`}
                  >
                    Course Catalog
                  </button>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('admin-dashboard')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition backdrop-blur-md border ${
                      activeTab === 'admin-dashboard'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'text-slate-300 border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'
                    }`}
                  >
                    Admin Console
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('aptitude-manage')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition backdrop-blur-md border ${
                      activeTab === 'aptitude-manage'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'text-slate-300 border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'
                    }`}
                  >
                    Question Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('courses')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition backdrop-blur-md border ${
                      activeTab === 'courses'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'text-slate-300 border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'
                    }`}
                  >
                    Courses & Content
                  </button>
                </>
              )}
            </nav>
          )}

          {/* Right Utilities */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* AI Offline/Online Mode Switcher */}
            <button
              type="button"
              onClick={() => setIsOfflineAI(!isOfflineAI)}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md transition min-h-[38px] ${
                isOfflineAI
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
              title="Toggle Online vs Offline Local AI Mode"
              aria-label="Toggle Online vs Offline Local AI Mode"
            >
              {isOfflineAI ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">Offline AI</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline">Online AI</span>
                </>
              )}
            </button>

            {/* Certificate Verification Button */}
            <button
              type="button"
              onClick={() => setShowVerifyModal(true)}
              className="p-2 rounded-xl text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white backdrop-blur-md transition min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Verify Certificate"
              aria-label="Verify Certificate"
            >
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </button>

            {/* Notifications Bell */}
            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white backdrop-blur-md transition relative min-h-[38px] min-w-[38px] flex items-center justify-center"
                  aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-pink-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border border-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 border border-white/15 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3.5 bg-white/5 border-b border-white/10 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">Notifications</h4>
                      <span className="text-xs text-slate-400">{unreadCount} unread</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-white/10">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">No new notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => onMarkNotificationRead(n.id)}
                            className={`p-3 text-xs cursor-pointer hover:bg-white/5 transition ${
                              !n.read ? 'bg-indigo-500/10' : 'opacity-70'
                            }`}
                          >
                            <p className="font-semibold text-slate-200">{n.title}</p>
                            <p className="text-slate-400 mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile & Logout */}
            {user ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2 pl-1.5 sm:pl-2 border-l border-white/10">
                <button
                  type="button"
                  onClick={() => navTo('profile')}
                  className="flex items-center space-x-2 p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md transition min-h-[38px]"
                  title="View Profile"
                  aria-label="View Profile"
                >
                  {!avatarError && user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      onError={() => setAvatarError(true)}
                      className="w-7 h-7 rounded-full object-cover border border-indigo-400/50 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs border border-indigo-400/50 shrink-0">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="hidden xl:inline text-xs font-semibold text-slate-200 truncate max-w-[100px]">{user.name}</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-xl transition min-h-[38px] min-w-[38px] flex items-center justify-center"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navTo('login')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 border border-white/20 transition min-h-[38px]"
              >
                Login Portal
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            {user && (
              <button
                type="button"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white backdrop-blur-md transition min-h-[38px] min-w-[38px] flex items-center justify-center"
                aria-label="Toggle navigation menu"
              >
                {mobileNavOpen ? <X className="w-5 h-5 text-indigo-400" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileNavOpen && user && (
          <div className="lg:hidden border-t border-white/10 py-3 px-2 space-y-1 bg-slate-950/90 backdrop-blur-2xl rounded-b-2xl animate-in fade-in slide-in-from-top-2 duration-150">
            {user.role === 'STUDENT' && (
              <>
                <button
                  type="button"
                  onClick={() => navTo('dashboard')}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition ${
                    activeTab === 'dashboard' ? 'bg-indigo-600/30 text-white border border-indigo-400/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Student Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => navTo('courses')}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition ${
                    activeTab === 'courses' ? 'bg-indigo-600/30 text-white border border-indigo-400/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Courseware Catalog</span>
                </button>
                <button
                  type="button"
                  onClick={() => navTo('aptitude')}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition ${
                    activeTab === 'aptitude' ? 'bg-indigo-600/30 text-white border border-indigo-400/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <span>Aptitude Practice Bank</span>
                </button>
                <button
                  type="button"
                  onClick={() => navTo('compiler')}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition ${
                    activeTab === 'compiler' ? 'bg-indigo-600/30 text-white border border-indigo-400/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Code className="w-4 h-4 text-indigo-400" />
                  <span>Programming Compiler (C/C++/Java/Python)</span>
                </button>
                <button
                  type="button"
                  onClick={() => navTo('skills')}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition ${
                    activeTab === 'skills' ? 'bg-indigo-600/30 text-white border border-indigo-400/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>Skill Analyzer & Gaps</span>
                </button>
                <button
                  type="button"
                  onClick={() => navTo('interview')}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition ${
                    activeTab === 'interview' ? 'bg-indigo-600/30 text-white border border-indigo-400/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>AI Mock Interview Simulator</span>
                </button>
                <button
                  type="button"
                  onClick={() => navTo('jobs')}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition ${
                    activeTab === 'jobs' ? 'bg-indigo-600/30 text-white border border-indigo-400/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  <span>Job Board & Applications</span>
                </button>
                <button
                  type="button"
                  onClick={() => navTo('certificates')}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition ${
                    activeTab === 'certificates' ? 'bg-indigo-600/30 text-white border border-indigo-400/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>My Certificates</span>
                </button>
                <button
                  type="button"
                  onClick={() => navTo('notes')}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition ${
                    activeTab === 'notes' ? 'bg-indigo-600/30 text-white border border-indigo-400/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Personal Study Notes</span>
                </button>
              </>
            )}

            {user.role === 'STAFF' && (
              <>
                <button
                  type="button"
                  onClick={() => navTo('staff-dashboard')}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition ${
                    activeTab === 'staff-dashboard' ? 'bg-purple-600/30 text-white border border-purple-400/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>Staff Portal Overview</span>
                </button>
                <button
                  type="button"
                  onClick={() => navTo('aptitude-manage')}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition ${
                    activeTab === 'aptitude-manage' ? 'bg-purple-600/30 text-white border border-purple-400/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>Aptitude Question Posting</span>
                </button>
                <button
                  type="button"
                  onClick={() => navTo('courses')}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition ${
                    activeTab === 'courses' ? 'bg-purple-600/30 text-white border border-purple-400/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>Course Catalog</span>
                </button>
              </>
            )}

            {user.role === 'ADMIN' && (
              <>
                <button
                  type="button"
                  onClick={() => navTo('admin-dashboard')}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition ${
                    activeTab === 'admin-dashboard' ? 'bg-amber-600/30 text-white border border-amber-400/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>Admin Governance Console</span>
                </button>
                <button
                  type="button"
                  onClick={() => navTo('aptitude-manage')}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition ${
                    activeTab === 'aptitude-manage' ? 'bg-amber-600/30 text-white border border-amber-400/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>Question Bank Management</span>
                </button>
                <button
                  type="button"
                  onClick={() => navTo('courses')}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition ${
                    activeTab === 'courses' ? 'bg-amber-600/30 text-white border border-amber-400/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>Courses & Content</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Certificate Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-white/15 backdrop-blur-2xl rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowVerifyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Verify Certificate</h3>
                <p className="text-xs text-slate-400">Enter verification code or certificate ID</p>
              </div>
            </div>
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label htmlFor="verify-code" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Verification Code
                </label>
                <input
                  id="verify-code"
                  type="text"
                  value={verifyCodeInput}
                  onChange={e => setVerifyCodeInput(e.target.value)}
                  placeholder="e.g. VERIFY-9921-SFA"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md placeholder:text-slate-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-500/20 border border-white/20 min-h-[44px]"
              >
                Verify Record Now
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
