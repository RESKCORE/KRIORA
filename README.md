# Kriora LMS — Next-Generation AI-Powered Learning Management System

<div align="center">

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

**Kriora LMS** is a full-stack educational platform engineered to provide a seamless pair-learning experience between educators and students. Designed from the ground up with modern **shadcn/ui design tokens**, **Convex Cloud real-time reactivity**, and **Clerk Identity Authentication**, Kriora delivers high performance with zero server bottleneck by leveraging client-side WebAssembly for code execution.

---

## 🚀 Key Feature Sets

### 1. 🎓 Student Experience & Learning Workbench
- **White-Themed Modern Portal**: Clean, distraction-free UI with collapsible navigation sidebar (`w-64` / `w-20` icon-only mode) and Clerk profile sync.
- **Interactive 40-Day Curriculum Roadmap**: Real-time day-by-day progression tracker with visual state indicators (Completed, In-Progress, Locked, Scored).
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
- **Real Academic & Certification Transcript**:
  - Live 4-card requirement checkpoint (Daily Quiz Average, Submission Volume, Syllabus Completion, Capstone Exam).
  - Dynamic certification progress score.

---

### 2. ⚡ Admin & Instructor Command Center
- **Live Cohort & Batch Scheduling**:
  - Create and manage multi-cohort schedules with start/end dates, timing, and capacity.
  - **Day-by-Day Release Controls**: Lock or unlock specific curriculum days for entire cohorts or individual catch-up students.
- **Real Analytics Engine**:
  - Real-time aggregated statistics calculated from Convex database records (Total Students, Active Batches, Daily Quiz Averages, Evaluation Queue).
  - Multi-dimensional filtering across cohorts, dates, and score distributions.
- **Day-to-Day Marks Matrix & Submission Log**:
  - Full audit log of every student submission with input/output diffs, scores, and timestamps.
  - 15+ Day progression matrix table for cross-cohort comparison.
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
| **Styling & UI Tokens** | Tailwind CSS v4, Radix UI Primitives, Lucide Icons |
| **Authentication & Identity** | Clerk React (`@clerk/clerk-react`) with Google OAuth |
| **Backend & Realtime Database** | Convex Cloud (`convex/react`, real-time WebSocket sync) |
| **Code Execution Engine** | Pyodide WebAssembly (Python 3.11 in-browser runtime) |
| **AI Evaluation & Copilot** | Google Gemini 2.5/3.5 Flash API via `@ai-sdk/openai` |
| **Server & API Bundler** | Express.js, TypeScript, Esbuild |

---

## 📁 Repository Directory Structure

```
Kriora/
├── convex/                     # Convex Cloud backend schema & functions
│   ├── auth.config.ts          # Clerk authentication integration
│   ├── lms.ts                  # Core LMS mutations, queries, and proctoring
│   ├── schema.ts               # Database table schemas & indexes
│   └── _generated/             # Type-safe API bindings generated by Convex
│
├── src/
│   ├── components/
│   │   ├── AdminPortal.tsx     # Admin dashboard, analytics, marks matrix & copilot
│   │   ├── StudentPortal.tsx   # Student dashboard, syllabus, & lesson player
│   │   ├── PythonCompiler.tsx  # Developer IDE sandbox (Pyodide WASM runtime)
│   │   ├── TutorDrawer.tsx     # AI companion chat drawer for students
│   │   └── ui/                 # Reusable shadcn/ui components
│   │       ├── card.tsx, badge.tsx, button.tsx, table.tsx, avatar.tsx...
│   │       └── admin-shared.tsx # KPI StatCards, PageHeaders, StatusPills
│   │
│   ├── lib/
│   │   ├── pythonRunner.ts     # Client-side Pyodide WASM runner & fallback
│   │   └── utils.ts            # Class merging and string formatting utilities
│   │
│   ├── App.tsx                 # Root router & role-based authentication gate
│   ├── main.tsx                # Application bootstrap with Clerk & Convex Providers
│   └── types.ts                # Master TypeScript interface definitions
│
├── server.ts                   # Express server for AI evaluation & compiler endpoints
├── index.html                  # Main application HTML entry point
└── package.json                # Project dependencies & build scripts
```

---

## ⚙️ Setup & Local Development

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun**
- Free **Convex Cloud** account ([convex.dev](https://convex.dev))
- Free **Clerk** account ([clerk.com](https://clerk.com))

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/kriora.git
cd kriora

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```env
# Convex Database
VITE_CONVEX_URL="https://your-convex-deployment.convex.cloud"
CONVEX_DEPLOYMENT="dev:your-convex-deployment"

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Google Gemini AI
GEMINI_API_KEY="AIzaSy..."
```

### 4. Running Locally
```bash
# Start local development server (Vite + Express backend)
npm run dev

# In a separate terminal, start Convex backend watcher
npm run convex:dev
```
Open `http://localhost:3000` in your browser.

### 5. Production Build
```bash
npm run build
```

---

## 📈 Concurrency & Scalability Analysis on Vercel

If you deploy **Kriora LMS** to [Vercel](https://vercel.com), here is a complete technical capacity breakdown of how many students can access the platform simultaneously:

### 1. Why Kriora Scales Exceptionally Well
Unlike traditional platforms that run Docker containers on the server for each student's code execution, **Kriora runs Python directly inside each student's browser using Pyodide WebAssembly (WASM)**.
- **Zero Server CPU load** for running Python scripts.
- **Zero Server RAM load** during coding labs.
- **10,000 students running Python code concurrently** consume **0 MB of server memory**.

---

### 2. Tier-by-Tier Capacity Estimates

| Deployment Tier | Simultaneous Active Students | Concurrency Limiters & Notes |
|---|---|---|
| **Vercel Hobby (Free)** | **1,000 – 2,500 students** | • Static assets & WASM served globally via Vercel Edge CDN.<br>• 100 concurrent Serverless Function executions.<br>• Convex free tier supports up to 1,000 concurrent WebSocket connections. |
| **Vercel Pro ($20/mo) + Convex Team** | **15,000 – 30,000+ students** | • 1,000 concurrent serverless executions with automatic instant scaling.<br>• Unlimited global edge CDN bandwidth.<br>• Convex Team tier handles 10,000+ concurrent realtime WebSocket connections. |
| **Enterprise (Multi-Region)** | **100,000+ students** | • Auto-scaling serverless edge compute with custom Convex capacity. |

---

### 3. Component Concurrency Breakdown

```
[ 50,000+ Concurrent Students ]
               │
               ▼
   [ Vercel Edge Network CDN ]  ──> Delivers React HTML/JS/CSS & Pyodide WASM (Handles 100k+ req/sec)
               │
      ┌────────┴──────────────────────────┐
      ▼                                   ▼
[ Client Browsers ]              [ Clerk Auth Cloud ]
• Runs Python Code in WASM       • Handles 100,000+ concurrent sessions
• 0 Server CPU / 0 Server RAM    • Google OAuth token verification
      │
      ▼
[ Convex Cloud Realtime Engine ]
• Realtime WebSocket subscriptions
• Auto-scales database queries & transactions
```

1. **Frontend Asset Delivery (Vercel CDN)**:
   - All React components, images, and WASM binaries are cached on Vercel's global Anycast Edge Network.
   - Capable of serving **50,000+ page visits per second**.
2. **Realtime Database (Convex Cloud)**:
   - Uses persistent WebSocket connections with automatic diff replication.
   - Hobby plan: ~1,000 active realtime listeners.
   - Pro/Team plan: 10,000 to 50,000+ active realtime connections.
3. **AI Evaluations (Gemini API)**:
   - Asynchronous serverless calls with rate limiting. Handled smoothly across batch submissions.

---

## 🔒 Security & Proctoring Architecture
- **JWT Identity Binding**: All database mutations require authenticated Clerk session tokens with email verification.
- **Deterministic Evaluation**: Client-side execution isolation prevents arbitrary remote code execution (RCE) vulnerabilities.
- **Integrity Telemetry**: Tracks student browser tab switches and visibility changes during graded tests with instant notification alerts.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
