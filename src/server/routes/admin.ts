import { Router, Response } from 'express';
import { db } from '../db';
import { authMiddleware, requireRole, AuthRequest } from '../auth';
import { User, Course, Lesson, AptitudeTest, Question, Job, VideoItem } from '../../types';

export const adminRouter = Router();

adminRouter.use(authMiddleware);
adminRouter.use(requireRole(['ADMIN']));

// 1. Admin Platform Overview Counts
adminRouter.get('/dashboard', (req: AuthRequest, res: Response) => {
  const users = db.get('users');
  const totalUsers = users.length;
  const totalStudents = users.filter(u => u.role === 'STUDENT').length;
  const totalStaff = users.filter(u => u.role === 'STAFF').length;
  const totalAdmins = users.filter(u => u.role === 'ADMIN').length;

  const totalCourses = db.get('courses').length;
  const totalAssessments = db.get('aptitudeTests').length;
  const totalJobs = db.get('jobs').length;
  const totalCertificates = db.get('certificates').length;

  res.json({
    totalUsers,
    totalStudents,
    totalStaff,
    totalAdmins,
    totalCourses,
    totalAssessments,
    totalJobs,
    totalCertificates
  });
});

// 2. Admin Platform Analytics (Charts)
adminRouter.get('/analytics', (req: AuthRequest, res: Response) => {
  const userGrowth = [
    { period: 'Jan', students: 120, staff: 8 },
    { period: 'Feb', students: 210, staff: 12 },
    { period: 'Mar', students: 340, staff: 15 },
    { period: 'Apr', students: 480, staff: 18 },
    { period: 'May', students: 620, staff: 22 },
    { period: 'Jun', students: 850, staff: 28 }
  ];

  const courseEnrollmentTrend = [
    { month: 'Jan', enrollments: 80, completions: 30 },
    { month: 'Feb', enrollments: 140, completions: 65 },
    { month: 'Mar', enrollments: 220, completions: 110 },
    { month: 'Apr', enrollments: 310, completions: 180 },
    { month: 'May', enrollments: 450, completions: 290 },
    { month: 'Jun', enrollments: 590, completions: 410 }
  ];

  const assessmentPerformance = [
    { category: 'Quantitative Aptitude', avgScore: 82, passRate: 88 },
    { category: 'Logical Reasoning', avgScore: 86, passRate: 92 },
    { category: 'Verbal Ability', avgScore: 79, passRate: 81 },
    { category: 'Coding & Algorithms', avgScore: 74, passRate: 76 }
  ];

  const jobApplicationsTrend = [
    { month: 'Jan', applications: 25 },
    { month: 'Feb', applications: 58 },
    { month: 'Mar', applications: 92 },
    { month: 'Apr', applications: 145 },
    { month: 'May', applications: 210 },
    { month: 'Jun', applications: 280 }
  ];

  const certificatesOverTime = [
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 28 },
    { month: 'Mar', count: 54 },
    { month: 'Apr', count: 89 },
    { month: 'May', count: 135 },
    { month: 'Jun', count: 198 }
  ];

  res.json({
    userGrowth,
    courseEnrollmentTrend,
    assessmentPerformance,
    jobApplicationsTrend,
    certificatesOverTime
  });
});

// 3. User Management
adminRouter.get('/users', (req: AuthRequest, res: Response) => {
  const users = db.get('users').map(u => {
    const { passwordHash: _, ...safe } = u;
    return safe;
  });
  res.json(users);
});

adminRouter.patch('/users/:id', (req: AuthRequest, res: Response) => {
  const updated = db.update('users', req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const { passwordHash: _, ...safe } = updated;
  res.json(safe);
});

adminRouter.delete('/users/:id', (req: AuthRequest, res: Response) => {
  const success = db.delete('users', req.params.id);
  if (!success) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ status: 'ok' });
});

// 4. Course Management
adminRouter.get('/courses', (req: AuthRequest, res: Response) => {
  const courses = db.get('courses');
  const lessons = db.get('lessons');
  const result = courses.map(c => ({
    ...c,
    lessons: lessons.filter(l => l.courseId === c.id)
  }));
  res.json(result);
});

adminRouter.post('/courses', (req: AuthRequest, res: Response) => {
  const { title, description, category, department, level, duration, thumbnail, instructor, status } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Course title is required' });
    return;
  }

  const newCourse: Course = {
    id: `crs_${Date.now()}`,
    title,
    description: description || '',
    category: category || 'Computer Science',
    department: department || 'Computer Science & Engineering',
    level: level || 'Beginner',
    duration: duration || '10 Hours',
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516116211223-4c714132a0c3?auto=format&fit=crop&q=80&w=600',
    instructor: instructor || req.user!.name,
    status: status || 'Published',
    rating: 5.0,
    enrolledCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.insert('courses', newCourse);
  res.json(newCourse);
});

adminRouter.patch('/courses/:id', (req: AuthRequest, res: Response) => {
  const updated = db.update('courses', req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  res.json(updated);
});

adminRouter.delete('/courses/:id', (req: AuthRequest, res: Response) => {
  const success = db.delete('courses', req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  res.json({ status: 'ok' });
});

// Lessons inside Course
adminRouter.post('/courses/:id/lessons', (req: AuthRequest, res: Response) => {
  const courseId = req.params.id;
  const { title, description, videoUrl, content, duration } = req.body;

  const lessons = db.filter('lessons', l => l.courseId === courseId);
  const newLesson: Lesson = {
    id: `les_${Date.now()}`,
    courseId,
    title,
    description: description || '',
    videoUrl: videoUrl || 'https://www.youtube.com/embed/g2o22C3CRfU',
    content: content || 'Lesson content overview...',
    duration: duration || '20 min',
    order: lessons.length + 1
  };

  db.insert('lessons', newLesson);
  res.json(newLesson);
});

adminRouter.patch('/lessons/:id', (req: AuthRequest, res: Response) => {
  const updated = db.update('lessons', req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }
  res.json(updated);
});

adminRouter.delete('/lessons/:id', (req: AuthRequest, res: Response) => {
  const success = db.delete('lessons', req.params.id);
  res.json({ status: success ? 'ok' : 'failed' });
});

// 5. Assessment Management
adminRouter.get('/assessments', (req: AuthRequest, res: Response) => {
  const tests = db.get('aptitudeTests');
  res.json(tests);
});

adminRouter.post('/assessments', (req: AuthRequest, res: Response) => {
  const { title, description, category, durationMinutes, passPercentage, status, companyPattern } = req.body;
  const newTest: AptitudeTest = {
    id: `test_${Date.now()}`,
    title,
    description: description || '',
    category: category || 'Placement Practice',
    durationMinutes: Number(durationMinutes) || 30,
    totalQuestions: 5,
    marksPerQuestion: 2,
    negativeMarks: 0.5,
    passPercentage: Number(passPercentage) || 60,
    status: status || 'Published',
    companyPattern: companyPattern || 'TCS Style',
    questionIds: ['apt_1', 'apt_2', 'apt_3']
  };

  db.insert('aptitudeTests', newTest);
  res.json(newTest);
});

adminRouter.patch('/assessments/:id', (req: AuthRequest, res: Response) => {
  const updated = db.update('aptitudeTests', req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Assessment not found' });
    return;
  }
  res.json(updated);
});

adminRouter.delete('/assessments/:id', (req: AuthRequest, res: Response) => {
  const success = db.delete('aptitudeTests', req.params.id);
  res.json({ status: success ? 'ok' : 'failed' });
});

// 6. Job Management
adminRouter.get('/jobs', (req: AuthRequest, res: Response) => {
  res.json(db.get('jobs'));
});

adminRouter.post('/jobs', (req: AuthRequest, res: Response) => {
  const { title, company, location, type, salary, description, requirements, skills, applicationUrl, status } = req.body;
  if (!title || !company) {
    res.status(400).json({ error: 'Title and company are required' });
    return;
  }

  const newJob: Job = {
    id: `job_${Date.now()}`,
    title,
    company,
    location: location || 'Remote / Hybrid',
    type: type || 'Full-time',
    salary: salary || '$100,000 - $120,000',
    description: description || 'Exciting software engineering role.',
    requirements: Array.isArray(requirements) ? requirements : (requirements ? String(requirements).split(',') : ['Computer Science Degree']),
    skills: Array.isArray(skills) ? skills : (skills ? String(skills).split(',') : ['React.js', 'Node.js']),
    applicationUrl,
    status: status || 'Open',
    createdAt: new Date().toISOString()
  };

  db.insert('jobs', newJob);
  res.json(newJob);
});

adminRouter.patch('/jobs/:id', (req: AuthRequest, res: Response) => {
  const updated = db.update('jobs', req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(updated);
});

adminRouter.delete('/jobs/:id', (req: AuthRequest, res: Response) => {
  const success = db.delete('jobs', req.params.id);
  res.json({ status: success ? 'ok' : 'failed' });
});

// 7. Video Management
adminRouter.get('/videos', (req: AuthRequest, res: Response) => {
  res.json(db.get('videos') || []);
});

adminRouter.post('/videos', (req: AuthRequest, res: Response) => {
  const { title, description, youtubeUrl, category, department, duration, thumbnail } = req.body;
  const newVid: VideoItem = {
    id: `vid_${Date.now()}`,
    title,
    description: description || '',
    youtubeUrl: youtubeUrl || 'https://www.youtube.com/embed/g2o22C3CRfU',
    category: category || 'Tutorial',
    department: department || 'General',
    duration: duration || '15 min',
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516116211223-4c714132a0c3?auto=format&fit=crop&q=80&w=600'
  };
  db.insert('videos', newVid);
  res.json(newVid);
});

adminRouter.patch('/videos/:id', (req: AuthRequest, res: Response) => {
  const updated = db.update('videos', req.params.id, req.body);
  res.json(updated);
});

adminRouter.delete('/videos/:id', (req: AuthRequest, res: Response) => {
  db.delete('videos', req.params.id);
  res.json({ status: 'ok' });
});

// 8. Announcements (Auto creates Notifications)
adminRouter.post('/announcements', (req: AuthRequest, res: Response) => {
  const { title, message, targetRole = 'ALL', department, priority = 'Medium' } = req.body;

  if (!title || !message) {
    res.status(400).json({ error: 'Title and message are required' });
    return;
  }

  const users = db.get('users');
  let targetUsers = users;

  if (targetRole === 'STUDENT') {
    targetUsers = users.filter(u => u.role === 'STUDENT');
  } else if (targetRole === 'STAFF') {
    targetUsers = users.filter(u => u.role === 'STAFF');
  }

  if (department) {
    targetUsers = targetUsers.filter(u => u.department === department);
  }

  // Create notifications for matching users
  targetUsers.forEach(u => {
    db.insert('notifications', {
      id: `notif_ann_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: u.id,
      title: `📢 Announcement: ${title}`,
      message,
      type: 'announcement',
      read: false,
      createdAt: new Date().toISOString()
    });
  });

  res.json({
    status: 'published',
    targetCount: targetUsers.length,
    announcement: { title, message, targetRole, department, priority, createdAt: new Date().toISOString() }
  });
});

// 9. Certificates Report
adminRouter.get('/certificates', (req: AuthRequest, res: Response) => {
  res.json(db.get('certificates'));
});

// 10. Aggregated Reports & CSV Export
adminRouter.get('/reports', (req: AuthRequest, res: Response) => {
  const users = db.get('users');
  const courses = db.get('courses');
  const enrollments = db.get('enrollments');
  const attempts = db.get('assessmentAttempts');
  const certs = db.get('certificates');
  const jobs = db.get('jobs');
  const apps = db.get('jobApplications');

  res.json({
    usersReport: users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, department: u.department, status: u.status, createdAt: u.createdAt })),
    coursesReport: courses.map(c => ({ id: c.id, title: c.title, instructor: c.instructor, category: c.category, status: c.status, duration: c.duration })),
    assessmentsReport: attempts.map(a => ({ id: a.id, userId: a.userId, assessmentTitle: a.assessmentTitle, score: a.percentage, passed: a.passed, date: a.completedAt })),
    certificatesReport: certs.map(c => ({ id: c.id, student: c.userName, course: c.courseTitle, number: c.certificateNumber, code: c.verificationCode, date: c.issuedAt })),
    jobsReport: jobs.map(j => ({ id: j.id, title: j.title, company: j.company, location: j.location, status: j.status })),
    applicationsReport: apps.map(ap => ({ id: ap.id, studentId: ap.userId, jobTitle: ap.jobTitle, company: ap.company, status: ap.status, date: ap.appliedAt }))
  });
});
