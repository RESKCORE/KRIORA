# Convex Migration Report

Kriora LMS — final report for making Convex the canonical database.

## Summary

All persistence now lives in Convex. The express REST API (`server.ts`) is the only
application-layer entry point, and it reads/writes Convex — the legacy
`data-store.json` and the static `src/curriculum.ts` syllabus are no longer the
source of runtime data. The REST contract is unchanged, so the React frontend
(StudentPortal / AdminPortal) needed no portal-level rewrite.

## Architecture

```
React frontend  →  express REST API (server.ts)  →  Convex (local dev deployment)
                                                        ^ legacy disk store = fallback seed only
```

- **`convex/schema.ts`** — 17 tables, all `v.any()`. `src/types.ts` is the contract,
  not Convex validation (`ponytail:`).
- **`convex/lms.ts`** — two primitives only:
  - `getState` — aggregates every collection in one query.
  - `saveCollection` — atomic per-entity clear + re-insert.
- **`server.ts`** — `loadState()`/`saveState()` wrap those primitives with a
  JSON-diff snapshot (`lastSnapshot`), so `saveState` writes only the collections a
  request actually changed. Falls back to the disk store only if Convex is
  unreachable. `getLMSState` strips `caseStudyVariants`/`assessmentInstances` so
  the student browser never sees the pool or other students' assignments.
- **`scripts/migrate.ts`** — one-time seed: builds the 40-day course from
  `PYTHON_MASTERY_DAYS` (deterministic ids `day-N`, `day-N-topic-M`), validates
  (40 days, phases, day titles, payload <900KB), and seeds Convex idempotently
  (re-running skips already-seeded collections).

## What was migrated

| Collection | Source | Rows |
|---|---|---|
| courses | curriculum.ts (40 days, 9 modules, 239 topics, 453KB) | 1 |
| students | data-store.json | 1 |
| auditLogs | data-store.json | 1 |
| config | data-store.json (+ `INITIAL_CONFIG` merge) | 1 |
| caseStudyVariants | curriculum per-day personalizedTest + data-store.json OOP pool | 45 (40/day + 5 OOP) |
| everything else | empty (fresh tables) | 0 |

Config is stored as a 1-doc array and unwrapped (`raw.config[0]`) in `buildState`.
Course payload 453.3 KB is under Convex's 1 MB doc limit.

## Files changed

- `convex/schema.ts` — rewritten (17-table model).
- `convex/lms.ts` — rewritten (`getState`/`saveCollection`), strips `_id`/`_creationTime`
  on re-insert.
- `server.ts` — Convex-backed `loadState`/`saveState`, `buildState`, all 39 handler
  call sites converted to `await loadState()`/`await saveState(state)`, removed
  `if (convex)` branches, loads `.env.local` so `CONVEX_URL` is actually seen.
- `src/types.ts` — `DayContent`, `WorkedExampleContent`, `CourseDay.content`.
- `src/curriculum.ts` — added `PYTHON_MASTERY_DAYS` export (migration seed only).
- `src/components/StudentPortal.tsx` — renders day-level content (opener, objectives,
  common mistakes, worked example with algorithm/pseudocode/solution/variations,
  practice tasks) and the day's own case study when no pool variant is assigned.
- `scripts/migrate.ts` — new.
- `tsconfig.json` — fixed `@/*` → `./src/*`, added `vite/client`.

## Verification

- `npx tsc --noEmit` — clean.
- `npm run build` — passes.
- Migration idempotent (re-run writes 0 collections).
- 14-step E2E flow against the live API, each verified persisted in Convex:
  register → approve → batch → enroll → release day → progress → test submit →
  grade → attendance → session start/event/submit → assessment current →
  certification. All writes landed in Convex; `data-store.json` untouched.
- `/api/lms/state` serves 40 days; Day 1 = "Introduction to Python" with full
  worked example (7 objectives, 5 practice items, personalized test, `d1` key).

## Deviations from the spec

1. **Day 25 mismatch.** The spec claims "Day 25 = OOP Fundamentals". The actual
   syllabus (`curriculum.ts`, transcribed verbatim) has **Day 25 = JSON Data**;
   OOP is Days 18–20 (Module 4), and **Day 40 = Final Master Exam and Course Review**,
   not "Capstone Project". The curriculum was migrated as-is; the spec's claims do
   not match the source document.
2. **`/api/admin/approve-student` is a placeholder** — returns `{ success: true }`
   (email-integration stub). Real approval goes through `students/action`
   `action: 'approve'`. Unchanged, pre-existing.

## Known gaps (honest state)

- **Auth**: no server-side auth. Clerk is client-side only; every admin endpoint
  is callable directly. Pre-existing, documented in `server.ts`, unchanged.
- **Personalized case-study variants**: `scripts/migrate.ts` now materializes one
  assignable variant per day (keyed `d1`–`d40`) from each day's authored
  `personalizedTest` (title from day title, scenario/requirements from the syllabus,
  objectives from day content; difficulty/rubric/marks/timeMinutes are mechanical).
  Merged per-key with the 5-variant OOP pool → 45 total. `assessments/current`
  returns a real variant (verified: Day 1 → "Case Study — Introduction to Python").
- **`import.meta` warning** in the cjs `dist/server.cjs` build (pre-existing;
  dev uses `tsx` ESM).
- **Enrollment model**: `enroll` sets `student.batchId`; batch docs don't hold
  `studentIds` — membership is derived from students. Intentional, matches frontend.
- **Cloud deployment** (`veracious-hornet-741`) needs `npx convex login`; current
  data lives in the local deployment at `http://127.0.0.1:3210`.

## Run

```bash
npx convex dev &        # Convex local deployment (watches convex/)
npx tsx scripts/migrate.ts   # one-time seed (idempotent)
npm run dev             # tsx server.ts on :3000  →  vite on :5173
```
