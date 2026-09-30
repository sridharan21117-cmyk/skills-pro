/**
 * Skill Forge AI - Core Domain Types
 */

export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  profilePhoto?: string;
  phone?: string;
  location?: string;
  department?: string;
  college?: string;
  graduationYear?: string;
  careerGoal?: string;
  bio?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
  permissions?: string[]; // For Staff
  assignedDepartment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  thumbnail: string;
  instructor: string;
  status: 'Published' | 'Draft' | 'Archived';
  rating?: number;
  enrolledCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  content: string;
  duration: string;
  order: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number; // 0 - 100
  completed: boolean;
  completedLessonIds?: string[];
  enrolledAt: string;
  completedAt?: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  passingScore: number;
  status: 'Published' | 'Draft';
  totalQuestions?: number;
}

export interface Question {
  id: string;
  assessmentId?: string;
  category: string;
  topic: string;
  subtopic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionType: 'MCQ' | 'MULTIPLE_CORRECT' | 'TRUE_FALSE' | 'FILL_BLANK' | 'NUMERICAL';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  marks: number;
  negativeMarks?: number;
  authorId?: string;
  authorName?: string;
  status?: 'Draft' | 'Pending Review' | 'Published' | 'Archived';
  tags?: string[];
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  assessmentId: string;
  assessmentTitle?: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  userAnswers?: Record<string, string>;
  startedAt: string;
  completedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  score: number; // 0 - 100
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Remote';
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
  applicationUrl?: string;
  status: 'Open' | 'Closed';
  createdAt: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  jobId: string;
  jobTitle?: string;
  company?: string;
  status: 'Applied' | 'Under Review' | 'Interview Scheduled' | 'Offered' | 'Rejected';
  appliedAt: string;
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  certificateNumber: string;
  verificationCode: string;
  issuedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'course' | 'assessment' | 'certificate' | 'job' | 'announcement' | 'system';
  read: boolean;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  userId: string;
  type: 'course' | 'skill' | 'practice' | 'job';
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  targetId?: string;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  role: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  startedAt: string;
  completedAt?: string;
  score?: number;
  feedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  qaPairs?: Array<{ question: string; answer: string; feedback?: string; score?: number }>;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  category: string;
  department: string;
  duration: string;
  thumbnail: string;
}

export interface ProgrammingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string; // Arrays, Strings, Dynamic Programming, etc.
  starterCode: Record<string, string>; // language -> code
  testCases: Array<{ input: string; expectedOutput: string; isHidden?: boolean }>;
  hints?: string[];
  authorId?: string;
  createdAt: string;
}

export interface ProgrammingSubmission {
  id: string;
  userId: string;
  problemId: string;
  problemTitle?: string;
  code: string;
  language: 'c' | 'cpp' | 'java' | 'python';
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  passedCases: number;
  totalCases: number;
  score: number;
  executionTimeMs: number;
  isOffline?: boolean;
  submittedAt: string;
}

export interface AptitudeTest {
  id: string;
  title: string;
  description: string;
  category: string; // Quantitative, Logical, Verbal, Placement
  durationMinutes: number;
  totalQuestions: number;
  marksPerQuestion: number;
  negativeMarks: number;
  passPercentage: number;
  status: 'Published' | 'Draft';
  companyPattern?: string; // e.g. "TCS-Style", "Infosys-Style"
  questionIds: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  module: string;
  timestamp: string;
  target?: string;
}
