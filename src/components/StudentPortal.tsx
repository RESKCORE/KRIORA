import React, { useState, useEffect, useRef } from "react";
import {
  Layers, BookOpen, Play, FileText, Bell, Settings, LogOut,
  Search, Lock, CheckCircle2, Circle, ChevronRight, ChevronLeft, ChevronDown,
  AlertCircle, RefreshCw, Clock, Award, User, Code, Calendar, GraduationCap,
  Target, AlertTriangle, FileCode, Sparkles, Lightbulb, HelpCircle,
  Check, ArrowRight, Zap, TrendingUp, CheckSquare, Send, Cpu, Terminal,
  PanelLeftClose, PanelLeftOpen, Copy, BookMarked, Eye, Flame, ArrowLeft
} from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatCard, StatusPill, PageHeader, EmptyState } from "@/components/ui/admin-shared";
import type { Course, Student, Announcement, LMSConfig, CourseDay, CourseModule, Topic, Batch, BatchDayAccess, TestSubmission } from "../types";
import PythonCompiler from "./PythonCompiler";
import { runPythonWithStdin, normalizeOutput } from "../lib/pythonRunner";
import { EVALUATOR_VERSION, RUBRIC_VERSION } from "../lib/constants";

const PracticeArena = React.lazy(() =>
  import("./practice/PracticeArena").then((m) => ({ default: m.PracticeArena }))
);

interface StudentPortalProps {
  actorEmail: string;
  student: Student;
  courses: Course[];
  announcements: Announcement[];
  notifications: any[];
  config: LMSConfig;
  batches: Batch[];
  dayAccess: BatchDayAccess[];
  testSubmissions: TestSubmission[];
  onLogout: () => void;
  onRefreshState: () => void;
}

type TabId = "dashboard" | "course" | "practice" | "player" | "announcements" | "notifications" | "settings";
type PlayerSubTab = "theory" | "worked_example" | "practice" | "assessment";

// ── Reusable Code Block with Copy Button ──────────────────────────────────────
interface CodeSnippetProps {
  code: string;
  title?: string;
  explanation?: string;
  key?: React.Key;
}

function CodeSnippet({ code, title, explanation }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2 rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-[#0D1117]">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161B22] border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="text-slate-400 font-bold ml-2 text-[11px]">{title || "Python Code Demonstration"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>

      <pre className="text-emerald-300 p-4 text-xs font-mono overflow-x-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
        {code}
      </pre>

      {explanation && (
        <div className="bg-[#161B22]/80 border-t border-slate-800/80 p-3 text-xs text-slate-300 italic flex items-start gap-2">
          <span className="text-amber-400 font-bold shrink-0">💡 Note:</span>
          <span>{explanation}</span>
        </div>
      )}
    </div>
  );
}

export default function StudentPortal({
  actorEmail, student, courses, announcements, notifications, config, batches, dayAccess, testSubmissions, onLogout, onRefreshState
}: StudentPortalProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTopicSidebarOpen, setIsTopicSidebarOpen] = useState(true);
  const [playerTab, setPlayerTab] = useState<PlayerSubTab>("theory");
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [practiceInitialProblemId, setPracticeInitialProblemId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [assessmentCode, setAssessmentCode] = useState("");
  const [activeSubmissionRequestId, setActiveSubmissionRequestId] = useState<string | null>(null);
  const [assessmentBusy, setAssessmentBusy] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any | null>(null);
  const [evalStatus, setEvalStatus] = useState<"idle" | "running" | "done" | "error">("idle");

  // Reset assessment editor & state when switching days
  useEffect(() => {
    setAssessmentCode("");
    setAssessmentResult(null);
    setEvalStatus("idle");
    setActiveSubmissionRequestId(null);
    setTabSwitchCount(0);
    setFocusLostCount(0);
    setPasteCount(0);
  }, [activeDayId]);

  // ── Assessment Live Proctoring Telemetry ────────────────────────────────────
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [focusLostCount, setFocusLostCount] = useState(0);
  const [pasteCount, setPasteCount] = useState(0);

  useEffect(() => {
    if (activeTab !== "player" || playerTab !== "assessment") return;

    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount((c) => c + 1);
      }
    };

    const handleBlur = () => {
      setFocusLostCount((c) => c + 1);
    };

    const handlePaste = () => {
      setPasteCount((c) => c + 1);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("paste", handlePaste);
    };
  }, [activeTab, playerTab, activeDayId]);

  // ── Track Seen Announcements for Student ────────────────────────────────
  const [seenAnnouncementIds, setSeenAnnouncementIds] = useState<string[]>(() => {
    if (typeof window !== "undefined" && (student?.id || student?.email)) {
      try {
        const key = `kriora_seen_announcements_${student.id || student.email}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // When student views the announcements tab, mark all current announcements as seen
  useEffect(() => {
    if (activeTab === "announcements" && announcements.length > 0) {
      const allIds = announcements.map((a) => a.id);
      setSeenAnnouncementIds((prev) => {
        const merged = Array.from(new Set([...prev, ...allIds]));
        if (typeof window !== "undefined" && (student?.id || student?.email)) {
          try {
            localStorage.setItem(
              `kriora_seen_announcements_${student.id || student.email}`,
              JSON.stringify(merged)
            );
          } catch (e) {}
        }
        return merged;
      });
    }
  }, [activeTab, announcements, student?.id, student?.email]);

  const updateProgressMut = useMutation(api.lms.updateLessonProgress);
  const submitCodeMut = useMutation(api.lms.submitAssessmentCode);
  const evaluateAssessmentAction = useAction(api.lms.evaluateAssessment);

  const activeDayContent = useQuery(
    api.lms.getDayContent,
    activeDayId ? { dayId: activeDayId, actorEmail } : "skip"
  );

  const course = courses.find((c) => c.id === "python-mastery") || courses[0];

  // Batch scoping & access
  const studentBatch = batches.find((b) => b.id === student.batchId);
  const batchStatusOf = (b?: Batch) => {
    if (!b) return null;
    if (b.status === "cancelled") return "cancelled";
    const today = new Date().toISOString().slice(0, 10);
    if (b.endDate && b.endDate < today) return "completed";
    if (b.startDate > today) return "upcoming";
    return "active";
  };
  const bStatus = batchStatusOf(studentBatch);
  const batchIsLive = bStatus === "active" || bStatus === "completed";
  const batchGranted = (dayId: string) =>
    studentBatch ? dayAccess.some((a) => a.batchId === studentBatch.id && a.dayId === dayId && (!a.studentId || a.studentId === student.id)) : false;

  const isDayAvailable = (d: CourseDay) => {
    const legacy = d.releaseStatus !== "locked";
    if (!studentBatch || !student.batchId) return legacy;
    if (!batchIsLive) return false;
    return batchGranted(d.id) || legacy;
  };
  const allDays = course?.modules.flatMap((m) => m.days) || [];
  const availableDays = allDays.filter(isDayAvailable);
  const totalDays = allDays.length;
  const currentDay = studentBatch
    ? Math.max(0, ...dayAccess.filter((a) => a.batchId === studentBatch.id && !a.studentId && a.dayId !== "final-master-exam").map((a) => a.dayNumber))
    : availableDays.length;
  const finalExamOpen = studentBatch && batchIsLive && batchGranted("final-master-exam");
  const daySubmission = (dayId: string) => testSubmissions.find((s) => s.studentId === student.id && s.dayId === dayId && s.testType === "daily");

  const submitAssessment = async (day: CourseDay) => {
    if (!assessmentCode.trim()) return;
    setAssessmentBusy(true);
    setEvalStatus("running");
    setAssessmentResult(null);

    const submissionRequestId = `sub_req_${student.id}_${day.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
      let aiEval: any = null;

      // 1. Primary: Direct Convex Cloud Serverless Action
      try {
        const actionRes = await evaluateAssessmentAction({
          code: assessmentCode,
          dayNumber: day.dayNumber,
          dayTitle: day.title,
          taskDescription: day.content?.workedExample?.caseStudy || day.description || day.title,
          maxScore: config?.dailyAssessmentMarks || 10,
          testType: "daily",
        });
        if (actionRes?.success) {
          aiEval = actionRes;
        }
      } catch (convexErr) {
        console.warn("[Student Evaluation] Convex action fallback to Gateway:", convexErr);
      }

      // 2. Secondary: Backend Gateway API (/api/lms/evaluate-test)
      if (!aiEval) {
        try {
          const sessionToken = await getToken();
          const evalRes = await fetch("/api/lms/evaluate-test", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
            },
            body: JSON.stringify({
              code: assessmentCode,
              dayNumber: day.dayNumber,
              dayTitle: day.title,
              taskDescription: day.content?.workedExample?.caseStudy || day.description || day.title,
              maxScore: config?.dailyAssessmentMarks || 10,
              testType: "daily",
              submissionRequestId,
            }),
          });
          if (evalRes.ok) {
            const data = await evalRes.json();
            if (data.success) aiEval = data;
          }
        } catch (gatewayErr) {
          console.warn("[Student Evaluation] Gateway call failed, falling back to local runner:", gatewayErr);
        }
      }

      if (aiEval) {
        await submitCodeMut({
          actorEmail,
          dayId: day.id,
          dayNumber: day.dayNumber,
          testId: "day-" + day.dayNumber,
          testType: "daily",
          code: assessmentCode,
          evalResults: aiEval.evalResults,
          evalError: aiEval.feedback || undefined,
          submissionRequestId,
          graderMode: aiEval.graderMode || "ai-assisted",
          graderVersion: aiEval.graderVersion || EVALUATOR_VERSION,
          rubricVersion: aiEval.rubricVersion || RUBRIC_VERSION,
        });
        setAssessmentResult({
          score: aiEval.score,
          percentage: aiEval.percentage,
          maxScore: aiEval.maxScore || config?.dailyAssessmentMarks || 10,
          passedTests: aiEval.passedTests,
          failedTests: aiEval.failedTests,
          feedback: aiEval.feedback,
          evalStatus: "auto",
          evalResults: aiEval.evalResults,
        });
        setEvalStatus("done");
        setAssessmentBusy(false);
        return;
      }

      const practiceItems = day.content?.practice || [];
      const evalResults: { input: string; expected: string; actual: string; pass: boolean }[] = [];
      let evalError: string | undefined;

      for (const item of practiceItems) {
        try {
          const run = await runPythonWithStdin(assessmentCode, "");
          if (run.error) {
            evalError = evalError || run.error;
            evalResults.push({ input: item.question, expected: item.expectedOutput || "", actual: run.stderr || run.error, pass: false });
          } else {
            const pass = item.expectedOutput ? normalizeOutput(run.stdout) === normalizeOutput(item.expectedOutput) : true;
            evalResults.push({ input: item.question, expected: item.expectedOutput || "", actual: run.stdout, pass });
          }
        } catch (err: any) {
          evalError = evalError || (err.message || "Evaluation failed");
          evalResults.push({ input: item.question, expected: item.expectedOutput || "", actual: "", pass: false });
        }
      }

      const res = await submitCodeMut({
        actorEmail,
        dayId: day.id,
        dayNumber: day.dayNumber,
        testId: "day-" + day.dayNumber,
        testType: "daily",
        code: assessmentCode,
        ...(evalResults.length > 0 ? { evalResults, evalError } : {}),
      });

      setAssessmentResult({
        score: res.score,
        percentage: res.percentage,
        maxScore: res.maxScore || config?.dailyAssessmentMarks || 10,
        passedTests: res.passedTests,
        failedTests: res.failedTests,
        evalStatus: res.evalStatus,
        evalResults: res.evalResults || evalResults,
      });
      setEvalStatus("done");
    } catch (err: any) {
      setEvalStatus("error");
      setAssessmentResult({
        score: 0,
        percentage: 0,
        maxScore: config?.dailyAssessmentMarks || 10,
        passedTests: 0,
        failedTests: 1,
        feedback: "Error submitting assessment: " + (err.message || "Unknown error"),
        evalStatus: "pending",
      });
    } finally {
      setAssessmentBusy(false);
    }
  };

  const toggleModule = (modId: string) =>
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));

  const handleMarkTopic = async (topicId: string, isCompleted: boolean) => {
    try {
      await updateProgressMut({
        actorEmail,
        courseId: course?.id || "python-mastery",
        topicId,
        isCompleted,
      });
    } catch (err: any) {
      console.error("Failed to update progress:", err);
    }
  };

  // ── Real Live Student Analytics & Progress Calculations ──────────────────
  const completedTopicIds = student.completedLessons || [];
  const totalTopics = allDays.flatMap((d) => d.topics).length;
  const completedTopics = completedTopicIds.length;
  const realProgressPct = totalTopics > 0
    ? Math.min(100, Math.round((completedTopics / totalTopics) * 100))
    : (student.progress?.[course?.id || ""] || 0);

  const dailySubmissions = testSubmissions.filter((s) => s.studentId === student.id && s.testType === "daily");
  const gradedDaily = dailySubmissions.filter((s) => s.score !== undefined);
  const pendingManualCount = dailySubmissions.filter((s) => s.evalStatus === "pending").length;
  const gradedAvgPct = gradedDaily.length > 0
    ? Math.round(gradedDaily.reduce((sum, s) => sum + (s.percentage ?? (s.score != null ? Math.round((s.score / (s.maxScore || 10)) * 100) : 0)), 0) / gradedDaily.length)
    : null;

  const finalExamSub = testSubmissions.find((s) => s.studentId === student.id && s.testType === "final");
  const finalExamScore = finalExamSub
    ? (finalExamSub.percentage ?? (finalExamSub.score ? Math.round((finalExamSub.score / (finalExamSub.maxScore || 100)) * 100) : 0))
    : null;

  const dailyThreshold = config?.dailyPerfThreshold || 70;
  const finalThreshold = config?.finalExamThreshold || 80;
  const minRequiredTestsCount = Math.max(1, Math.ceil(totalDays * 0.75));
  const dailyPerfMet = gradedAvgPct !== null && gradedAvgPct >= dailyThreshold;
  const finalExamMet = finalExamScore !== null && finalExamScore >= finalThreshold;
  const testVolumeMet = gradedDaily.length >= minRequiredTestsCount;
  const isCertified = dailyPerfMet && finalExamMet && testVolumeMet;

  // Real composite certification progress (0 - 100%)
  const syllabusWeight = (completedTopics / Math.max(1, totalTopics)) * 40;
  const testsWeight = (Math.min(gradedDaily.length, totalDays) / Math.max(1, totalDays)) * 40 * ((gradedAvgPct || 0) / 100);
  const finalWeight = finalExamScore !== null ? (finalExamScore / 100) * 20 : 0;
  const overallCertProgress = Math.min(100, Math.round(syllabusWeight + testsWeight + finalWeight));

  const activeDayRaw = allDays.find((d) => d.id === activeDayId);
  const activeDay = activeDayRaw
    ? { ...activeDayRaw, content: activeDayContent || activeDayRaw.content }
    : undefined;

  const unreadAnnouncementsCount = announcements.filter(
    (a) => !seenAnnouncementIds.includes(a.id)
  ).length;

  const navItems: { id: TabId; label: string; icon: any; badge?: number | string }[] = [
    { id: "dashboard" as TabId, label: "Overview", icon: Layers },
    { id: "course" as TabId, label: "Syllabus", icon: BookOpen },
    { id: "practice" as TabId, label: "Practice Arena", icon: Code },
    { id: "announcements" as TabId, label: "Announcements", icon: Bell, badge: unreadAnnouncementsCount },
    { id: "settings" as TabId, label: "Profile", icon: User },
  ];

  // Current day index and next/prev day helpers
  const currentDayIndex = allDays.findIndex(d => d.id === activeDay?.id);
  const prevDay = currentDayIndex > 0 ? allDays[currentDayIndex - 1] : null;
  const nextDay = currentDayIndex >= 0 && currentDayIndex < allDays.length - 1 ? allDays[currentDayIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-800 flex font-sans antialiased">
      {/* ── Collapsible Main Sidebar ───────────────────────────────────────── */}
      <aside
        className={`bg-white border-r border-slate-200/80 flex flex-col shrink-0 fixed inset-y-0 z-30 shadow-2xs transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className={`h-16 border-b border-slate-100 flex items-center ${sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"}`}>
          <button
            onClick={() => sidebarCollapsed && setSidebarCollapsed(false)}
            className="flex items-center gap-3 shrink-0 group focus:outline-none text-left"
            title={sidebarCollapsed ? "Expand Sidebar" : undefined}
          >
            <img
              src="/KRIORA_LOGO_2.png"
              alt="Kriora Logo"
              className="w-10 h-10 rounded-full object-cover shadow-md shadow-orange-500/20 shrink-0 border border-orange-200 ring-2 ring-orange-500/20 group-hover:scale-105 transition-transform"
            />
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-extrabold text-sm text-slate-900 leading-tight">Kriora LMS</h1>
                <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60 inline-block mt-0.5">
                  Student Portal
                </span>
              </div>
            )}
          </button>

          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              title="Collapse Sidebar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors hidden md:block"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User Card */}
        <div className={`p-3 bg-slate-50/80 border border-slate-200/60 mx-2.5 my-3 rounded-2xl flex items-center gap-3 shadow-2xs ${sidebarCollapsed ? "justify-center px-2" : ""}`}>
          <Avatar className="w-10 h-10 ring-2 ring-orange-500/20 shadow-2xs shrink-0 border border-orange-200">
            <AvatarImage src={user?.imageUrl} alt={student.fullName} className="object-cover" />
            <AvatarFallback className="bg-orange-100 text-[#FF5A36] font-extrabold text-xs">
              {student.fullName?.slice(0, 2).toUpperCase() || "ST"}
            </AvatarFallback>
          </Avatar>
          {!sidebarCollapsed && (
            <div className="overflow-hidden text-left min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{student.fullName}</p>
              <p className="text-[10px] font-mono text-slate-500 truncate">{studentBatch?.name || "Self-Paced"}</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-2.5 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === "course" && activeTab === "player");
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`relative w-full flex items-center ${
                  sidebarCollapsed ? "justify-center px-0 py-3" : "justify-between px-3.5 py-2.5"
                } rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-orange-50/80 text-[#FF5A36] shadow-2xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#FF5A36] before:rounded-r"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#FF5A36]" : "text-slate-500"}`} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge !== undefined && (typeof item.badge === "number" ? item.badge > 0 : Boolean(item.badge)) && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 text-[#FF5A36]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Sign Out */}
        <div className="p-2.5 border-t border-slate-100">
          <button
            onClick={onLogout}
            title={sidebarCollapsed ? "Sign Out" : undefined}
            className={`w-full flex items-center ${
              sidebarCollapsed ? "justify-center px-0 py-3" : "gap-2.5 px-3.5 py-2.5"
            } rounded-xl text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all`}
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <main className={`flex-1 transition-all duration-300 min-h-screen flex flex-col ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
        {/* Top Header Bar */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            <h2 className="font-extrabold text-sm text-slate-900 capitalize">
              {activeTab === "dashboard"
                ? "Dashboard Overview"
                : activeTab === "course"
                ? "Course Syllabus"
                : activeTab === "practice"
                ? "Practice Arena"
                : activeTab === "player"
                ? `Day ${activeDay?.dayNumber || ""}: ${activeDay?.title || "Lesson Player"}`
                : activeTab}
            </h2>
            {studentBatch && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {studentBatch.name} • Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider">Course Progress</span>
              <span className="text-xs font-extrabold text-[#FF5A36]">{realProgressPct}% Completed</span>
            </div>
            <div className="w-28 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60">
              <div className="bg-gradient-to-r from-[#FF5A36] to-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${realProgressPct}%` }} />
            </div>
          </div>
        </header>

        {/* View Switcher */}
        <div className="p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {/* ═══════════════════════════════════════════════════════════════════
              TAB: DASHBOARD OVERVIEW
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Hero Welcome Banner */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#1e293b] text-white rounded-3xl p-7 relative overflow-hidden shadow-xl border border-slate-800">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full uppercase tracking-widest font-bold border border-orange-500/20">
                      <Sparkles className="w-3 h-3 text-orange-400" /> Python Mastery Track
                    </span>
                    <h2 className="text-2xl font-black tracking-tight">
                      Welcome back, {student.fullName?.split(" ")[0] || "Student"}! 👋
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      You are actively enrolled in <strong className="text-white font-bold">{studentBatch?.name || "Python Mastery Cohort"}</strong>. 
                      Your cohort has unlocked up to <strong className="text-orange-400 font-mono font-bold">Day {currentDay} of {totalDays}</strong>.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
                    {availableDays.length > 0 && (
                      <Button
                        onClick={() => {
                          const targetDay = allDays.find(d => d.dayNumber === currentDay) || availableDays[0];
                          if (targetDay) {
                            setActiveDayId(targetDay.id);
                            setActiveTab("player");
                          }
                        }}
                        className="bg-[#FF5A36] hover:bg-orange-600 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-lg shadow-orange-500/25 shrink-0 flex items-center gap-2 w-full sm:w-auto"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Resume Day {currentDay || 1} Lesson</span>
                      </Button>
                    )}

                    <Button
                      onClick={() => setActiveTab("practice")}
                      variant="outline"
                      className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs px-4 py-3 rounded-2xl shrink-0 flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Code className="w-4 h-4 text-indigo-400" />
                      <span>Practice Arena</span>
                    </Button>
                  </div>
                </div>
                <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              </div>

              {/* 4 Real Stat Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Completed Topics"
                  value={`${completedTopics} / ${totalTopics}`}
                  subtitle={`${realProgressPct}% Course Finished`}
                  trend={realProgressPct > 0 ? "Active" : undefined}
                  trendType="neutral"
                  icon={BookOpen}
                />
                <StatCard
                  title="Daily Assessments"
                  value={`${gradedDaily.length} Graded`}
                  subtitle={pendingManualCount > 0 ? `${pendingManualCount} pending review` : `${dailySubmissions.length} total submitted`}
                  icon={CheckSquare}
                />
                <StatCard
                  title="Daily Performance"
                  value={gradedAvgPct !== null ? `${gradedAvgPct}% Average` : "No graded tests"}
                  subtitle={gradedDaily.length > 0 ? `Across ${gradedDaily.length} graded test${gradedDaily.length === 1 ? "" : "s"}` : "Awaiting first test"}
                  trend={gradedAvgPct !== null && gradedAvgPct >= dailyThreshold ? "On Track" : undefined}
                  trendType={gradedAvgPct !== null && gradedAvgPct >= dailyThreshold ? "up" : "neutral"}
                  icon={TrendingUp}
                />
                <StatCard
                  title="Certification"
                  value={isCertified ? "Certified" : `${overallCertProgress}%`}
                  subtitle={isCertified ? "All benchmarks met" : `${gradedDaily.length}/${totalDays} tests • Final: ${finalExamSub ? "Submitted" : "Pending"}`}
                  trend={isCertified ? "Certified" : "In Progress"}
                  trendType={isCertified ? "up" : "neutral"}
                  icon={Award}
                />
              </div>

              {/* Course Roadmap */}
              <Card className="shadow-2xs border-slate-200/80 rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <CardTitle className="text-base font-extrabold text-slate-900">Your Course Roadmap</CardTitle>
                    <p className="text-xs text-slate-500">Track your day-by-day progression and test submissions</p>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs text-orange-600 border-orange-200">
                    {availableDays.length} / {totalDays} Unlocked
                  </Badge>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
                    {allDays.map((d) => {
                      const available = isDayAvailable(d);
                      const sub = daySubmission(d.id);
                      return (
                        <button
                          key={d.id}
                          onClick={() => {
                            if (available) {
                              setActiveDayId(d.id);
                              setActiveTab("player");
                            }
                          }}
                          disabled={!available}
                          className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between min-h-[105px] ${
                            available
                              ? "bg-white border-slate-200/80 hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5"
                              : "bg-slate-50/70 border-slate-200/50 opacity-60 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-2">
                            <span className="text-[11px] font-mono font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200/50">
                              Day {d.dayNumber}
                            </span>
                            {!available ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400">
                                <Lock className="w-3.5 h-3.5" /> Locked
                              </span>
                            ) : sub ? (
                              sub.evalStatus === "pending" ? (
                                <Badge variant="warning" className="text-[10px] py-0">Pending</Badge>
                              ) : sub.evalStatus === "auto" || sub.evalStatus === "manual" ? (
                                <Badge variant="success" className="text-[10px] py-0">
                                  {sub.percentage ?? (sub.score ? Math.round((sub.score / (sub.maxScore || 10)) * 100) : 100)}%
                                </Badge>
                              ) : (
                                <Badge variant="success" className="text-[10px] py-0">Done</Badge>
                              )
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 group-hover:text-orange-500 transition-colors">
                                Open →
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1 group-hover:text-[#FF5A36] transition-colors">
                              {d.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {d.topics?.length || 0} Topics • {d.assessmentKey ? "Graded Test" : "Practice"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB: SYLLABUS / COURSE CURRICULUM
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === "course" && (
            <Card className="shadow-2xs border-slate-200/80 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-extrabold text-slate-900">{course?.title}</CardTitle>
                  <p className="text-xs text-slate-500 max-w-2xl">{course?.description}</p>
                </div>
                <Badge variant="outline" className="font-mono text-xs text-orange-600 border-orange-200 bg-orange-50/50">
                  {allDays.length} Days Total Curriculum
                </Badge>
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                {course?.modules.map((mod) => (
                  <div key={mod.id} className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full bg-slate-50/90 p-4.5 flex items-center justify-between text-left font-bold text-xs text-slate-900 hover:bg-slate-100/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 font-mono text-[11px] font-black flex items-center justify-center">
                          {mod.order}
                        </span>
                        <span className="font-extrabold text-sm">{mod.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-slate-500">{mod.days.length} Days</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedModules[mod.id] ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {expandedModules[mod.id] && (
                      <div className="divide-y divide-slate-100">
                        {mod.days.map((d) => {
                          const available = isDayAvailable(d);
                          const sub = daySubmission(d.id);
                          return (
                            <div key={d.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors">
                              <div className="flex items-center gap-4 min-w-0 pr-4">
                                <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md shrink-0">
                                  Day {d.dayNumber}
                                </span>
                                <div className="min-w-0">
                                  <h4 className={`font-bold truncate ${available ? "text-slate-900" : "text-slate-400"}`}>
                                    {d.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                    {d.topics?.length || 0} Lessons • {d.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                {sub && (
                                  <Badge variant={sub.evalStatus === "pending" ? "warning" : "success"} className="text-[10px]">
                                    {sub.evalStatus === "pending" ? "Awaiting Review" : `Scored ${sub.percentage ?? 100}%`}
                                  </Badge>
                                )}

                                {available ? (
                                  <Button
                                    size="sm"
                                    onClick={() => { setActiveDayId(d.id); setActiveTab("player"); }}
                                    className="bg-orange-50 text-[#FF5A36] hover:bg-[#FF5A36] hover:text-white text-xs font-bold rounded-xl transition-all shadow-2xs"
                                  >
                                    Open Lesson
                                  </Button>
                                ) : (
                                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl">
                                    <Lock className="w-3.5 h-3.5" /> Locked
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB: PRACTICE ARENA (100+ PROBLEMS WORKSPACE)
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === "practice" && (
            <div className="space-y-6">
              <React.Suspense
                fallback={
                  <div className="py-24 text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-xs text-slate-400 font-medium">Loading Python Practice Arena...</p>
                  </div>
                }
              >
                <PracticeArena
                  studentEmail={student?.email || actorEmail}
                  initialProblemId={practiceInitialProblemId}
                  onNavigateToCurriculumDay={(dayNumber) => {
                    const d = allDays.find((day) => day.dayNumber === dayNumber);
                    if (d) {
                      setActiveDayId(d.id);
                      setActiveTab("player");
                    } else {
                      setActiveTab("course");
                    }
                  }}
                  onClearInitialProblem={() => setPracticeInitialProblemId(null)}
                />
              </React.Suspense>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB: LESSON PLAYER / READING PANE & WORKBENCH
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === "player" && (
            <div className="space-y-6">
              {activeDay ? (
                <div className="space-y-6">
                  {/* Top Navigation & Day Controls */}
                  <Card className="border-slate-200/80 rounded-3xl p-5 shadow-2xs bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Day Title & Breadcrumbs */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTab("course")}
                            className="text-xs font-bold text-slate-500 hover:text-slate-900 px-2.5 h-8 -ml-2"
                          >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Syllabus
                          </Button>
                          <span className="text-slate-300">/</span>
                          <Badge variant="outline" className="font-mono text-xs text-orange-600 bg-orange-50 border-orange-200">
                            Day {activeDay.dayNumber} of {totalDays}
                          </Badge>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-mono text-slate-500">
                            {activeDay.topics?.length || 0} Core Topics
                          </span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{activeDay.title}</h2>
                        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">{activeDay.description}</p>
                      </div>

                      {/* Right: Quick Day Switchers & Topic Sidebar Toggle */}
                      <div className="flex items-center gap-2 self-start lg:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!prevDay || !isDayAvailable(prevDay)}
                          onClick={() => prevDay && setActiveDayId(prevDay.id)}
                          className="text-xs font-bold border-slate-200 rounded-xl"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          <span>Prev Day</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!nextDay || !isDayAvailable(nextDay)}
                          onClick={() => nextDay && setActiveDayId(nextDay.id)}
                          className="text-xs font-bold border-slate-200 rounded-xl"
                        >
                          <span>Next Day</span>
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setIsTopicSidebarOpen(!isTopicSidebarOpen)}
                          className="text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                          {isTopicSidebarOpen ? <PanelLeftClose className="w-4 h-4 mr-1.5" /> : <PanelLeftOpen className="w-4 h-4 mr-1.5" />}
                          <span>{isTopicSidebarOpen ? "Hide Topics" : "Show Topics"}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Lesson Section Sub-Tabs */}
                    <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100 overflow-x-auto">
                      <button
                        onClick={() => setPlayerTab("theory")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                          playerTab === "theory"
                            ? "bg-[#FF5A36] text-white shadow-md shadow-orange-500/20"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Lesson Notes ({activeDay.topics?.length || 0})</span>
                      </button>

                      {activeDay.content?.workedExample && (
                        <button
                          onClick={() => setPlayerTab("worked_example")}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                            playerTab === "worked_example"
                              ? "bg-[#FF5A36] text-white shadow-md shadow-orange-500/20"
                              : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <FileCode className="w-3.5 h-3.5" />
                          <span>Worked Case Study</span>
                        </button>
                      )}

                      {((activeDay.content?.commonMistakes?.length || 0) > 0 || (activeDay.content?.practice?.length || 0) > 0) && (
                        <button
                          onClick={() => setPlayerTab("practice")}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                            playerTab === "practice"
                              ? "bg-[#FF5A36] text-white shadow-md shadow-orange-500/20"
                              : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Practice & Pitfalls</span>
                        </button>
                      )}

                      {activeDay.assessmentKey && (
                        <button
                          onClick={() => setPlayerTab("assessment")}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                            playerTab === "assessment"
                              ? "bg-[#FF5A36] text-white shadow-md shadow-orange-500/20"
                              : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Python Sandbox & Test</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setActiveTab("practice");
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200/60 ml-auto"
                      >
                        <Code className="w-3.5 h-3.5" />
                        <span>Practice Arena</span>
                      </button>
                    </div>
                  </Card>

                  {/* ── Sub-Tab 1: Lesson Notes & Topic Reader ────────────────── */}
                  {playerTab === "theory" && (
                    <div className="space-y-6">
                      {/* Learning Objectives Callout */}
                      {activeDay.content?.objectives && activeDay.content.objectives.length > 0 && (
                        <div className="bg-gradient-to-r from-orange-50/90 via-amber-50/60 to-orange-50/40 border border-orange-200/70 rounded-2xl p-5 space-y-3 shadow-2xs">
                          <div className="flex items-center gap-2 text-orange-950 font-black text-xs uppercase tracking-wider">
                            <Target className="w-4 h-4 text-[#FF5A36]" />
                            <span>Today's Learning Objectives</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {activeDay.content.objectives.map((obj: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{obj}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Two-Pane Documentation Layout */}
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Left Collapsible Topic Sidebar */}
                        {isTopicSidebarOpen && (
                          <div className="w-full md:w-80 shrink-0 bg-slate-50/80 border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs transition-all">
                            <div className="p-3.5 bg-slate-100/90 border-b border-slate-200/80 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-[#FF5A36]" />
                                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                                  Topics ({activeDay.topics?.length || 0})
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">Step Guide</span>
                            </div>

                            <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
                              {activeDay.topics?.map((topic: Topic, idx: number) => {
                                const isDone = completedTopicIds.includes(topic.id);
                                const isSelected = (expandedTopicId === topic.id) || (expandedTopicId === null && idx === 0);

                                return (
                                  <button
                                    key={topic.id}
                                    onClick={() => setExpandedTopicId(topic.id)}
                                    className={`w-full p-3.5 flex items-start justify-between text-left transition-all group ${
                                      isSelected
                                        ? "bg-white border-l-4 border-[#FF5A36] shadow-2xs"
                                        : "hover:bg-slate-100/70"
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5 min-w-0 pr-2">
                                      <span className={`w-5 h-5 rounded-full font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 ${
                                        isSelected ? "bg-[#FF5A36] text-white" : "bg-slate-200 text-slate-700"
                                      }`}>
                                        {topic.order || idx + 1}
                                      </span>
                                      <div className="min-w-0">
                                        <h4 className={`text-xs leading-snug line-clamp-2 ${isSelected ? "font-black text-slate-900" : "font-semibold text-slate-700 group-hover:text-slate-900"}`}>
                                          {topic.title}
                                        </h4>
                                      </div>
                                    </div>

                                    <span className="shrink-0 mt-0.5">
                                      {isDone ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                                      )}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Right Content Reading Pane */}
                        <div className="flex-1 min-w-0 w-full bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xs">
                          {(() => {
                            const topicsList = activeDay.topics || [];
                            const activeTopicIndex = topicsList.findIndex((t: Topic, idx: number) =>
                              expandedTopicId ? t.id === expandedTopicId : idx === 0
                            );
                            const activeTopic = topicsList[activeTopicIndex >= 0 ? activeTopicIndex : 0];

                            if (!activeTopic) {
                              return <p className="text-xs text-slate-400 italic">No topic available in this module.</p>;
                            }

                            const isDone = completedTopicIds.includes(activeTopic.id);
                            const dayTopic = (activeDay.content?.topics || []).find(
                              (t: any) =>
                                t.id === activeTopic.id ||
                                t.order === activeTopic.order ||
                                (t.title && activeTopic.title && t.title.trim().toLowerCase() === activeTopic.title.trim().toLowerCase())
                            );
                            const theory = dayTopic?.theoryContent ?? activeTopic.theoryContent;
                            const codeExamples = dayTopic?.codeExamples ?? activeTopic.codeExamples;

                            const prevTopic = activeTopicIndex > 0 ? topicsList[activeTopicIndex - 1] : null;
                            const nextTopic = activeTopicIndex < topicsList.length - 1 ? topicsList[activeTopicIndex + 1] : null;

                            return (
                              <div className="space-y-6">
                                {/* Topic Header */}
                                <div className="flex items-center justify-between border-b border-slate-100 pb-5 flex-wrap gap-4">
                                  <div>
                                    <span className="text-[10px] font-mono text-orange-600 font-bold uppercase tracking-wider block">
                                      Topic {activeTopic.order || activeTopicIndex + 1} of {topicsList.length}
                                    </span>
                                    <h3 className="text-xl font-black text-slate-900 mt-1">{activeTopic.title}</h3>
                                  </div>

                                  <Button
                                    onClick={() => handleMarkTopic(activeTopic.id, !isDone)}
                                    className={`font-extrabold text-xs rounded-xl shadow-2xs transition-all ${
                                      isDone
                                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                                        : "bg-[#FF5A36] text-white hover:bg-orange-600 shadow-orange-500/20"
                                    }`}
                                  >
                                    {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-700 mr-1.5" /> : <Circle className="w-4 h-4 text-white/80 mr-1.5" />}
                                    {isDone ? "Completed Topic" : "Mark as Complete"}
                                  </Button>
                                </div>

                                {/* Theory Paragraphs */}
                                {theory ? (
                                  <div className="space-y-4 text-xs text-slate-800 leading-relaxed font-sans">
                                    {theory.split("\n\n").map((para: string, pIdx: number) => (
                                      <div key={pIdx} className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 text-slate-800 text-xs leading-relaxed font-sans shadow-2xs">
                                        {para}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 italic">
                                    No written notes authored for {activeTopic.title} yet.
                                  </div>
                                )}

                                {/* Code Demonstrations */}
                                {codeExamples && codeExamples.length > 0 && (
                                  <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <span className="text-[11px] font-mono font-bold text-slate-600 uppercase tracking-wider block">
                                      Code Demonstrations ({codeExamples.length}):
                                    </span>
                                    {codeExamples.map((ex: any, exIdx: number) => (
                                      <CodeSnippet
                                        key={exIdx}
                                        title={ex.title || `Example ${exIdx + 1}`}
                                        code={typeof ex === "string" ? ex : ex.code || JSON.stringify(ex)}
                                        explanation={ex.explanation}
                                      />
                                    ))}
                                  </div>
                                )}

                                {/* Bottom Topic Navigation Controls */}
                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                                  {prevTopic ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setExpandedTopicId(prevTopic.id)}
                                      className="text-xs font-bold rounded-xl border-slate-200"
                                    >
                                      <ChevronLeft className="w-4 h-4 mr-1" />
                                      <span>Prev Topic: {prevTopic.title}</span>
                                    </Button>
                                  ) : <div />}

                                  {nextTopic ? (
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        handleMarkTopic(activeTopic.id, true);
                                        setExpandedTopicId(nextTopic.id);
                                      }}
                                      className="text-xs font-extrabold bg-[#FF5A36] hover:bg-orange-600 text-white rounded-xl shadow-md shadow-orange-500/20"
                                    >
                                      <span>Complete & Next Topic: {nextTopic.title}</span>
                                      <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        handleMarkTopic(activeTopic.id, true);
                                        setPlayerTab("assessment");
                                      }}
                                      className="text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20"
                                    >
                                      <span>Finish Lesson & Go to Test</span>
                                      <Terminal className="w-4 h-4 ml-1.5" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Sub-Tab 2: Worked Example & Practical Scenario ────────── */}
                  {playerTab === "worked_example" && activeDay.content?.workedExample && (
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-wider">
                          <FileCode className="w-5 h-5 text-[#FF5A36]" />
                          <span>{activeDay.content.workedExample.title || "Industry Case Implementation"}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs text-slate-700 leading-relaxed font-sans">{activeDay.content.workedExample.caseStudy}</p>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {activeDay.content.workedExample.entities?.map((ent: string, i: number) => (
                            <Badge key={i} variant="secondary" className="font-mono text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                              Entity: {ent}
                            </Badge>
                          ))}
                          {activeDay.content.workedExample.data?.map((d: string, i: number) => (
                            <Badge key={i} variant="secondary" className="font-mono text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                              Data: {d}
                            </Badge>
                          ))}
                          {activeDay.content.workedExample.operations?.map((op: string, i: number) => (
                            <Badge key={i} variant="secondary" className="font-mono text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                              Op: {op}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Algorithm & Pseudocode */}
                      {activeDay.content.workedExample.algorithm && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2.5 shadow-2xs">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Step-By-Step Algorithm:</span>
                            <ol className="list-decimal list-inside text-xs text-slate-700 space-y-1.5 leading-relaxed">
                              {activeDay.content.workedExample.algorithm.map((step: string, sIdx: number) => (
                                <li key={sIdx}>{step}</li>
                              ))}
                            </ol>
                          </div>

                          {activeDay.content.workedExample.pseudocode && (
                            <div className="bg-[#0D1117] text-slate-200 p-5 rounded-2xl font-mono text-xs space-y-2 border border-slate-800 shadow-lg">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Pseudocode:</span>
                              <pre className="whitespace-pre-wrap leading-relaxed text-emerald-400">{activeDay.content.workedExample.pseudocode.join("\n")}</pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Implementation Challenge & Conceptual Walkthrough */}
                      <div className="bg-gradient-to-r from-orange-50/80 to-amber-50/60 border border-orange-200/80 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-2 text-orange-950 font-black text-xs uppercase tracking-wider">
                          <Code className="w-4 h-4 text-[#FF5A36]" />
                          <span>Implementation Challenge</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          Follow the step-by-step algorithm and pseudocode blueprint above to write your own implementation. Open the <strong className="text-orange-600 font-bold">Python Sandbox & Test</strong> tab to write, test, and submit your code.
                        </p>
                        {activeDay.content.workedExample.codeExplanation && (
                          <div className="pt-2 border-t border-orange-200/60 text-xs text-slate-600">
                            <span className="font-semibold text-slate-800 block mb-1">Key Logic & Architectural Considerations:</span>
                            <p className="leading-relaxed">{activeDay.content.workedExample.codeExplanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Sub-Tab 3: Practice & Common Pitfalls ─────────────────── */}
                  {playerTab === "practice" && (
                    <div className="space-y-6">
                      {/* Common Mistakes */}
                      {activeDay.content?.commonMistakes && activeDay.content.commonMistakes.length > 0 && (
                        <div className="bg-rose-50/60 border border-rose-200/70 rounded-3xl p-6 space-y-3 shadow-2xs">
                          <div className="flex items-center gap-2 text-rose-950 font-black text-xs uppercase tracking-wider">
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                            <span>COMMON PITFALLS & MISTAKES TO AVOID</span>
                          </div>
                          <div className="space-y-2">
                            {activeDay.content.commonMistakes.map((mistake: string, mIdx: number) => (
                              <div key={mIdx} className="flex items-start gap-2.5 text-xs text-rose-950 leading-relaxed">
                                <span className="text-rose-500 font-bold shrink-0">•</span>
                                <span>{mistake}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Practice Exercises */}
                      {activeDay.content?.practice && activeDay.content.practice.length > 0 && (
                        <div className="bg-blue-50/50 border border-blue-200/70 rounded-3xl p-6 space-y-4 shadow-2xs">
                          <div className="flex items-center gap-2 text-blue-950 font-black text-xs uppercase tracking-wider">
                            <Lightbulb className="w-4 h-4 text-blue-600" />
                            <span>PRACTICE TASKS & EXERCISES ({activeDay.content.practice.length})</span>
                          </div>
                          <div className="space-y-3">
                            {activeDay.content.practice.map((task: any, tIdx: number) => (
                              <div key={tIdx} className="p-4 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-800 space-y-1 shadow-2xs">
                                <span className="font-bold text-blue-600">Task {tIdx + 1}:</span>
                                <p className="text-slate-700 leading-relaxed">{task.question}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Sub-Tab 4: Python Compiler & Graded Assessment ────────── */}
                  {playerTab === "assessment" && activeDay.assessmentKey && (
                    <div className="space-y-6">
                      {/* Practical Assessment Card */}
                      <div className="bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-orange-50/20 border border-orange-200/80 rounded-3xl p-6 space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="font-extrabold text-sm text-orange-950">
                            {activeDay.content?.workedExample?.title || `Day ${activeDay.dayNumber} Practical Coding Assessment`}
                          </h4>
                          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 font-bold border border-orange-200/60">
                            Day {activeDay.dayNumber} Evaluation
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-sans">
                          {activeDay.content?.workedExample?.caseStudy || activeDay.description || "Solve the daily coding challenge based on today's concepts."}
                        </p>

                        {activeDay.content?.objectives && activeDay.content.objectives.length > 0 && (
                          <div className="space-y-1.5 pt-2">
                            <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider">
                              Assessment Objectives:
                            </span>
                            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                              {activeDay.content.objectives.map((obj: string, idx: number) => (
                                <li key={idx}>{obj}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Realtime Live Proctoring Telemetry Pill */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-3 shadow-md text-xs font-mono">
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="font-bold text-slate-200">Live Assessment Proctoring</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px] text-slate-400 flex-wrap">
                          <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                            Tab Switches: <strong className={tabSwitchCount > 0 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>{tabSwitchCount}</strong>
                          </span>
                          <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                            Focus Lost: <strong className={focusLostCount > 0 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>{focusLostCount}</strong>
                          </span>
                          <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                            Paste Events: <strong className="text-slate-200 font-bold">{pasteCount}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Interactive Python Compiler Sandbox */}
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-[#FF5A36]" />
                          Interactive Python Sandbox (Pyodide WASM Engine):
                        </label>
                        <PythonCompiler
                          starterCode={`# Day ${activeDay.dayNumber}: ${activeDay.title || "Daily Assessment Sandbox"}\n# Write your Python solution below:\n\n`}
                          topicId={activeDay.id}
                          studentId={student.id}
                        />
                      </div>

                      {/* Final Solution Code Submission Box */}
                      <div className="space-y-3 pt-4">
                        <label className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                          <Send className="w-4 h-4 text-emerald-600" />
                          Final Solution Code Submission:
                        </label>
                        <div className="relative">
                          <textarea
                            rows={9}
                            value={assessmentCode}
                            onChange={(e) => {
                              setAssessmentCode(e.target.value);
                              setActiveSubmissionRequestId(null);
                            }}
                            placeholder={`# Write or paste your complete Python solution code for Day ${activeDay.dayNumber} here...`}
                            className="w-full font-mono text-xs p-4 bg-slate-900 text-emerald-300 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-[#FF5A36] outline-none leading-relaxed shadow-xl"
                          />
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <Button
                            onClick={() => submitAssessment(activeDay)}
                            disabled={assessmentBusy || !assessmentCode.trim()}
                            className="bg-[#FF5A36] hover:bg-orange-600 text-white text-xs font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
                          >
                            {assessmentBusy ? (
                              <span className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Submitting & Evaluating Code...
                              </span>
                            ) : (
                              "Submit Daily Assessment"
                            )}
                          </Button>
                        </div>

                        {/* AI Grading & Submission Feedback Card */}
                        {(() => {
                          const sub = daySubmission(activeDay.id);
                          const resultToShow = assessmentResult || (sub ? {
                            evalStatus: sub.evalStatus,
                            percentage: sub.percentage ?? (sub.score ? Math.round((sub.score / (sub.maxScore || 10)) * 100) : 0),
                            score: sub.score,
                            maxScore: sub.maxScore || 10,
                            passedTests: sub.passedTests ?? 0,
                            failedTests: sub.failedTests ?? 0,
                            feedback: sub.feedback,
                            evalResults: sub.evalDetails?.results || [],
                          } : null);

                          if (!resultToShow) return null;

                          return (
                            <div className={`rounded-3xl border p-6 space-y-4 shadow-2xs ${
                              resultToShow.evalStatus === "auto" || resultToShow.evalStatus === "manual"
                                ? "bg-emerald-50/60 border-emerald-200"
                                : "bg-amber-50/60 border-amber-200"
                            }`}>
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                  <h4 className="text-sm font-black text-slate-900">
                                    {resultToShow.isManualReviewDay
                                      ? "Submitted for instructor review"
                                      : resultToShow.evalStatus === "auto" || resultToShow.evalStatus === "manual"
                                      ? `Assessment Scored: ${resultToShow.percentage}% (${resultToShow.score}/${resultToShow.maxScore ?? 10} Marks)`
                                      : "Submitted — Awaiting Instructor Review"}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-2">
                                  {(resultToShow.evalStatus === "auto" || resultToShow.evalStatus === "manual") && (
                                    <Badge variant="success" className="font-mono text-xs">
                                      {resultToShow.passedTests ?? 0} Passed · {resultToShow.failedTests ?? 0} Failed
                                    </Badge>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => { setAssessmentResult(null); setEvalStatus("idle"); }}
                                    className="text-xs font-bold border-slate-300"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-attempt
                                  </Button>
                                </div>
                              </div>

                              {resultToShow.feedback && (
                                <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-800 leading-relaxed shadow-2xs">
                                  <span className="font-extrabold text-[11px] text-orange-600 block uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-[#FF5A36]" /> AI Evaluator Feedback
                                  </span>
                                  {resultToShow.feedback}
                                </div>
                              )}

                              {(resultToShow.evalStatus === "auto" || resultToShow.evalStatus === "manual") && (resultToShow.evalResults || []).length > 0 && (
                                <div className="space-y-2">
                                  {resultToShow.evalResults.map((r: any, idx: number) => (
                                    <div key={idx} className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${
                                      r.pass ? "bg-emerald-100/70 border-emerald-200 text-emerald-950" : "bg-rose-50 border-rose-200 text-rose-950"
                                    }`}>
                                      {r.pass ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                                      <div className="min-w-0 space-y-0.5">
                                        <span className="font-bold block">{r.pass ? "Test Case Passed" : "Test Case Failed"}</span>
                                        <span className="text-slate-700 block">Input: <code className="font-mono bg-white/70 px-1.5 py-0.5 rounded">{r.input?.replace(/\n/g, " / ") || "(none)"}</code></span>
                                        {!r.pass && (
                                          <>
                                            <span className="text-slate-700 block">Expected: <code className="font-mono bg-white/70 px-1.5 py-0.5 rounded">{r.expected}</code></span>
                                            <span className="text-rose-700 font-mono block">Actual: {r.actual}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No Day Selected"
                  description="Choose a day from your course roadmap or syllabus to open the lesson."
                  action={
                    <Button
                      onClick={() => setActiveTab("course")}
                      className="bg-orange-50 text-[#FF5A36] hover:bg-[#FF5A36] hover:text-white text-xs font-bold rounded-xl transition-all shadow-2xs"
                    >
                      Go to Syllabus
                    </Button>
                  }
                />
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB: ANNOUNCEMENTS
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === "announcements" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader
                  title="Cohort Announcements"
                  subtitle="Important updates, assignment notices, and broadcast messages from instructors"
                />
                {announcements.length > 0 && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60 inline-flex items-center gap-1.5 w-fit">
                    <Check className="w-3.5 h-3.5" /> All Announcements Seen
                  </span>
                )}
              </div>

              {announcements.length === 0 ? (
                <EmptyState
                  title="No Announcements Yet"
                  description="When instructors post notices for your cohort, they will appear here in real-time."
                />
              ) : (
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <Card key={ann.id} className="shadow-2xs border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xs">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-extrabold text-slate-900">{ann.title}</CardTitle>
                            <span className="text-[10px] font-mono text-slate-400">By {ann.author}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Seen
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Date(ann.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB: PROFILE & SETTINGS
          ═══════════════════════════════════════════════════════════════════ */}
          {/* ═══════════════════════════════════════════════════════════════════
              TAB: PROFILE & SETTINGS
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-4xl">
              <PageHeader
                title="Student Profile & Certification"
                subtitle="Live academic transcript, syllabus progress, and certification benchmarks"
              />

              <Card className="shadow-2xs border-slate-200/80 rounded-3xl overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 ring-4 ring-orange-500/20 shadow-md">
                      <AvatarImage src={user?.imageUrl} alt={student.fullName} />
                      <AvatarFallback className="bg-orange-100 text-[#FF5A36] font-black text-lg">
                        {student.fullName?.slice(0, 2).toUpperCase() || "ST"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl font-black text-slate-900">{student.fullName}</CardTitle>
                      <p className="text-xs font-mono text-slate-500">{student.email}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="primary" className="text-[10px]">
                          {studentBatch?.name || "Self-Paced"}
                        </Badge>
                        <Badge variant={isCertified ? "success" : "warning"} className="text-[10px]">
                          {isCertified ? "Verified Certified" : "Certification In Progress"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-slate-200/60">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Overall Completion Score
                    </span>
                    <span className="text-2xl font-black text-[#FF5A36]">
                      {overallCertProgress}%
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Personal Student Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Full Name</span>
                      <span className="font-bold text-slate-900 mt-1 block">{student.fullName}</span>
                    </div>

                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Email Address</span>
                      <span className="font-bold text-slate-900 mt-1 block">{student.email}</span>
                    </div>

                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider block">College / University</span>
                      <span className="font-bold text-slate-900 mt-1 block">{student.collegeName || "SRKIT"}</span>
                    </div>

                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Department / Branch</span>
                      <span className="font-bold text-slate-900 mt-1 block">{student.branch || "Computer Science"}</span>
                    </div>
                  </div>

                  {/* Real Live Certification Requirements Checklist */}
                  <div className="bg-gradient-to-br from-orange-50/60 via-amber-50/30 to-orange-50/10 border border-orange-200/80 rounded-3xl p-6 space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-orange-950 font-black text-xs uppercase tracking-wider">
                        <Award className="w-5 h-5 text-[#FF5A36]" />
                        <span>Certification Progress & Live Benchmarks</span>
                      </div>
                      <span className="text-xs font-mono font-black text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
                        {overallCertProgress}% Overall Progress
                      </span>
                    </div>

                    <Progress value={overallCertProgress} className="h-2.5 bg-orange-100/80" />

                    {/* 4 Real Live Requirement Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {/* 1. Daily Test Performance */}
                      <div className="p-4 bg-white/90 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">1. Daily Assessment Average</span>
                          <Badge variant={dailyPerfMet ? "success" : "outline"} className="text-[9px]">
                            {dailyPerfMet ? "Passed" : `Target ≥ ${dailyThreshold}%`}
                          </Badge>
                        </div>
                        <p className="text-base font-black text-slate-900">
                          {gradedAvgPct !== null ? `${gradedAvgPct}%` : "0% (No tests graded yet)"}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          Based on {gradedDaily.length} graded test{gradedDaily.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      {/* 2. Daily Test Volume */}
                      <div className="p-4 bg-white/90 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">2. Daily Tests Submitted</span>
                          <Badge variant={testVolumeMet ? "success" : "outline"} className="text-[9px]">
                            {testVolumeMet ? "Met Requirement" : `Min ${minRequiredTestsCount} Required`}
                          </Badge>
                        </div>
                        <p className="text-base font-black text-slate-900">
                          {gradedDaily.length} / {totalDays} Tests Graded
                        </p>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {pendingManualCount > 0 ? `${pendingManualCount} pending review` : "All submissions evaluated"}
                        </span>
                      </div>

                      {/* 3. Course Topics Completed */}
                      <div className="p-4 bg-white/90 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">3. Syllabus Curriculum</span>
                          <Badge variant={realProgressPct >= 80 ? "success" : "outline"} className="text-[9px]">
                            {realProgressPct}% Finished
                          </Badge>
                        </div>
                        <p className="text-base font-black text-slate-900">
                          {completedTopics} / {totalTopics} Topics Completed
                        </p>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          Across {allDays.length} course days
                        </span>
                      </div>

                      {/* 4. Capstone Final Exam */}
                      <div className="p-4 bg-white/90 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">4. Capstone Final Exam</span>
                          <Badge variant={finalExamMet ? "success" : "outline"} className="text-[9px]">
                            {finalExamMet ? "Passed" : `Target ≥ ${finalThreshold}%`}
                          </Badge>
                        </div>
                        <p className="text-base font-black text-slate-900">
                          {finalExamScore !== null ? `${finalExamScore}%` : "Not Attempted"}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {finalExamSub ? "Final exam submitted" : "Will unlock at end of cohort"}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                      Certification is awarded when a student completes the required curriculum, achieves at least <strong>{dailyThreshold}%</strong> daily assessment average, and scores <strong>{finalThreshold}%</strong> or higher on the Capstone Final Exam.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
