// ============================================================
// KRIORA LMS — Practice Arena Type Definitions
// ============================================================

export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

export type ProblemStatus = 'Not Attempted' | 'Attempted' | 'Solved';

export type SubmissionStatus = 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded';

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemSolution {
  approach: string;
  code: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface PracticeProblem {
  id: string;
  problemNumber: number;
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  topic: string;
  topics: string[];
  relatedDay?: number;
  relatedCurriculumTopic?: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  examples: ProblemExample[];
  starterCode: string;
  hints: string[];
  publicTestCases: TestCase[];
  hiddenTestCases?: TestCase[];
  solution?: ProblemSolution;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PracticeProgress {
  id: string;
  studentId: string;
  problemId: string;
  status: ProblemStatus;
  bookmarked: boolean;
  bestSubmissionId?: string;
  solvedAt?: string;
  firstAttemptedAt: string;
  lastAttemptedAt: string;
  attemptsCount: number;
}

export interface PracticeSubmission {
  id: string;
  studentId: string;
  problemId: string;
  status: SubmissionStatus;
  code: string;
  passedTests: number;
  totalTests: number;
  runtimeMs: number;
  submittedAt: string;
  attemptNumber: number;
  submissionRequestId?: string;
}

export interface PracticeStats {
  totalProblems: number;
  solvedCount: number;
  easyTotal: number;
  easySolved: number;
  mediumTotal: number;
  mediumSolved: number;
  hardTotal: number;
  hardSolved: number;
  totalAttempts: number;
  successRate: number;
  currentStreak: number;
  topicsMastered: number;
  totalTopics: number;
  bookmarkedCount: number;
}

export interface TestExecutionResult {
  testIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string | null;
  runtimeMs?: number;
}

export interface PracticeFilters {
  searchQuery: string;
  difficulty: 'All' | ProblemDifficulty;
  topic: string;
  status: 'All' | ProblemStatus | 'Bookmarked';
}
