// ============================================================
// KRIORA LMS — Core Type Definitions
// ============================================================

// --- Auth & Student ---

export interface Student {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  collegeName: string;
  university?: string;
  degree?: string;
  branch: string;
  currentYear: string;
  graduationYear: string;
  city?: string;
  state?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  skills?: string;
  preferredCourse: string;
  reasonForJoining?: string;
  resumeUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  role: 'student';
  progress: Record<string, number>; // courseId -> completionPercentage
  completedLessons: string[];        // array of completed topic/lesson IDs
  batchId?: string;                  // assigned batch/cohort
  lastLogin?: string;
  lastActive?: string;
  registeredAt: string;
  isEmailVerified?: boolean;
}

// --- Batches / Cohorts ---

export type BatchStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface Batch {
  id: string;
  name: string;
  courseId: string;
  capacity: number;
  startDate: string;        // YYYY-MM-DD
  endDate?: string;         // YYYY-MM-DD
  startTime: string;        // "18:00"
  endTime: string;          // "20:00"
  daysOfWeek: string[];
  status: BatchStatus;
  description?: string;
  createdAt: string;
}

export interface BatchDayAccess {
  id: string;
  batchId: string;
  courseId?: string;
  dayId: string;
  dayNumber?: number;
  studentId?: string;
  grantedBy?: string;
  grantedAt?: string;
}

export type EvalStatus = 'pending' | 'manual' | 'auto' | 'rejected';

export interface TestSubmission {
  id: string;
  studentId: string;
  batchId?: string;
  courseId?: string;
  dayId?: string;
  dayNumber?: number;
  testId: string;
  testType: string;
  code?: string;
  score?: number;
  maxScore?: number;
  percentage?: number;
  submittedAt?: string;
  evalStatus: string;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  passedTests?: number;
  failedTests?: number;
  evalDetails?: any;
}

// --- Course Architecture (Course → Module → CourseDay → Topic) ---

export interface Topic {
  id: string;
  dayId: string;
  order: number;
  title: string;
  theoryContent?: string;
  codeExamples?: CodeExample[];
  practiceProblems?: PracticeItem[];
  compilerExercises?: CompilerExercise[];
  estimatedMinutes?: number;
  isPublished?: boolean;
  version?: number;
}

export interface CodeExample {
  id: string;
  title: string;
  language: string;
  code: string;
  explanation?: string;
}

export interface PracticeItem {
  id?: string;
  question: string;
  hints?: string[];
  expectedOutput?: string;
}

export interface CompilerExercise {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  testCases?: { input: string; expectedOutput: string }[];
}

export interface DayContent {
  phase?: string;
  opening?: string;
  objectives?: string[];
  commonMistakes?: string[];
  workedExample?: WorkedExampleContent;
  practice?: PracticeItem[];
  marks?: number;
  performanceReport?: string;
}

export interface WorkedExampleContent {
  title?: string;
  caseStudy?: string;
  entities?: string[];
  data?: string[];
  operations?: string[];
  algorithm?: string[];
  pseudocode?: string[];
  code?: string;
  codeExplanation?: string;
  variations?: string[];
}

export interface CourseDay {
  id: string;
  moduleId: string;
  dayNumber: number;
  title: string;
  description?: string;
  releaseStatus: string;
  releasedAt?: string;
  lockedAt?: string;
  topics: Topic[];
  estimatedMinutes?: number;
  assessmentKey?: string;
  content?: DayContent;
}

export interface CourseModule {
  id: string;
  courseId: string;
  order: number;
  title: string;
  description?: string;
  days: CourseDay[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  instructor: string;
  totalDuration?: string;
  skills: string[];
  learningOutcomes?: string[];
  prerequisites?: string[];
  thumbnailUrl?: string;
  isPublished?: boolean;
  modules: CourseModule[];
}

// --- Announcements ---

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  isPinned: boolean;
}

// --- Audit Logs ---

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'Student' | 'Admin';
  action: string;
  details: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

// --- LMS Config ---

export interface LMSConfig {
  instituteName: string;
  instituteLogo?: string;
  contactEmail: string;
  contactPhone?: string;
  websiteUrl?: string;
  linkedinLink?: string;
  githubLink?: string;
  allowSelfRegistration: boolean;
  requireEmailVerification?: boolean;
  dailyAssessmentMarks?: number;
  dailyPerfThreshold?: number;
  finalExamThreshold?: number;
  testDurationMinutes?: number;
}

// --- Practice Arena (V1) ---
export * from './lib/practice/types';
