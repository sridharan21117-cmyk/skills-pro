import React, { useState, useEffect } from 'react';
import {
  BookOpen, Award, CheckCircle2, Trophy, Clock, ArrowRight,
  Sparkles, Target, Briefcase, Cpu, Play, Check, Search, Filter,
  FileText, Plus, Trash2, ExternalLink, RefreshCw, AlertCircle
} from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { studentDashboardService, courseService, aptitudeService, certificateService, noteService, jobService } from '../services/api';
import { User, Course, Enrollment, UserSkill, Recommendation, Job, Certificate, Note } from '../types';
import { BackButton } from './BackButton';
import { Breadcrumbs } from './Breadcrumbs';

interface StudentDashboardProps {
  user: Partial<User>;
  onLogout: () => void;
  onNavigateTab?: (tab: string, extraData?: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onLogout,
  onNavigateTab
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard Data State
  const [data, setData] = useState<{
    overviewStats: { coursesEnrolled: number; coursesCompleted: number; averageScore: number; certificatesCount: number };
    myCourses: Array<Enrollment & { course?: Course; completedLessonsCount: number; totalLessonsCount: number }>;
    recentActivity: Array<{ id: string; type: string; title: string; subtitle: string; timestamp: string; iconType: string }>;
    skills: Array<UserSkill & { skillGap: number; recommendedLearning: string }>;
    recommendations: Recommendation[];
    upcomingTasks: Array<{ id: string; title: string; time: string; type: string; actionText: string; actionTab: string }>;
    jobMatches: Array<Job & { matchPercentage: number; missingSkills: string[]; isApplied: boolean }>;
  } | null>(null);

  // Certificates State
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  // Notes State
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, certsRes, notesRes] = await Promise.all([
        studentDashboardService.getDashboard(),
        certificateService.getCertificates(),
        noteService.getNotes()
      ]);
      setData(dashRes);
      setCertificates(certsRes);
      setNotes(notesRes);
    } catch (err: any) {
      console.error('Failed to load student dashboard data:', err);
      setError('Failed to load student dashboard. Please ensure you are logged in as a Student.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    try {
      const created = await noteService.createNote(newNoteTitle, newNoteContent);
      setNotes(prev => [created, ...prev]);
      setNewNoteTitle('');
      setNewNoteContent('');
      setShowAddNote(false);
    } catch (e) {
      console.error('Failed to create note', e);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await noteService.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error('Failed to delete note', e);
    }
  };

  const handleApplyJob = async (jobId: string) => {
    try {
      await jobService.applyForJob(jobId);
      // Refresh dashboard
      loadDashboardData();
    } catch (e) {
      console.error('Failed to apply for job', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* Sidebar */}
      <DashboardSidebar
        role="STUDENT"
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
          title="Student Learning & Career Portal"
          subtitle="Real-time progress, skill benchmark gap analysis, AI recommendations & job matching"
        />

        <main className="p-4 sm:p-6 lg:p-8 flex-1 space-y-6 max-w-7xl w-full mx-auto">

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-300">Loading Student Dashboard Data...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-3xl backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-rose-400" />
                <span className="text-sm text-rose-200">{error}</span>
              </div>
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-500"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && data && (
            <>
              {activeSection !== 'overview' && (
                <div className="flex items-center justify-between bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
                  <div className="flex items-center space-x-3">
                    <BackButton
                      label="Back to Overview"
                      onClick={() => setActiveSection('overview')}
                    />
                    <Breadcrumbs
                      items={[
                        { label: 'Student Portal', onClick: () => setActiveSection('overview') },
                        { label: activeSection.charAt(0).toUpperCase() + activeSection.slice(1), isCurrent: true }
                      ]}
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-mono capitalize">
                    {activeSection} Workspace
                  </span>
                </div>
              )}

              {/* SECTION 1: OVERVIEW */}
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-xl flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Courses</div>
                        <div className="text-2xl sm:text-3xl font-black text-white mt-1">{data.overviewStats.coursesEnrolled}</div>
                        <div className="text-[10px] text-cyan-300 mt-1 font-semibold">Active Enrollments</div>
                      </div>
                      <div className="p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-2xl text-cyan-300">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-xl flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Courses Completed</div>
                        <div className="text-2xl sm:text-3xl font-black text-white mt-1">{data.overviewStats.coursesCompleted}</div>
                        <div className="text-[10px] text-emerald-300 mt-1 font-semibold">100% Mastery</div>
                      </div>
                      <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-300">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-xl flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Score</div>
                        <div className="text-2xl sm:text-3xl font-black text-white mt-1">{data.overviewStats.averageScore}%</div>
                        <div className="text-[10px] text-purple-300 mt-1 font-semibold">Across Assessments</div>
                      </div>
                      <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-2xl text-purple-300">
                        <Trophy className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-xl flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Certificates</div>
                        <div className="text-2xl sm:text-3xl font-black text-white mt-1">{data.overviewStats.certificatesCount}</div>
                        <div className="text-[10px] text-amber-300 mt-1 font-semibold">Verified Credentials</div>
                      </div>
                      <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-300">
                        <Award className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Main Grid: My Learning + Upcoming Tasks */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* My Learning (Left 2 cols) */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-white flex items-center space-x-2">
                          <BookOpen className="w-5 h-5 text-cyan-400" />
                          <span>My Active Learning Progress</span>
                        </h2>
                        <button
                          onClick={() => setActiveSection('learning')}
                          className="text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center space-x-1"
                        >
                          <span>View All ({data.myCourses.length})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {data.myCourses.length === 0 ? (
                          <div className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center space-y-2 backdrop-blur-md">
                            <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
                            <p className="text-sm text-slate-300 font-semibold">You haven't enrolled in any courses yet.</p>
                            <button
                              onClick={() => onNavigateTab && onNavigateTab('courses')}
                              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg"
                            >
                              Explore Course Catalog
                            </button>
                          </div>
                        ) : (
                          data.myCourses.map(item => (
                            <div key={item.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition backdrop-blur-md space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                    {item.course?.category || 'Computer Science'}
                                  </span>
                                  <h3 className="text-sm font-bold text-white mt-1.5">{item.course?.title || 'Course'}</h3>
                                  <p className="text-xs text-slate-300">Instructor: {item.course?.instructor}</p>
                                </div>

                                <button
                                  onClick={() => onNavigateTab && onNavigateTab('courses', { courseId: item.courseId })}
                                  className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 rounded-xl text-xs font-bold transition flex items-center space-x-1 shrink-0"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                  <span>Resume</span>
                                </button>
                              </div>

                              {/* Progress Bar */}
                              <div>
                                <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                                  <span>{item.completedLessonsCount} / {item.totalLessonsCount} Lessons Completed</span>
                                  <span className="font-bold text-cyan-300">{item.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10">
                                  <div
                                    className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Upcoming Tasks & Recommendations (Right col) */}
                    <div className="space-y-6">
                      
                      {/* Upcoming Tasks */}
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md shadow-xl space-y-3">
                        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span>Upcoming Action Tasks</span>
                        </h3>

                        <div className="space-y-2">
                          {data.upcomingTasks.map(task => (
                            <div key={task.id} className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-white">{task.title}</h4>
                                <span className="text-[10px] text-purple-300 font-medium">{task.time}</span>
                              </div>
                              <button
                                onClick={() => onNavigateTab && onNavigateTab(task.actionTab)}
                                className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-200 rounded-lg text-[10px] font-bold"
                              >
                                {task.actionText}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Recommendations Widget */}
                      <div className="bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900/60 border border-indigo-500/30 rounded-3xl p-5 backdrop-blur-md shadow-xl space-y-3">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span className="text-xs font-bold text-amber-200">AI Career Recommendations</span>
                        </div>

                        <div className="space-y-2">
                          {data.recommendations.slice(0, 3).map(rec => (
                            <div key={rec.id} className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {rec.type}
                              </span>
                              <h5 className="text-xs font-bold text-white mt-1">{rec.title}</h5>
                              <p className="text-[11px] text-slate-300">{rec.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Section: Skill Benchmarks & Job Matches Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                    
                    {/* Skill Benchmarks & Gaps */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md shadow-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                          <Target className="w-4 h-4 text-cyan-400" />
                          <span>Skill Benchmarks & Gap Analysis</span>
                        </h3>
                        <button onClick={() => setActiveSection('skills')} className="text-xs text-cyan-300 font-bold hover:underline">
                          Full Analysis
                        </button>
                      </div>

                      <div className="space-y-3">
                        {data.skills.map(s => (
                          <div key={s.id} className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-white">{s.skillName}</span>
                              <span className="text-cyan-300">{s.level} ({s.score}%)</span>
                            </div>

                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/10">
                              <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${s.score}%` }} />
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>Skill Gap: <strong className="text-amber-300">{s.skillGap}%</strong></span>
                              <span className="text-indigo-300 font-semibold">{s.recommendedLearning}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Job Matches */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md shadow-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                          <Briefcase className="w-4 h-4 text-emerald-400" />
                          <span>Top Matched Job Opportunities</span>
                        </h3>
                        <button onClick={() => setActiveSection('jobs')} className="text-xs text-emerald-300 font-bold hover:underline">
                          View All Jobs
                        </button>
                      </div>

                      <div className="space-y-3">
                        {data.jobMatches.slice(0, 3).map(job => (
                          <div key={job.id} className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-white">{job.title}</h4>
                                <p className="text-[11px] text-slate-300">{job.company} • {job.location}</p>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                {job.matchPercentage}% Match
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-slate-400">{job.salary}</span>
                              {job.isApplied ? (
                                <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-xl text-[10px] font-bold">
                                  Applied
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleApplyJob(job.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold transition shadow-sm"
                                >
                                  Quick Apply
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* SECTION 2: MY LEARNING */}
              {activeSection === 'learning' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                    <div>
                      <h2 className="text-lg font-bold text-white">My Enrolled Courses & Learning Progress</h2>
                      <p className="text-xs text-slate-300 mt-1">Track completed lessons, resume interactive modules, and view course details.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.myCourses.map(item => (
                      <div key={item.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 backdrop-blur-md shadow-xl">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                              {item.course?.category || 'Computer Science'}
                            </span>
                            <h3 className="text-base font-bold text-white mt-2">{item.course?.title}</h3>
                            <p className="text-xs text-slate-300 mt-1">{item.course?.description}</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-300 mb-1 font-semibold">
                            <span>Lessons: {item.completedLessonsCount} / {item.totalLessonsCount}</span>
                            <span className="text-cyan-300">{item.progress}% Completed</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10">
                            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${item.progress}%` }} />
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => onNavigateTab && onNavigateTab('courses', { courseId: item.courseId })}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-lg"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Continue Learning</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 3: SKILL BENCHMARKS */}
              {activeSection === 'skills' && (
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                    <h2 className="text-lg font-bold text-white">Skill Benchmarks & Gap Analysis</h2>
                    <p className="text-xs text-slate-300 mt-1">Detailed evaluation of your skill levels against industry standards.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.skills.map(skill => (
                        <div key={skill.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white">{skill.skillName}</h4>
                            <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
                              {skill.level} ({skill.score}%)
                            </span>
                          </div>

                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10">
                            <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full" style={{ width: `${skill.score}%` }} />
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                            <span>Gap to Benchmark: <strong className="text-amber-300">{skill.skillGap}%</strong></span>
                            <button
                              onClick={() => onNavigateTab && onNavigateTab('aptitude')}
                              className="px-3 py-1 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition"
                            >
                              Practice Drill
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: RECOMMENDATIONS */}
              {activeSection === 'recommendations' && (
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                    <h2 className="text-lg font-bold text-white">AI-Powered Personalized Recommendations</h2>
                    <p className="text-xs text-slate-300 mt-1">Custom recommended learning paths based on your department, score trends, and career goals.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.recommendations.map(rec => (
                      <div key={rec.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3 backdrop-blur-md shadow-xl">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          {rec.type}
                        </span>
                        <h3 className="text-sm font-bold text-white">{rec.title}</h3>
                        <p className="text-xs text-slate-300">{rec.description}</p>

                        <div className="pt-2">
                          <button
                            onClick={() => onNavigateTab && onNavigateTab('courses')}
                            className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold rounded-xl shadow-md"
                          >
                            Explore Recommendation
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 5: CERTIFICATES */}
              {activeSection === 'certificates' && (
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                    <h2 className="text-lg font-bold text-white">Verified Earned Certificates</h2>
                    <p className="text-xs text-slate-300 mt-1">Authentic credentials with verification codes for portfolio and LinkedIn sharing.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map(cert => (
                      <div key={cert.id} className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-amber-500/30 rounded-3xl p-6 backdrop-blur-md shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Award className="w-6 h-6 text-amber-400" />
                            <span className="text-xs font-bold text-amber-300">OFFICIAL CERTIFICATE</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{cert.verificationCode}</span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-white">{cert.courseTitle}</h3>
                          <p className="text-xs text-slate-300 mt-1">Issued to: <strong className="text-white">{cert.userName}</strong></p>
                          <p className="text-[11px] text-slate-400">Date: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => onNavigateTab && onNavigateTab('certificates', { certId: cert.id })}
                            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View / Download PDF</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 6: NOTES */}
              {activeSection === 'notes' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                    <div>
                      <h2 className="text-lg font-bold text-white">Personal Study Notes Manager</h2>
                      <p className="text-xs text-slate-300 mt-1">Save course notes, algorithm snippets, and revision points.</p>
                    </div>
                    <button
                      onClick={() => setShowAddNote(true)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Note</span>
                    </button>
                  </div>

                  {showAddNote && (
                    <form onSubmit={handleCreateNote} className="bg-slate-900 border border-white/10 p-5 rounded-3xl space-y-3">
                      <input
                        type="text"
                        value={newNoteTitle}
                        onChange={e => setNewNoteTitle(e.target.value)}
                        placeholder="Note Title..."
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none"
                        required
                      />
                      <textarea
                        value={newNoteContent}
                        onChange={e => setNewNoteContent(e.target.value)}
                        placeholder="Write your study notes here..."
                        className="w-full h-24 p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none"
                        required
                      />
                      <div className="flex justify-end space-x-2">
                        <button type="button" onClick={() => setShowAddNote(false)} className="px-4 py-1.5 bg-white/10 text-xs text-slate-300 rounded-xl">Cancel</button>
                        <button type="submit" className="px-4 py-1.5 bg-cyan-600 text-xs font-bold text-white rounded-xl">Save Note</button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notes.map(note => (
                      <div key={note.id} className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-3 backdrop-blur-md shadow-xl">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-white">{note.title}</h3>
                          <button onClick={() => handleDeleteNote(note.id)} className="p-1 text-slate-400 hover:text-rose-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 whitespace-pre-wrap">{note.content}</p>
                        <p className="text-[10px] text-slate-500">{new Date(note.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback Section Router to Main App Tabs */}
              {['practice', 'interview', 'jobs'].includes(activeSection) && (
                <div className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center space-y-3 backdrop-blur-md">
                  <h3 className="text-base font-bold text-white uppercase">{activeSection} Module Active</h3>
                  <p className="text-xs text-slate-300">Redirecting to full interactive workspace view...</p>
                  <button
                    onClick={() => onNavigateTab && onNavigateTab(activeSection)}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-xl"
                  >
                    Launch Full {activeSection.toUpperCase()} Workspace
                  </button>
                </div>
              )}

            </>
          )}

        </main>
      </div>

    </div>
  );
};
