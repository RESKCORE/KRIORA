import React, { useState } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import {
  Code2,
  Terminal,
  Sparkles,
  Zap,
  GraduationCap,
  ShieldCheck,
  BarChart3,
  Award,
  ArrowRight,
  CheckCircle2,
  Play,
  Layers,
  Users,
  Bot,
  ChevronRight,
  X,
  Check,
  Clock,
  Laptop,
  BookOpen,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onGetStarted?: () => void;
  initialAuthMode?: 'signin' | 'signup' | null;
}

export default function LandingPage({ onGetStarted, initialAuthMode = null }: LandingPageProps) {
  const [authModal, setAuthModal] = useState<'signin' | 'signup' | null>(initialAuthMode);
  const [activeTab, setActiveTab] = useState<'editor' | 'curriculum' | 'analytics'>('editor');
  const [copiedCode, setCopiedCode] = useState(false);

  const samplePythonCode = `# Day 1: Python 3.11 WASM Engine & AI Evaluation
def calculate_grade(points_earned, total_points=100):
    """Kriora Deterministic & AI-Assisted Assessment Engine"""
    percentage = round((points_earned / total_points) * 100)
    passed = percentage >= 70
    
    return {
        "score": points_earned,
        "percentage": f"{percentage}%",
        "status": "PASSED" if passed else "RETRY",
        "verified": True
    }

# Execute in-browser with 0ms server latency
result = calculate_grade(95)
print(f"🚀 Status: {result['status']} | Grade: {result['percentage']}")`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(samplePythonCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const openAuth = (mode: 'signin' | 'signup' = 'signup') => {
    if (onGetStarted) {
      onGetStarted();
    }
    setAuthModal(mode);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#FF5A36]/20 selection:text-[#FF5A36] relative overflow-x-hidden font-sans">
      {/* Background Animated Gradient Aura & Mesh Grids */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-tr from-orange-400/15 via-[#FF5A36]/10 to-amber-300/15 rounded-full blur-[140px] animate-gradient-shift" />
        <div className="absolute top-[35%] -left-48 w-[600px] h-[600px] bg-orange-500/8 rounded-full blur-[160px] animate-pulse-glow" />
        <div className="absolute top-[60%] -right-48 w-[650px] h-[650px] bg-amber-500/8 rounded-full blur-[160px] animate-pulse-glow" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />
      </div>

      {/* ─── Top Sticky Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative">
              <img
                src="/KRIORA_LOGO_2.png"
                alt="Kriora Logo"
                className="w-10 h-10 rounded-xl object-cover shadow-md shadow-orange-500/20 ring-2 ring-orange-500/20"
              />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 font-sans">KRIORA</span>
                <span className="text-[11px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-gradient-to-r from-[#FF5A36] to-orange-600 text-white rounded-md shadow-xs">LMS</span>
              </div>
              <p className="text-[9px] font-mono font-bold tracking-widest text-[#FF5A36] uppercase -mt-0.5">Cloud & AI Academy</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-[#FF5A36] transition-colors">Features</a>
            <a href="#curriculum" className="hover:text-[#FF5A36] transition-colors">Curriculum</a>
            <a href="#wasm-sandbox" className="hover:text-[#FF5A36] transition-colors">WASM Sandbox</a>
            <a href="#certification" className="hover:text-[#FF5A36] transition-colors">Certification</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => openAuth('signin')}
              className="text-xs font-bold text-slate-700 hover:text-[#FF5A36] hover:bg-orange-50/60 px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Sign In
            </Button>
            <Button
              onClick={() => openAuth('signup')}
              className="text-xs font-black bg-gradient-to-r from-[#FF5A36] via-[#FF6E4E] to-[#FF3B14] hover:from-[#FF4820] hover:to-[#E02E09] text-white px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center gap-2 group animate-gradient-shift"
            >
              <span>Start Journey</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-12 pb-20 md:pt-20 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Live Announcement Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-orange-50/80 border border-orange-200/80 text-[11px] font-bold text-orange-950 shadow-xs backdrop-blur-md animate-float">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A36] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5A36]"></span>
            </span>
            <span className="font-mono text-[#FF5A36] font-extrabold uppercase tracking-wider">Next-Gen Learning 2026</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-slate-700 font-medium">In-Browser Python 3.11 WASM & AI Evaluation</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#FF5A36]" />
          </div>

          {/* Hero Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Master Python, Cloud & AI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A36] via-[#FF7A59] to-[#FF3B14] animate-gradient-shift">
                with Real-Time Interactive Labs
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              The high-density Learning Management System engineered for modern universities & bootcamps. Zero server latency, instant WASM compilation, autonomous AI tutors, and verified certification checkpoints.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
            <Button
              onClick={() => openAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#FF5A36] via-[#FF6E4E] to-[#FF3B14] hover:from-[#FF4820] hover:to-[#E02E09] text-white text-sm font-black rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer group animate-gradient-shift"
            >
              <Sparkles className="w-4 h-4 text-orange-200 animate-pulse" />
              <span>Start Your Journey Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <a
              href="#curriculum"
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-sm font-extrabold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2.5 text-center cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#FF5A36]" />
              <span>Explore 40-Day Curriculum</span>
            </a>
          </div>

          {/* Key Value Stat Checkpoints */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 pt-8 w-full border-t border-slate-100 max-w-3xl">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">40 Days</span>
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Step-by-Step Roadmap</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-[#FF5A36] tracking-tight">0ms Latency</span>
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Client-Side WASM</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">AI Assisted</span>
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Instant Auto-Grading</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">Verifiable</span>
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Industry Transcripts</span>
            </div>
          </div>
        </div>

        {/* ─── Interactive Hero Workbench Mockup ─────────────────────────────── */}
        <div id="wasm-sandbox" className="mt-14 max-w-5xl mx-auto relative">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#FF5A36]/40 via-amber-400/30 to-[#FF3B14]/40 blur-xl opacity-50 animate-pulse-glow" />
          
          <div className="relative rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden text-slate-200">
            {/* Window Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-xs text-slate-200 font-bold">assessment_day_01.py</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 hidden sm:inline-flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-emerald-400" /> Pyodide 3.11 Engine
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> 42ms Execution
                </span>
                <button
                  onClick={handleCopyCode}
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors font-mono flex items-center gap-1.5"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Layers className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-5 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto bg-[#0B0F17] text-slate-300">
              <pre className="font-mono">{samplePythonCode}</pre>
            </div>

            {/* Simulated Live Console Output */}
            <div className="p-4 sm:p-5 bg-[#070A0F] border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>STDOUT: 🚀 Status: PASSED | Grade: 95% (Evaluated by Kriora Engine)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px]">Integrity Verified &bull; Idempotency Token Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Platform Pillars / Features Grid ─────────────────────────────── */}
      <section id="features" className="py-20 bg-slate-50/60 border-t border-b border-slate-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#FF5A36] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Engineered For Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Everything You Need to Master Modern Engineering
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              A cohesive ecosystem uniting interactive in-browser compilation, deterministic test cases, autonomous AI tutoring, and cohort administration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5A36] group-hover:scale-110 transition-transform">
                  <Terminal className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900">In-Browser Python 3.11 WASM</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Run Python directly in the student's browser with Pyodide WebAssembly. Zero server queue, instant output, full STDIN/STDOUT support, and complete isolation.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center gap-2 text-xs font-bold text-[#FF5A36]">
                <span>Explore WASM Runner</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5A36] group-hover:scale-110 transition-transform">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Autonomous AI Tutor Companion</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Integrated 24/7 AI tutor drawer tailored to your exact current curriculum day and code challenge. Instant feedback, syntax guidance, and concept explanations.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center gap-2 text-xs font-bold text-[#FF5A36]">
                <span>Meet AI Tutor</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5A36] group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Live Cohort & Batch Releases</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instructors manage multi-batch schedules with precise day-by-day release locks, live telemetry, proctoring alerts, and automated marks matrices.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center gap-2 text-xs font-bold text-[#FF5A36]">
                <span>Admin Command Center</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 40-Day Curriculum Roadmap Preview ────────────────────────────────── */}
      <section id="curriculum" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#FF5A36] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            Structured Syllabus
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            4-Phase Intensive Mastery Roadmap
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            A battle-tested 40-day curriculum taking learners from fundamental logic to production cloud architectures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Phase 1 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 hover:border-orange-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-[#FF5A36] uppercase bg-orange-50 px-2 py-0.5 rounded-md">Days 1 – 10</span>
              <span className="text-xs font-bold text-slate-400">Phase 01</span>
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Python Foundations & Memory</h4>
            <ul className="text-xs text-slate-600 space-y-2 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Variables, Memory & Data Types</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Control Flow & Logical Structures</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Functions & Scope Management</li>
            </ul>
          </div>

          {/* Phase 2 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 hover:border-orange-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-[#FF5A36] uppercase bg-orange-50 px-2 py-0.5 rounded-md">Days 11 – 20</span>
              <span className="text-xs font-bold text-slate-400">Phase 02</span>
            </div>
            <h4 className="font-extrabold text-base text-slate-900">OOP & Data Structures</h4>
            <ul className="text-xs text-slate-600 space-y-2 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Classes, Inheritance & Dunder Methods</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Lists, Dicts, Tuples & Sets</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> File I/O & Exception Handling</li>
            </ul>
          </div>

          {/* Phase 3 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 hover:border-orange-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-[#FF5A36] uppercase bg-orange-50 px-2 py-0.5 rounded-md">Days 21 – 30</span>
              <span className="text-xs font-bold text-slate-400">Phase 03</span>
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Algorithms & Complexity</h4>
            <ul className="text-xs text-slate-600 space-y-2 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Big-O Time & Space Analysis</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Recursion & Dynamic Programming</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Search & Sorting Implementations</li>
            </ul>
          </div>

          {/* Phase 4 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 hover:border-orange-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-[#FF5A36] uppercase bg-orange-50 px-2 py-0.5 rounded-md">Days 31 – 40</span>
              <span className="text-xs font-bold text-slate-400">Phase 04</span>
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Capstone & Certification</h4>
            <ul className="text-xs text-slate-600 space-y-2 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Full-Stack Python Application</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Final Master Assessment Exam</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Verified Certificate Issuance</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Final CTA Banner ─────────────────────────────────────────────────── */}
      <section id="certification" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-14 text-white overflow-hidden border border-slate-800 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FF5A36]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#FF5A36] text-[11px] font-mono font-bold uppercase">
              <Award className="w-3.5 h-3.5" /> Industry Verified Certification
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to Accelerate Your Career in Cloud & AI?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Join thousands of students and engineers mastering real-world software engineering with instant interactive labs and AI-driven precision.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Button
                onClick={() => openAuth('signup')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#FF5A36] to-[#FF3B14] hover:from-[#FF4820] hover:to-[#E02E09] text-white text-sm font-black rounded-2xl shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer animate-gradient-shift"
              >
                <span>Get Started Now — It's Free</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => openAuth('signin')}
                className="w-full sm:w-auto text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 px-6 py-4 rounded-2xl transition-colors cursor-pointer"
              >
                Already registered? Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-10 bg-white relative z-10 text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/KRIORA_LOGO_2.png" alt="Kriora" className="w-6 h-6 rounded-md object-cover" />
            <span className="font-bold text-slate-800">Kriora LMS &bull; Professional Cloud & AI Academy</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Active (v1.3.1)
            </span>
            <span>&copy; {new Date().getFullYear()} Kriora. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* ─── Seamless Auth Modal Dialog ───────────────────────────────────────── */}
      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-[440px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Close Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <img src="/KRIORA_LOGO_2.png" alt="Kriora" className="w-6 h-6 rounded-md object-cover" />
                <span className="font-black text-sm text-slate-900 tracking-tight">KRIORA <span className="text-[#FF5A36]">LMS</span></span>
              </div>
              <button
                onClick={() => setAuthModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Close Authentication Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Separated Sign In vs Sign Up Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/80 p-1.5 gap-1.5">
              <button
                onClick={() => setAuthModal('signin')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authModal === 'signin'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <span>Sign In</span>
              </button>
              <button
                onClick={() => setAuthModal('signup')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authModal === 'signup'
                    ? 'bg-white text-[#FF5A36] shadow-sm border border-slate-200/80 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <span>Create Account (Sign Up)</span>
              </button>
            </div>

            {/* Clerk Sign In / Sign Up Widget */}
            <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden max-h-[75vh] flex flex-col items-center w-full">
              {authModal === 'signup' ? (
                <SignUp
                  routing="virtual"
                  fallbackRedirectUrl="/"
                  forceRedirectUrl="/"
                  appearance={{
                    elements: {
                      card: 'shadow-none border-none p-0 bg-transparent w-full',
                      rootBox: 'w-full flex justify-center',
                      cardBox: 'w-full shadow-none border-none',
                      footer: 'hidden',
                      footerAction: 'hidden',
                      footerActionText: 'hidden',
                      footerActionLink: 'hidden',
                      footerPages: 'hidden',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      socialButtonsBlockButton: 'rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 h-10',
                      formButtonPrimary: 'bg-[#FF5A36] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md h-10 transition-all',
                      formFieldInput: 'rounded-xl border-slate-200 text-xs focus:ring-[#FF5A36] focus:border-[#FF5A36] h-10',
                    },
                    layout: {
                      socialButtonsPlacement: 'top',
                      showOptionalFields: false,
                    },
                  }}
                />
              ) : (
                <SignIn
                  routing="virtual"
                  fallbackRedirectUrl="/"
                  forceRedirectUrl="/"
                  appearance={{
                    elements: {
                      card: 'shadow-none border-none p-0 bg-transparent w-full',
                      rootBox: 'w-full flex justify-center',
                      cardBox: 'w-full shadow-none border-none',
                      footer: 'hidden',
                      footerAction: 'hidden',
                      footerActionText: 'hidden',
                      footerActionLink: 'hidden',
                      footerPages: 'hidden',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      socialButtonsBlockButton: 'rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 h-10',
                      formButtonPrimary: 'bg-[#FF5A36] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md h-10 transition-all',
                      formFieldInput: 'rounded-xl border-slate-200 text-xs focus:ring-[#FF5A36] focus:border-[#FF5A36] h-10',
                    },
                    layout: {
                      socialButtonsPlacement: 'top',
                      showOptionalFields: false,
                    },
                  }}
                />
              )}
            </div>

            {/* Modal Bottom Toggle */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
              {authModal === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setAuthModal(authModal === 'signup' ? 'signin' : 'signup')}
                className="text-[#FF5A36] font-bold hover:underline cursor-pointer ml-1"
              >
                {authModal === 'signup' ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
