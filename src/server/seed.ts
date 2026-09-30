import bcrypt from 'bcryptjs';
import { db } from './db';
import {
  User, Course, Lesson, Question, ProgrammingProblem, Job, Skill, VideoItem, AptitudeTest
} from '../types';

export async function seedDatabase() {
  const users = db.get('users');
  if (users.length > 0) {
    return; // Already seeded
  }

  console.log('Seeding initial Skill Forge AI database...');

  const passwordHash = await bcrypt.hash('admin123', 10);
  const staffHash = await bcrypt.hash('staff123', 10);
  const studentHash = await bcrypt.hash('student123', 10);

  // 1. Initial Users
  const seededUsers: User[] = [
    {
      id: 'usr_admin',
      name: 'System Admin',
      email: 'admin@skillforge.ai',
      passwordHash: passwordHash,
      role: 'ADMIN',
      department: 'Computer Science & Engineering',
      college: 'Skill Forge Institute of Technology',
      phone: '+1 800-555-0199',
      location: 'San Francisco, CA',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr_staff',
      name: 'Prof. Rajesh Sharma',
      email: 'staff@skillforge.ai',
      passwordHash: staffHash,
      role: 'STAFF',
      department: 'Computer Science & Engineering',
      college: 'Skill Forge Institute of Technology',
      phone: '+1 800-555-0188',
      location: 'Boston, MA',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      status: 'ACTIVE',
      permissions: ['COURSE_VIEW', 'COURSE_CREATE', 'COURSE_EDIT', 'APTITUDE_VIEW', 'APTITUDE_CREATE', 'APTITUDE_EDIT', 'PROGRAMMING_VIEW', 'PROGRAMMING_CREATE'],
      assignedDepartment: 'Computer Science & Engineering',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr_student',
      name: 'Sridharan V',
      email: 'student@skillforge.ai',
      passwordHash: studentHash,
      role: 'STUDENT',
      department: 'Computer Science & Engineering',
      college: 'Skill Forge Institute of Technology',
      graduationYear: '2026',
      phone: '+1 800-555-0177',
      location: 'New York, NY',
      careerGoal: 'Full Stack AI Software Engineer',
      profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  db.set('users', seededUsers);

  // 2. Courses & Lessons
  const seededCourses: Course[] = [
    {
      id: 'crs_1',
      title: 'Data Structures & Algorithms Masterclass',
      description: 'Master Arrays, Linked Lists, Trees, Graphs, Dynamic Programming and System Design for top tech interviews.',
      category: 'Computer Science',
      department: 'Computer Science & Engineering',
      level: 'Intermediate',
      duration: '18 Hours',
      thumbnail: 'https://images.unsplash.com/photo-1516116211223-4c714132a0c3?auto=format&fit=crop&q=80&w=600',
      instructor: 'Prof. Rajesh Sharma',
      status: 'Published',
      rating: 4.9,
      enrolledCount: 1420,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'crs_2',
      title: 'Full Stack Web Development with React & Node',
      description: 'Build production-ready web applications with modern React 19, TypeScript, Express, PostgreSQL and AI integrations.',
      category: 'Web Development',
      department: 'Information Technology',
      level: 'Beginner',
      duration: '24 Hours',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600',
      instructor: 'Sarah Jenkins',
      status: 'Published',
      rating: 4.8,
      enrolledCount: 980,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'crs_3',
      title: 'Quantitative Aptitude & Logical Reasoning for Campus Placements',
      description: 'Comprehensive preparation for TCS, Infosys, Accenture, Wipro and product company placement rounds.',
      category: 'Placement Prep',
      department: 'General Aptitude',
      level: 'Beginner',
      duration: '15 Hours',
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
      instructor: 'Dr. Anand Kumar',
      status: 'Published',
      rating: 4.9,
      enrolledCount: 2300,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'crs_4',
      title: 'AI Engineering & LLM Application Development',
      description: 'Build generative AI apps with Gemini API, RAG, prompt engineering, vector embeddings, and autonomous agents.',
      category: 'Artificial Intelligence',
      department: 'AI & Data Science',
      level: 'Advanced',
      duration: '12 Hours',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600',
      instructor: 'Dr. Elena Vance',
      status: 'Published',
      rating: 5.0,
      enrolledCount: 850,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  db.set('courses', seededCourses);

  const seededLessons: Lesson[] = [
    {
      id: 'les_101',
      courseId: 'crs_1',
      title: 'Introduction to Time & Space Complexity (Big O)',
      description: 'Understand how to analyze time complexity and space complexity of algorithms.',
      videoUrl: 'https://www.youtube.com/embed/g2o22C3CRfU',
      content: 'Big O notation describes the upper bound of execution time or memory space in terms of input size N.',
      duration: '25 min',
      order: 1
    },
    {
      id: 'les_102',
      courseId: 'crs_1',
      title: 'Arrays & Two-Pointer Pattern Techniques',
      description: 'Solving Two-Sum, Container with Most Water, and 3Sum efficiently.',
      videoUrl: 'https://www.youtube.com/embed/KLlXCFG5TnA',
      content: 'The two-pointer technique uses two indices to traverse array structures from opposite ends or at variable speeds.',
      duration: '35 min',
      order: 2
    },
    {
      id: 'les_103',
      courseId: 'crs_1',
      title: 'Linked List Reversal & Cycle Detection',
      description: 'Master Floyd Cycle Detection Algorithm and In-place reversal.',
      videoUrl: 'https://www.youtube.com/embed/G0_I-ZF0S38',
      content: 'Linked lists require careful pointer manipulation to avoid memory leaks or dangling node pointers.',
      duration: '40 min',
      order: 3
    },
    {
      id: 'les_201',
      courseId: 'crs_2',
      title: 'React Fundamentals & Component Architecture',
      description: 'JSX, Props, State management with hooks, and component breakdown.',
      videoUrl: 'https://www.youtube.com/embed/w7ejDZ8SWv8',
      content: 'React components are functional building blocks rendering UI based on immutable props and reactive state.',
      duration: '30 min',
      order: 1
    },
    {
      id: 'les_301',
      courseId: 'crs_3',
      title: 'Number Systems & Divisibility Fast Tricks',
      description: 'Shortcut tricks for LCM, HCF, remainders and unit digits.',
      videoUrl: 'https://www.youtube.com/embed/5m3O50j9Qj8',
      content: 'Learn modular arithmetic shortcuts for solving remainders and unit digit problems in under 30 seconds.',
      duration: '20 min',
      order: 1
    }
  ];

  db.set('lessons', seededLessons);

  // 3. Initial Enrollment for Student
  db.set('enrollments', [
    {
      id: 'enr_1',
      userId: 'usr_student',
      courseId: 'crs_1',
      progress: 66,
      completed: false,
      completedLessonIds: ['les_101', 'les_102'],
      enrolledAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'enr_2',
      userId: 'usr_student',
      courseId: 'crs_3',
      progress: 100,
      completed: true,
      completedLessonIds: ['les_301'],
      enrolledAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ]);

  // 4. Aptitude Questions & Tests
  const seededQuestions: Question[] = [
    {
      id: 'apt_1',
      category: 'Quantitative Aptitude',
      topic: 'Number System',
      subtopic: 'Remainders',
      difficulty: 'Easy',
      questionType: 'MCQ',
      question: 'Find the remainder when 7^84 is divided by 342.',
      options: ['1', '7', '49', '341'],
      correctAnswer: '1',
      explanation: '7^3 = 343. 343 ≡ 1 (mod 342). So (7^3)^28 = 7^84 ≡ 1^28 ≡ 1 (mod 342). Remainder is 1.',
      marks: 2,
      negativeMarks: 0.5,
      status: 'Published',
      tags: ['TCS Pattern', 'Remainders']
    },
    {
      id: 'apt_2',
      category: 'Quantitative Aptitude',
      topic: 'Profit, Loss & Discount',
      difficulty: 'Medium',
      questionType: 'MCQ',
      question: 'A trader marks his goods 25% above cost price and allows a discount of 10%. What is his profit percentage?',
      options: ['12.5%', '15%', '10%', '17.5%'],
      correctAnswer: '12.5%',
      explanation: 'Let CP = 100. Marked Price = 125. Selling Price after 10% discount = 125 - 12.5 = 112.5. Profit = 12.5%.',
      marks: 2,
      negativeMarks: 0.5,
      status: 'Published',
      tags: ['Profit & Loss', 'Infosys Pattern']
    },
    {
      id: 'apt_3',
      category: 'Logical Reasoning',
      topic: 'Coding-Decoding',
      difficulty: 'Easy',
      questionType: 'MCQ',
      question: 'If "STATION" is coded as "UVCVKQP", how will "CAMPUS" be coded?',
      options: ['ECORWU', 'ECOWRU', 'EDORWU', 'ECORVT'],
      correctAnswer: 'ECORWU',
      explanation: 'Each letter is shifted by +2 positions in the alphabet: C->E, A->C, M->O, P->R, U->W, S->U.',
      marks: 2,
      negativeMarks: 0.5,
      status: 'Published',
      tags: ['Logical', 'Wipro Pattern']
    },
    {
      id: 'apt_4',
      category: 'Verbal Ability',
      topic: 'Synonyms',
      difficulty: 'Easy',
      questionType: 'MCQ',
      question: 'Choose the word nearest in meaning to "PRAGMATIC":',
      options: ['Practical', 'Idealistic', 'Theoretical', 'Arrogant'],
      correctAnswer: 'Practical',
      explanation: 'Pragmatic means dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.',
      marks: 1,
      negativeMarks: 0.25,
      status: 'Published',
      tags: ['Verbal', 'Vocabulary']
    },
    {
      id: 'apt_5',
      category: 'Quantitative Aptitude',
      topic: 'Time & Work',
      difficulty: 'Medium',
      questionType: 'MCQ',
      question: 'A can complete a work in 12 days and B in 15 days. If they work together for 4 days, what fraction of work is left?',
      options: ['2/5', '1/3', '3/10', '4/15'],
      correctAnswer: '2/5',
      explanation: 'A 1 day = 1/12, B 1 day = 1/15. Together 1 day = 1/12 + 1/15 = 9/60 = 3/20. In 4 days = 12/20 = 3/5. Work left = 1 - 3/5 = 2/5.',
      marks: 2,
      negativeMarks: 0.5,
      status: 'Published',
      tags: ['Time & Work', 'Placement']
    }
  ];

  db.set('questions', seededQuestions);

  const seededAptitudeTests: AptitudeTest[] = [
    {
      id: 'apt_test_1',
      title: 'TCS NQT Full Placement Practice Test',
      description: 'Simulated placement round covering Quantitative Aptitude, Logical Reasoning, and Verbal Ability.',
      category: 'Placement Practice',
      durationMinutes: 30,
      totalQuestions: 5,
      marksPerQuestion: 2,
      negativeMarks: 0.5,
      passPercentage: 60,
      status: 'Published',
      companyPattern: 'TCS NQT Style',
      questionIds: ['apt_1', 'apt_2', 'apt_3', 'apt_4', 'apt_5']
    }
  ];

  db.set('aptitudeTests', seededAptitudeTests);

  // 5. Programming Problems
  const seededProblems: ProgrammingProblem[] = [
    {
      id: 'prob_1',
      title: 'Two Sum - Target Pair Finder',
      difficulty: 'Easy',
      category: 'Arrays & Hashing',
      description: 'Given an array of integers `nums` and an integer `target`, return the 0-indexed positions of the two numbers such that they add up to `target`.',
      starterCode: {
        python: 'def two_sum(nums, target):\n    # Write your solution here\n    pass\n\n# Example Test\nprint(two_sum([2, 7, 11, 15], 9))',
        cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n    return {};\n}\n\nint main() {\n    vector<int> nums = {2, 7, 11, 15};\n    auto res = twoSum(nums, 9);\n    cout << "[" << res[0] << ", " << res[1] << "]" << endl;\n    return 0;\n}',
        c: '#include <stdio.h>\nint main() {\n    int nums[] = {2, 7, 11, 15};\n    int target = 9;\n    // Write your code here\n    printf("[0, 1]\\n");\n    return 0;\n}',
        java: 'public class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write code here\n        return new int[]{0, 1};\n    }\n    public static void main(String[] args) {\n        int[] res = twoSum(new int[]{2,7,11,15}, 9);\n        System.out.println("[" + res[0] + ", " + res[1] + "]");\n    }\n}'
      },
      testCases: [
        { input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]' },
        { input: '[3, 2, 4], 6', expectedOutput: '[1, 2]' },
        { input: '[3, 3], 6', expectedOutput: '[0, 1]', isHidden: true }
      ],
      hints: ['Use a hash map to store seen values and their indices for O(N) efficiency.'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'prob_2',
      title: 'Reverse a Linked List',
      difficulty: 'Medium',
      category: 'Linked Lists',
      description: 'Given the head of a singly linked list, reverse the list and return the reversed list.',
      starterCode: {
        python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head):\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev\n',
        cpp: '// Implement Linked List reversal in C++',
        c: '// Implement Linked List reversal in C',
        java: '// Implement Linked List reversal in Java'
      },
      testCases: [
        { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' }
      ],
      hints: ['Iterate through nodes keeping track of prev, curr, and next pointers.'],
      createdAt: new Date().toISOString()
    }
  ];

  db.set('programmingProblems', seededProblems);

  // 6. Skills & User Skills
  const seededSkills: Skill[] = [
    { id: 'skl_1', name: 'Data Structures', category: 'CS Core', description: 'Arrays, Trees, Graphs, Hash Maps' },
    { id: 'skl_2', name: 'Algorithms', category: 'CS Core', description: 'Searching, Sorting, DP, Greedy' },
    { id: 'skl_3', name: 'React.js', category: 'Frontend', description: 'Modern React hooks, state management, SPA' },
    { id: 'skl_4', name: 'Node.js & Express', category: 'Backend', description: 'REST APIs, middleware, HTTP authentication' },
    { id: 'skl_5', name: 'Quantitative Aptitude', category: 'Placement', description: 'Math, percentages, logic, speed calculations' },
    { id: 'skl_6', name: 'Python Programming', category: 'Languages', description: 'Python 3 data structures, OOP, scripting' }
  ];

  db.set('skills', seededSkills);

  db.set('userSkills', [
    { id: 'us_1', userId: 'usr_student', skillId: 'skl_1', skillName: 'Data Structures', level: 'Intermediate', score: 85 },
    { id: 'us_2', userId: 'usr_student', skillId: 'skl_3', skillName: 'React.js', level: 'Intermediate', score: 80 },
    { id: 'us_3', userId: 'usr_student', skillId: 'skl_5', skillName: 'Quantitative Aptitude', level: 'Advanced', score: 92 }
  ]);

  // 7. Jobs
  const seededJobs: Job[] = [
    {
      id: 'job_1',
      title: 'Graduate Software Development Engineer (SDE-1)',
      company: 'TechCorp Global',
      location: 'San Francisco, CA / Remote',
      type: 'Full-time',
      salary: '$115,000 - $135,000',
      description: 'We are seeking passionate fresh graduates with strong fundamentals in DSA, Web Architecture, and Problem Solving.',
      requirements: ['Strong proficiency in C++, Java or Python', 'Knowledge of Data Structures & Algorithms', 'Experience with React or Node.js is a plus'],
      skills: ['Data Structures', 'Algorithms', 'React.js', 'Node.js & Express'],
      status: 'Open',
      createdAt: new Date().toISOString()
    },
    {
      id: 'job_2',
      title: 'Associate AI Solutions Developer',
      company: 'Neural Dynamics AI',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$120,000 - $140,000',
      description: 'Build Next-Gen Generative AI applications, fine-tune models, and design intelligent assistant tools.',
      requirements: ['Proficiency in Python', 'Understanding of LLMs and REST APIs', 'Good aptitude and analytical skills'],
      skills: ['Python Programming', 'Algorithms', 'Node.js & Express'],
      status: 'Open',
      createdAt: new Date().toISOString()
    }
  ];

  db.set('jobs', seededJobs);

  // 8. Certificates
  db.set('certificates', [
    {
      id: 'cert_1001',
      userId: 'usr_student',
      userName: 'Sridharan V',
      courseId: 'crs_3',
      courseTitle: 'Quantitative Aptitude & Logical Reasoning for Campus Placements',
      certificateNumber: 'SFA-2026-QA-9921',
      verificationCode: 'VERIFY-9921-SFA',
      issuedAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ]);

  // 9. Notes & Notifications
  db.set('notes', [
    {
      id: 'nt_1',
      userId: 'usr_student',
      title: 'Big-O Cheat Sheet & Dynamic Programming Notes',
      content: '1. Array access: O(1)\n2. Binary Search: O(log N)\n3. Merge Sort: O(N log N)\n4. Knapsack DP: O(N * W)',
      category: 'DSA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  db.set('notifications', [
    {
      id: 'notif_1',
      userId: 'usr_student',
      title: 'Certificate Issued! 🎓',
      message: 'Congratulations! You earned your Certificate in Quantitative Aptitude & Logical Reasoning.',
      type: 'certificate',
      read: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'notif_2',
      userId: 'usr_student',
      title: 'New Placement Drive Announced',
      message: 'TechCorp Global has opened applications for SDE-1 positions. Check your 85% skill match!',
      type: 'job',
      read: false,
      createdAt: new Date().toISOString()
    }
  ]);

  db.set('recommendations', [
    {
      id: 'rec_1',
      userId: 'usr_student',
      type: 'course',
      title: 'AI Engineering & LLM Application Development',
      description: 'Based on your target goal of Full Stack AI Software Engineer.',
      priority: 'High',
      targetId: 'crs_4',
      createdAt: new Date().toISOString()
    }
  ]);

  console.log('Database successfully seeded with realistic platform data!');
}
