import React, { useState, useEffect } from 'react';
import {
  Shield, Users, BookOpen, CheckSquare, Briefcase, Video, Bell, BarChart2,
  Trash2, Edit3, Plus, Search, Filter, AlertCircle, RefreshCw, Eye, Download,
  CheckCircle2, XCircle, FileText, ChevronRight
} from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { adminDashboardService, aptitudeService } from '../services/api';
import { User, Course, AptitudeTest, Question, Job, VideoItem } from '../types';
import { BackButton } from './BackButton';
import { Breadcrumbs } from './Breadcrumbs';

interface AdminDashboardProps {
  user: Partial<User>;
  onLogout: () => void;
  onNavigateTab?: (tab: string, extraData?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
  onNavigateTab
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats & Analytics State
  const [overviewStats, setOverviewStats] = useState<{
    totalUsers: number;
    totalStudents: number;
    totalStaff: number;
    totalAdmins: number;
    totalCourses: number;
    totalAssessments: number;
    totalJobs: number;
    totalCertificates: number;
  } | null>(null);

  const [analytics, setAnalytics] = useState<{
    userGrowth: Array<{ period: string; students: number; staff: number }>;
    courseEnrollmentTrend: Array<{ month: string; enrollments: number; completions: number }>;
    assessmentPerformance: Array<{ category: string; avgScore: number; passRate: number }>;
    jobApplicationsTrend: Array<{ month: string; applications: number }>;
    certificatesOverTime: Array<{ month: string; count: number }>;
  } | null>(null);

  // Entities State
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<AptitudeTest[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Search & Filter
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annRole, setAnnRole] = useState('ALL');
  const [annStatus, setAnnStatus] = useState<string | null>(null);

  // Modals
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDept, setNewCourseDept] = useState('Computer Science & Engineering');

  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, analyticsRes, uList, cList, aList, jList, vList, qList] = await Promise.all([
        adminDashboardService.getDashboard(),
        adminDashboardService.getAnalytics(),
        adminDashboardService.getUsers(),
        adminDashboardService.getCourses(),
        adminDashboardService.getAssessments(),
        adminDashboardService.getJobs(),
        adminDashboardService.getVideos(),
        aptitudeService.getQuestions()
      ]);
      setOverviewStats(statsRes);
      setAnalytics(analyticsRes);
      setUsers(uList);
      setCourses(cList);
      setAssessments(aList);
      setJobs(jList);
      setVideos(vList);
      setQuestions(qList);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError('Unable to load Administrator Console data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const updated = await adminDashboardService.updateUser(userId, { role: newRole as any });
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    } catch (e) {
      console.error('Failed to change user role', e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminDashboardService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e) {
      console.error('Failed to delete user', e);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;
    try {
      const created = await adminDashboardService.createCourse({
        title: newCourseTitle,
        department: newCourseDept
      });
      setCourses(prev => [created, ...prev]);
      setNewCourseTitle('');
      setShowAddCourseModal(false);
    } catch (e) {
      console.error('Failed to create course', e);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      await adminDashboardService.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error('Failed to delete course', e);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;
    try {
      const created = await adminDashboardService.createJob({
        title: newJobTitle,
        company: newJobCompany
      });
      setJobs(prev => [created, ...prev]);
      setNewJobTitle('');
      setNewJobCompany('');
      setShowAddJobModal(false);
    } catch (e) {
      console.error('Failed to create job', e);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await adminDashboardService.deleteJob(id);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (e) {
      console.error('Failed to delete job', e);
    }
  };

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    try {
      const res = await adminDashboardService.createAnnouncement({
        title: annTitle,
        message: annMessage,
        targetRole: annRole
      });
      setAnnStatus(`Successfully broadcasted announcement to ${res.targetCount} users!`);
      setAnnTitle('');
      setAnnMessage('');
    } catch (e) {
      console.error('Failed to broadcast announcement', e);
    }
  };

  const handleExportCSVReport = async () => {
    try {
      const reports = await adminDashboardService.getReports();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(reports, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `skillforge_platform_report_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Failed to export report', e);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* Sidebar */}
      <DashboardSidebar
        role="ADMIN"
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onLogout={onLogout}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <DashboardHeader
          user={user}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          title="Administrator Governance Console"
          subtitle="User role directory, course catalog admin, job postings, announcements broadcast & platform reports"
        />

        <main className="p-4 sm:p-6 lg:p-8 flex-1 space-y-6 max-w-7xl w-full mx-auto">

          {activeSection !== 'overview' && (
            <div className="flex items-center justify-between bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <BackButton
                  label="Back to Overview"
                  onClick={() => setActiveSection('overview')}
                />
                <Breadcrumbs
                  items={[
                    { label: 'Admin Console', onClick: () => setActiveSection('overview') },
                    { label: activeSection.charAt(0).toUpperCase() + activeSection.slice(1), isCurrent: true }
                  ]}
                />
              </div>
              <span className="text-xs text-slate-400 font-mono capitalize">
                {activeSection} Admin View
              </span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-300">Loading Governance Console...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-3xl backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-rose-400" />
                <span className="text-sm text-rose-200">{error}</span>
              </div>
              <button onClick={loadAdminData} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">
                Retry
              </button>
            </div>
          )}

          {!loading && overviewStats && analytics && (
            <>
              {/* SECTION 1: OVERVIEW */}
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  
                  {/* Platform Overview Counts */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Total Accounts</div>
                        <div className="text-2xl font-black text-white mt-1">{overviewStats.totalUsers}</div>
                        <div className="text-[10px] text-amber-300 font-semibold">{overviewStats.totalStudents} Students • {overviewStats.totalStaff} Staff</div>
                      </div>
                      <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-300">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Course Catalog</div>
                        <div className="text-2xl font-black text-white mt-1">{overviewStats.totalCourses}</div>
                        <div className="text-[10px] text-cyan-300 font-semibold">Active Modules</div>
                      </div>
                      <div className="p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-2xl text-cyan-300">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Assessments</div>
                        <div className="text-2xl font-black text-white mt-1">{overviewStats.totalAssessments}</div>
                        <div className="text-[10px] text-purple-300 font-semibold">Practice Tests</div>
                      </div>
                      <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-2xl text-purple-300">
                        <CheckSquare className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Job Opportunities</div>
                        <div className="text-2xl font-black text-white mt-1">{overviewStats.totalJobs}</div>
                        <div className="text-[10px] text-emerald-300 font-semibold">Active Positions</div>
                      </div>
                      <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-300">
                        <Briefcase className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Growth & Analytics Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* User Growth Chart */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-4">
                      <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                        <BarChart2 className="w-4 h-4 text-amber-400" />
                        <span>Platform User Account Growth</span>
                      </h3>

                      <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-white/10 pb-4">
                        {analytics.userGrowth.map(item => (
                          <div key={item.period} className="flex-1 flex flex-col items-center space-y-2 h-full justify-end">
                            <div className="w-full flex items-end justify-center space-x-1 h-32">
                              <div
                                className="w-4 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md"
                                style={{ height: `${(item.students / 1000) * 100}%` }}
                                title={`Students: ${item.students}`}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">{item.period}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Reports Export */}
                    <div className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
                          <Shield className="w-4 h-4" />
                          <span>Platform Export & Governance</span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-2">Comprehensive Data Reports Export</h3>
                        <p className="text-xs text-slate-300 mt-1">Download consolidated JSON/CSV reports containing all users, course completions, test attempts, certificates, and job application history.</p>
                      </div>

                      <button
                        onClick={handleExportCSVReport}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-xl hover:brightness-110"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Comprehensive Report</span>
                      </button>
                    </div>

                  </div>

                </div>
              )}

              {/* SECTION 2: USER DIRECTORY & ROLES */}
              {(activeSection === 'users' || activeSection === 'overview') && (
                <div className="space-y-4 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md">
                    <div>
                      <h2 className="text-base font-bold text-white">Registered User Directory ({filteredUsers.length})</h2>
                      <p className="text-xs text-slate-300">Manage user authorization, assign roles (STUDENT, STAFF, ADMIN), and remove accounts.</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-amber-300 font-bold"
                      >
                        <option value="">All Roles</option>
                        <option value="STUDENT">STUDENT</option>
                        <option value="STAFF">STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>

                      <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={userSearch}
                          onChange={e => setUserSearch(e.target.value)}
                          placeholder="Search users..."
                          className="bg-transparent text-white placeholder:text-slate-500 focus:outline-none w-40 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900/80 border-b border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Department</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-white/5 transition">
                              <td className="p-4">
                                <div className="font-bold text-white">{u.name}</div>
                                <div className="text-[10px] text-slate-400">{u.email}</div>
                              </td>
                              <td className="p-4">{u.department || 'General'}</td>
                              <td className="p-4">
                                <select
                                  value={u.role}
                                  onChange={e => handleRoleChange(u.id, e.target.value)}
                                  className="px-2.5 py-1 bg-slate-900 border border-white/10 rounded-lg text-xs font-bold text-amber-300"
                                >
                                  <option value="STUDENT">STUDENT</option>
                                  <option value="STAFF">STAFF</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>
                              </td>
                              <td className="p-4">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                  {u.status || 'ACTIVE'}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition"
                                  title="Delete User Account"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: COURSE ADMIN */}
              {activeSection === 'courses' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md">
                    <div>
                      <h2 className="text-base font-bold text-white">Course Catalog Management ({courses.length})</h2>
                      <p className="text-xs text-slate-300">Create, edit, and publish platform courses and lessons.</p>
                    </div>

                    <button
                      onClick={() => setShowAddCourseModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Course</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map(course => (
                      <div key={course.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3 backdrop-blur-md shadow-xl">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                              {course.department}
                            </span>
                            <h3 className="text-sm font-bold text-white mt-1">{course.title}</h3>
                          </div>
                          <button onClick={() => handleDeleteCourse(course.id)} className="p-1 text-slate-400 hover:text-rose-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: ANNOUNCEMENTS BROADCAST */}
              {activeSection === 'announcements' && (
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-4">
                    <h2 className="text-base font-bold text-white">Platform Announcement Broadcaster</h2>
                    <p className="text-xs text-slate-300">Broadcast platform notices automatically generating user notifications for targeted roles.</p>

                    {annStatus && (
                      <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-xs font-bold text-emerald-300">
                        {annStatus}
                      </div>
                    )}

                    <form onSubmit={handleBroadcastAnnouncement} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={annTitle}
                          onChange={e => setAnnTitle(e.target.value)}
                          placeholder="Announcement Title..."
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
                          required
                        />
                        <select
                          value={annRole}
                          onChange={e => setAnnRole(e.target.value)}
                          className="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-amber-300 font-bold"
                        >
                          <option value="ALL">All Users (Students + Staff)</option>
                          <option value="STUDENT">Students Only</option>
                          <option value="STAFF">Staff Only</option>
                        </select>
                      </div>

                      <textarea
                        value={annMessage}
                        onChange={e => setAnnMessage(e.target.value)}
                        placeholder="Write announcement message body..."
                        className="w-full h-24 p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
                        required
                      />

                      <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-xs font-bold shadow-lg">
                        Broadcast Announcement
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </>
          )}

          {/* Add Course Modal */}
          {showAddCourseModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-white">Create New Course</h3>
                <form onSubmit={handleCreateCourse} className="space-y-3">
                  <input type="text" value={newCourseTitle} onChange={e => setNewCourseTitle(e.target.value)} placeholder="Course Title..." className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white" required />
                  <input type="text" value={newCourseDept} onChange={e => setNewCourseDept(e.target.value)} placeholder="Department..." className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white" required />
                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={() => setShowAddCourseModal(false)} className="px-4 py-2 bg-white/10 text-xs text-slate-300 rounded-xl">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-amber-500 text-xs font-bold text-white rounded-xl">Create Course</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
