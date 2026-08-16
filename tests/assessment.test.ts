import { describe, it, expect } from 'vitest';
import { normalizeOutput } from '../src/lib/pythonRunner.ts';
import { validateDayContentPayload, isServerAuthorized } from '../convex/lms.ts';
import { EVALUATOR_VERSION, RUBRIC_VERSION } from '../src/lib/constants.ts';

describe('Assessment Scoring, Idempotency & Data Integrity Tests', () => {
  it('normalizes multiline outputs with differing line endings and trailing whitespace', () => {
    const raw1 = 'Hello World  \r\n42\r\n';
    const raw2 = 'Hello World\n42';
    expect(normalizeOutput(raw1)).toBe(normalizeOutput(raw2));
  });

  it('clamps scores strictly between 0 and maxScore', () => {
    const clampScore = (score: number, maxScore: number) => {
      return Math.min(Math.max(0, Math.round(score * 10) / 10), maxScore);
    };

    expect(clampScore(-5, 10)).toBe(0);
    expect(clampScore(12.5, 10)).toBe(10);
    expect(clampScore(8.76, 10)).toBe(8.8);
    expect(clampScore(95, 100)).toBe(95);
    expect(clampScore(105, 100)).toBe(100);
  });

  it('computes integer percentages accurately without rounding overflow', () => {
    const calcPercentage = (passed: number, total: number) => {
      if (total <= 0) return 0;
      return Math.min(100, Math.max(0, Math.round((passed / total) * 100)));
    };

    expect(calcPercentage(7, 10)).toBe(70);
    expect(calcPercentage(1, 3)).toBe(33);
    expect(calcPercentage(2, 3)).toBe(67);
    expect(calcPercentage(0, 5)).toBe(0);
    expect(calcPercentage(5, 5)).toBe(100);
  });

  it('simulates idempotent submission request token matching', () => {
    const database: any[] = [];

    const handleSubmission = (submission: {
      studentId: string;
      dayId: string;
      submissionRequestId: string;
      code: string;
      score: number;
    }) => {
      const existing = database.find(
        (s) => s.submissionRequestId === submission.submissionRequestId && s.studentId === submission.studentId
      );
      if (existing) {
        return { ...existing, idempotent: true };
      }
      const record = { ...submission, id: `sub-${database.length + 1}` };
      database.push(record);
      return { ...record, idempotent: false };
    };

    const req1 = handleSubmission({
      studentId: 'std-1',
      dayId: 'day-1',
      submissionRequestId: 'req-token-abc',
      code: 'print(1)',
      score: 10,
    });
    expect(req1.idempotent).toBe(false);
    expect(req1.id).toBe('sub-1');

    // Identical network retry
    const req2 = handleSubmission({
      studentId: 'std-1',
      dayId: 'day-1',
      submissionRequestId: 'req-token-abc',
      code: 'print(1)',
      score: 10,
    });
    expect(req2.idempotent).toBe(true);
    expect(req2.id).toBe('sub-1');
    expect(database.length).toBe(1);

    // Fresh new attempt with new requestId
    const req3 = handleSubmission({
      studentId: 'std-1',
      dayId: 'day-1',
      submissionRequestId: 'req-token-xyz',
      code: 'print(2)',
      score: 10,
    });
    expect(req3.idempotent).toBe(false);
    expect(req3.id).toBe('sub-2');
    expect(database.length).toBe(2);
  });

  it('validates centralized evaluator and rubric version constants', () => {
    expect(EVALUATOR_VERSION).toBe('2.1.0');
    expect(RUBRIC_VERSION).toBe('2026.1');
  });

  it('fails closed: server-gateway authority requires a matching CONVEX_SERVER_SECRET', () => {
    process.env.CONVEX_SERVER_SECRET = 'test-shared-secret';
    expect(isServerAuthorized('test-shared-secret')).toBe(true);
    expect(isServerAuthorized('attacker-guess')).toBe(false);
    expect(isServerAuthorized(undefined)).toBe(false);
    expect(isServerAuthorized('')).toBe(false);
    process.env.CONVEX_SERVER_SECRET = undefined;
    expect(isServerAuthorized('test-shared-secret')).toBe(false);
  });

  it('validates day content write boundary validator', () => {
    expect(() => validateDayContentPayload(null)).toThrow(/valid object/i);
    expect(() => validateDayContentPayload({})).toThrow(/at least one topic/i);
    expect(() => validateDayContentPayload({ topics: [{ title: '' }] })).toThrow(/title.*required/i);
    expect(() => validateDayContentPayload({ topics: [{ title: 'Intro' }], practice: 'not-array' })).toThrow(/array of practice/i);
    expect(() => validateDayContentPayload({ topics: [{ title: 'Intro' }], testCases: 'not-array' })).toThrow(/array of test cases/i);

    const validPayload = {
      topics: [{ title: 'Variables & Data Types', codeExamples: [{ title: 'Ex 1', code: 'x = 10' }] }],
      workedExample: { caseStudy: 'Banking System', solutionCode: 'balance = 100' },
      practice: [{ task: 'Create a loop' }],
      testCases: [{ input: '5', expected: '10' }],
    };
    expect(validateDayContentPayload(validPayload)).toBeDefined();
  });
});
