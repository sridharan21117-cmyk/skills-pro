import React, { useState, useEffect } from 'react';
import { User, Enrollment, Course, Certificate, Recommendation, Job, NotificationItem } from './types';
import { authService, courseService, certificateService, profileService, jobService, notificationService } from './services/api';

import { Navbar } from './components/Navbar';
import { LoginPortal } from './components/LoginPortal';
import { StudentDashboard } from './components/StudentDashboard';
import { CoursesView } from './components/CoursesView';
import { AptitudePracticeView } from './components/AptitudePracticeView';
import { ProgrammingCompilerView } from './components/ProgrammingCompilerView';
import { SkillAnalyzerView } from './components/SkillAnalyzerView';
import { InterviewSimulatorView } from './components/InterviewSimulatorView';
import { JobSimulatorView } from './components/JobSimulatorView';
import { CertificatesView } from './components/CertificatesView';
import { NotesView } from './components/NotesView';
import { ProfileView } from './components/ProfileView';
import { StaffDashboard } from './components/StaffDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AIMentorDrawer } from './components/AIMentorDrawer';

import { Bot, Sparkles, AlertCircle } from 'lucide-react';
import { Toast, ToastMessage } from './components/Toast';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOfflineAI, setIsOfflineAI] = useState<boolean>(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);

  // Toast feedback state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Data states
  const [myCourses, setMyCourses] = useState<Array<Enrollment & { course?: Course }>>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronize route & enforce strict Role-Based Route Guards
  const syncRouteWithUser = (currentUser: User | null, targetTab?: string) => {
    if (!currentUser) {
      if (window.location.pathname !== '/login') {
        window.history.pushState({}, '', '/login');
      }
      setActiveTab('login');
      return;
    }

    const path = window.location.pathname;

    // Strict Role Redirection
    if (currentUser.role === 'STUDENT') {
      if (path.startsWith('/staff') || path.startsWith('/admin')) {
        window.history.pushState({}, '', '/student/dashboard');
        setActiveTab('dashboard');
        return;
      }
      if (path === '/student/dashboard' || path === '/' || !path) {
        setActiveTab('dashboard');
      }
    } else if (currentUser.role === 'STAFF') {
      if (path.startsWith('/student') || path.startsWith('/admin')) {
        window.history.pushState({}, '', '/staff/dashboard');
        setActiveTab('staff-dashboard');
        return;
      }
      if (path === '/staff/dashboard' || path === '/' || !path) {
        setActiveTab('staff-dashboard');
      }
    } else if (currentUser.role === 'ADMIN') {
      if (path.startsWith('/student') || path.startsWith('/staff')) {
        window.history.pushState({}, '', '/admin/dashboard');
        setActiveTab('admin-dashboard');
        return;
      }
      if (path === '/admin/dashboard' || path === '/' || !path) {
        setActiveTab('admin-dashboard');
      }
    }

    if (targetTab) {
      setActiveTab(targetTab);
    }
  };

  useEffect(() => {
    checkInitialAuth();

    const handlePopState = () => {
      if (user) {
        syncRouteWithUser(user);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const checkInitialAuth = async () => {
    try {
      const res = await authService.getMe();
      setUser(res.user);
      syncRouteWithUser(res.user);
      loadGlobalData();
    } catch (e) {
      try {
        const demo = await authService.login('student@skillforge.ai', 'student123', 'STUDENT');
        setUser(demo.user);
        syncRouteWithUser(demo.user);
        loadGlobalData();
      } catch (err) {
        window.history.pushState({}, '', '/login');
        setActiveTab('login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalData = async () => {
    try {
      const [mCourses, certs, recs, jobList, notifs] = await Promise.all([
        courseService.getMyCourses().catch(() => []),
        certificateService.getCertificates().catch(() => []),
        profileService.getRecommendations().catch(() => []),
        jobService.getJobs().catch(() => []),
        notificationService.getNotifications().catch(() => [])
      ]);

      setMyCourses(mCourses);
      setCertificates(certs);
      setRecommendations(recs);
      setJobs(jobList);
      setNotifications(notifs);
    } catch (e) {
      console.error('Failed to load global data', e);
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    loadGlobalData();
    if (loggedInUser.role === 'ADMIN') {
      window.history.pushState({}, '', '/admin/dashboard');
      setActiveTab('admin-dashboard');
    } else if (loggedInUser.role === 'STAFF') {
      window.history.pushState({}, '', '/staff/dashboard');
      setActiveTab('staff-dashboard');
    } else {
      window.history.pushState({}, '', '/student/dashboard');
      setActiveTab('dashboard');
    }
  };

  const handleNavigateTab = (tab: string) => {
    if (tab === 'practice') {
      setActiveTab('aptitude');
    } else {
      setActiveTab(tab);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    window.history.pushState({}, '', '/login');
    setActiveTab('login');
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error('Failed notification update', e);
    }
  };

  const handleVerifyCertificate = async (code: string) => {
    try {
      const res = await certificateService.verifyCertificate(code);
      if (res.valid && res.certificate) {
        showToast('success', `Course: ${res.certificate.courseTitle} • Issued to ${res.certificate.userName} on ${new Date(res.certificate.issuedAt).toLocaleDateString()}`, 'Verified Certificate Found!');
      } else {
        showToast('error', `Code "${code}" is unrecorded or invalid.`, 'Verification Failed');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Unable to connect to verification server.', 'Verification Error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#1e293b,#0f172a)] bg-slate-950 flex items-center justify-center text-white relative overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col items-center space-y-4 relative z-10 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-spin shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-slate-300 font-semibold tracking-wider uppercase">Initializing Skill Forge AI Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#1e293b,#0f172a)] bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* Frosted Glass Ambient Spotlights */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isOfflineAI={isOfflineAI}
        setIsOfflineAI={setIsOfflineAI}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onVerifyCertificate={handleVerifyCertificate}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 pb-12">
        {activeTab === 'login' && (
          <LoginPortal onLoginSuccess={handleLoginSuccess} />
        )}

        {user && activeTab === 'dashboard' && (
          <StudentDashboard
            user={user}
            onLogout={handleLogout}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {user && activeTab === 'courses' && (
          <CoursesView
            user={user}
            onRefreshCourses={loadGlobalData}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {user && activeTab === 'aptitude' && (
          <AptitudePracticeView
            onAttemptCompleted={loadGlobalData}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {user && activeTab === 'compiler' && (
          <ProgrammingCompilerView
            isOffline={isOfflineAI}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {user && activeTab === 'skills' && (
          <SkillAnalyzerView
            user={user}
            setActiveTab={setActiveTab}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {user && activeTab === 'interview' && (
          <InterviewSimulatorView
            onNavigateTab={handleNavigateTab}
          />
        )}

        {user && activeTab === 'jobs' && (
          <JobSimulatorView
            onNavigateTab={handleNavigateTab}
          />
        )}

        {user && activeTab === 'certificates' && (
          <CertificatesView
            certificates={certificates}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {user && activeTab === 'notes' && (
          <NotesView
            onNavigateTab={handleNavigateTab}
          />
        )}

        {user && activeTab === 'profile' && (
          <ProfileView
            user={user}
            onUpdateUser={setUser}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {user && (user.role === 'STAFF' || user.role === 'ADMIN') && activeTab === 'staff-dashboard' && (
          <StaffDashboard
            user={user}
            onLogout={handleLogout}
            onNavigateTab={handleNavigateTab}
            initialSection="overview"
          />
        )}

        {user && (user.role === 'STAFF' || user.role === 'ADMIN') && activeTab === 'aptitude-manage' && (
          <StaffDashboard
            user={user}
            onLogout={handleLogout}
            onNavigateTab={handleNavigateTab}
            initialSection="questions"
          />
        )}

        {user && user.role === 'ADMIN' && activeTab === 'admin-dashboard' && (
          <AdminDashboard
            user={user}
            onLogout={handleLogout}
            onNavigateTab={handleNavigateTab}
            initialSection="overview"
          />
        )}
      </main>

      {/* Clean Global Footer */}
      <footer className="py-4 px-6 sm:px-8 border-t border-white/10 bg-slate-950/70 backdrop-blur-xl relative z-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-200">Skill Forge AI</span>
            <span>•</span>
            <span>Enterprise Learning & Skill Verification</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => setActiveTab('courses')}
              className="hover:text-indigo-300 transition"
            >
              Courses
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('aptitude')}
              className="hover:text-indigo-300 transition"
            >
              Aptitude Bank
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('compiler')}
              className="hover:text-indigo-300 transition"
            >
              Compiler
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('certificates')}
              className="hover:text-indigo-300 transition"
            >
              Credentials
            </button>
          </div>

          <div className="font-mono text-[11px] text-slate-500">
            &copy; 2026 Skill Forge AI. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Toast Feedback Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Floating AI Mentor Drawer Launcher Button */}
      {user && (
        <button
          onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
          className="fixed bottom-16 right-6 z-40 px-4 py-3 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl shadow-2xl backdrop-blur-xl flex items-center space-x-2 font-bold text-xs transition border border-white/20 group"
        >
          <Bot className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>AI Mentor</span>
          <span className={`w-2 h-2 rounded-full ${isOfflineAI ? 'bg-amber-400' : 'bg-emerald-400'}`} />
        </button>
      )}

      {/* Floating AI Mentor Drawer */}
      <AIMentorDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        user={user}
        isOfflineAI={isOfflineAI}
        setIsOfflineAI={setIsOfflineAI}
      />

    </div>
  );
}

export default App;
