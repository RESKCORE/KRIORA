# Kriora LMS — Robustness Baseline & Rollback Point

## Baseline Record

- **Date Recorded**: 2026-08-16
- **Baseline Git Commit**: `979e852d341e865b7d6076e7e6807246412bce78`
- **Branch**: `main`
- **Node Version**: `v24.15.0` (Vercel target compatibility: Node 20.x / 22.x / 24.x)
- **npm Version**: `11.12.1`
- **Package Manager**: npm (lockfile `package-lock.json` present)
- **Build Tool**: Vite v6.2.3 + esbuild v0.25.0
- **UI Framework**: React 19.0.1 + Tailwind CSS v4.1.14

## Environment Variables Inventory

| Variable Name | Category | Scope | Baseline Presence |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | AI Secret | Server | Present in `.env.local` |
| `OPENROUTER_API_KEY` | AI Secret | Server | Present in `.env.local` |
| `VITE_GEMINI_API_KEY` | AI Secret (To be removed from client) | Public (Vite) | Present in `.env.local` (Risk: exposed to browser) |
| `VITE_OPENROUTER_API_KEY` | AI Secret (To be removed from client) | Public (Vite) | Present in `.env.local` (Risk: exposed to browser) |
| `CONVEX_DEPLOYMENT` | Database Secret | Server / Deploy | Present in `.env.local` |
| `VITE_CONVEX_URL` | Convex Cloud URL | Public (Vite) | Present in `.env.local` |
| `CONVEX_URL` | Convex Cloud URL | Server | Present in `.env.local` |
| `ADMIN_EMAILS` | Admin Allowlist | Server | Present in `.env.local` |
| `CLERK_SECRET_KEY` | Auth Secret | Server | Present in `.env.local` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Auth Public Key | Public (Vite) | Present in `.env.local` |

## Verified Baseline Functionality & Known Defects

### 1. Build Verification
- Running `npm run build` generates `dist/index.html`, `dist/assets/*`, and `dist/server.cjs`.

### 2. Known Critical Defects
- **Vercel Serverless Function Crash (`500 FUNCTION_INVOCATION_FAILED`)**:
  - `server.ts` ran top-level code calling `startServer()`, which spawned Vite dev middleware and bound to port 3000 during Vercel serverless cold start / module import.
  - Express app instance and standalone dev server were tightly coupled in `server.ts`.
- **Frontend Infinite Hang**:
  - In `src/App.tsx`, if the Convex reactive query was pending or network was slow, the application displayed `Connecting to Kriora Serverless Backend...` indefinitely without a timeout or retry button.
- **Client-Side Secret Exposure**:
  - `src/App.tsx` and `src/components/AdminPortal.tsx` contained direct browser calls to `generativelanguage.googleapis.com` with `VITE_GEMINI_API_KEY`.
- **Authorization Bypass Risk**:
  - Convex functions and Express handlers relied on client-supplied `actorEmail` rather than verifying Clerk session subjects server-side.
- **AI Action Auto-Publishing**:
  - Admin Copilot could auto-publish announcements without an explicit draft/confirmation modal or button.

## Rollback Point
- Rollback commit hash: `979e852d341e865b7d6076e7e6807246412bce78`
- If any phase requires a rollback, checkout this commit or revert the corresponding phase commit.
