import { PRACTICE_PROBLEMS_CATALOG } from './catalog';
import type { PracticeProblem } from './types';

export interface ValidationReport {
  isValid: boolean;
  totalProblems: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  topicsDistribution: Record<string, number>;
  errors: string[];
}

export function validatePracticeCatalog(problems: PracticeProblem[] = PRACTICE_PROBLEMS_CATALOG): ValidationReport {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const seenNumbers = new Set<number>();
  const seenSlugs = new Set<string>();

  let easyCount = 0;
  let mediumCount = 0;
  let hardCount = 0;
  const topicsDistribution: Record<string, number> = {};

  if (problems.length < 100) {
    errors.push(`Problem count must be at least 100, found ${problems.length}`);
  }

  problems.forEach((p, idx) => {
    const loc = `Problem #${p.problemNumber || idx + 1} (${p.title || 'Untitled'})`;

    if (!p.id) errors.push(`${loc}: Missing ID`);
    if (seenIds.has(p.id)) errors.push(`${loc}: Duplicate ID '${p.id}'`);
    seenIds.add(p.id);

    if (!p.problemNumber || p.problemNumber < 1) errors.push(`${loc}: Invalid problem number`);
    if (seenNumbers.has(p.problemNumber)) errors.push(`${loc}: Duplicate problem number '${p.problemNumber}'`);
    seenNumbers.add(p.problemNumber);

    if (!p.slug) errors.push(`${loc}: Missing slug`);
    if (seenSlugs.has(p.slug)) errors.push(`${loc}: Duplicate slug '${p.slug}'`);
    seenSlugs.add(p.slug);

    if (!['Easy', 'Medium', 'Hard'].includes(p.difficulty)) {
      errors.push(`${loc}: Invalid difficulty '${p.difficulty}'`);
    } else {
      if (p.difficulty === 'Easy') easyCount++;
      if (p.difficulty === 'Medium') mediumCount++;
      if (p.difficulty === 'Hard') hardCount++;
    }

    if (!p.topic || typeof p.topic !== 'string') {
      errors.push(`${loc}: Invalid topic`);
    } else {
      topicsDistribution[p.topic] = (topicsDistribution[p.topic] || 0) + 1;
    }

    if (!p.title || !p.title.trim()) errors.push(`${loc}: Missing title`);
    if (!p.description || !p.description.trim()) errors.push(`${loc}: Missing description`);
    if (!p.inputFormat || !p.inputFormat.trim()) errors.push(`${loc}: Missing inputFormat`);
    if (!p.outputFormat || !p.outputFormat.trim()) errors.push(`${loc}: Missing outputFormat`);
    if (!p.constraints || !p.constraints.trim()) errors.push(`${loc}: Missing constraints`);
    if (!p.starterCode || !p.starterCode.trim()) errors.push(`${loc}: Missing starterCode`);

    if (!Array.isArray(p.examples) || p.examples.length === 0) {
      errors.push(`${loc}: Must have at least 1 example`);
    }

    if (!Array.isArray(p.publicTestCases) || p.publicTestCases.length === 0) {
      errors.push(`${loc}: Must have at least 1 public test case`);
    }

    if (!p.solution || !p.solution.code || !p.solution.approach) {
      errors.push(`${loc}: Missing reference solution or approach`);
    }
  });

  return {
    isValid: errors.length === 0,
    totalProblems: problems.length,
    easyCount,
    mediumCount,
    hardCount,
    topicsDistribution,
    errors,
  };
}
