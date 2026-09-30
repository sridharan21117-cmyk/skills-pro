import {
  User, Course, Lesson, Enrollment, Assessment, Question, AssessmentAttempt,
  Skill, UserSkill, Job, JobApplication, Certificate, Note, NotificationItem,
  Recommendation, ProgrammingProblem, ProgrammingSubmission, AptitudeTest, AuditLog, VideoItem
} from '../types';

const TOKEN_KEY = 'skillforge_jwt_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP Error ${response.status}`);
  }

  return response.json();
}

export const authService = {
  login: async (email: string, password: string, role?: string) => {
    const data = await apiFetch<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    });
    setStoredToken(data.token);
    return data;
  },
  register: async (name: string, email: string, password: string, department?: string, role?: string) => {
    const data = await apiFetch<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, department, role })
    });
    setStoredToken(data.token);
    return data;
  },
  logout: async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    } finally {
      setStoredToken(null);
    }
  },
  getMe: async () => {
    return apiFetch<{ user: User }>('/api/auth/me');
  }
};

export const courseService = {
  getCourses: () => apiFetch<Course[]>('/api/courses'),
  getCourseDetails: (id: string) => apiFetch<Course & { lessons: Lesson[] }>(`/api/courses/${id}`),
  enrollCourse: (id: string) => apiFetch<Enrollment>(`/api/courses/${id}/enroll`, { method: 'POST' }),
  getMyCourses: () => apiFetch<Array<Enrollment & { course?: Course }>>('/api/my-courses'),
  completeLesson: (lessonId: string) => apiFetch<Enrollment>(`/api/lessons/${lessonId}/complete`, { method: 'POST' })
};

export const aptitudeService = {
  getTests: () => apiFetch<AptitudeTest[]>('/api/aptitude/tests'),
  getQuestions: (params?: Record<string, string>) => {
    const q = new URLSearchParams(params || {}).toString();
    return apiFetch<Question[]>(`/api/aptitude/questions${q ? `?${q}` : ''}`);
  },
  createQuestion: (question: Partial<Question>) => apiFetch<Question>('/api/aptitude/questions', {
    method: 'POST',
    body: JSON.stringify(question)
  }),
  importQuestions: (questions: any[]) => apiFetch<{ count: number; questions: Question[] }>('/api/aptitude/questions/import', {
    method: 'POST',
    body: JSON.stringify({ questions })
  }),
  updateQuestion: (id: string, updates: Partial<Question>) => apiFetch<Question>(`/api/aptitude/questions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  deleteQuestion: (id: string) => apiFetch<{ status: string }>(`/api/aptitude/questions/${id}`, {
    method: 'DELETE'
  }),
  submitTestAttempt: (testId: string, answers: Record<string, string>) => apiFetch<AssessmentAttempt>(`/api/assessments/${testId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers })
  }),
  getAttempts: () => apiFetch<AssessmentAttempt[]>('/api/assessment-attempts')
};

export const codingService = {
  getProblems: () => apiFetch<ProgrammingProblem[]>('/api/programming/problems'),
  getProblem: (id: string) => apiFetch<ProgrammingProblem>(`/api/programming/problems/${id}`),
  executeCode: (code: string, language: string, input?: string) => apiFetch<{
    output: string;
    error: string;
    executionTimeMs: number;
    language: string;
  }>('/api/programming/execute', {
    method: 'POST',
    body: JSON.stringify({ code, language, input })
  }),
  submitSolution: (problemId: string, code: string, language: string, isOffline?: boolean) => apiFetch<ProgrammingSubmission>('/api/programming/submit', {
    method: 'POST',
    body: JSON.stringify({ problemId, code, language, isOffline })
  }),
  getSubmissions: () => apiFetch<ProgrammingSubmission[]>('/api/programming/submissions')
};

export const jobService = {
  getJobs: () => apiFetch<Job[]>('/api/jobs'),
  applyForJob: (id: string) => apiFetch<JobApplication>(`/api/jobs/${id}/apply`, { method: 'POST' }),
  getMyApplications: () => apiFetch<JobApplication[]>('/api/my-applications')
};

export const certificateService = {
  getCertificates: () => apiFetch<Certificate[]>('/api/certificates'),
  verifyCertificate: (code: string) => apiFetch<{ valid: boolean; certificate?: Certificate; message?: string }>(`/api/certificates/verify/${encodeURIComponent(code)}`)
};

export const noteService = {
  getNotes: () => apiFetch<Note[]>('/api/notes'),
  createNote: (title: string, content: string, category?: string) => apiFetch<Note>('/api/notes', {
    method: 'POST',
    body: JSON.stringify({ title, content, category })
  }),
  deleteNote: (id: string) => apiFetch<{ status: string }>(`/api/notes/${id}`, { method: 'DELETE' })
};

export const notificationService = {
  getNotifications: () => apiFetch<NotificationItem[]>('/api/notifications'),
  markAsRead: (id: string) => apiFetch<NotificationItem>(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllAsRead: () => apiFetch<{ status: string }>('/api/notifications/read-all', { method: 'POST' })
};

export const profileService = {
  getProfile: () => apiFetch<User>('/api/profile'),
  updateProfile: (updates: Partial<User>) => apiFetch<User>('/api/profile', {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  getSkills: () => apiFetch<UserSkill[]>('/api/users/me/skills'),
  addSkill: (skillName: string, level: string, score: number) => apiFetch<UserSkill>('/api/users/me/skills', {
    method: 'POST',
    body: JSON.stringify({ skillName, level, score })
  }),
  getRecommendations: () => apiFetch<Recommendation[]>('/api/recommendations')
};

export const aiService = {
  chat: (prompt: string, context?: any, isOffline?: boolean) => apiFetch<{ reply: string; mode: string }>('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt, context, isOffline })
  })
};

export const studentDashboardService = {
  getDashboard: () => apiFetch<{
    user: Partial<User>;
    overviewStats: { coursesEnrolled: number; coursesCompleted: number; averageScore: number; certificatesCount: number };
    myCourses: Array<Enrollment & { course?: Course; completedLessonsCount: number; totalLessonsCount: number }>;
    recentActivity: Array<{ id: string; type: string; title: string; subtitle: string; timestamp: string; iconType: string }>;
    skills: Array<UserSkill & { skillGap: number; recommendedLearning: string }>;
    recommendations: Recommendation[];
    upcomingTasks: Array<{ id: string; title: string; time: string; type: string; actionText: string; actionTab: string }>;
    jobMatches: Array<Job & { matchPercentage: number; missingSkills: string[]; isApplied: boolean }>;
  }>('/api/student/dashboard'),
  getProgress: () => apiFetch<any[]>('/api/student/progress'),
  getSkills: () => apiFetch<UserSkill[]>('/api/student/skills'),
  getRecommendations: () => apiFetch<Recommendation[]>('/api/student/recommendations'),
  getActivity: () => apiFetch<any>('/api/student/activity'),
  getJobs: () => apiFetch<any[]>('/api/student/jobs')
};

export const staffDashboardService = {
  getDashboard: () => apiFetch<{
    totalStudents: number;
    activeLearners: number;
    totalCourses: number;
    averageStudentScore: number;
    completionRate: number;
    certificatesIssued: number;
  }>('/api/staff/dashboard'),
  getAnalytics: () => apiFetch<{
    enrollmentTrend: Array<{ month: string; enrollments: number; completions: number }>;
    courseCompletionBreakdown: { completed: number; inProgress: number; notStarted: number };
    assessmentPerformance: { averageScore: number; passRate: number; failRate: number };
  }>('/api/staff/analytics'),
  getStudents: () => apiFetch<any[]>('/api/staff/students'),
  getCourses: (department?: string) => apiFetch<any[]>(`/api/staff/courses${department ? `?department=${encodeURIComponent(department)}` : ''}`),
  getAssessments: () => apiFetch<any[]>('/api/staff/assessments'),
  getActivity: () => apiFetch<{ activeLearnersCount: number; activityFeed: any[] }>('/api/staff/activity')
};

export const adminDashboardService = {
  getDashboard: () => apiFetch<{
    totalUsers: number;
    totalStudents: number;
    totalStaff: number;
    totalAdmins: number;
    totalCourses: number;
    totalAssessments: number;
    totalJobs: number;
    totalCertificates: number;
  }>('/api/admin/dashboard'),
  getAnalytics: () => apiFetch<{
    userGrowth: Array<{ period: string; students: number; staff: number }>;
    courseEnrollmentTrend: Array<{ month: string; enrollments: number; completions: number }>;
    assessmentPerformance: Array<{ category: string; avgScore: number; passRate: number }>;
    jobApplicationsTrend: Array<{ month: string; applications: number }>;
    certificatesOverTime: Array<{ month: string; count: number }>;
  }>('/api/admin/analytics'),
  getUsers: () => apiFetch<User[]>('/api/admin/users'),
  updateUser: (id: string, updates: Partial<User>) => apiFetch<User>(`/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  deleteUser: (id: string) => apiFetch<{ status: string }>(`/api/admin/users/${id}`, { method: 'DELETE' }),
  getCourses: () => apiFetch<any[]>('/api/admin/courses'),
  createCourse: (course: Partial<Course>) => apiFetch<Course>('/api/admin/courses', {
    method: 'POST',
    body: JSON.stringify(course)
  }),
  updateCourse: (id: string, updates: Partial<Course>) => apiFetch<Course>(`/api/admin/courses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  deleteCourse: (id: string) => apiFetch<{ status: string }>(`/api/admin/courses/${id}`, { method: 'DELETE' }),
  addLesson: (courseId: string, lesson: Partial<Lesson>) => apiFetch<Lesson>(`/api/admin/courses/${courseId}/lessons`, {
    method: 'POST',
    body: JSON.stringify(lesson)
  }),
  updateLesson: (id: string, updates: Partial<Lesson>) => apiFetch<Lesson>(`/api/admin/lessons/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  deleteLesson: (id: string) => apiFetch<{ status: string }>(`/api/admin/lessons/${id}`, { method: 'DELETE' }),
  getAssessments: () => apiFetch<AptitudeTest[]>('/api/admin/assessments'),
  createAssessment: (test: Partial<AptitudeTest>) => apiFetch<AptitudeTest>('/api/admin/assessments', {
    method: 'POST',
    body: JSON.stringify(test)
  }),
  updateAssessment: (id: string, updates: Partial<AptitudeTest>) => apiFetch<AptitudeTest>(`/api/admin/assessments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  deleteAssessment: (id: string) => apiFetch<{ status: string }>(`/api/admin/assessments/${id}`, { method: 'DELETE' }),
  getJobs: () => apiFetch<Job[]>('/api/admin/jobs'),
  createJob: (job: Partial<Job>) => apiFetch<Job>('/api/admin/jobs', {
    method: 'POST',
    body: JSON.stringify(job)
  }),
  updateJob: (id: string, updates: Partial<Job>) => apiFetch<Job>(`/api/admin/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  deleteJob: (id: string) => apiFetch<{ status: string }>(`/api/admin/jobs/${id}`, { method: 'DELETE' }),
  getVideos: () => apiFetch<VideoItem[]>('/api/admin/videos'),
  createVideo: (video: Partial<VideoItem>) => apiFetch<VideoItem>('/api/admin/videos', {
    method: 'POST',
    body: JSON.stringify(video)
  }),
  updateVideo: (id: string, updates: Partial<VideoItem>) => apiFetch<VideoItem>(`/api/admin/videos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  deleteVideo: (id: string) => apiFetch<{ status: string }>(`/api/admin/videos/${id}`, { method: 'DELETE' }),
  createAnnouncement: (announcement: { title: string; message: string; targetRole?: string; department?: string; priority?: string }) => apiFetch<{ status: string; targetCount: number }>('/api/admin/announcements', {
    method: 'POST',
    body: JSON.stringify(announcement)
  }),
  getReports: () => apiFetch<{
    usersReport: any[];
    coursesReport: any[];
    assessmentsReport: any[];
    certificatesReport: any[];
    jobsReport: any[];
    applicationsReport: any[];
  }>('/api/admin/reports')
};
