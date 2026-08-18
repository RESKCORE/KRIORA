<div align="center">

<img src="public/KRIORA_LOGO_2.png" alt="Kriora LMS Logo" width="96" height="96" style="border-radius: 20px; box-shadow: 0 10px 25px rgba(255, 90, 54, 0.3);" />

# Kriora LMS — Next-Generation AI-Powered Learning Management System

![Kriora LMS](https://img.shields.io/badge/Platform-Kriora_LMS-FF5A36?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)
![Convex Cloud](https://img.shields.io/badge/Database-Convex_Cloud-FFC53D?style=for-the-badge)
![Clerk Auth](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=for-the-badge&logo=clerk)
![Python 3.11 WASM](https://img.shields.io/badge/Sandbox-Pyodide_WASM-3776AB?style=for-the-badge&logo=python)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss)

**An enterprise-grade, high-density Learning Management System built for colleges, universities, and cohort-based training programs. Features automated AI code grading, in-browser Python compilation, live proctoring, realtime analytics, and batch release scheduling.**

</div>

---

## 🌟 Executive Overview

**Kriora LMS** is a full-stack educational platform engineered to provide a seamless pair-learning experience between educators and students. Designed from the ground up with modern **Base UI design tokens**, **Convex Cloud real-time reactivity**, and **Clerk Identity Authentication**, Kriora delivers high performance with zero server bottleneck by leveraging client-side WebAssembly for code execution.

---

## 🚀 Key Feature Sets

### 1. 🎓 Student Experience & Learning Workbench
- **White-Themed Marketing Landing Page**: Public-facing white-themed landing (`LandingPage.tsx`) with animated orange gradient auras, 4-phase curriculum roadmap preview, WASM sandbox demo, and a seamless Clerk **Sign In / Sign Up modal** — rendered instantly for unauthenticated visitors (no loading spinner before auth).
- **White-Themed Modern Portal**: Clean, distraction-free UI with collapsible navigation sidebar (`w-64` / `w-20` icon-only mode) and Clerk profile sync.
- **Interactive 40-Day Curriculum Roadmap**: Real-time day-by-day progression tracker with visual state indicators (Completed, In-Progress, Locked, Scored).
- **LeetCode-Inspired Python Practice Arena**:
  - **102 Original Python Problems**: Categorized across 14 curriculum topics (Basics, Variables, I/O, Conditionals, Loops, Strings, Lists, Tuples/Sets, Dictionaries, Functions, Recursion, Searching/Sorting, Algorithms).
  - **Difficulty Tiers**: Balanced across Easy (27), Medium (46), and Hard (29).
  - **Browser-Side Pyodide WASM Engine**: Instant local execution for code and public test cases with zero server compute load and 6.0s timeout watchdog protection.
  - **Public & Hidden Test Suites**: Immediate feedback on public tests, with hidden test verification on submission.
  - **Practice Activity Heatmap & Streaks**: Continuous activity heatmap derived from immutable submission timestamps, calculating daily streaks and problem solve counts.
  - **Problem Bookmarking & Filter Search**: Multi-dimensional filtering by topic, difficulty, status (Solved, Attempted, Not Attempted), and custom bookmarks.
  - **On-Demand Hints & Solutions**: Multi-tier hints and full algorithmic approaches with time/space complexity analysis unlocked on solve.
- **Sub-Tabbed Lesson Player**:
  - 📖 **Lesson Notes & Theory**: Step-by-step topic reader, learning objectives banner, structured markdown explanations, and one-click code copy tools.
  - ⚡ **Worked Case Studies**: Domain scenario modeling, Entity/Data/Operation architecture tags, algorithmic breakdowns, pseudocode, and executable Python demonstrations.
  - 💡 **Practice & Common Pitfalls**: Curated common mistakes callouts and hands-on practice task containers.
  - 💻 **Python Sandbox & Test**: Integrated developer IDE, code submission drawer, and instant grading.
- **Embedded Python 3.11 IDE (`Pyodide WASM Engine`)**:
  - Full in-browser Python execution with zero server compute load.
  - Line numbers gutter, execution millisecond timers, and tabbed console for **STDOUT Output**, **STDIN Inputs**, and **Execution History**.
- **Deterministic & AI-Assisted Assessment Engine**:
  - Auto-evaluates submissions against test cases with diffs.
  - Formatted AI feedback cards detailing score breakdowns and suggestions.
- **Dual Grader Modes**:
  - **AI-Assisted** (`ai-assisted`): Code is executed in-browser via Pyodide, then evaluated by an AI grader (Gemini → OpenRouter fallback) against the day's rubric.
  - **Deterministic** (`deterministic`): Submissions are scored purely against explicit test cases with input/output diffs — no AI involved.
  - **Manual** (`manual`): Instructor-driven evaluation for edge submissions.
  - Every submission records explicit grading metadata (`graderMode`, `graderVersion`, `rubricVersion`, `evalTimestamp`) for auditability.
- **Real Academic & Certification Transcript**:
  - Live 4-card requirement checkpoint (Daily Quiz Average, Submission Volume, Syllabus Completion, Capstone Exam).
  - Dynamic certification progress score.

---

### 2. ⚡ Admin & Instructor Command Center
- **Live Cohort & Batch Scheduling**:
  - Create and manage multi-cohort schedules with start/end dates, timing, and capacity.
  - **Day-by-Day Release Controls**: Lock or unlock specific curriculum days for entire cohorts or individual catch-up students.
- **Admin Practice Arena Management Console**:
  - **Live Submissions Monitor**: Real-time WebSocket stream of student practice attempts, runtime performance, and test results.
  - **On-Demand Student Code Inspector**: Modal inspector to inspect student Python code on demand with syntax highlighting and copy tools.
  - **Questions Catalog Inspector**: Search and review all 102 curriculum problems, test cases, and reference solutions.
- **Real Analytics Engine**:
  - Real-time aggregated statistics calculated from Convex database records (Total Students, Active Batches, Daily Quiz Averages, Evaluation Queue).
  - Multi-dimensional filtering across cohorts, dates, and score distributions.
- **Day-to-Day Marks Matrix & Submission Log**:
  - Full audit log of every student submission with input/output diffs, scores, and timestamps.
  - Complete 40-Day progression matrix table for cross-cohort comparison.
- **Real-Time Proctoring & Security Monitor**:
  - Active telemetry tracking tab switches, window blurs, and proctoring warnings during timed evaluations.
- **Autonomous AI Copilot**:
  - Formulate and broadcast announcements, analyze batch performance, and manage cohort schedules via natural language commands.
- **Course & Module Authoring**:
  - Full control over modules, curriculum days, topics, learning objectives, and custom evaluation test cases.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & UI Tokens** | Tailwind CSS v4, Base UI (`@base-ui/react`), Lucide Icons |
| **Authentication & Identity** | Clerk React (`@clerk/clerk-react`) with Google OAuth |
| **Backend & Realtime Database** | Convex Cloud (`convex/react`, real-time WebSocket sync) |
| **Code Execution Engine** | Pyodide WebAssembly (Python 3.11 in-browser runtime) |
| **AI Evaluation & Copilot** | Google Gemini + OpenRouter fallback via direct REST (`generateAIWithFallback`) |
| **Server & API Bundler** | Express.js, TypeScript, Esbuild |

---

## 📁 Repository Directory Structure

```
Kriora/
├── api/                        # Vercel serverless entrypoint (exports the Express app)
│   └── index.ts
├── convex/                     # Convex Cloud backend schema & functions
│   ├── auth.config.ts          # Clerk authentication integration
│   ├── lms.ts                  # Core LMS mutations, queries, and proctoring
│   ├── schema.ts               # Database table schemas & indexes
│   └── _generated/             # Type-safe API bindings generated by Convex
│
├── scripts/
│   └── bundle-check.mjs        # CI bundle-size gate (client chunk budget)
├── tests/                      # Vitest suites (auth, API, assessment, serverless boot)
├── .github/workflows/ci.yml    # CI: typecheck → tests → build
│
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx     # Public white-themed marketing landing + auth modal
│   │   ├── AdminPortal.tsx     # Admin dashboard, analytics, marks matrix & copilot
│   │   ├── StudentPortal.tsx   # Student dashboard, syllabus, & lesson player
│   │   ├── PythonCompiler.tsx  # Developer IDE sandbox (Pyodide WASM runtime)
│   │   ├── TutorDrawer.tsx     # AI companion chat drawer for students
│   │   ├── ErrorBoundary.tsx   # Root error boundary
│   │   └── ui/                 # Reusable Base UI components
│   │       ├── card.tsx, badge.tsx, button.tsx, table.tsx, avatar.tsx...
│   │       └── admin-shared.tsx # KPI StatCards, PageHeaders, StatusPills
│   │
│   ├── lib/
│   │   ├── constants.ts        # Central APP/EVALUATOR/RUBRIC version constants
│   │   ├── pythonRunner.ts     # Client-side Pyodide WASM runner & fallback
│   │   └── utils.ts            # Class merging and string formatting utilities
│   │
│   ├── App.tsx                 # Root router & role-based authentication gate
│   ├── main.tsx                # Application bootstrap with Clerk & Convex Providers
│   └── types.ts                # Master TypeScript interface definitions
│
├── server.ts                   # Express server for AI evaluation & compiler endpoints
├── vercel.json                 # Vercel rewrite + serverless function routing
├── index.html                  # Main application HTML entry point
└── package.json                # Project dependencies & build scripts
```

---

## ⚙️ Setup & Local Development

### 1. Prerequisites
- **Node.js**: v18.0.0, v20.x, v22.x, or v24.x
- **npm** (or compatible package manager)
- **Convex Cloud** account ([convex.dev](https://convex.dev))
- **Clerk Authentication** account ([clerk.com](https://clerk.com))
- Google Gemini or OpenRouter API key for server AI features

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/reskcore/Kriora.git
cd Kriora

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```env
# ── Public Frontend Variables (Bundled with Vite) ──
VITE_CONVEX_URL="https://your-convex-deployment.convex.cloud"
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."

# ── Private Server & Deployment Secrets (Never exposed to client bundles) ──
CONVEX_DEPLOYMENT="dev:your-convex-deployment"
CONVEX_URL="https://your-convex-deployment.convex.cloud"
CLERK_SECRET_KEY="sk_test_..."
GEMINI_API_KEY="AIzaSy..."
OPENROUTER_API_KEY="sk-or-..."

# Server-to-Convex shared secret — MUST be set here AND in the Convex
# deployment env vars. Without it, the serverless gateway cannot perform
# admin/student operations on behalf of verified sessions (fail-closed).
CONVEX_SERVER_SECRET="generate_a_long_random_string"

# Admin Email Allowlist (comma-separated)
ADMIN_EMAILS="reddysantosh1310@gmail.com,suchandramanne@gmail.com"
```

### 4. Running Locally & Testing
```bash
# Run unit & integration test suite (Vitest)
npm test

# Start local development server (Vite + Express backend)
npm run dev

# In a separate terminal, start Convex backend watcher
npm run convex:dev
```
Open `http://localhost:3000` in your browser.

### 5. Production Build & Quality Gates
```bash
npm run build
```
`npm run build` runs: Vite production build → **client bundle budget gate** (`scripts/bundle-check.mjs`, 684 KiB budget) → serverless Express bundle (`dist/server.cjs`). CI (`.github/workflows/ci.yml`) runs `tsc --noEmit`, the full Vitest suite, and the build on every push/PR. The test suite also includes a **serverless boot smoke test** that bundles `api/index.ts` and verifies `/api/health` and `/api/readiness` respond on a clean import (no Vite/port startup on the serverless path).

---

## 📈 Concurrency & Scalability Analysis (Measured & Estimated)

### 1. Architectural Model
Unlike platforms that spin up server-side Docker containers for each student's code execution, **Kriora runs Python directly inside each student's browser using Pyodide WebAssembly (WASM)**.
- **Zero Server CPU load** for running Python student code.
- **Zero Server RAM load** during interactive coding labs.
- **Client-Side Execution Isolation**: Practice and immediate feedback run in a secure, sandboxed browser environment.

---

### 2. Capacity Profile (Estimated & Tier-Based)

> [!NOTE]
> No production load tests have been run on a live deployment yet. All concurrency numbers below are **tier-based engineering estimates** derived from serverless stateless scaling and the client-side WASM execution model — not measured values.

| Deployment Tier | Estimated Simultaneous Students | Concurrency Limiters & Notes |
|---|---|---|
| **Vercel Hobby + Convex Free** *(Estimated)* | **1,000 – 2,500 students** | • Static assets & WASM served globally via Vercel Edge CDN.<br>• 100 concurrent Serverless Function executions.<br>• Convex free tier supports up to 1,000 concurrent WebSocket connections. |
| **Vercel Pro + Convex Team** *(Estimated)* | **15,000 – 30,000+ students** | • 1,000 concurrent serverless executions with automatic instant scaling.<br>• Unlimited global edge CDN bandwidth.<br>• Convex Team tier handles 10,000+ concurrent realtime WebSocket connections. |
| **Enterprise Multi-Region** *(Aspirational Architecture)* | **100,000+ students** | • Auto-scaling serverless edge compute with dedicated Convex database clustering. |

---

## 🩺 System Observability & Health Endpoints

| Endpoint | Method | Purpose | Response Format |
|---|---|---|---|
| `/api/health` | `GET` | **Liveness Probe**: Confirms server process is running and responsive | `{ "status": "ok", "version": "1.3.1", "timestamp": "...", "requestId": "..." }` |
| `/api/readiness` | `GET` | **Readiness Probe**: Verifies presence of Convex database and AI provider configuration | `{ "status": "ready", "dependencies": { "convexConfigured": true, "aiConfigured": true, ... } }` |

---

## 🔒 Security & Assessment Integrity Architecture
- **Server-Authoritative Authorization**: Privileged administrator queries and mutations derive authority **strictly from verified Clerk session identities** (`ctx.auth.getUserIdentity()`), never from a caller-supplied email. The serverless gateway authenticates to Convex via a shared `CONVEX_SERVER_SECRET`; unauthenticated calls without a matching secret are **fail-closed** (rejected).
- **No Client Secrets**: Zero AI provider API keys are bundled or read in the client browser bundle.
- **Dual Grader Mode**: Pyodide handles instant student practice; authoritative assessment submissions record explicit grading metadata (`graderMode`, `graderVersion`, `rubricVersion`, `evalTimestamp`).
- **Duplicate Protection**: Assessment submissions support idempotent request tokens (`submissionRequestId`) backed by a `by_request_id` database index — retries of the same logical attempt return the existing result instead of double-submitting.
- **Score Integrity**: All scores are clamped server-side to `[0, maxScore]` and percentages to `[0, 100]` in both the Express gateway and Convex mutations/actions.
- **Integrity Telemetry**: Tracks student browser tab switches and visibility changes during graded tests with instant notification alerts.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
