import fs from 'fs';
import path from 'path';
import {
  User, Course, Lesson, Enrollment, Assessment, Question, AssessmentAttempt,
  Skill, UserSkill, Job, JobApplication, Certificate, Note, NotificationItem,
  Recommendation, InterviewSession, VideoItem, ProgrammingProblem, ProgrammingSubmission,
  AptitudeTest, AuditLog
} from '../types';

export interface DatabaseSchema {
  users: User[];
  courses: Course[];
  lessons: Lesson[];
  enrollments: Enrollment[];
  assessments: Assessment[];
  questions: Question[];
  assessmentAttempts: AssessmentAttempt[];
  skills: Skill[];
  userSkills: UserSkill[];
  jobs: Job[];
  jobApplications: JobApplication[];
  certificates: Certificate[];
  notes: Note[];
  notifications: NotificationItem[];
  recommendations: Recommendation[];
  interviews: InterviewSession[];
  videos: VideoItem[];
  programmingProblems: ProgrammingProblem[];
  programmingSubmissions: ProgrammingSubmission[];
  aptitudeTests: AptitudeTest[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'skillforge.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class JSONDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse database file, resetting to empty schema', e);
      }
    }
    return {
      users: [],
      courses: [],
      lessons: [],
      enrollments: [],
      assessments: [],
      questions: [],
      assessmentAttempts: [],
      skills: [],
      userSkills: [],
      jobs: [],
      jobApplications: [],
      certificates: [],
      notes: [],
      notifications: [],
      recommendations: [],
      interviews: [],
      videos: [],
      programmingProblems: [],
      programmingSubmissions: [],
      aptitudeTests: [],
      auditLogs: []
    };
  }

  public save(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file', e);
    }
  }

  public get<K extends keyof DatabaseSchema>(collection: K): DatabaseSchema[K] {
    return this.data[collection];
  }

  public set<K extends keyof DatabaseSchema>(collection: K, items: DatabaseSchema[K]): void {
    this.data[collection] = items;
    this.save();
  }

  public findOne<K extends keyof DatabaseSchema>(
    collection: K,
    predicate: (item: DatabaseSchema[K][number]) => boolean
  ): DatabaseSchema[K][number] | undefined {
    return (this.data[collection] as any[]).find(predicate);
  }

  public filter<K extends keyof DatabaseSchema>(
    collection: K,
    predicate: (item: DatabaseSchema[K][number]) => boolean
  ): DatabaseSchema[K] {
    return (this.data[collection] as any[]).filter(predicate) as DatabaseSchema[K];
  }

  public insert<K extends keyof DatabaseSchema>(
    collection: K,
    item: DatabaseSchema[K][number]
  ): DatabaseSchema[K][number] {
    (this.data[collection] as any[]).push(item);
    this.save();
    return item;
  }

  public update<K extends keyof DatabaseSchema>(
    collection: K,
    id: string,
    updates: Partial<DatabaseSchema[K][number]>
  ): DatabaseSchema[K][number] | undefined {
    const list = this.data[collection] as any[];
    const idx = list.findIndex(x => x.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return list[idx];
    }
    return undefined;
  }

  public delete<K extends keyof DatabaseSchema>(collection: K, id: string): boolean {
    const list = this.data[collection] as any[];
    const idx = list.findIndex(x => x.id === id);
    if (idx !== -1) {
      list.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new JSONDatabase();
