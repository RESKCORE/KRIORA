// ============================================================
// KRIORA LMS — Official Practice Problems Catalog (102 Problems)
// ============================================================

import type { PracticeProblem } from './types';
import { BASICS_PROBLEMS } from './catalog/basics';
import { VARIABLES_IO_PROBLEMS } from './catalog/variables_io';
import { CONDITIONALS_PROBLEMS } from './catalog/conditionals';
import { LOOPS_PROBLEMS } from './catalog/loops';
import { STRINGS_PROBLEMS } from './catalog/strings';
import { LISTS_PROBLEMS } from './catalog/lists';
import { TUPLES_SETS_PROBLEMS } from './catalog/tuples_sets';
import { DICTIONARIES_PROBLEMS } from './catalog/dictionaries';
import { FUNCTIONS_PROBLEMS } from './catalog/functions';
import { RECURSION_PROBLEMS } from './catalog/recursion';
import { SEARCHING_SORTING_PROBLEMS } from './catalog/searching_sorting';
import { ALGORITHMS_PROBLEMS } from './catalog/algorithms';

export const PRACTICE_PROBLEMS_CATALOG: PracticeProblem[] = [
  ...BASICS_PROBLEMS,
  ...VARIABLES_IO_PROBLEMS,
  ...CONDITIONALS_PROBLEMS,
  ...LOOPS_PROBLEMS,
  ...STRINGS_PROBLEMS,
  ...LISTS_PROBLEMS,
  ...TUPLES_SETS_PROBLEMS,
  ...DICTIONARIES_PROBLEMS,
  ...FUNCTIONS_PROBLEMS,
  ...RECURSION_PROBLEMS,
  ...SEARCHING_SORTING_PROBLEMS,
  ...ALGORITHMS_PROBLEMS,
];

export const PRACTICE_TOPICS = [
  'All',
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
] as const;

export const PROBLEMS_BY_ID = new Map<string, PracticeProblem>(
  PRACTICE_PROBLEMS_CATALOG.map((p) => [p.id, p])
);

export const PROBLEMS_BY_SLUG = new Map<string, PracticeProblem>(
  PRACTICE_PROBLEMS_CATALOG.map((p) => [p.slug, p])
);

export const PROBLEMS_BY_NUMBER = new Map<number, PracticeProblem>(
  PRACTICE_PROBLEMS_CATALOG.map((p) => [p.problemNumber, p])
);
