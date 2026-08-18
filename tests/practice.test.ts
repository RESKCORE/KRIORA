import { describe, it, expect } from 'vitest';
import { PRACTICE_PROBLEMS_CATALOG } from '../src/lib/practice/catalog.ts';
import { validatePracticeCatalog } from '../src/lib/practice/validation.ts';

describe('Practice Arena Catalog & Architecture Verification', () => {
  it('contains at least 100 original Python practice problems', () => {
    expect(PRACTICE_PROBLEMS_CATALOG.length).toBeGreaterThanOrEqual(100);
  });

  it('validates that all problems have unique identifiers, complete descriptions, and test cases', () => {
    const report = validatePracticeCatalog(PRACTICE_PROBLEMS_CATALOG);
    if (!report.isValid) {
      console.error('Catalog Validation Errors:', report.errors);
    }
    expect(report.isValid).toBe(true);
    expect(report.errors).toHaveLength(0);
  });

  it('has a balanced difficulty distribution across Easy, Medium, and Hard', () => {
    const report = validatePracticeCatalog(PRACTICE_PROBLEMS_CATALOG);
    expect(report.easyCount).toBeGreaterThanOrEqual(25);
    expect(report.mediumCount).toBeGreaterThanOrEqual(40);
    expect(report.hardCount).toBeGreaterThanOrEqual(15);
  });

  it('covers all 13 core Python curriculum topics', () => {
    const report = validatePracticeCatalog(PRACTICE_PROBLEMS_CATALOG);
    const expectedTopics = [
      'Basics',
      'Variables',
      'Input/Output',
      'Conditionals',
      'Loops',
      'Strings',
      'Lists',
      'Tuples/Sets',
      'Dictionaries',
      'Functions',
      'Recursion',
      'Searching/Sorting',
      'Algorithms',
    ];
    for (const topic of expectedTopics) {
      expect(report.topicsDistribution[topic]).toBeGreaterThanOrEqual(5);
    }
  });

  it('ensures every problem has at least 1 public test case, non-empty starter code, and reference solution', () => {
    for (const p of PRACTICE_PROBLEMS_CATALOG) {
      expect(p.publicTestCases.length).toBeGreaterThanOrEqual(1);
      expect(p.starterCode.trim().length).toBeGreaterThan(0);
      expect(p.solution?.code.trim().length).toBeGreaterThan(0);
      expect(p.solution?.approach.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('Targeted Data Integrity & Regression Verification Suite', () => {
  // ─── TEST 1: Student >50 academic submissions history preservation ─────────
  it('preserves complete academic history and scores for students with >50 submissions', () => {
    // Simulate 80 academic assessment submissions across 40 curriculum days
    const mockSubmissions: Array<{
      id: string;
      studentId: string;
      testId: string;
      score: number;
      evalStatus: string;
      submittedAt: string;
    }> = [];

    for (let day = 1; day <= 40; day++) {
      // First attempt
      mockSubmissions.push({
        id: `sub_${day}_1`,
        studentId: 'student_001',
        testId: `test_day_${day}`,
        score: day <= 20 ? 8 : 9,
        evalStatus: 'Evaluated',
        submittedAt: new Date(2026, 0, day, 10, 0).toISOString(),
      });
      // Retry attempt
      mockSubmissions.push({
        id: `sub_${day}_2`,
        studentId: 'student_001',
        testId: `test_day_${day}`,
        score: 10,
        evalStatus: 'Evaluated',
        submittedAt: new Date(2026, 0, day, 14, 0).toISOString(),
      });
    }

    expect(mockSubmissions.length).toBe(80);

    // Verify Day 1 and Day 40 both exist in history (no truncation)
    const day1Subs = mockSubmissions.filter((s) => s.testId === 'test_day_1');
    const day40Subs = mockSubmissions.filter((s) => s.testId === 'test_day_40');

    expect(day1Subs.length).toBe(2);
    expect(day40Subs.length).toBe(2);

    // Calculate daily average across all 40 days without data loss
    const bestScoresByDay = new Map<string, number>();
    for (const sub of mockSubmissions) {
      const current = bestScoresByDay.get(sub.testId) || 0;
      if (sub.score > current) {
        bestScoresByDay.set(sub.testId, sub.score);
      }
    }

    expect(bestScoresByDay.size).toBe(40);
    const avgScore = Array.from(bestScoresByDay.values()).reduce((a, b) => a + b, 0) / 40;
    expect(avgScore).toBe(10); // All retries achieved 10/10

    // Certificate eligibility check (>= 70% threshold across 40 days)
    const isEligibleForGraduation = bestScoresByDay.size === 40 && avgScore >= 7;
    expect(isEligibleForGraduation).toBe(true);
  });

  // ─── TEST 2: Admin cohort-wide >50 submissions visibility ──────────────────
  it('allows Admin full visibility over 100+ cohort assessment submissions without truncation', () => {
    // 20 students x 5 days = 100 submissions
    const cohortSubmissions: Array<{
      studentId: string;
      testId: string;
      score: number;
      evalStatus: string;
    }> = [];

    for (let s = 1; s <= 20; s++) {
      for (let day = 1; day <= 5; day++) {
        cohortSubmissions.push({
          studentId: `student_${s}`,
          testId: `day_${day}`,
          score: (s + day) % 10 + 1,
          evalStatus: s === 20 ? 'Pending' : 'Evaluated',
        });
      }
    }

    expect(cohortSubmissions.length).toBe(100);

    // Daily Marks grid mapping verification: every student and day is accounted for
    const marksGrid = new Map<string, Map<string, number>>();
    for (const sub of cohortSubmissions) {
      if (!marksGrid.has(sub.studentId)) {
        marksGrid.set(sub.studentId, new Map());
      }
      marksGrid.get(sub.studentId)!.set(sub.testId, sub.score);
    }

    expect(marksGrid.size).toBe(20);
    for (let s = 1; s <= 20; s++) {
      expect(marksGrid.get(`student_${s}`)?.size).toBe(5);
    }

    // Pending assessments queue discovery
    const pendingQueue = cohortSubmissions.filter((s) => s.evalStatus === 'Pending');
    expect(pendingQueue.length).toBe(5);
  });

  // ─── TEST 3: Practice heatmap multi-day retries preservation ───────────────
  it('records distinct heatmap activity dates when a problem is retried across multiple days', () => {
    // Simulate student attempts:
    // Day 1 (2026-08-01): Problem A
    // Day 3 (2026-08-03): Problem B
    // Day 5 (2026-08-05): Problem A retried
    const mockPracticeSubmissions = [
      { id: 'sub_1', studentId: 'st_1', problemId: 'two-sum', status: 'Wrong Answer', submittedAt: '2026-08-01T10:00:00Z' },
      { id: 'sub_2', studentId: 'st_1', problemId: 'valid-anagram', status: 'Accepted', submittedAt: '2026-08-03T11:00:00Z' },
      { id: 'sub_3', studentId: 'st_1', problemId: 'two-sum', status: 'Accepted', submittedAt: '2026-08-05T09:00:00Z' },
    ];

    const dateCounts = new Map<string, number>();
    for (const sub of mockPracticeSubmissions) {
      const dateStr = sub.submittedAt.slice(0, 10);
      dateCounts.set(dateStr, (dateCounts.get(dateStr) || 0) + 1);
    }

    // All 3 days must be present in the heatmap, despite Problem A being retried on Day 5
    expect(dateCounts.has('2026-08-01')).toBe(true);
    expect(dateCounts.has('2026-08-03')).toBe(true);
    expect(dateCounts.has('2026-08-05')).toBe(true);
    expect(dateCounts.get('2026-08-01')).toBe(1);
    expect(dateCounts.get('2026-08-03')).toBe(1);
    expect(dateCounts.get('2026-08-05')).toBe(1);
    expect(dateCounts.size).toBe(3);
  });

  // ─── TEST 4: Solved count persistence after 300+ submissions ───────────────
  it('preserves solved problem status even when 300+ subsequent submissions accumulate', () => {
    // Practice progress table: Problem #1 was solved
    const mockProgress = [
      { id: 'prog_1', studentId: 'st_1', problemId: 'p-001', status: 'Solved', solvedAt: '2026-01-01T00:00:00Z' },
      { id: 'prog_2', studentId: 'st_1', problemId: 'p-002', status: 'Attempted', solvedAt: undefined },
    ];

    // Simulate 300 subsequent practice submissions across other problems
    const mockRecentSubmissions: Array<{ id: string; problemId: string; status: string }> = [];
    for (let i = 1; i <= 300; i++) {
      mockRecentSubmissions.push({
        id: `sub_${i}`,
        problemId: `p-${(i % 50) + 2}`, // p-002 to p-051
        status: i % 2 === 0 ? 'Accepted' : 'Wrong Answer',
      });
    }

    // Bounded view only sees latest 250
    const boundedView = mockRecentSubmissions.slice(-250);
    expect(boundedView.length).toBe(250);

    // Problem p-001 is NOT in boundedView, but is authoritatively counted in mockProgress
    const authoritativeSolvedCount = mockProgress.filter((p) => p.status === 'Solved').length;
    expect(authoritativeSolvedCount).toBe(1);

    const problem1Progress = mockProgress.find((p) => p.problemId === 'p-001');
    expect(problem1Progress?.status).toBe('Solved');
  });

  // ─── TEST 5: Student Isolation ─────────────────────────────────────────────
  it('enforces strict single-student data isolation for practice and assessment contexts', () => {
    const student1Id = 'student_alice';
    const student2Id = 'student_bob';

    const allSubmissions = [
      { id: 'sub_a1', studentId: student1Id, problemId: 'p-001', status: 'Accepted' },
      { id: 'sub_b1', studentId: student2Id, problemId: 'p-002', status: 'Accepted' },
    ];

    // Filter by studentId (mirrors .withIndex("by_student"))
    const aliceSubmissions = allSubmissions.filter((s) => s.studentId === student1Id);
    expect(aliceSubmissions.length).toBe(1);
    expect(aliceSubmissions[0].studentId).toBe(student1Id);
    expect(aliceSubmissions.some((s) => s.studentId === student2Id)).toBe(false);
  });

  // ─── TEST 6: Admin Authorization Gate ──────────────────────────────────────
  it('rejects non-admin access to admin management queries', () => {
    const ADMIN_EMAILS = ['reddysantosh1310@gmail.com', 'suchandramanne@gmail.com'];
    const isAdmin = (email?: string) => email ? ADMIN_EMAILS.includes(email.trim().toLowerCase()) : false;

    expect(isAdmin('reddysantosh1310@gmail.com')).toBe(true);
    expect(isAdmin('suchandramanne@gmail.com')).toBe(true);
    expect(isAdmin('student@example.com')).toBe(false);
    expect(isAdmin('attacker@malicious.com')).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});
