/**
 * Centralized platform, evaluator, and rubric version constants for Kriora LMS.
 */

export const APP_VERSION = "1.3.1";
export const EVALUATOR_VERSION = "2.1.0";
export const RUBRIC_VERSION = "2026.1";

export const GRADER_MODES = {
  AI_ASSISTED: "ai-assisted",
  DETERMINISTIC: "deterministic",
  MANUAL: "manual",
  PENDING: "pending",
} as const;

export type GraderMode = typeof GRADER_MODES[keyof typeof GRADER_MODES];
