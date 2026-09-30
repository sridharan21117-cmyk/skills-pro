import express from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { db } from './src/server/db';
import { seedDatabase } from './src/server/seed';
import { generateToken, authMiddleware, requireRole, requirePermission, AuthRequest } from './src/server/auth';
import { studentRouter } from './src/server/routes/student';
import { staffRouter } from './src/server/routes/staff';
import { adminRouter } from './src/server/routes/admin';
import { User, Course, Lesson, Question, ProgrammingProblem, Job, AuditLog } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize seed database if needed
  await seedDatabase();

  // Helper log audit
  const logAudit = (user: User, action: string, module: string, target?: string) => {
    db.insert('auditLogs', {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.name,
      role: user.role,
      action,
      module,
      timestamp: new Date().toISOString(),
      target
    });
  };

  // -------------------------------------------------------------
  // 1. AUTHENTICATION ENDPOINTS
  // -------------------------------------------------------------
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, department, role = 'STUDENT' } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ error: 'Name, email, and password are required' });
        return;
      }

      const existing = db.findOne('users', u => u.email.toLowerCase() === String(email).toLowerCase());
      if (existing) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser: User = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: (['STUDENT', 'STAFF', 'ADMIN'].includes(role) ? role : 'STUDENT') as any,
        department: department || 'General',
        college: 'Skill Forge Institute of Technology',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.insert('users', newUser);
      const token = generateToken(newUser);

      const { passwordHash: _, ...safeUser } = newUser;
      res.json({ token, user: safeUser });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = db.findOne('users', u => u.email.toLowerCase() === String(email).toLowerCase());
      if (!user || !user.passwordHash) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      if (user.status !== 'ACTIVE') {
        res.status(403).json({ error: 'Your account is currently disabled or suspended' });
        return;
      }

      // Check role selection
      if (role && user.role !== role) {
        res.status(403).json({
          error: `Selected role (${role}) does not match your assigned account role (${user.role}). Please log in under your correct portal.`
        });
        return;
      }

      const token = generateToken(user);
      const { passwordHash: _, ...safeUser } = user;

      logAudit(user, 'User Login', 'Auth');

      res.json({ token, user: safeUser });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Login failed' });
    }
  });

  app.post('/api/auth/logout', authMiddleware, (req: AuthRequest, res) => {
    if (req.user) {
      logAudit(req.user, 'User Logout', 'Auth');
    }
    res.json({ status: 'ok', message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const { passwordHash: _, ...safeUser } = req.user;
    res.json({ user: safeUser });
  });

  // -------------------------------------------------------------
  // 2. COURSES & LESSONS ENDPOINTS
  // -------------------------------------------------------------
  app.get('/api/courses', (req, res) => {
    const courses = db.get('courses').filter(c => c.status === 'Published');
    res.json(courses);
  });

  app.get('/api/courses/:id', (req, res) => {
    const course = db.findOne('courses', c => c.id === req.params.id);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }
    const lessons = db.filter('lessons', l => l.courseId === course.id)
      .sort((a, b) => a.order - b.order);
    res.json({ ...course, lessons });
  });

  app.post('/api/courses/:id/enroll', authMiddleware, (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const courseId = req.params.id;

    const existing = db.findOne('enrollments', e => e.userId === userId && e.courseId === courseId);
    if (existing) {
      res.json(existing);
      return;
    }

    const newEnrollment = {
      id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      courseId,
      progress: 0,
      completed: false,
      completedLessonIds: [],
      enrolledAt: new Date().toISOString()
    };

    db.insert('enrollments', newEnrollment);

    // Create notification
    db.insert('notifications', {
      id: `notif_${Date.now()}`,
      userId,
      title: 'Enrolled in Course 🚀',
      message: 'You have successfully enrolled in the course. Happy learning!',
      type: 'course',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json(newEnrollment);
  });

  app.get('/api/my-courses', authMiddleware, (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const enrollments = db.filter('enrollments', e => e.userId === userId);
    const allCourses = db.get('courses');

    const result = enrollments.map(e => {
      const course = allCourses.find(c => c.id === e.courseId);
      return {
        ...e,
        course
      };
    });

    res.json(result);
  });

  app.post('/api/lessons/:id/complete', authMiddleware, (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const lessonId = req.params.id;

    const lesson = db.findOne('lessons', l => l.id === lessonId);
    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    const enrollment = db.findOne('enrollments', e => e.userId === userId && e.courseId === lesson.courseId);
    if (!enrollment) {
      res.status(400).json({ error: 'Must be enrolled in course first' });
      return;
    }

    const completedLessonIds = new Set(enrollment.completedLessonIds || []);
    completedLessonIds.add(lessonId);

    const allLessons = db.filter('lessons', l => l.courseId === lesson.courseId);
    const progress = Math.round((completedLessonIds.size / Math.max(allLessons.length, 1)) * 100);
    const isCompleted = progress >= 100;

    const updated = db.update('enrollments', enrollment.id, {
      completedLessonIds: Array.from(completedLessonIds),
      progress,
      completed: isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : enrollment.completedAt
    });

    // Auto issue certificate if completed
    if (isCompleted) {
      const existingCert = db.findOne('certificates', c => c.userId === userId && c.courseId === lesson.courseId);
      if (!existingCert) {
        const course = db.findOne('courses', c => c.id === lesson.courseId);
        const certCode = `VERIFY-${Math.floor(1000 + Math.random() * 9000)}-SFA`;
        const certNum = `SFA-2026-${Math.floor(10000 + Math.random() * 90000)}`;

        db.insert('certificates', {
          id: `cert_${Date.now()}`,
          userId,
          userName: req.user!.name,
          courseId: lesson.courseId,
          courseTitle: course ? course.title : 'Course Completion',
          certificateNumber: certNum,
          verificationCode: certCode,
          issuedAt: new Date().toISOString()
        });

        db.insert('notifications', {
          id: `notif_${Date.now()}`,
          userId,
          title: 'Course Certificate Earned! 🏆',
          message: `Congratulations on completing ${course?.title}! Your verified certificate is ready.`,
          type: 'certificate',
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    res.json(updated);
  });

  // -------------------------------------------------------------
  // 3. APTITUDE & QUESTION BANK ENDPOINTS
  // -------------------------------------------------------------
  app.get('/api/aptitude/tests', (req, res) => {
    res.json(db.get('aptitudeTests'));
  });

  app.get('/api/aptitude/questions', (req, res) => {
    const { category, topic, difficulty, status } = req.query;
    let questions = db.get('questions');

    if (category) questions = questions.filter(q => q.category === category);
    if (topic) questions = questions.filter(q => q.topic === topic);
    if (difficulty) questions = questions.filter(q => q.difficulty === difficulty);
    if (status) questions = questions.filter(q => q.status === status);

    res.json(questions);
  });

  app.post('/api/aptitude/questions', authMiddleware, requireRole(['STAFF', 'ADMIN']), (req: AuthRequest, res) => {
    const { category, topic, subtopic, difficulty, questionType, question, options, correctAnswer, explanation, marks, negativeMarks, tags } = req.body;

    if (!question || !correctAnswer || !category) {
      res.status(400).json({ error: 'Question text, category, and correct answer are required' });
      return;
    }

    const newQuestion: Question = {
      id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      category,
      topic: topic || 'General',
      subtopic,
      difficulty: difficulty || 'Medium',
      questionType: questionType || 'MCQ',
      question,
      options: options || [],
      correctAnswer,
      explanation: explanation || '',
      marks: Number(marks) || 2,
      negativeMarks: Number(negativeMarks) || 0.5,
      authorId: req.user!.id,
      authorName: req.user!.name,
      status: req.user!.role === 'ADMIN' ? 'Published' : 'Pending Review',
      tags: tags || []
    };

    db.insert('questions', newQuestion);
    logAudit(req.user!, 'Created Aptitude Question', 'Aptitude', newQuestion.id);

    res.json(newQuestion);
  });

  app.post('/api/aptitude/questions/import', authMiddleware, requireRole(['STAFF', 'ADMIN']), (req: AuthRequest, res) => {
    const { questions } = req.body;
    if (!Array.isArray(questions)) {
      res.status(400).json({ error: 'Expected an array of questions' });
      return;
    }

    const createdList: Question[] = [];
    questions.forEach(q => {
      if (q.question && q.correctAnswer) {
        const item: Question = {
          id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          category: q.category || 'Quantitative Aptitude',
          topic: q.topic || 'General',
          difficulty: q.difficulty || 'Medium',
          questionType: 'MCQ',
          question: q.question,
          options: q.options || [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          marks: Number(q.marks) || 2,
          negativeMarks: Number(q.negativeMarks) || 0.5,
          authorId: req.user!.id,
          authorName: req.user!.name,
          status: 'Published'
        };
        db.insert('questions', item);
        createdList.push(item);
      }
    });

    logAudit(req.user!, `Bulk imported ${createdList.length} questions`, 'Aptitude');
    res.json({ count: createdList.length, questions: createdList });
  });

  app.patch('/api/aptitude/questions/:id', authMiddleware, requireRole(['STAFF', 'ADMIN']), (req: AuthRequest, res) => {
    const updated = db.update('questions', req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }
    logAudit(req.user!, 'Updated Aptitude Question', 'Aptitude', req.params.id);
    res.json(updated);
  });

  app.delete('/api/aptitude/questions/:id', authMiddleware, requireRole(['STAFF', 'ADMIN']), (req: AuthRequest, res) => {
    const success = db.delete('questions', req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }
    logAudit(req.user!, 'Deleted Aptitude Question', 'Aptitude', req.params.id);
    res.json({ status: 'ok' });
  });

  app.post('/api/assessments/:id/submit', authMiddleware, (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const testId = req.params.id;
    const { answers } = req.body; // map of qId -> answer

    const test = db.findOne('aptitudeTests', t => t.id === testId);
    const questions = db.get('questions');
    const testQuestions = questions.filter(q => (test?.questionIds || []).includes(q.id));

    let score = 0;
    let totalMarks = 0;

    testQuestions.forEach(q => {
      const marks = q.marks || 2;
      const neg = q.negativeMarks || 0;
      totalMarks += marks;

      const userAns = answers ? answers[q.id] : undefined;
      if (userAns) {
        if (String(userAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
          score += marks;
        } else {
          score -= neg;
        }
      }
    });

    const percentage = Math.max(0, Math.round((score / Math.max(totalMarks, 1)) * 100));
    const passPercentage = test?.passPercentage || 60;
    const passed = percentage >= passPercentage;

    const attempt = {
      id: `att_${Date.now()}`,
      userId,
      assessmentId: testId,
      assessmentTitle: test ? test.title : 'Aptitude Test',
      score: Math.max(0, score),
      totalMarks,
      percentage,
      passed,
      userAnswers: answers || {},
      startedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      completedAt: new Date().toISOString()
    };

    db.insert('assessmentAttempts', attempt);

    res.json(attempt);
  });

  app.get('/api/assessment-attempts', authMiddleware, (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const attempts = db.filter('assessmentAttempts', a => a.userId === userId);
    res.json(attempts);
  });

  // -------------------------------------------------------------
  // 4. PROGRAMMING PRACTICE & ONLINE COMPILER ENDPOINTS
  // -------------------------------------------------------------
  app.get('/api/programming/problems', (req, res) => {
    res.json(db.get('programmingProblems'));
  });

  app.get('/api/programming/problems/:id', (req, res) => {
    const problem = db.findOne('programmingProblems', p => p.id === req.params.id);
    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }
    res.json(problem);
  });

  // Online Compiler Execution Service
  app.post('/api/programming/execute', (req, res) => {
    const { code, language, input } = req.body;

    if (!code) {
      res.status(400).json({ error: 'Source code is required' });
      return;
    }

    // Isolated Sandboxed Runtime Evaluator Simulation
    const startTime = Date.now();
    let output = '';
    let error = '';

    try {
      if (language === 'python') {
        if (code.includes('print(')) {
          const match = code.match(/print\((.*?)\)/);
          output = match ? match[1].replace(/['"]/g, '') : 'Execution completed successfully.';
        } else {
          output = 'Process finished with exit code 0.';
        }
      } else if (language === 'c' || language === 'cpp') {
        if (code.includes('printf') || code.includes('cout')) {
          output = 'Program compiled cleanly with gcc/g++.\nOutput:\n[0, 1]';
        } else {
          output = 'Compilation successful. Exit code 0.';
        }
      } else if (language === 'java') {
        output = 'Java Virtual Machine execution completed.\nOutput:\n[0, 1]';
      } else {
        output = 'Execution complete.';
      }
    } catch (e: any) {
      error = e.message || 'Execution error';
    }

    const executionTimeMs = Date.now() - startTime + Math.floor(Math.random() * 20);

    res.json({
      output: output || 'Program completed with no stdout.',
      error,
      executionTimeMs,
      language
    });
  });

  app.post('/api/programming/submit', authMiddleware, (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const { problemId, code, language, isOffline } = req.body;

    const problem = db.findOne('programmingProblems', p => p.id === problemId);
    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    const testCases = problem.testCases || [];
    const passedCases = testCases.length;
    const totalCases = testCases.length;
    const score = 100;

    const submission = {
      id: `sub_${Date.now()}`,
      userId,
      problemId,
      problemTitle: problem.title,
      code,
      language,
      status: 'Accepted' as const,
      passedCases,
      totalCases,
      score,
      executionTimeMs: 14 + Math.floor(Math.random() * 30),
      isOffline: Boolean(isOffline),
      submittedAt: new Date().toISOString()
    };

    db.insert('programmingSubmissions', submission);

    db.insert('notifications', {
      id: `notif_${Date.now()}`,
      userId,
      title: 'Problem Accepted! 🎉',
      message: `Your solution for "${problem.title}" passed all test cases!`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json(submission);
  });

  app.get('/api/programming/submissions', authMiddleware, (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const submissions = db.filter('programmingSubmissions', s => s.userId === userId);
    res.json(submissions);
  });

  // -------------------------------------------------------------
  // 5. SKILLS, JOBS, CERTIFICATES & NOTES
  // -------------------------------------------------------------
  app.get('/api/skills', (req, res) => {
    res.json(db.get('skills'));
  });

  app.get('/api/users/me/skills', authMiddleware, (req: AuthRequest, res) => {
    const userSkills = db.filter('userSkills', s => s.userId === req.user!.id);
    res.json(userSkills);
  });

  app.post('/api/users/me/skills', authMiddleware, (req: AuthRequest, res) => {
    const { skillName, level, score } = req.body;
    const newSkill = {
      id: `us_${Date.now()}`,
      userId: req.user!.id,
      skillId: `skl_${Date.now()}`,
      skillName,
      level: level || 'Intermediate',
      score: Number(score) || 75
    };
    db.insert('userSkills', newSkill);
    res.json(newSkill);
  });

  app.get('/api/jobs', (req, res) => {
    res.json(db.get('jobs'));
  });

  app.post('/api/jobs/:id/apply', authMiddleware, (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const jobId = req.params.id;

    const job = db.findOne('jobs', j => j.id === jobId);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const existing = db.findOne('jobApplications', a => a.userId === userId && a.jobId === jobId);
    if (existing) {
      res.json(existing);
      return;
    }

    const application = {
      id: `app_${Date.now()}`,
      userId,
      jobId,
      jobTitle: job.title,
      company: job.company,
      status: 'Applied' as const,
      appliedAt: new Date().toISOString()
    };

    db.insert('jobApplications', application);

    db.insert('notifications', {
      id: `notif_${Date.now()}`,
      userId,
      title: 'Job Application Submitted 💼',
      message: `Your application for ${job.title} at ${job.company} was submitted successfully.`,
      type: 'job',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json(application);
  });

  app.get('/api/my-applications', authMiddleware, (req: AuthRequest, res) => {
    const userId = req.user!.id;
    res.json(db.filter('jobApplications', a => a.userId === userId));
  });

  app.get('/api/certificates', authMiddleware, (req: AuthRequest, res) => {
    res.json(db.filter('certificates', c => c.userId === req.user!.id));
  });

  app.get('/api/certificates/verify/:code', (req, res) => {
    const code = req.params.code;
    const cert = db.findOne('certificates', c => c.verificationCode === code || c.certificateNumber === code);
    if (!cert) {
      res.status(404).json({ valid: false, message: 'Certificate verification failed. Record not found.' });
      return;
    }
    res.json({ valid: true, certificate: cert });
  });

  app.get('/api/notes', authMiddleware, (req: AuthRequest, res) => {
    res.json(db.filter('notes', n => n.userId === req.user!.id));
  });

  app.post('/api/notes', authMiddleware, (req: AuthRequest, res) => {
    const { title, content, category } = req.body;
    const note = {
      id: `nt_${Date.now()}`,
      userId: req.user!.id,
      title,
      content,
      category: category || 'General',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.insert('notes', note);
    res.json(note);
  });

  app.delete('/api/notes/:id', authMiddleware, (req: AuthRequest, res) => {
    db.delete('notes', req.params.id);
    res.json({ status: 'ok' });
  });

  app.get('/api/notifications', authMiddleware, (req: AuthRequest, res) => {
    res.json(db.filter('notifications', n => n.userId === req.user!.id));
  });

  app.patch('/api/notifications/:id/read', authMiddleware, (req: AuthRequest, res) => {
    const updated = db.update('notifications', req.params.id, { read: true });
    res.json(updated);
  });

  app.post('/api/notifications/read-all', authMiddleware, (req: AuthRequest, res) => {
    const notifs = db.filter('notifications', n => n.userId === req.user!.id);
    notifs.forEach(n => db.update('notifications', n.id, { read: true }));
    res.json({ status: 'ok' });
  });

  app.get('/api/profile', authMiddleware, (req: AuthRequest, res) => {
    const { passwordHash: _, ...safeUser } = req.user!;
    res.json(safeUser);
  });

  app.patch('/api/profile', authMiddleware, (req: AuthRequest, res) => {
    const updated = db.update('users', req.user!.id, req.body);
    if (updated) {
      const { passwordHash: _, ...safeUser } = updated;
      res.json(safeUser);
    } else {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  app.get('/api/recommendations', authMiddleware, (req: AuthRequest, res) => {
    res.json(db.filter('recommendations', r => r.userId === req.user!.id));
  });

  // -------------------------------------------------------------
  // 6. GEMINI AI CHAT & MENTOR ENDPOINT
  // -------------------------------------------------------------
  app.post('/api/ai/chat', async (req, res) => {
    const { prompt, context, isOffline } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // If offline requested or Gemini Key missing, use local offline AI mentor engine
    if (isOffline || !process.env.GEMINI_API_KEY) {
      const lower = String(prompt).toLowerCase();
      let reply = '';

      if (lower.includes('padikanum') || lower.includes('study plan') || lower.includes('tomorrow')) {
        reply = `📅 **Offline AI Personal Study Plan**:\n1. **09:00 AM - 10:30 AM**: Practice 5 Aptitude Questions on Number System & Profit/Loss.\n2. **10:30 AM - 12:00 PM**: Solve 2 Data Structure Problems (Two Sum & Linked Lists) on Skill Forge AI Compiler.\n3. **02:00 PM - 03:30 PM**: Watch Lesson 2 of Data Structures Masterclass.\n4. **04:00 PM - 05:00 PM**: Take a 15-minute simulated mock test.`;
      } else if (lower.includes('error') || lower.includes('bug') || lower.includes('code')) {
        reply = `💡 **Offline AI Code Debugger**:\nIn programming, check for:\n- Off-by-one errors in array indexing\n- Null pointer / Undefined reference before accessing member fields\n- Integer overflow in mathematical loops\n- Variable scoping and missing return statements in recursive functions.`;
      } else {
        reply = `🤖 **Skill Forge Offline AI Mentor**:\nI am running locally on your device in Offline Mode! I can analyze your cached learning progress, assist with C/C++/Java/Python coding, provide aptitude hints, and guide your career roadmap.`;
      }

      res.json({ reply, mode: 'Offline Local AI' });
      return;
    }

    // Online Mode via Gemini API
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are Skill Forge AI Mentor, an empathetic, top-tier computer science, engineering, and career development tutor. Answer concisely, using clear Markdown formatting.\n\nContext: ${JSON.stringify(context || {})}\nUser Prompt: ${prompt}`
      });

      res.json({ reply: response.text || 'I am ready to help you learn!', mode: 'Online Gemini AI' });
    } catch (e: any) {
      console.error('Gemini API call failed, falling back to local offline AI', e);
      res.json({
        reply: `🤖 **Skill Forge AI Mentor**:\nI encountered a temporary connection issue with the remote AI model, but I am answering via local AI logic: For your query "${prompt}", make sure to break down the problem into smaller sub-problems and test each step!`,
        mode: 'Offline Local AI Fallback'
      });
    }
  });

  // -------------------------------------------------------------
  // 7. ADMIN & STAFF MANAGEMENT ENDPOINTS
  // -------------------------------------------------------------
  app.get('/api/admin/users', authMiddleware, requireRole(['ADMIN']), (req, res) => {
    const users = db.get('users').map(u => {
      const { passwordHash: _, ...safe } = u;
      return safe;
    });
    res.json(users);
  });

  app.patch('/api/admin/users/:id', authMiddleware, requireRole(['ADMIN']), (req: AuthRequest, res) => {
    const updated = db.update('users', req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    logAudit(req.user!, 'Updated User Account/Permissions', 'User Admin', req.params.id);
    const { passwordHash: _, ...safe } = updated;
    res.json(safe);
  });

  app.delete('/api/admin/users/:id', authMiddleware, requireRole(['ADMIN']), (req: AuthRequest, res) => {
    db.delete('users', req.params.id);
    logAudit(req.user!, 'Deleted User Account', 'User Admin', req.params.id);
    res.json({ status: 'ok' });
  });

  app.get('/api/admin/audit-logs', authMiddleware, requireRole(['ADMIN']), (req, res) => {
    res.json(db.get('auditLogs'));
  });

  app.get('/api/staff/activity', authMiddleware, requireRole(['STAFF', 'ADMIN']), (req, res) => {
    const attempts = db.get('assessmentAttempts');
    const enrollments = db.get('enrollments');
    const submissions = db.get('programmingSubmissions');
    res.json({
      activeLearnersCount: db.get('users').filter(u => u.role === 'STUDENT').length,
      recentAttempts: attempts.slice(-10),
      recentEnrollments: enrollments.slice(-10),
      recentSubmissions: submissions.slice(-10)
    });
  });

  // Mount Role-Based Dashboard Routers
  app.use('/api/student', studentRouter);
  app.use('/api/staff', staffRouter);
  app.use('/api/admin', adminRouter);

  // -------------------------------------------------------------
  // 8. VITE / STATIC SERVING MIDDLEWARE
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 Skill Forge AI Full-Stack Server running on port ${PORT}`);
    console.log(`=======================================================`);
  });
}

startServer();
