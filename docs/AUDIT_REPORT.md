# Kriora LMS — End-to-End Security & Robustness Audit

**Date:** 2026-08-16
**Repo:** https://github.com/reskcore/Kriora.git
**Audit scope:** Serverless gateway boot & probes · Auth & secrets · Assessment idempotency & scoring · Frontend flow (Landing Page) · A11y/Performance/Build.
**Method:** Static review + code tracing + automated verification. Live Vercel/Convex/Clerk verification is **not possible from this environment** (no `vercel` CLI, no `.vercel/`, no `convex.json`, no Convex deployment auth) — items requiring a live deployment are explicitly labeled **pending staging verification**.

---

## Evidence

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ exit 0 |
| `npm test` (Vitest) | ✅ 4 files / **22 tests passed** (auth, api, assessment, serverless boot) |
| `npm run build` | ✅ Vite build + **bundle gate 636.2 KiB / 684 KiB budget (7 chunks)** + `dist/server.cjs` |
| Secret scan of built client chunks | ✅ No `CLERK_SECRET_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `sk_live_`/`sk_test_`, `dotenv`, `process.env`, `@clerk/express` |
| Serverless boot (local, 3 shapes) | ✅ `/api/health`→200, `/api/readiness`→ready, `/`→404, `/api`→404; no import-time Vite/port startup |

---

## Pass / Fail Summary

| # | Vector | Verdict |
|---|--------|---------|
| 1 | Serverless gateway boots isolated on import (no side effects) | ✅ PASS |
| 2 | Health/readiness probes respond without secrets | ✅ PASS |
| 3 | Dev auth bypass impossible in production | ✅ PASS |
| 4 | **Admin/student authority derives strictly from Clerk identity, never caller-supplied email** | ❌ **FAIL (fixed)** |
| 5 | Idempotent submissions via stable `submissionRequestId` + index | ✅ PASS |
| 6 | Scores clamped to `[0, maxScore]`, percentages to `[0, 100]` | ✅ PASS |
| 7 | Centralized `EVALUATOR_VERSION` / `RUBRIC_VERSION` constants | ✅ PASS (minor fix) |
| 8 | Unauthenticated visitors see the white-themed Landing Page | ✅ PASS |
| 9 | Lazy-loaded portals, bundle budget gate, CI, no client secrets | ✅ PASS |

---

## Line-Level Findings

### 1. Serverless Gateway Boot — PASS
- `api/index.ts` re-exports the Express app; `vercel.json` rewrites `/api/(.*)` → `/api` and `/(.*)` → `/index.html`.
- `isDirectExecution` guard in `server.ts` returns false when `VERCEL=1`, `NOW_REGION`, or `AWS_LAMBDA_FUNCTION_NAME` is set, so the listener never binds on serverless. Verified by `tests/serverless.test.ts`, which bundles `api/index.ts` (esbuild, packages external) into `dist/api-serverless-smoke.cjs`, boots it in a child process, and asserts `/api/health` = 200 and `/api/readiness` ∈ [200, 503].

### 2. Health & Readiness Probes — PASS
- `/api/health` (`server.ts`) returns `{ status: "ok", version: APP_VERSION }` with no env access. `/api/readiness` reflects `convexConfigured` / `aiConfigured` truthfully (green = at least one provider key present). Both covered by `tests/api.test.ts`.

### 3. Dev Auth Bypass — PASS
- `verifyUserSession` (`server.ts:523-540`) returns a dev session **only** when `NODE_ENV === 'development'` **and** `ALLOW_DEV_AUTH_BYPASS === 'true'`, and short-circuits to `false` on `VERCEL` / `NOW_REGION` / `AWS_LAMBDA_FUNCTION_NAME`. `.env.example` documents both variables as local-dev-only. Enforced by the VERCEL-guard test and the production-mode 401 tests.

### 4. Convex Authorization — FAIL → FIXED ✅
- **Before:** `requireAdmin`, `resolveAuthenticatedStudent`, `findStudentByIdentity`, and `bindClerkIdentityToStudent` (`convex/lms.ts`) resolved identity as `identity?.email || fallbackEmail`. With no Clerk identity (direct `ConvexHttpClient` or raw HTTPS against the public Convex endpoint), any caller could pass an admin's email as `actorEmail` and obtain admin authority on every `requireAdmin` mutation (announcements, batch/day release, grading, student status) or read/impersonate any student.
- **Fix (fail-closed):**
  - Added `isServerAuthorized(serverSecret)` — valid only when the arg matches `process.env.CONVEX_SERVER_SECRET` and that env var is set.
  - All four auth helpers now reject identity-less `fallbackEmail` calls unless a valid server secret is supplied.
  - `getMyStudentContext`, `getCourseMetadata`, `getDayContent`, `saveDayContent` accept an optional `serverSecret` and thread it through; admin determination in `getCourseMetadata`/`getDayContent` no longer trusts `actorEmail` without identity or secret.
  - The serverless gateway (`server.ts:604,610,709,720,771`) now sends `serverSecret: process.env.CONVEX_SERVER_SECRET` on its five Convex calls. Browser calls are unaffected (identity always present via `ConvexProviderWithClerk`).
  - `.env.example` documents that `CONVEX_SERVER_SECRET` must be set in both the server (Vercel) env and the Convex deployment env; without it the gateway is **fail-closed**, not open.
- **Coverage:** new test `isServerAuthorized` (matches, mismatch, missing, empty, unset-env) in `tests/assessment.test.ts`.
- ⚠️ **Pending staging verification:** deploy Convex functions, set `CONVEX_SERVER_SECRET` in both envs, confirm gateway admin-content generation succeeds and raw unauthenticated `saveDayContent`/`createAnnouncement` calls are rejected (HTTP 401) against a real deployment.

### 5. Assessment Idempotency — PASS
- `submitAssessmentCode` (`convex/lms.ts:794-814`) dedups on `submissionRequestId` via the `by_request_id` index (`convex/schema.ts:158`) and returns the existing result with `idempotent: true` for the same student+request token.
- Client generates one stable token per logical attempt in `submitAssessment` (`StudentPortal.tsx:196`) — preserved across the Convex→gateway→mutation retry chain, regenerated on a fresh submit. This matches the audit requirement.
- Live duplicate-submission behavior (two racing calls → one row) requires a real Convex deployment: **pending staging verification**.

### 6. Score Clamping — PASS
- Express `/api/lms/evaluate-test`: `maxScore` sanitized to `[1,100]` (`server.ts:420`), `score` clamped `[0, maxScore]` (:476), `percentage` clamped `[0,100]` (:479).
- Convex `evaluateAssessment` action: `score` clamped `[0, maxScore]` (`lms.ts:1643`).
- Convex `submitAssessmentCode` mutation: `score` clamped `[0, maxScore]`, `percentage` `[0,100]` (`lms.ts:840-841`). Negative / over-max / float-rounding paths covered in `tests/assessment.test.ts`.

### 7. Version Constants — PASS (minor fix)
- `src/lib/constants.ts` centralizes `EVALUATOR_VERSION = "2.1.0"` and `RUBRIC_VERSION = "2026.1"` (asserted by test). StudentPortal previously hardcoded `"2.1.0"`/`"2026.1"` as fallbacks; now imports the constants (`StudentPortal.tsx:23,259-260`).

### 8. Frontend Landing Flow — PASS
- `App.tsx:233-235`: any unauthenticated visitor renders `<LandingPage />` immediately (no spinner before auth). Landing page is white-themed with animated orange gradient auras, sticky nav, hero CTA, WASM sandbox demo, 4-phase curriculum preview, and a Clerk `<SignIn/>`/`<SignUp/>` modal (`LandingPage.tsx:448-487`) with an `aria-label` on the close button.
- `AuthScreen.tsx` is **dead code** (tracked, imported nowhere) — candidate for deletion.

### 9. A11y / Performance / Build — PASS
- Portals and TutorDrawer lazy-loaded with `Suspense` + `PortalLoading` fallback (`App.tsx:13-15,302,459`).
- Bundle gate `scripts/bundle-check.mjs` (684 KiB budget) wired into `npm run build` and CI.
- CI `.github/workflows/ci.yml`: `npm ci` → `tsc --noEmit` → `npm test` → `npm run build` on Node 22 (push to main + PRs).
- A11y spot-checks pass (form labels, `aria-label` on icon buttons, focus-visible rings in `src/index.css`); a full axe/lighthouse pass is **pending a live deploy**.

---

## Residual Risks / Pending Live Verification
1. **Convex auth hardening** must be validated against a real deployment (see §4).
2. **Rate limiting** is in-memory per instance (`rateLimit` in server.ts) — accurate only for a single serverless instance; acceptable because auth is now mandatory on all AI endpoints.
3. **Duplicate-submission dedup** requires a live Convex deploy to observe under concurrent requests.
4. **LandingPage a11y** (color contrast on orange gradient text, keyboard nav) needs a browser audit on a deployed URL.

## What Changed in This Audit
- `convex/lms.ts` — fail-closed auth helpers + `serverSecret` on the 4 gateway-called functions.
- `server.ts` — passes `CONVEX_SERVER_SECRET` on all gateway Convex calls.
- `src/components/StudentPortal.tsx` — uses central version constants.
- `tests/assessment.test.ts` — new `isServerAuthorized` test.
- `.env.example`, `README.md` — document `CONVEX_SERVER_SECRET`.
