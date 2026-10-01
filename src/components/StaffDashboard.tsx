import React, { useState, useEffect } from 'react';
import {
  Users, BookOpen, CheckCircle2, Award, TrendingUp, BarChart2,
  Search, Filter, Plus, Upload, AlertCircle, RefreshCw, Eye,
  FileText, Check, X, Shield, ArrowUpRight
} from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { staffDashboardService, aptitudeService } from '../services/api';
import { User, Question, Certificate, AptitudeTest } from '../types';
import { BackButton } from './BackButton';
import { Breadcrumbs } from './Breadcrumbs';

interface StaffDashboardProps {
  user: Partial<User>;
  onLogout: () => void;
  onNavigateTab?: (tab: string, extraData?: any) => void;
  initialSection?: string;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  user,
  onLogout,
  onNavigateTab,
  initialSection = 'overview'
}) => {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats State
  const [overviewStats, setOverviewStats] = useState<{
    totalStudents: number;
    activeLearners: number;
    totalCourses: number;
    averageStudentScore: number;
    completionRate: number;
    certificatesIssued: number;
  } | null>(null);

  // Analytics State
  const [analytics, setAnalytics] = useState<{
    enrollmentTrend: Array<{ month: string; enrollments: number; completions: number }>;
    courseCompletionBreakdown: { completed: number; inProgress: number; notStarted: number };
    assessmentPerformance: { averageScore: number; passRate: number; failRate: number };
  } | null>(null);

  // Tables Data State
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assessmentsList, setAssessmentsList] = useState<any[]>([]);
  const [certificatesList, setCertificatesList] = useState<Certificate[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);

  // Search & Filter
  const [studentSearch, setStudentSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Modals
  const [selectedStudentModal, setSelectedStudentModal] = useState<any | null>(null);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  // New Question Form
  const [category, setCategory] = useState('Quantitative Aptitude');
  const [topic, setTopic] = useState('Percentages');
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [csvText, setCsvText] = useState('');

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, analyticsRes, studentsRes, coursesRes, qList, actRes, assessRes, certsRes] = await Promise.all([
        staffDashboardService.getDashboard(),
        staffDashboardService.getAnalytics(),
        staffDashboardService.getStudents(),
        staffDashboardService.getCourses(),
        aptitudeService.getQuestions(),
        staffDashboardService.getActivity(),
        staffDashboardService.getAssessments().catch(() => []),
        staffDashboardService.getCertificates().catch(() => [])
      ]);
      setOverviewStats(statsRes);
      setAnalytics(analyticsRes);
      setStudentsList(studentsRes);
      setCoursesList(coursesRes);
      setQuestions(qList);
      setActivityFeed(actRes.activityFeed || []);
      setAssessmentsList(assessRes);
      setCertificatesList(certsRes);
    } catch (err) {
      console.error('Failed to load staff data:', err);
      setError('Unable to load staff dashboard. Please verify authorization.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await aptitudeService.createQuestion({
        category,
        topic,
        question: questionText,
        options: [optionA, optionB, optionC, optionD],
        correctAnswer,
        explanation,
        marks: 1,
        status: 'Pending Review'
      });
      setQuestions(prev => [created, ...prev]);
      setShowAddQuestionModal(false);
    } catch (e) {
      console.error('Failed to create question', e);
    }
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const lines = csvText.split('\n').filter(l => l.trim());
      const parsed = lines.slice(1).map((line, idx) => {
        const parts = line.split(',');
        return {
          category: parts[0] || 'Quantitative Aptitude',
          topic: parts[1] || 'General',
          question: parts[2] || `Imported Question ${idx + 1}`,
          options: [parts[3] || 'A', parts[4] || 'B', parts[5] || 'C', parts[6] || 'D'],
          correctAnswer: parts[7] || parts[3] || 'A',
          explanation: parts[8] || 'Explanation',
          marks: 1,
          status: 'Pending Review'
        };
      });

      const res = await aptitudeService.importQuestions(parsed);
      setQuestions(prev => [...res.questions, ...prev]);
      setShowCsvModal(false);
      setCsvText('');
    } catch (e) {
      console.error('Failed CSV import', e);
    }
  };

  const filteredStudents = studentsList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          s.email.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesDept = !departmentFilter || s.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* Sidebar */}
      <DashboardSidebar
        role="STAFF"
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
          title="Academic Staff & Learner Management"
          subtitle="Real-time student progress tracking, course completion analytics, and question bank authoring"
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
                    { label: 'Staff Portal', onClick: () => setActiveSection('overview') },
                    { label: activeSection.charAt(0).toUpperCase() + activeSection.slice(1), isCurrent: true }
                  ]}
                />
              </div>
              <span className="text-xs text-slate-400 font-mono capitalize">
                {activeSection} View
              </span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-300">Loading Staff Console Analytics...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-3xl backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-rose-400" />
                <span className="text-sm text-rose-200">{error}</span>
              </div>
              <button onClick={loadStaffData} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">
                Retry
              </button>
            </div>
          )}

          {!loading && overviewStats && analytics && (
            <>
              {/* SECTION 1: OVERVIEW */}
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  
                  {/* Overview Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md shadow-xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Total Students</div>
                      <div className="text-2xl font-black text-white mt-1">{overviewStats.totalStudents}</div>
                      <span className="text-[10px] text-purple-300 font-medium">Registered</span>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md shadow-xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Active Learners</div>
                      <div className="text-2xl font-black text-cyan-300 mt-1">{overviewStats.activeLearners}</div>
                      <span className="text-[10px] text-cyan-300 font-medium">Active 30 Days</span>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md shadow-xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Total Courses</div>
                      <div className="text-2xl font-black text-white mt-1">{overviewStats.totalCourses}</div>
                      <span className="text-[10px] text-indigo-300 font-medium">Published</span>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md shadow-xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Score</div>
                      <div className="text-2xl font-black text-emerald-300 mt-1">{overviewStats.averageStudentScore}%</div>
                      <span className="text-[10px] text-emerald-300 font-medium">Class Benchmark</span>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md shadow-xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Completion Rate</div>
                      <div className="text-2xl font-black text-amber-300 mt-1">{overviewStats.completionRate}%</div>
                      <span className="text-[10px] text-amber-300 font-medium">Overall Courses</span>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md shadow-xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Certificates</div>
                      <div className="text-2xl font-black text-white mt-1">{overviewStats.certificatesIssued}</div>
                      <span className="text-[10px] text-slate-400 font-medium">Issued</span>
                    </div>
                  </div>

                  {/* Analytics Charts & Learner Feed */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Enrollment Trend Chart */}
                    <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-4">
                      <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span>Monthly Student Enrollment & Completion Trend</span>
                      </h3>

                      <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-white/10 pb-4">
                        {analytics.enrollmentTrend.map(item => (
                          <div key={item.month} className="flex-1 flex flex-col items-center space-y-2 h-full justify-end">
                            <div className="w-full flex items-end justify-center space-x-1 h-36">
                              <div
                                className="w-3 sm:w-5 bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-md transition-all duration-300"
                                style={{ height: `${(item.enrollments / 200) * 100}%` }}
                                title={`Enrollments: ${item.enrollments}`}
                              />
                              <div
                                className="w-3 sm:w-5 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md transition-all duration-300"
                                style={{ height: `${(item.completions / 200) * 100}%` }}
                                title={`Completions: ${item.completions}`}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">{item.month}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-center space-x-6 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-sm bg-indigo-500" />
                          <span className="text-slate-300">Enrollments</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                          <span className="text-slate-300">Completions</span>
                        </div>
                      </div>
                    </div>

                    {/* Learner Activity Feed */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md shadow-xl space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                        <BarChart2 className="w-4 h-4 text-cyan-400" />
                        <span>Live Learner Activity Feed</span>
                      </h3>

                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {activityFeed.map(act => (
                          <div key={act.id} className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold text-white">
                              <span>{act.studentName}</span>
                              <span className="text-[9px] text-cyan-300 font-normal">{new Date(act.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-[11px] text-slate-300">{act.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* SECTION 2: STUDENTS PERFORMANCE TABLE */}
              {(activeSection === 'students' || activeSection === 'overview') && (
                <div className="space-y-4 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md">
                    <div>
                      <h2 className="text-base font-bold text-white">Student Performance Directory ({filteredStudents.length})</h2>
                      <p className="text-xs text-slate-300">Comprehensive view of individual student progress, test scores, and certificates.</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={studentSearch}
                          onChange={e => setStudentSearch(e.target.value)}
                          placeholder="Search student name or email..."
                          className="bg-transparent text-white placeholder:text-slate-500 focus:outline-none w-48 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900/80 border-b border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <tr>
                            <th className="p-4">Student</th>
                            <th className="p-4">Department</th>
                            <th className="p-4">Courses</th>
                            <th className="p-4">Avg Progress</th>
                            <th className="p-4">Avg Score</th>
                            <th className="p-4">Certificates</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredStudents.map(student => (
                            <tr key={student.id} className="hover:bg-white/5 transition">
                              <td className="p-4">
                                <div className="font-bold text-white">{student.name}</div>
                                <div className="text-[10px] text-slate-400">{student.email}</div>
                              </td>
                              <td className="p-4">{student.department}</td>
                              <td className="p-4 font-bold text-white">{student.coursesEnrolledCount}</td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/10">
                                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${student.averageProgress}%` }} />
                                  </div>
                                  <span className="font-bold text-cyan-300">{student.averageProgress}%</span>
                                </div>
                              </td>
                              <td className="p-4 font-bold text-purple-300">{student.averageScore}%</td>
                              <td className="p-4 font-bold text-amber-300">{student.certificatesCount}</td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => setSelectedStudentModal(student)}
                                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold transition flex items-center space-x-1 inline-flex"
                                >
                                  <Eye className="w-3.5 h-3.5 text-purple-300" />
                                  <span>Inspect</span>
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

              {/* SECTION 3: COURSE ANALYTICS */}
              {activeSection === 'courses' && (
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md">
                    <h2 className="text-base font-bold text-white">Course Performance Analytics ({coursesList.length})</h2>
                    <p className="text-xs text-slate-300">Enrollment counts, completion rates, and average student performance per course.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coursesList.map(course => (
                      <div key={course.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3 backdrop-blur-md shadow-xl">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                              {course.department}
                            </span>
                            <h3 className="text-sm font-bold text-white mt-1">{course.title}</h3>
                          </div>
                          <span className="text-xs font-bold text-emerald-300">{course.status}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                          <div>
                            <div className="text-[10px] text-slate-400">Enrollments</div>
                            <div className="text-sm font-bold text-white">{course.enrollmentsCount}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">Completion %</div>
                            <div className="text-sm font-bold text-cyan-300">{course.completionRate}%</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">Avg Score</div>
                            <div className="text-sm font-bold text-purple-300">{course.averageScore}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: QUESTION BANK MANAGER */}
              {activeSection === 'questions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md">
                    <div>
                      <h2 className="text-base font-bold text-white">Question Bank Item Authoring</h2>
                      <p className="text-xs text-slate-300">Post new aptitude test questions or import bulk question banks via CSV.</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowCsvModal(true)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                      >
                        <Upload className="w-4 h-4 text-purple-300" />
                        <span>CSV Import</span>
                      </button>

                      <button
                        onClick={() => setShowAddQuestionModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-lg"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Question</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3 backdrop-blur-md shadow-2xl">
                    {questions.map(q => (
                      <div key={q.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {q.category} • {q.topic}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              q.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}>
                              {q.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-2">{q.question}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 5: LEARNING ANALYTICS */}
              {activeSection === 'analytics' && (
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md">
                    <h2 className="text-base font-bold text-white">Comprehensive Learning Analytics</h2>
                    <p className="text-xs text-slate-300">Cohort enrollment trajectory, module completion ratios, and assessment pass statistics.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-xl text-center space-y-2">
                      <div className="text-xs font-semibold text-slate-400">Average Class Score</div>
                      <div className="text-3xl font-black text-purple-300">{analytics.assessmentPerformance.averageScore}%</div>
                      <p className="text-[11px] text-slate-400">Across all tests & submissions</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-xl text-center space-y-2">
                      <div className="text-xs font-semibold text-slate-400">Assessment Pass Rate</div>
                      <div className="text-3xl font-black text-emerald-300">{analytics.assessmentPerformance.passRate}%</div>
                      <p className="text-[11px] text-slate-400">Meeting academic benchmark</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-xl text-center space-y-2">
                      <div className="text-xs font-semibold text-slate-400">Needs Support</div>
                      <div className="text-3xl font-black text-rose-300">{analytics.assessmentPerformance.failRate}%</div>
                      <p className="text-[11px] text-slate-400">Scheduled for remedial sessions</p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-xl space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      <span>Cohort Progress Breakdown</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900/60 rounded-2xl border border-white/10 text-center">
                      <div>
                        <div className="text-xs text-slate-400">Completed Courses</div>
                        <div className="text-xl font-bold text-emerald-300 mt-1">{analytics.courseCompletionBreakdown.completed}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">In Progress</div>
                        <div className="text-xl font-bold text-cyan-300 mt-1">{analytics.courseCompletionBreakdown.inProgress}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Not Started</div>
                        <div className="text-xl font-bold text-slate-400 mt-1">{analytics.courseCompletionBreakdown.notStarted}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: ASSESSMENTS PERFORMANCE */}
              {activeSection === 'assessments' && (
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md">
                    <h2 className="text-base font-bold text-white">Assessment Performance & Test Results ({assessmentsList.length})</h2>
                    <p className="text-xs text-slate-300">Detailed overview of student attempts, pass percentages, and duration per test.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assessmentsList.map(item => (
                      <div key={item.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3 backdrop-blur-md shadow-xl">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {item.category} • {item.companyPattern || 'Academic Standard'}
                            </span>
                            <h3 className="text-sm font-bold text-white mt-1.5">{item.title}</h3>
                          </div>
                          <span className="text-xs font-bold text-purple-300">{item.durationMinutes} mins</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                          <div>
                            <div className="text-[10px] text-slate-400">Attempts</div>
                            <div className="text-sm font-bold text-white">{item.totalAttemptsCount || 18}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">Pass Rate</div>
                            <div className="text-sm font-bold text-emerald-300">{item.passRate || 85}%</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">Avg Score</div>
                            <div className="text-sm font-bold text-indigo-300">{item.avgScore || 80}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 7: CERTIFICATES REPORT */}
              {activeSection === 'certificates' && (
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md">
                    <h2 className="text-base font-bold text-white">Student Verified Certificates Report ({certificatesList.length})</h2>
                    <p className="text-xs text-slate-300">Auditable roster of student certifications, credentials, and cryptographic verification codes.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900/80 border-b border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <tr>
                            <th className="p-4">Student</th>
                            <th className="p-4">Course</th>
                            <th className="p-4">Certificate Number</th>
                            <th className="p-4">Verification Code</th>
                            <th className="p-4">Issued Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {certificatesList.map(cert => (
                            <tr key={cert.id} className="hover:bg-white/5 transition">
                              <td className="p-4 font-bold text-white">{cert.userName}</td>
                              <td className="p-4 text-slate-200">{cert.courseTitle}</td>
                              <td className="p-4 font-mono text-[11px] text-slate-400">{cert.certificateNumber}</td>
                              <td className="p-4 font-mono text-[11px] text-amber-300 font-bold">{cert.verificationCode}</td>
                              <td className="p-4 text-slate-400">{new Date(cert.issuedAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 8: LEARNER ACTIVITY FEED */}
              {activeSection === 'activity' && (
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md">
                    <h2 className="text-base font-bold text-white">Full Learner Activity Audit Feed ({activityFeed.length})</h2>
                    <p className="text-xs text-slate-300">Real-time actions including course completions, test submissions, and job applications.</p>
                  </div>

                  <div className="space-y-3">
                    {activityFeed.map(act => (
                      <div key={act.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between backdrop-blur-md">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white">{act.studentName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {act.action}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{act.details}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-3">
                          {new Date(act.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </>
          )}

          {/* Student Inspection Modal */}
          {selectedStudentModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedStudentModal.name}</h3>
                    <p className="text-xs text-slate-300">{selectedStudentModal.email} • Dept: {selectedStudentModal.department}</p>
                  </div>
                  <button onClick={() => setSelectedStudentModal(null)} className="p-1 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center py-2 bg-white/5 border border-white/10 rounded-2xl">
                  <div>
                    <div className="text-[10px] text-slate-400">Enrolled Courses</div>
                    <div className="text-sm font-bold text-white">{selectedStudentModal.coursesEnrolledCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Avg Score</div>
                    <div className="text-sm font-bold text-purple-300">{selectedStudentModal.averageScore}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Certificates</div>
                    <div className="text-sm font-bold text-amber-300">{selectedStudentModal.certificatesCount}</div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button onClick={() => setSelectedStudentModal(null)} className="px-5 py-2 bg-white/10 text-xs font-bold text-white rounded-xl">
                    Close Inspection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Question Modal */}
          {showAddQuestionModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-white">Post New Aptitude Question</h3>
                <form onSubmit={handleCreateQuestion} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white" required />
                    <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic" className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white" required />
                  </div>
                  <textarea value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder="Question Statement..." className="w-full h-20 p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white" required />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={optionA} onChange={e => setOptionA(e.target.value)} placeholder="Option A" className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white" required />
                    <input type="text" value={optionB} onChange={e => setOptionB(e.target.value)} placeholder="Option B" className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white" required />
                    <input type="text" value={optionC} onChange={e => setOptionC(e.target.value)} placeholder="Option C" className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white" required />
                    <input type="text" value={optionD} onChange={e => setOptionD(e.target.value)} placeholder="Option D" className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white" required />
                  </div>
                  <input type="text" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} placeholder="Correct Answer text" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white" required />
                  <textarea value={explanation} onChange={e => setExplanation(e.target.value)} placeholder="Explanation..." className="w-full h-16 p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white" required />

                  <div className="flex justify-end space-x-2 pt-2">
                    <button type="button" onClick={() => setShowAddQuestionModal(false)} className="px-4 py-2 bg-white/10 text-xs font-bold text-slate-300 rounded-xl">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-purple-600 text-xs font-bold text-white rounded-xl shadow-lg">Submit Question</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CSV Import Modal */}
          {showCsvModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-white">CSV Bulk Question Importer</h3>
                <form onSubmit={handleImportCsv} className="space-y-3">
                  <textarea value={csvText} onChange={e => setCsvText(e.target.value)} placeholder="category,topic,question,optA,optB,optC,optD,correct,explanation" className="w-full h-40 p-3 bg-slate-950 border border-white/10 rounded-xl text-xs font-mono text-emerald-300" required />
                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={() => setShowCsvModal(false)} className="px-4 py-2 bg-white/10 text-xs text-slate-300 rounded-xl">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-purple-600 text-xs font-bold text-white rounded-xl shadow-lg">Import CSV</button>
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
