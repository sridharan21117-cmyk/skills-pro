import { Router, Response } from 'express';
import { db } from '../db';
import { authMiddleware, requireRole, AuthRequest } from '../auth';

export const studentRouter = Router();

studentRouter.use(authMiddleware);
studentRouter.use(requireRole(['STUDENT', 'ADMIN']));

// 1. Student Main Dashboard Overview
studentRouter.get('/dashboard', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const user = req.user!;

  // Enrollments
  const enrollments = db.filter('enrollments', e => e.userId === userId);
  const courses = db.get('courses');
  const lessons = db.get('lessons');

  const myCourses = enrollments.map(e => {
    const course = courses.find(c => c.id === e.courseId);
    const courseLessons = lessons.filter(l => l.courseId === e.courseId);
    const completedLessonCount = (e.completedLessonIds || []).length;
    return {
      ...e,
      course,
      completedLessonsCount: completedLessonCount,
      totalLessonsCount: courseLessons.length || 1
    };
  });

  const coursesEnrolled = myCourses.length;
  const coursesCompleted = myCourses.filter(c => c.completed).length;

  // Assessment Attempts & Scores
  const attempts = db.filter('assessmentAttempts', a => a.userId === userId);
  let averageScore = 84; // default baseline if no attempts
  if (attempts.length > 0) {
    const sum = attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
    averageScore = Math.round(sum / attempts.length);
  }

  // Certificates Count
  const certificates = db.filter('certificates', c => c.userId === userId);
  const certificatesCount = certificates.length;

  // Recent Activity Feed
  const recentActivity: Array<{ id: string; type: string; title: string; subtitle: string; timestamp: string; iconType: string }> = [];

  // Add course enrollments
  enrollments.forEach(e => {
    const course = courses.find(c => c.id === e.courseId);
    recentActivity.push({
      id: `act_${e.id}`,
      type: 'course_enrolled',
      title: `Enrolled in ${course?.title || 'Course'}`,
      subtitle: `${e.progress}% Progress`,
      timestamp: e.enrolledAt,
      iconType: 'course'
    });
    if (e.completed && e.completedAt) {
      recentActivity.push({
        id: `act_comp_${e.id}`,
        type: 'course_completed',
        title: `Completed ${course?.title || 'Course'}`,
        subtitle: `100% Mastery Achieved`,
        timestamp: e.completedAt,
        iconType: 'check'
      });
    }
  });

  // Add assessment attempts
  attempts.forEach(a => {
    recentActivity.push({
      id: `act_att_${a.id}`,
      type: 'assessment_completed',
      title: `Completed ${a.assessmentTitle || 'Assessment'}`,
      subtitle: `Score: ${a.percentage}% (${a.passed ? 'PASSED' : 'FAILED'})`,
      timestamp: a.completedAt,
      iconType: 'assessment'
    });
  });

  // Add certificates
  certificates.forEach(c => {
    recentActivity.push({
      id: `act_cert_${c.id}`,
      type: 'certificate_earned',
      title: `Certificate Earned: ${c.courseTitle}`,
      subtitle: `Verification Code: ${c.verificationCode}`,
      timestamp: c.issuedAt,
      iconType: 'certificate'
    });
  });

  // Add job applications
  const applications = db.filter('jobApplications', a => a.userId === userId);
  applications.forEach(a => {
    recentActivity.push({
      id: `act_app_${a.id}`,
      type: 'job_applied',
      title: `Applied for ${a.jobTitle || 'Role'} at ${a.company || 'Company'}`,
      subtitle: `Status: ${a.status}`,
      timestamp: a.appliedAt,
      iconType: 'job'
    });
  });

  // Sort activity descending by timestamp
  recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Skills & Gaps
  const userSkills = db.filter('userSkills', s => s.userId === userId);
  const formattedSkills = userSkills.map(s => {
    const targetScore = 85;
    const gap = Math.max(0, targetScore - s.score);
    return {
      ...s,
      skillGap: gap,
      recommendedLearning: gap > 0 ? `Practice ${s.skillName} Drills` : 'Skill Benchmark Met'
    };
  });

  // Recommendations
  const recommendations = db.filter('recommendations', r => r.userId === userId);

  // Job Matches
  const jobs = db.get('jobs').filter(j => j.status === 'Open');
  const userSkillNames = new Set(userSkills.map(s => s.skillName.toLowerCase()));

  const jobMatches = jobs.map(j => {
    const requiredSkills = j.skills || [];
    let matchedCount = 0;
    const missingSkills: string[] = [];

    requiredSkills.forEach(reqSkill => {
      if (userSkillNames.has(reqSkill.toLowerCase())) {
        matchedCount++;
      } else {
        missingSkills.push(reqSkill);
      }
    });

    const matchPercentage = requiredSkills.length > 0
      ? Math.round((matchedCount / requiredSkills.length) * 100)
      : 80;

    const isApplied = applications.some(app => app.jobId === j.id);

    return {
      ...j,
      matchPercentage: Math.max(65, matchPercentage),
      missingSkills,
      isApplied
    };
  });

  // Upcoming Tasks
  const tests = db.get('aptitudeTests').filter(t => t.status === 'Published');
  const upcomingTasks = [
    {
      id: 'task_1',
      title: tests[0]?.title || 'JavaScript & Aptitude Assessment',
      time: 'Tomorrow • 30 mins',
      type: 'Assessment',
      actionText: 'Start Test',
      actionTab: 'aptitude'
    },
    {
      id: 'task_2',
      title: 'Complete Linked List Reversal Lesson',
      time: 'Due in 2 days',
      type: 'Lesson',
      actionText: 'Resume Lesson',
      actionTab: 'courses'
    },
    {
      id: 'task_3',
      title: 'AI Mock Interview Drill: React Developer',
      time: 'Recommended Today',
      type: 'Interview Practice',
      actionText: 'Launch Simulator',
      actionTab: 'interview'
    }
  ];

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
      department: user.department,
      careerGoal: user.careerGoal
    },
    overviewStats: {
      coursesEnrolled,
      coursesCompleted,
      averageScore,
      certificatesCount
    },
    myCourses,
    recentActivity: recentActivity.slice(0, 8),
    skills: formattedSkills,
    recommendations,
    upcomingTasks,
    jobMatches
  });
});

// 2. Student Learning Progress
studentRouter.get('/progress', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const enrollments = db.filter('enrollments', e => e.userId === userId);
  const courses = db.get('courses');
  const lessons = db.get('lessons');

  const detailedProgress = enrollments.map(e => {
    const course = courses.find(c => c.id === e.courseId);
    const courseLessons = lessons.filter(l => l.courseId === e.courseId);
    return {
      enrollmentId: e.id,
      courseId: e.courseId,
      courseTitle: course?.title || 'Unknown Course',
      instructor: course?.instructor || 'Instructor',
      thumbnail: course?.thumbnail || '',
      progress: e.progress,
      completed: e.completed,
      completedLessons: (e.completedLessonIds || []).length,
      totalLessons: courseLessons.length || 1,
      lessons: courseLessons.map(l => ({
        id: l.id,
        title: l.title,
        duration: l.duration,
        completed: (e.completedLessonIds || []).includes(l.id)
      }))
    };
  });

  res.json(detailedProgress);
});

// 3. Student Skills Overview & Gap Analysis
studentRouter.get('/skills', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const userSkills = db.filter('userSkills', s => s.userId === userId);
  res.json(userSkills);
});

// 4. Student Recommendations
studentRouter.get('/recommendations', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const recommendations = db.filter('recommendations', r => r.userId === userId);
  res.json(recommendations);
});

// 5. Student Activity
studentRouter.get('/activity', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const attempts = db.filter('assessmentAttempts', a => a.userId === userId);
  const enrollments = db.filter('enrollments', e => e.userId === userId);
  const certs = db.filter('certificates', c => c.userId === userId);
  const apps = db.filter('jobApplications', a => a.userId === userId);

  res.json({
    attempts,
    enrollments,
    certificates: certs,
    jobApplications: apps
  });
});

// 6. Student Job Matches
studentRouter.get('/jobs', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const userSkills = db.filter('userSkills', s => s.userId === userId);
  const jobs = db.get('jobs').filter(j => j.status === 'Open');
  const apps = db.filter('jobApplications', a => a.userId === userId);

  const userSkillNames = new Set(userSkills.map(s => s.skillName.toLowerCase()));

  const matched = jobs.map(j => {
    const reqSkills = j.skills || [];
    let matchedCount = 0;
    const missingSkills: string[] = [];

    reqSkills.forEach(s => {
      if (userSkillNames.has(s.toLowerCase())) matchedCount++;
      else missingSkills.push(s);
    });

    const matchPct = reqSkills.length > 0 ? Math.round((matchedCount / reqSkills.length) * 100) : 80;
    const isApplied = apps.some(a => a.jobId === j.id);

    return {
      ...j,
      matchPercentage: Math.max(65, matchPct),
      missingSkills,
      isApplied
    };
  });

  res.json(matched);
});
