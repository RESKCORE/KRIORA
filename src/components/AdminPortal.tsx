import React, { useState, useRef, useEffect } from "react";
import {
  Layers, Users, BookOpen, Clock, FileText, LogOut,
  Search, Plus, Edit, Trash2, Check, X, AlertCircle,
  ChevronRight, ChevronLeft, RefreshCw, Lock, Unlock, Play, TrendingUp, Eye,
  Sparkles, Send, Brain, Monitor, AlertTriangle, BarChart2,
  UserPlus, GraduationCap, CheckCircle2, Zap, Megaphone,
  Activity, CheckSquare, Award, ArrowUpRight, ChevronDown,
  Filter, MoreHorizontal
} from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StatCard, StatusPill, PageHeader, EmptyState } from "@/components/ui/admin-shared";
import type {
  Course, Student, Announcement, AuditLog, LMSConfig,
  CourseDay, CourseModule, Topic, Batch, BatchDayAccess, TestSubmission
} from "../types";

interface AdminPortalProps {
  actorEmail: string;
  courses: Course[];
  students: Student[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  config: LMSConfig;
  batches: Batch[];
  dayAccess: BatchDayAccess[];
  testSubmissions: TestSubmission[];
  onLogout: () => void;
  onRefreshState: () => void;
}

type AdminTab = "dashboard" | "students" | "batches" | "assessments" | "marks" | "courses" | "content" | "analytics" | "tests" | "announcements" | "audit" | "copilot";

export default function AdminPortal({
  actorEmail, courses, students, announcements, auditLogs, config, batches, dayAccess, testSubmissions, onLogout, onRefreshState
}: AdminPortalProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      try {
        localStorage.removeItem("kriora_theme");
      } catch (_) {}
    }
  }, []);

  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("All");
  const [studentBatchFilter, setStudentBatchFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ fullName: "", email: "", phone: "", collegeName: "", branch: "", batchId: "" });
  const [assessmentFilterTab, setAssessmentFilterTab] = useState<"all" | "draft" | "approved">("all");
  const [globalSearch, setGlobalSearch] = useState("");
  const [dateRange, setDateRange] = useState("Today, Oct 24");
  const [expandedCurriculumPhases, setExpandedCurriculumPhases] = useState<Record<string, boolean>>({
    "mod-1": true,
    "mod-2": true,
    "mod-3": true,
  });

  // Convex mutations
  const studentActionMut = useMutation(api.lms.studentAdminAction);
  const registerStudentMut = useMutation(api.lms.registerStudent);
  const saveBatchMut = useMutation(api.lms.saveBatch);
  const deleteBatchMut = useMutation(api.lms.deleteBatch);
  const enrollStudentMut = useMutation(api.lms.enrollStudentInBatch);
  const setStudentBatchMut = useMutation(api.lms.setStudentBatch);
  const releaseDayToBatchMut = useMutation(api.lms.releaseDayToBatch);
  const lockDayForBatchMut = useMutation(api.lms.lockDayForBatch);
  const gradeSubmissionMut = useMutation(api.lms.gradeSubmission);
  const upsertAnnMut = useMutation(api.lms.upsertAnnouncement);
  const deleteAnnMut = useMutation(api.lms.deleteAnnouncement);
  const saveConfigMut = useMutation(api.lms.saveLMSConfig);

  const withActorEmail = <T extends object>(mutate: (args: T) => Promise<any>) => {
    return (args: T) => mutate({ ...args, actorEmail } as T);
  };

  const runStudentActionMut = withActorEmail(studentActionMut);
  const runRegisterStudentMut = withActorEmail(registerStudentMut);
  const runSaveBatchMut = withActorEmail(saveBatchMut);
  const runDeleteBatchMut = withActorEmail(deleteBatchMut);
  const runEnrollStudentMut = withActorEmail(enrollStudentMut);
  const runSetStudentBatchMut = withActorEmail(setStudentBatchMut);
  const runReleaseDayToBatchMut = withActorEmail(releaseDayToBatchMut);
  const runLockDayForBatchMut = withActorEmail(lockDayForBatchMut);
  const runGradeSubmissionMut = withActorEmail(gradeSubmissionMut);
  const runUpsertAnnMut = withActorEmail(upsertAnnMut);
  const runDeleteAnnMut = withActorEmail(deleteAnnMut);
  const runSaveConfigMut = withActorEmail(saveConfigMut);

  // Derived Analytics Data directly from props
  const attendanceData: any[] = [];
  const sessionData: any[] = [];
  const testSessionData: any[] = [];
  const testEventData: any[] = [];
  const assessmentData = null;

  // Batch management state
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [batchForm, setBatchForm] = useState({
    name: "", courseId: "python-mastery", capacity: "5",
    startDate: "", endDate: "", startTime: "18:00", endTime: "20:00",
    daysOfWeek: [] as string[], status: "active", description: "",
  });
  const [assignStudentId, setAssignStudentId] = useState("");
  const [releaseDayId, setReleaseDayId] = useState("");
  const [transferStudentId, setTransferStudentId] = useState("");
  const [transferBatchId, setTransferBatchId] = useState("");
  const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({});
  const [gradeFeedback, setGradeFeedback] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [aiEvaluatingId, setAiEvaluatingId] = useState<string | null>(null);

  // Content management state
  const [selectedCourseId, setSelectedCourseId] = useState<string>("python-mastery");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");

  // Course Content viewer state
  const [contentDayId, setContentDayId] = useState<string>("");
  const [contentSearch, setContentSearch] = useState("");
  const [contentModuleFilter, setContentModuleFilter] = useState<string>("");
  const [contentStatusFilter, setContentStatusFilter] = useState<string>("all");
  const [previewDayId, setPreviewDayId] = useState<string | null>(null);
  const [previewTopicId, setPreviewTopicId] = useState<string | null>(null);

  // Gemini content generation for a previewed day
  const { getToken } = useAuth();
  const [genBusy, setGenBusy] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const generateDayContent = async (regenerate: boolean) => {
    if (!previewDayId) return;
    if (regenerate && !window.confirm("Regenerating will REPLACE the existing stored lesson content for this day. Continue?")) return;
    setGenBusy(true);
    setGenError(null);
    try {
      const token = await getToken();
      const res = await fetch("/api/lms/generate-day-content", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dayId: previewDayId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Content generation failed.");
      setPreviewTopicId(null);
    } catch (err: any) {
      setGenError(err.message || "Content generation failed.");
    } finally {
      setGenBusy(false);
    }
  };

  // Canonical day lesson content for the Course Content preview
  const adminDayContent = useQuery(
    api.lms.getDayContent,
    previewDayId ? { dayId: previewDayId, actorEmail } : "skip"
  );

  // Cloud AI Copilot Action
  const adminCopilotChatAction = useAction(api.lms.adminCopilotChat);

  // Body scroll lock & ESC key listener for Admin Lesson Preview Modal
  useEffect(() => {
    if (!previewDayId) return;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewDayId(null);
        setPreviewTopicId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewDayId]);

  // Announcement state
  const [annForm, setAnnForm] = useState({ id: "", title: "", content: "", author: "Director Admin", isPinned: false });
  const [isAnnEditing, setIsAnnEditing] = useState(false);

  // AI Copilot
  interface CopilotMsg {
    id: string;
    sender: "user" | "ai";
    text: string;
    actionExecuted?: {
      type: "create_announcement" | "approve_student" | "release_day";
      status: "success" | "failed";
      summary: string;
      details?: any;
    };
  }

  const [copilotMessages, setCopilotMessages] = useState<CopilotMsg[]>([
    {
      id: "init",
      sender: "ai",
      text: "👋 Welcome! I am your Kriora Admin AI Copilot with autonomous administrative execution powers.\n\nI can automatically draft & publish announcements to all students on Convex Cloud, release learning modules, summarize student performance, and assist with platform operations.",
    }
  ]);
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotTyping, setCopilotTyping] = useState(false);

  // Config
  const [configForm, setConfigForm] = useState<LMSConfig>(config);

  // Content Release State
  const [contentReleaseBatchId, setContentReleaseBatchId] = useState<string>("");
  const [contentReleaseSearch, setContentReleaseSearch] = useState<string>("");
  const [contentReleaseModuleFilter, setContentReleaseModuleFilter] = useState<string>("all");

  // Daily Performance Marks State
  const [marksSearch, setMarksSearch] = useState<string>("");
  const [marksBatchFilter, setMarksBatchFilter] = useState<string>("all");
  const [marksDayFilter, setMarksDayFilter] = useState<string>("all");
  const [marksTypeFilter, setMarksTypeFilter] = useState<string>("all");
  const [marksViewMode, setMarksViewMode] = useState<"submissions" | "matrix">("submissions");

  // Grading modal state
  const [gradingSubmission, setGradingSubmission] = useState<TestSubmission | null>(null);

  // Derived
  const course = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const allDays = course?.modules.flatMap((m) => m.days) || [];
  const previewDay = allDays.find((d) => d.id === previewDayId);
  const pendingStudents = students.filter((s) => s.status === "Pending");
  const approvedStudents = students.filter((s) => s.status === "Approved");
  const validTestSubmissions = React.useMemo(() => {
    return testSubmissions.filter((sub) => students.some((st) => st.id === sub.studentId));
  }, [testSubmissions, students]);
  const filteredStudents = students.filter((s) => {
    const matchSearch = s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) || 
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.collegeName && s.collegeName.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.branch && s.branch.toLowerCase().includes(studentSearch.toLowerCase()));
    const matchStatus = studentStatusFilter === "All" || s.status === studentStatusFilter;
    const matchBatch = studentBatchFilter === "All" || (studentBatchFilter === "Unassigned" ? !s.batchId : s.batchId === studentBatchFilter);
    return matchSearch && matchStatus && matchBatch;
  });

  // ── Student Actions ────────────────────────────────────────────────────────
  const handleStudentAction = async (studentId: string, action: string) => {
    try {
      await runStudentActionMut({ studentId, action });
      setSelectedStudent(null);
    } catch (err: any) {
      alert(err.message || "Action failed");
    }
  };

  // ── Content Release ────────────────────────────────────────────────────────
  // ── Batch helpers ──────────────────────────────────────────────────────────
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const batchStatus = (b: Batch): Batch["status"] => {
    if (b.status === "cancelled") return "cancelled";
    const today = todayStr();
    if (b.endDate && b.endDate < today) return "completed";
    if (b.startDate > today) return "upcoming";
    return "active";
  };
  const batchStudents = (batchId: string) => students.filter((s) => s.batchId === batchId);
  const batchCurrentDay = (batchId: string) =>
    dayAccess.filter((a) => a.batchId === batchId && !a.studentId && a.dayId !== "final-master-exam")
      .reduce((mx, a) => Math.max(mx, a.dayNumber), 0);
  const batchReleased = (batchId: string, dayId: string, studentId?: string) =>
    dayAccess.some((a) => a.batchId === batchId && a.dayId === dayId && (a.studentId || null) === (studentId || null));

  const studentSubs = (studentId: string) => validTestSubmissions.filter((s) => s.studentId === studentId);
  const studentDailyPct = (studentId: string) => {
    const daily = studentSubs(studentId).filter((s) => s.testType === "daily" && s.score !== undefined);
    const totalScore = daily.reduce((sum, s) => sum + (s.score || 0), 0);
    const totalMax = daily.reduce((sum, s) => sum + s.maxScore, 0);
    return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null;
  };
  const studentCert = (studentId: string) => {
    const daily = studentDailyPct(studentId);
    const finalSub = studentSubs(studentId).find((s) => s.testType === "final" && s.score !== undefined);
    const finalPct = finalSub?.percentage ?? null;
    const dThresh = config.dailyPerfThreshold ?? 70;
    const fThresh = config.finalExamThreshold ?? 80;
    const eligible = daily !== null && finalPct !== null && daily >= dThresh && finalPct >= fThresh;
    return { daily, finalPct, eligible };
  };

  const run = async (fn: () => Promise<any>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Request failed"); }
    setBusy(false);
  };

  // ── Batch actions ──────────────────────────────────────────────────────────
  const openBatchForm = (batch?: Batch) => {
    if (batch) {
      setEditingBatchId(batch.id);
      setBatchForm({
        name: batch.name, courseId: batch.courseId, capacity: String(batch.capacity),
        startDate: batch.startDate, endDate: batch.endDate || "",
        startTime: batch.startTime, endTime: batch.endTime,
        daysOfWeek: batch.daysOfWeek || [], status: batch.status, description: batch.description || "",
      });
    } else {
      setEditingBatchId(null);
      setBatchForm({ name: "", courseId: "python-mastery", capacity: "5", startDate: todayStr(), endDate: "", startTime: "18:00", endTime: "20:00", daysOfWeek: [], status: "active", description: "" });
    }
    setShowBatchForm(true);
  };

  const saveBatch = () => {
    const payload = {
      id: editingBatchId || undefined,
      name: batchForm.name,
      courseId: batchForm.courseId,
      capacity: parseInt(batchForm.capacity, 10) || 5,
      startDate: batchForm.startDate,
      endDate: batchForm.endDate,
      startTime: batchForm.startTime,
      endTime: batchForm.endTime,
      daysOfWeek: batchForm.daysOfWeek,
      status: batchForm.status,
      description: batchForm.description,
    };
    return run(() => runSaveBatchMut(payload)).then(() => setShowBatchForm(false));
  };

  const deleteBatch = (b: Batch) => {
    if (!confirm(`Delete batch "${b.name}"? Its students will be unassigned.`)) return;
    if (selectedBatchId === b.id) setSelectedBatchId(null);
    run(() => runDeleteBatchMut({ batchId: b.id }));
  };

  const enrollStudent = (studentId: string, batchId: string) =>
    run(() => runEnrollStudentMut({ studentId, batchId })).then(() => setAssignStudentId(""));
  const transferStudent = (studentId: string, toBatchId: string) =>
    run(() => runSetStudentBatchMut({ studentId, batchId: toBatchId })).then(() => { setTransferStudentId(""); setTransferBatchId(""); });
  const removeFromBatch = (studentId: string) => {
    if (!confirm("Remove this student from the batch?")) return;
    run(() => runSetStudentBatchMut({ studentId, batchId: "" }));
  };
  const releaseDay = (batchId: string, dayId: string, studentId?: string) =>
    run(() => runReleaseDayToBatchMut({ batchId, courseId: "python-mastery", dayId, studentId })).then(() => setReleaseDayId(""));
  const unReleaseDay = (batchId: string, dayId: string) =>
    run(() => runLockDayForBatchMut({ batchId, dayId }));

  const releaseAllDaysForBatch = async (batchId: string) => {
    if (!confirm("Release all 40 curriculum days to this batch?")) return;
    const daysToRelease = allDays.filter((d) => !batchReleased(batchId, d.id));
    if (daysToRelease.length === 0) return alert("All 40 days are already released for this batch.");
    setBusy(true);
    try {
      for (const d of daysToRelease) {
        await runReleaseDayToBatchMut({ batchId, courseId: "python-mastery", dayId: d.id });
      }
    } catch (e: any) {
      alert(e.message || "Failed to release all days");
    }
    setBusy(false);
  };

  const lockAllDaysForBatch = async (batchId: string) => {
    if (!confirm("Lock all curriculum days for this batch?")) return;
    const released = allDays.filter((d) => batchReleased(batchId, d.id));
    if (released.length === 0) return alert("All days are already locked for this batch.");
    setBusy(true);
    try {
      for (const d of released) {
        await runLockDayForBatchMut({ batchId, dayId: d.id });
      }
    } catch (e: any) {
      alert(e.message || "Failed to lock days");
    }
    setBusy(false);
  };

  const handleGradeSubmission = (sub: TestSubmission) => {
    const score = parseFloat(gradeInputs[sub.id] || "");
    if (isNaN(score)) return alert("Please enter a valid score.");
    return run(() => runGradeSubmissionMut({ submissionId: sub.id, score, feedback: gradeFeedback[sub.id] || "" })).then(() => setGradingSubmission(null));
  };

  const handleAiAutoGrade = async (sub: TestSubmission) => {
    setAiEvaluatingId(sub.id);
    try {
      const res = await fetch("/api/lms/evaluate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: sub.code,
          dayNumber: sub.dayNumber,
          maxScore: sub.maxScore || 10,
          testType: sub.testType || "daily",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGradeInputs((prev) => ({ ...prev, [sub.id]: String(data.score) }));
        setGradeFeedback((prev) => ({ ...prev, [sub.id]: data.feedback }));
      } else {
        alert(data.error || "AI evaluation failed");
      }
    } catch (err: any) {
      alert(err.message || "Failed to contact AI evaluation service");
    } finally {
      setAiEvaluatingId(null);
    }
  };

  // ── Announcement Save ──────────────────────────────────────────────────────
  const handleSaveAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title.trim() || !annForm.content.trim()) return;
    try {
      await runUpsertAnnMut({
        id: annForm.id || undefined,
        title: annForm.title,
        content: annForm.content,
        author: annForm.author,
        isPinned: annForm.isPinned,
      });
      setAnnForm({ id: "", title: "", content: "", author: "Director Admin", isPinned: false });
      setIsAnnEditing(false);
    } catch (err: any) {
      alert(err.message || "Failed to save announcement");
    }
  };

  const handleDeleteAnn = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await runDeleteAnnMut({ id });
    } catch (err: any) {
      alert(err.message || "Failed to delete announcement");
    }
  };

  // ── Settings Save ──────────────────────────────────────────────────────────
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await runSaveConfigMut({
        instituteName: configForm.instituteName,
        contactEmail: configForm.contactEmail,
        dailyPerfThreshold: configForm.dailyPerfThreshold,
        finalExamThreshold: configForm.finalExamThreshold,
      });
      alert("LMS Settings saved successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    }
  };

  // ── AI Copilot Handlers ────────────────────────────────────────────────────
  const sendCopilotPrompt = async (promptText: string) => {
    const userMsg: CopilotMsg = {
      id: "user-" + Date.now(),
      sender: "user",
      text: promptText,
    };
    setCopilotMessages((prev) => [...prev, userMsg]);
    setCopilotInput("");
    setCopilotTyping(true);

    try {
      let replyText = "";

      // 1. Primary: Direct Convex Cloud Serverless Action (100% cloud connected)
      try {
        const convexRes = await adminCopilotChatAction({
          message: promptText,
          actorEmail,
          history: copilotMessages.slice(-6).map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        });
        if (convexRes?.reply || convexRes?.text) {
          replyText = convexRes.reply || convexRes.text;
        }
      } catch (convexErr) {
        console.warn("[Admin Copilot] Convex action fallback to Gateway:", convexErr);
      }

      // 2. Secondary: Backend Gateway API (/api/admin/chat)
      if (!replyText) {
        try {
          const res = await fetch("/api/admin/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: promptText,
              actorEmail,
              history: copilotMessages.slice(-6).map((m) => ({
                role: m.sender === "user" ? "user" : "assistant",
                content: m.text,
              })),
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.reply || data.text) {
              replyText = data.reply || data.text;
            }
          }
        } catch (backendErr) {
          console.warn("[Admin Copilot] Gateway fallback to client AI:", backendErr);
        }
      }

      // 3. Tertiary: Client-side Gemini Fallback
      if (!replyText) {
        const geminiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
        if (geminiKey) {
          const systemInstruction = `You are the Kriora LMS Admin Assistant.
Help the administrator draft announcements, summarize student performance, and plan curriculum topics.
Provide polished, professional copy ready to publish. Refer to the platform as Kriora LMS.`;

          const contents = [
            ...copilotMessages.slice(-6).map((m) => ({
              role: m.sender === "user" ? "user" : "model",
              parts: [{ text: m.text }],
            })),
            {
              role: "user",
              parts: [{ text: promptText }],
            },
          ];

          const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.7-flash"];
          for (const model of models) {
            try {
              const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contents,
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    generationConfig: { temperature: 0.7 },
                  }),
                }
              );

              if (geminiRes.ok) {
                const geminiData = await geminiRes.json();
                const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  replyText = text;
                  break;
                }
              }
            } catch (e) {
              console.warn(`[Admin Copilot] Direct fallback with ${model} failed:`, e);
            }
          }
        }
      }

      if (!replyText) {
        throw new Error("Unable to synthesize response. Please verify AI API configuration.");
      }

      const aiMsg: CopilotMsg = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: replyText,
      };
      setCopilotMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setCopilotMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          sender: "ai",
          text: err.message || "AI Copilot is temporarily unavailable. All admin functions remain fully operational.",
        },
      ]);
    }
    setCopilotTyping(false);
  };

  const handleCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotInput.trim()) return;
    await sendCopilotPrompt(copilotInput);
  };

  // Nav structure
  const mainNavItems: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: Layers },
    { id: "students", label: "Students", icon: Users, badge: pendingStudents.length > 0 ? pendingStudents.length : undefined },
    { id: "batches", label: "Batches", icon: Layers },
    { id: "assessments", label: "Assessments", icon: CheckSquare, badge: validTestSubmissions.filter(s => s.evalStatus === "pending").length > 0 ? validTestSubmissions.filter(s => s.evalStatus === "pending").length : undefined },
    { id: "marks", label: "Daily Marks", icon: Award },
    { id: "courses", label: "Course Content", icon: BookOpen },
    { id: "content", label: "Content Release", icon: Zap },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
  ];

  const systemNavItems: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
    { id: "copilot", label: "AI Copilot", icon: Sparkles },
    { id: "tests", label: "Test Monitor", icon: Monitor },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "audit", label: "Audit Logs", icon: Clock },
  ];

  const adminDisplayName = user?.fullName || user?.firstName || "Priya Nair";
  const adminEmailDisplay = user?.primaryEmailAddress?.emailAddress || actorEmail || "Campus Admin";

  return (
    <div className="min-h-screen w-full flex bg-[#F8F9FB] text-slate-900 font-sans antialiased">
      {/* ── White / Light Collapsible Sidebar ─────────────────────────── */}
      <aside 
        className={`${ sidebarCollapsed ? "w-20" : "w-64" } bg-white text-slate-700 shrink-0 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200/80 z-30 sticky top-0 h-screen select-none`}
      >
        {/* Brand Header & Toggle */}
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
              <div className="transition-opacity duration-200">
                <h1 className="font-extrabold text-sm text-slate-900 leading-tight tracking-tight">Kriora LMS</h1>
                <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60 inline-block mt-0.5">
                  Admin Operations
                </span>
              </div>
            )}
          </button>
          
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          {/* Main Workspace Navigation */}
          <div className="space-y-1">
            {mainNavItems.map((it) => {
              const Icon = it.icon;
              const active = activeTab === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => setActiveTab(it.id)}
                  title={sidebarCollapsed ? it.label : undefined}
                  className={`w-full flex items-center ${ sidebarCollapsed ? "justify-center px-0 py-3" : "justify-between px-3.5 py-2.5" } rounded-xl text-xs font-semibold transition-all relative group ${ active ? "bg-orange-50 text-[#FF5A36] font-bold shadow-2xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#FF5A36] before:rounded-r" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 " }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-[#FF5A36]" : "text-slate-400 group-hover:text-slate-700 "}`} />
                    {!sidebarCollapsed && <span>{it.label}</span>}
                  </div>
                  
                  {!sidebarCollapsed && it.badge !== undefined && it.badge > 0 && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-bold ${ active ? "bg-[#FF5A36] text-white" : "bg-slate-100 text-slate-600 " }`}>
                      {it.badge.toLocaleString()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* System Section */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                System
              </div>
            )}
            {systemNavItems.map((it) => {
              const Icon = it.icon;
              const active = activeTab === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => setActiveTab(it.id)}
                  title={sidebarCollapsed ? it.label : undefined}
                  className={`w-full flex items-center ${ sidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3.5 py-2" } rounded-xl text-xs font-semibold transition-all relative group ${ active ? "bg-orange-50 text-[#FF5A36] font-bold shadow-2xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#FF5A36] before:rounded-r" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 " }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-[#FF5A36]" : "text-slate-400 group-hover:text-slate-700 "}`} />
                    {!sidebarCollapsed && <span>{it.label}</span>}
                  </div>

                  {!sidebarCollapsed && it.badge !== undefined && it.badge > 0 && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-bold ${ active ? "bg-[#FF5A36] text-white" : "bg-slate-100 text-slate-600 " }`}>
                      {it.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Profile Card & Sign Out */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 space-y-2">
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} gap-2`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="w-10 h-10 shrink-0 ring-2 ring-orange-500/20 shadow-2xs border border-orange-200">
                {user?.imageUrl && <AvatarImage src={user.imageUrl} alt={adminDisplayName} className="object-cover" />}
                <AvatarFallback className="bg-orange-100 text-[#FF5A36] font-bold text-xs">
                  {adminDisplayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <div className="overflow-hidden min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate">{adminDisplayName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{adminEmailDisplay}</div>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <button
                onClick={onLogout}
                title="Sign Out Admin"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {sidebarCollapsed && (
            <button
              onClick={onLogout}
              title="Sign Out Admin"
              className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main View Workspace ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8F9FB]">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-xl text-slate-900 capitalize tracking-tight">
              {activeTab === "courses" 
                ? "Course Content" 
                : activeTab === "content" 
                ? "Content Release" 
                : activeTab === "marks" 
                ? "Day-to-Day Performance Marks" 
                : activeTab.replace("-", " ")}
            </h2>
            
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Syncing
            </span>
          </div>

                    {/* Header Controls & Day/Night Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students, batches, topics..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-400 transition-all"
              />
            </div>

            </div>
        </header>

        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
          {/* 1. DASHBOARD TAB (Stitch Image 1) */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* 4 Stat KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Students"
                  value={students.length.toLocaleString()}
                  subtitle="Active learners enrolled"
                  trend={students.length > 0 ? `${students.filter(s => s.status === "Approved").length} Approved` : "0 Enrolled"}
                  trendType={students.length > 0 ? "up" : "neutral"}
                  icon={Users}
                  iconColor="orange"
                />

                <StatCard
                  title="Pending Approvals"
                  value={pendingStudents.length.toLocaleString()}
                  subtitle="Registrations awaiting review"
                  trend={pendingStudents.length > 0 ? "Action Needed" : "All Vetted"}
                  trendType={pendingStudents.length > 0 ? "neutral" : "up"}
                  icon={Clock}
                  iconColor="amber"
                />

                <StatCard
                  title="Active Batches"
                  value={batches.filter((b) => batchStatus(b) === "active").length}
                  subtitle="Cohort schedules progressing"
                  trend={`${batches.length} Total Cohort(s)`}
                  trendType="neutral"
                  icon={Layers}
                  iconColor="blue"
                />

                <StatCard
                  title="Test Submissions"
                  value={validTestSubmissions.length.toLocaleString()}
                  subtitle="Daily & capstone evaluations"
                  trend={validTestSubmissions.length > 0 ? `${validTestSubmissions.filter(s => s.evalStatus === "auto" || s.evalStatus === "manual").length} Graded` : "0 Submissions"}
                  trendType={validTestSubmissions.length > 0 ? "up" : "neutral"}
                  icon={CheckCircle2}
                  iconColor="emerald"
                />
              </div>

              {/* Hero Banner: System Efficiency */}
              <Card className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-white border-orange-200/80 rounded-2xl p-6 shadow-2xs relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-[#FF5A36] text-white">
                        <Zap className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Efficiency & Health</span>
                      <Badge variant="orange" className="text-[10px] py-0 px-2">Live Cloud</Badge>
                    </div>
                    <div className="text-3xl font-black text-[#FF5A36] tracking-tight">100%</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Convex Cloud serverless synchronization, live student test proctoring, and automated evaluation engines are operational with sub-50ms latency.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setActiveTab("content")}
                      className="bg-[#FF5A36] hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
                    >
                      <Zap className="w-3.5 h-3.5 mr-1" />
                      Optimize Queues
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("analytics")}
                      className="text-xs font-bold"
                    >
                      View Telemetry
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Quick Operations Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab("students")}
                  className="bg-white hover:bg-orange-50/40 border border-slate-200/80 hover:border-orange-200 rounded-2xl p-4 text-left transition-all group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF5A36] transition-colors" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">Review Pending</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{pendingStudents.length} awaiting vetting</div>
                </button>

                <button
                  onClick={() => { setActiveTab("batches"); openBatchForm(); }}
                  className="bg-white hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-200 rounded-2xl p-4 text-left transition-all group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Plus className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">Create Batch</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Setup cohort & schedule</div>
                </button>

                <button
                  onClick={() => setActiveTab("content")}
                  className="bg-white hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-200 rounded-2xl p-4 text-left transition-all group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Unlock className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">Release Day</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Unlock next curriculum modules</div>
                </button>

                <button
                  onClick={() => setActiveTab("assessments")}
                  className="bg-white hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-200 rounded-2xl p-4 text-left transition-all group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Brain className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">Grade Tests</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {validTestSubmissions.filter(s => s.evalStatus === "pending").length > 0
                      ? `${validTestSubmissions.filter(s => s.evalStatus === "pending").length} manual reviews`
                      : "0 pending reviews"}
                  </div>
                </button>
              </div>

              {/* Recent Registrations Table */}
              <Card className="p-6 border-slate-200/80 bg-white rounded-2xl shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Recent Registrations</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Latest students joined the Kriora learning platform</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("students")}
                    className="text-xs font-bold text-[#FF5A36] hover:bg-orange-50"
                  >
                    <span>View all</span>
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>College & Branch</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.slice(0, 5).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              <AvatarFallback>{s.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-bold text-slate-900">{s.fullName}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{s.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {s.collegeName || "Engineering Institute"} ({s.branch || "CSE"})
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[11px]">
                            {batches.find((b) => b.id === s.batchId)?.name || "Unassigned"}
                          </Badge>
                        </TableCell>
                        <TableCell><StatusPill status={s.status} /></TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedStudent(s)}
                            className="text-xs font-bold"
                          >
                            Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* 2. STUDENTS DIRECTORY TAB (Stitch Image 2) */}
          {activeTab === "students" && (
            <Card className="p-6 border-slate-200/80 bg-white rounded-2xl shadow-2xs space-y-5">
              {/* Directory Header */}
              <PageHeader
                title="Student Directory"
                subtitle="Manage student roster, admissions vetting, and cohort batch assignments."
                badge={
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-bold font-mono">
                      ({filteredStudents.length} total)
                    </span>
                    <Badge variant="success" className="text-[10px] py-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                      Live
                    </Badge>
                  </div>
                }
                action={
                  <Button
                    onClick={() => setShowEnrollModal(true)}
                    className="bg-[#FF5A36] hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
                  >
                    <UserPlus className="w-4 h-4 mr-1.5" />
                    + Enroll Student
                  </Button>
                }
              />

              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row items-center gap-3 p-2 bg-slate-50/70 border border-slate-200/80 rounded-xl">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Search by student name, email, college or branch..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="w-36">
                    <Select
                      value={studentStatusFilter}
                      onChange={(e) => setStudentStatusFilter(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Rejected">Rejected</option>
                    </Select>
                  </div>

                  <div className="w-36">
                    <Select
                      value={studentBatchFilter}
                      onChange={(e) => setStudentBatchFilter(e.target.value)}
                    >
                      <option value="All">All Batches</option>
                      <option value="Unassigned">Unassigned</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setStudentSearch(""); setStudentStatusFilter("All"); setStudentBatchFilter("All"); }}
                    title="Reset Filters"
                  >
                    <Filter className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STUDENT NAME</TableHead>
                      <TableHead>COLLEGE & BRANCH</TableHead>
                      <TableHead>BATCH</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="p-8 text-center text-slate-400">
                          No students matched the selected filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((st) => (
                        <TableRow key={st.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar size="default">
                                <AvatarFallback className="bg-slate-200 text-slate-800">
                                  {st.fullName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <button
                                  onClick={() => setSelectedStudent(st)}
                                  className="font-bold text-slate-900 hover:text-[#FF5A36] text-left leading-tight"
                                >
                                  {st.fullName}
                                </button>
                                <div className="text-[11px] text-slate-400 font-mono">{st.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            <div className="font-medium text-slate-800">{st.collegeName || "N/A"}</div>
                            <div className="text-[11px] text-slate-400">{st.branch || "CSE"} • Grad {st.graduationYear || "2026"}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-[11px]">
                              {batches.find((b) => b.id === st.batchId)?.name || "Unassigned"}
                            </Badge>
                          </TableCell>
                          <TableCell><StatusPill status={st.status} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {st.status === "Pending" && (
                                <>
                                  <Button
                                    variant="secondary"
                                    size="xs"
                                    onClick={() => handleStudentAction(st.id, "approve")}
                                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 font-bold"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="xs"
                                    onClick={() => handleStudentAction(st.id, "reject")}
                                    className="font-bold"
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              {st.status === "Approved" && (
                                <Button
                                  variant="secondary"
                                  size="xs"
                                  onClick={() => handleStudentAction(st.id, "suspend")}
                                  className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60 font-bold"
                                >
                                  Suspend
                                </Button>
                              )}
                              {st.status === "Suspended" && (
                                <Button
                                  variant="secondary"
                                  size="xs"
                                  onClick={() => handleStudentAction(st.id, "activate")}
                                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 font-bold"
                                >
                                  Re-activate
                                </Button>
                              )}
                              <Button
                                variant="secondary"
                                size="xs"
                                onClick={() => setSelectedStudent(st)}
                                className="font-bold text-slate-700"
                              >
                                View Profile
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleStudentAction(st.id, "delete")}
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Delete Student"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination footer */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <div>Showing <span className="font-bold text-slate-800">{filteredStudents.length}</span> of {students.length} students</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm" disabled>Next</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Enroll Student Modal */}
          {showEnrollModal && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-base text-slate-900">Enroll New Student</h3>
                  <button onClick={() => setShowEnrollModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={enrollForm.fullName}
                      onChange={(e) => setEnrollForm({ ...enrollForm, fullName: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF5A36]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[10px] uppercase font-bold text-slate-400 block mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="student@university.edu"
                        value={enrollForm.email}
                        onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF5A36]"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] uppercase font-bold text-slate-400 block mb-1">Phone</label>
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={enrollForm.phone}
                        onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF5A36]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[10px] uppercase font-bold text-slate-400 block mb-1">College Name</label>
                      <input
                        type="text"
                        placeholder="e.g. IIT Madras"
                        value={enrollForm.collegeName}
                        onChange={(e) => setEnrollForm({ ...enrollForm, collegeName: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF5A36]"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] uppercase font-bold text-slate-400 block mb-1">Branch</label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={enrollForm.branch}
                        onChange={(e) => setEnrollForm({ ...enrollForm, branch: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF5A36]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-400 block mb-1">Assign to Batch</label>
                    <select
                      value={enrollForm.batchId}
                      onChange={(e) => setEnrollForm({ ...enrollForm, batchId: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF5A36] bg-white font-semibold"
                    >
                      <option value="">No Batch Assigned</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setShowEnrollModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!enrollForm.fullName.trim() || !enrollForm.email.trim() || !enrollForm.collegeName.trim() || !enrollForm.branch.trim()) {
                        alert("Please fill all required fields (Name, Email, College, Branch).");
                        return;
                      }
                      try {
                        const res = await runRegisterStudentMut({
                          fullName: enrollForm.fullName.trim(),
                          email: enrollForm.email.trim().toLowerCase(),
                          phone: enrollForm.phone.trim() || "+91 00000 00000",
                          collegeName: enrollForm.collegeName.trim(),
                          branch: enrollForm.branch.trim(),
                          currentYear: "1st Year",
                          graduationYear: new Date().getFullYear().toString(),
                          preferredCourse: "python-mastery",
                          linkedinProfile: "https://www.linkedin.com/in/student",
                        });
                        if (enrollForm.batchId && res?.student?.id) {
                          await runEnrollStudentMut({ studentId: res.student.id, batchId: enrollForm.batchId });
                        }
                        alert("Student registered and enrolled successfully.");
                        setEnrollForm({ fullName: "", email: "", phone: "", collegeName: "", branch: "", batchId: "" });
                        setShowEnrollModal(false);
                      } catch (err: any) {
                        alert(err.message || "Failed to enroll student.");
                      }
                    }}
                    className="px-4 py-2 bg-[#FF5A36] text-white text-xs font-bold rounded-xl hover:bg-orange-600 shadow-md shadow-orange-500/20"
                  >
                    Complete Enrollment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Student Profile Modal */}
          {selectedStudent && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-black text-base text-slate-900">{selectedStudent.fullName}</h3>
                    <p className="text-xs text-slate-500 font-mono">{selectedStudent.email} • {selectedStudent.phone}</p>
                  </div>
                  <button onClick={() => setSelectedStudent(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div><span className="text-slate-400 block font-mono text-[9px] uppercase">College</span> <span className="font-bold">{selectedStudent.collegeName || "N/A"}</span></div>
                  <div><span className="text-slate-400 block font-mono text-[9px] uppercase">Branch & Year</span> <span className="font-bold">{selectedStudent.branch} ({selectedStudent.currentYear})</span></div>
                  <div><span className="text-slate-400 block font-mono text-[9px] uppercase">Graduation Year</span> <span className="font-bold">{selectedStudent.graduationYear}</span></div>
                  <div><span className="text-slate-400 block font-mono text-[9px] uppercase">Batch</span> <span className="font-bold">{batches.find(b => b.id === selectedStudent.batchId)?.name || "Unassigned"}</span></div>
                  <div><span className="text-slate-400 block font-mono text-[9px] uppercase">LinkedIn</span> {selectedStudent.linkedinProfile ? <a href={selectedStudent.linkedinProfile} target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold truncate block">{selectedStudent.linkedinProfile}</a> : "N/A"}</div>
                  <div><span className="text-slate-400 block font-mono text-[9px] uppercase">GitHub</span> {selectedStudent.githubProfile ? <a href={selectedStudent.githubProfile} target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold truncate block">{selectedStudent.githubProfile}</a> : "N/A"}</div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-bold">Assign to Batch:</span>
                    <select
                      value={selectedStudent.batchId || ""}
                      onChange={(e) => enrollStudent(selectedStudent.id, e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-white font-semibold"
                    >
                      <option value="">No Batch</option>
                      {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setSelectedStudent(null)} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl">Close</button>
                </div>
              </div>
            </div>
          )}

          {/* 3. BATCHES TAB (Stitch Image 3) */}
          {activeTab === "batches" && (
            <Card className="p-6 border-slate-200/80 bg-white rounded-2xl shadow-2xs space-y-6">
              <PageHeader
                title={`Active Batches (${batches.length})`}
                subtitle="Schedule cohort sessions, monitor capacity, and manage student learning flows."
                action={
                  <Button
                    onClick={() => openBatchForm()}
                    className="bg-[#FF5A36] hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    + Create Batch
                  </Button>
                }
              />

              {/* 3-Column Batch Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {batches.map((b) => {
                  const members = batchStudents(b.id);
                  const capacityMax = b.capacity || 5;
                  const capacityPct = Math.min(100, Math.round((members.length / capacityMax) * 100));
                  const currentDay = batchCurrentDay(b.id);

                  return (
                    <Card
                      key={b.id}
                      className="p-5 border-slate-200/90 bg-white rounded-2xl shadow-2xs hover:shadow-md transition-all justify-between flex flex-col space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <StatusPill status={batchStatus(b)} />
                          <div className="flex items-center gap-1 text-slate-400">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => openBatchForm(b)}
                              className="hover:text-slate-900"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => deleteBatch(b)}
                              className="hover:text-rose-600 hover:bg-rose-50"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        <h4 className="font-extrabold text-base text-slate-900">{b.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {b.description || "Fast-track Python foundations and system design cohort."}
                        </p>
                      </div>

                      {/* Capacity Meter */}
                      <div className="space-y-1.5 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-slate-500 font-bold uppercase">CAPACITY</span>
                          <span className="font-bold text-slate-900">{members.length} / {capacityMax} Students</span>
                        </div>
                        <Progress value={capacityPct} max={100} indicatorClassName="bg-[#FF5A36]" />
                      </div>

                      {/* Schedule & Progress Meta */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">SCHEDULE</span>
                          <span className="font-semibold text-slate-800 text-[11px]">
                            {b.startTime || "18:00"} - {b.endTime || "20:00"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">CURRICULUM</span>
                          <span className="font-bold text-[#FF5A36] text-[11px]">Day {currentDay} / 40</span>
                        </div>
                      </div>

                      {/* Overlapping student avatar chips */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center -space-x-2">
                          {members.slice(0, 4).map((m, idx) => (
                            <Avatar key={idx} size="sm" className="border-2 border-white">
                              <AvatarFallback className="bg-slate-200 text-[10px] font-bold text-slate-700">
                                {m.fullName.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {members.length > 4 && (
                            <Avatar size="sm" className="border-2 border-white">
                              <AvatarFallback className="bg-slate-800 text-[9px] font-bold text-white">
                                +{members.length - 4}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setStudentBatchFilter(b.id);
                            setActiveTab("students");
                          }}
                          className="text-xs font-bold text-[#FF5A36] hover:bg-orange-50"
                        >
                          View Students →
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Form Modal for Batch creation/editing */}
          {showBatchForm && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-base text-slate-900">{editingBatchId ? "Edit Batch" : "Create Batch"}</h3>
                  <Button variant="ghost" size="icon-sm" onClick={() => setShowBatchForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">Batch Name</label>
                    <Input
                      type="text"
                      placeholder="e.g. Python Mastery - Morning A"
                      value={batchForm.name}
                      onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">Capacity</label>
                    <Input
                      type="number"
                      placeholder="150"
                      value={batchForm.capacity}
                      onChange={(e) => setBatchForm({ ...batchForm, capacity: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">Start Date</label>
                      <Input
                        type="date"
                        value={batchForm.startDate}
                        onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">End Date</label>
                      <Input
                        type="date"
                        value={batchForm.endDate}
                        onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">Description</label>
                    <textarea
                      placeholder="Cohort overview..."
                      value={batchForm.description}
                      onChange={(e) => setBatchForm({ ...batchForm, description: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl outline-none h-16 text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={() => setShowBatchForm(false)}>Cancel</Button>
                  <Button size="sm" onClick={saveBatch} className="bg-[#FF5A36] text-white hover:bg-orange-600 font-bold">Save Batch</Button>
                </div>
              </Card>
            </div>
          )}

          {/* 4. ASSESSMENTS TAB */}
          {activeTab === "assessments" && (
            <div className="space-y-6">
              {/* Submissions & Manual Grading Section */}
              <Card className="p-6 border-slate-200/80 bg-white rounded-2xl shadow-2xs space-y-4">
                <PageHeader
                  title="Assessments & Practical Evaluation Queue"
                  subtitle="Review and grade student Python submissions across daily assessments and final exams."
                  badge={
                    <span className="text-xs text-slate-500 font-mono font-bold">
                      ({validTestSubmissions.length} Total Submissions)
                    </span>
                  }
                />

                <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Test</TableHead>
                        <TableHead>Submitted At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validTestSubmissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="p-8 text-center text-slate-400">
                            No student submissions recorded yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        validTestSubmissions.map((sub) => {
                          const student = students.find(s => s.id === sub.studentId);
                          return (
                            <TableRow key={sub.id}>
                              <TableCell className="font-bold text-slate-800">{student?.fullName || sub.studentId}</TableCell>
                              <TableCell className="font-mono">{sub.testId} ({sub.testType})</TableCell>
                              <TableCell className="text-slate-500 font-mono">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "N/A"}</TableCell>
                              <TableCell><StatusPill status={sub.evalStatus} /></TableCell>
                              <TableCell>
                                <Badge variant={sub.evalStatus === "auto" ? "info" : "secondary"} className="font-mono text-[10px]">
                                  {sub.evalStatus === "auto" ? "AUTO" : "MANUAL"}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono font-bold">{sub.score !== undefined ? `${sub.score} / ${sub.maxScore || 10}` : "-"}</TableCell>
                              <TableCell className="text-right">
                                {sub.evalStatus === "pending" ? (
                                  <Button
                                    variant="secondary"
                                    size="xs"
                                    onClick={() => setGradingSubmission(sub)}
                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold"
                                  >
                                    Grade
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => setGradingSubmission(sub)}
                                    className="text-xs font-mono text-slate-500 hover:text-slate-900"
                                  >
                                    Review
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          )}

          {/* Grading Submission Modal */}
          {gradingSubmission && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-base text-slate-900">Grade Submission — {gradingSubmission.testId}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={aiEvaluatingId === gradingSubmission.id}
                      onClick={() => handleAiAutoGrade(gradingSubmission)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {aiEvaluatingId === gradingSubmission.id ? "Evaluating..." : "AI Auto-Evaluate"}
                    </button>
                    <button onClick={() => setGradingSubmission(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">Submitted Python Code</label>
                    <pre className="bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-xl overflow-x-auto max-h-48">
                      {gradingSubmission.code || "# No code submitted"}
                    </pre>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">Score (Out of {gradingSubmission.maxScore || 10})</label>
                    <input
                      type="number"
                      placeholder="e.g. 8.5"
                      value={gradeInputs[gradingSubmission.id] || ""}
                      onChange={(e) => setGradeInputs({ ...gradeInputs, [gradingSubmission.id]: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#FF5A36]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">Instructor Feedback</label>
                    <textarea
                      placeholder="Provide constructive evaluation notes..."
                      value={gradeFeedback[gradingSubmission.id] || ""}
                      onChange={(e) => setGradeFeedback({ ...gradeFeedback, [gradingSubmission.id]: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none h-20 focus:ring-2 focus:ring-[#FF5A36]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button onClick={() => setGradingSubmission(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
                  <button onClick={() => handleGradeSubmission(gradingSubmission)} className="px-4 py-2 bg-[#FF5A36] text-white text-xs font-bold rounded-xl hover:bg-orange-600">Save Grade</button>
                </div>
              </div>
            </div>
          )}

          {/* 5. COURSE CONTENT TAB (Stitch Image 5) */}
          {activeTab === "courses" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
              {/* Header & Overall Release Progress */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900 tracking-tight">
                    Canonical Python Mastery Curriculum
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    40 Days / 239 Topics · Standard Operations Panel
                  </p>
                </div>

                {/* Overall release bar */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-4 min-w-[280px]">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-500 font-bold uppercase">OVERALL RELEASE</span>
                      <span className="font-bold text-slate-900">
                        {allDays.filter(d => d.releaseStatus !== "locked").length} / {allDays.length} Days
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{
                          width: `${Math.round((allDays.filter(d => d.releaseStatus !== "locked").length / (allDays.length || 1)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search curriculum by topic, keywords, or Day number..."
                  value={contentSearch}
                  onChange={(e) => setContentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-slate-400"
                />
              </div>

              {/* Phase Modules Accordion */}
              <div className="space-y-4">
                {(course?.modules || []).map((m, mIdx) => {
                  const isExpanded = expandedCurriculumPhases[m.id] ?? true;
                  const moduleReleasedCount = m.days.filter(d => d.releaseStatus !== "locked").length;
                  const modulePct = Math.round((moduleReleasedCount / (m.days.length || 1)) * 100);

                  return (
                    <div key={m.id} className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
                      {/* Phase Header */}
                      <button
                        onClick={() => setExpandedCurriculumPhases(prev => ({ ...prev, [m.id]: !isExpanded }))}
                        className="w-full bg-slate-50/80 hover:bg-slate-100/80 px-5 py-4 border-b border-slate-200/80 flex items-center justify-between transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-[#FF5A36] font-bold text-xs flex items-center justify-center">
                            P{mIdx + 1}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900">{m.title}</h4>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {m.days.length} Days • {m.days.reduce((acc, d) => acc + (d.topics?.length || 0), 0)} Topics
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${ modulePct === 100 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-blue-50 text-blue-700 border border-blue-200" }`}>
                            {modulePct}% Released
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </button>

                      {/* Day Cards Grid */}
                      {isExpanded && (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50/30">
                          {m.days.map((d) => {
                            const isReleased = d.releaseStatus !== "locked";
                            return (
                              <div
                                key={d.id}
                                className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-2.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                      DAY {String(d.dayNumber).padStart(2, "0")}
                                    </span>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${ isReleased ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 " }`}>
                                      {isReleased ? "RELEASED" : "UNRELEASED"}
                                    </span>
                                  </div>

                                  <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{d.title}</h5>
                                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                    {d.description}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                  <span className="text-[11px] font-mono text-slate-400">
                                    {d.topics?.length || 6} Topics
                                  </span>

                                  <button
                                    onClick={() => { setPreviewDayId(d.id); setPreviewTopicId(null); }}
                                    className="px-2.5 py-1 text-xs font-bold text-[#FF5A36] hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Preview Lesson</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Admin Day Lesson Content Preview Modal Overlay */}
              {previewDayId && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200"
                  onClick={() => {
                    setPreviewDayId(null);
                    setPreviewTopicId(null);
                  }}
                  role="dialog"
                  aria-modal="true"
                >
                  <div
                    className="relative w-full max-w-6xl h-[88vh] max-h-[920px] bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-400/30 uppercase tracking-wider">
                            ADMIN LESSON PREVIEW
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-300">
                            Day {previewDay?.dayNumber}
                          </span>
                          <span className={"font-bold px-2 py-0.5 rounded uppercase text-[8px] " + (previewDay?.releaseStatus !== "locked" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-700 text-slate-300 border border-slate-600")}>
                            {previewDay?.releaseStatus || "locked"}
                          </span>
                          {previewDay?.assessmentKey && (
                            <span className="text-[10px] font-mono bg-slate-800 border border-slate-700 text-indigo-300 px-2 py-0.5 rounded font-bold">
                              Assessment: {previewDay.assessmentKey}
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-base text-white mt-1">
                          {previewDay?.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{previewDay?.description}</p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {!adminDayContent ? (
                          <button
                            onClick={() => generateDayContent(false)}
                            disabled={genBusy}
                            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-colors shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> {genBusy ? "Generating…" : "Generate Lesson Content"}
                          </button>
                        ) : (
                          <button
                            onClick={() => generateDayContent(true)}
                            disabled={genBusy}
                            className="text-xs font-bold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-xl transition-colors"
                          >
                            <RefreshCw className={"w-3.5 h-3.5 " + (genBusy ? "animate-spin" : "")} /> {genBusy ? "Regenerating…" : "Regenerate Content"}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setPreviewDayId(null);
                            setPreviewTopicId(null);
                          }}
                          className="text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
                          title="Close Preview (ESC)"
                        >
                          <X className="w-4 h-4" /> <span>Close</span>
                        </button>
                      </div>
                    </div>

                    {/* Modal Content Body */}
                    <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/60">
                      {genError && (
                        <p className="px-5 py-3 text-xs font-mono text-red-700 bg-red-50 border border-red-200 rounded-xl">Generation failed: {genError}</p>
                      )}

                      {adminDayContent === undefined ? (
                        <div className="flex items-center justify-center p-12 text-center">
                          <p className="text-xs text-slate-500 font-mono animate-pulse flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" /> Loading lesson content...
                          </p>
                        </div>
                      ) : !adminDayContent ? (
                        <div className="p-8 text-center space-y-4 bg-white border border-slate-200 rounded-2xl shadow-xs max-w-md mx-auto my-8">
                          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <div>
                            <h5 className="font-extrabold text-sm text-slate-900">No Generated Content</h5>
                            <p className="text-xs text-slate-500 mt-1">No stored lesson content exists in Convex for Day {previewDay?.dayNumber}. Click below to generate lesson content with Gemini.</p>
                          </div>
                          <button
                            onClick={() => generateDayContent(false)}
                            disabled={genBusy}
                            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl w-full shadow-md transition-colors"
                          >
                            <Sparkles className="w-4 h-4" /> {genBusy ? "Generating Lesson Content…" : "Generate Lesson Content"}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Opening */}
                          {adminDayContent.opening && (
                            <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">{adminDayContent.opening}</p>
                          )}

                          {/* Learning Objectives */}
                          {adminDayContent.objectives && adminDayContent.objectives.length > 0 && (
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                              <h5 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-2.5">Learning Objectives</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {adminDayContent.objectives.map((obj: string, i: number) => (
                                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                    <span>{obj}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Documentation-Style Two-Pane Layout */}
                          {(adminDayContent.topics || []).length > 0 && (
                            <div className="flex flex-col md:flex-row gap-4 items-start pt-1">
                              {/* Left Sidebar Pane: Topic Navigator */}
                              <div className="w-full md:w-1/3 lg:w-1/4 shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                                    <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                                      Topics ({adminDayContent.topics.length})
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">Admin</span>
                                </div>

                                <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto">
                                  {(adminDayContent.topics as any[])
                                    .filter((t) => !contentSearch || t.title.toLowerCase().includes(contentSearch.toLowerCase()))
                                    .map((t, idx) => {
                                      const isSelected = (previewTopicId === t.id) || (previewTopicId === null && idx === 0);

                                      return (
                                        <button
                                          key={t.id}
                                          onClick={() => setPreviewTopicId(t.id)}
                                          className={`w-full p-3 flex items-start justify-between text-left transition-all group ${ isSelected ? "bg-indigo-50/50 border-l-4 border-indigo-600 shadow-2xs" : "hover:bg-slate-50" }`}
                                        >
                                          <div className="flex items-start gap-2.5 min-w-0">
                                            <span className={`w-5 h-5 rounded-full font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 ${ isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600 " }`}>
                                              {t.order || idx + 1}
                                            </span>
                                            <div className="min-w-0">
                                              <h4 className={`text-xs leading-snug line-clamp-2 ${isSelected ? "font-black text-indigo-900" : "font-semibold text-slate-700 group-hover:text-slate-900 "}`}>
                                                {t.title}
                                              </h4>
                                            </div>
                                          </div>
                                        </button>
                                      );
                                    })}
                                </div>
                              </div>

                              {/* Right Content Pane: Selected Topic Detail */}
                              <div className="flex-1 min-w-0 w-full bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-sm">
                                {(() => {
                                  const activeTopic = (adminDayContent.topics as any[])?.find((t: any, idx: number) => 
                                    previewTopicId ? t.id === previewTopicId : idx === 0
                                  ) || adminDayContent.topics?.[0];

                                  if (!activeTopic) {
                                    return <p className="text-xs text-slate-400 italic">No topic selected.</p>;
                                  }

                                  return (
                                    <div className="space-y-5">
                                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
                                        <div>
                                          <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider block">
                                            Topic {activeTopic.order || 1} of {adminDayContent.topics.length}
                                          </span>
                                          <h4 className="text-base font-black text-slate-900 mt-0.5">{activeTopic.title}</h4>
                                        </div>
                                      </div>

                                      {activeTopic.theoryContent ? (
                                        <div className="prose prose-slate max-w-none space-y-3 font-sans text-xs text-slate-800 leading-relaxed">
                                          {String(activeTopic.theoryContent).split("\n\n").map((para: string, pIdx: number) => (
                                            <div key={pIdx} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-slate-800 text-xs leading-relaxed font-sans shadow-2xs">
                                              {para}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 italic">
                                          No written notes for this topic.
                                        </div>
                                      )}

                                      {activeTopic.codeExamples && activeTopic.codeExamples.length > 0 && (
                                        <div className="space-y-3 pt-1">
                                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide block">
                                            Code Examples ({activeTopic.codeExamples.length}):
                                          </span>
                                          {activeTopic.codeExamples.map((ex: any, ci: number) => (
                                            <div key={ci} className="space-y-1.5">
                                              {(ex.title || typeof ex !== "string") && (
                                                <span className="text-[11px] font-bold text-slate-700 block">
                                                  {ex.title || `Example ${ci + 1}`}
                                                </span>
                                              )}
                                              <pre className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 whitespace-pre-wrap leading-relaxed shadow-md">
                                                {typeof ex === "string" ? ex : ex.code || JSON.stringify(ex)}
                                              </pre>
                                              {ex.explanation && (
                                                <p className="text-xs text-slate-600 italic bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100">
                                                  💡 {ex.explanation}
                                                </p>
                                              )}
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

                          {/* Worked Example */}
                          {adminDayContent.workedExample && (
                            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
                              <h5 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide">Worked Example — {adminDayContent.workedExample.title || "Case Implementation"}</h5>
                              {adminDayContent.workedExample.caseStudy && <p className="text-xs text-slate-700 leading-relaxed">{adminDayContent.workedExample.caseStudy}</p>}
                              {adminDayContent.workedExample.algorithm && (
                                <ol className="list-decimal list-inside text-xs text-slate-700 space-y-1">
                                  {adminDayContent.workedExample.algorithm.map((step: string, si: number) => <li key={si}>{step}</li>)}
                                </ol>
                              )}
                              {adminDayContent.workedExample.pseudocode && (
                                <pre className="bg-slate-900 text-emerald-300 p-3.5 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 whitespace-pre-wrap">{adminDayContent.workedExample.pseudocode.join("\n")}</pre>
                              )}
                              {adminDayContent.workedExample.code && (
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Executable Python Code:</span>
                                  <pre className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 whitespace-pre-wrap">{adminDayContent.workedExample.code}</pre>
                                  {adminDayContent.workedExample.codeExplanation && <p className="text-xs text-slate-600 italic">{adminDayContent.workedExample.codeExplanation}</p>}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Common Mistakes */}
                          {adminDayContent.commonMistakes && adminDayContent.commonMistakes.length > 0 && (
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                              <h5 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-2.5">Common Pitfalls & Mistakes</h5>
                              <div className="space-y-1.5">
                                {adminDayContent.commonMistakes.map((mst: string, mi: number) => (
                                  <div key={mi} className="flex items-start gap-2 text-xs text-slate-700">
                                    <span className="text-red-500 font-bold shrink-0">•</span>
                                    <span>{mst}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Practice */}
                          {adminDayContent.practice && adminDayContent.practice.length > 0 && (
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                              <h5 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-2.5">Practice Tasks ({adminDayContent.practice.length})</h5>
                              <div className="space-y-2">
                                {adminDayContent.practice.map((task: any, ti: number) => (
                                  <p key={ti} className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="font-bold text-indigo-600 mr-1.5">Task {ti + 1}:</span>{task.question}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. CONTENT RELEASE TAB */}
          {activeTab === "content" && (() => {
            const activeBatch = batches.find((b) => b.id === contentReleaseBatchId) || batches[0];
            const releasedCount = activeBatch ? allDays.filter((d) => batchReleased(activeBatch.id, d.id)).length : 0;
            const totalDaysCount = allDays.length || 40;
            const progressPercent = Math.round((releasedCount / totalDaysCount) * 100);
            const nextLockedDay = activeBatch ? allDays.find((d) => !batchReleased(activeBatch.id, d.id)) : null;

            const filteredDays = allDays.filter((d) => {
              if (contentReleaseModuleFilter !== "all" && d.moduleId !== contentReleaseModuleFilter) {
                return false;
              }
              if (contentReleaseSearch.trim()) {
                const q = contentReleaseSearch.toLowerCase();
                const matchTitle = d.title.toLowerCase().includes(q);
                const matchDayNum = `day ${d.dayNumber}`.includes(q) || String(d.dayNumber) === q;
                const matchTopic = d.topics?.some((t) => t.title.toLowerCase().includes(q));
                if (!matchTitle && !matchDayNum && !matchTopic) return false;
              }
              return true;
            });

            return (
              <div className="space-y-6">
                {/* Header & Description */}
                <Card className="p-6 border-slate-200/80 bg-white rounded-2xl shadow-2xs space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <PageHeader
                      title="Curriculum Content Release Management"
                      subtitle="Select an active student batch to unlock, schedule, or lock all 40 curriculum days with full topic breakdowns."
                    />

                    {/* Batch Selection Tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-400 uppercase mr-1">Active Batch:</span>
                      {batches.map((b) => {
                        const isSelected = (activeBatch?.id === b.id);
                        const bReleased = allDays.filter((d) => batchReleased(b.id, d.id)).length;
                        return (
                          <Button
                            key={b.id}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => setContentReleaseBatchId(b.id)}
                            className={isSelected ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-50"}
                          >
                            <span>{b.name}</span>
                            <Badge variant={isSelected ? "default" : "secondary"} className="text-[10px] py-0 px-1.5 ml-1">
                              Day {bReleased}/40
                            </Badge>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {activeBatch ? (
                    <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Selected Batch</div>
                        <div className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-2">
                          {activeBatch.name}
                          <StatusPill status={batchStatus(activeBatch)} />
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {batchStudents(activeBatch.id).length} Enrolled Student(s) • {activeBatch.startTime || "18:00"} - {activeBatch.endTime || "20:00"}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Curriculum Release Progress</div>
                        <div className="text-sm font-black text-slate-900 mt-0.5">
                          {releasedCount} of {totalDaysCount} Days Released <span className="text-xs font-bold text-emerald-600 font-mono">({progressPercent}%)</span>
                        </div>
                        <Progress value={progressPercent} max={100} className="mt-2" indicatorClassName="bg-emerald-500" />
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch md:items-center justify-end gap-2">
                        {nextLockedDay && (
                          <Button
                            size="sm"
                            onClick={() => releaseDay(activeBatch.id, nextLockedDay.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            <Zap className="w-3.5 h-3.5 mr-1" />
                            Release Next (Day {nextLockedDay.dayNumber})
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => releaseAllDaysForBatch(activeBatch.id)}
                          className="bg-[#FF5A36] hover:bg-orange-600 text-white font-bold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Release All 40
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => lockAllDaysForBatch(activeBatch.id)}
                          className="hover:bg-red-50 hover:text-red-600 font-bold"
                        >
                          <Lock className="w-3.5 h-3.5 mr-1" />
                          Lock All
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 text-amber-700 text-xs rounded-xl border border-amber-200">
                      No active batches found. Create a batch first to control content release.
                    </div>
                  )}
                </Card>

                {/* Filter & Search Bar */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="text"
                        placeholder="Search by topic title, day name, or Day number..."
                        value={contentReleaseSearch}
                        onChange={(e) => setContentReleaseSearch(e.target.value)}
                        className="pl-9 pr-3 py-2 text-xs"
                      />
                    </div>

                    <div className="w-60">
                      <Select
                        value={contentReleaseModuleFilter}
                        onChange={(e) => setContentReleaseModuleFilter(e.target.value)}
                      >
                        <option value="all">All Modules (40 Days)</option>
                        {(course?.modules || []).map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.title} ({m.days.length} Days)
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-500 font-bold shrink-0">
                    Showing <span className="text-slate-900 font-extrabold">{filteredDays.length}</span> of {allDays.length} Curriculum Days
                  </div>
                </div>

                {/* 40-Day One-By-One List with Topics Breakdown */}
                <div className="space-y-4">
                  {filteredDays.length === 0 ? (
                    <EmptyState
                      icon={Layers}
                      title="No curriculum days match your search/filter."
                      description="Try clearing the search or changing the module filter."
                    />
                  ) : (
                    filteredDays.map((d) => {
                      const isRel = activeBatch ? batchReleased(activeBatch.id, d.id) : false;
                      const parentMod = course?.modules.find((m) => m.id === d.moduleId);

                      return (
                        <Card
                          key={d.id}
                          className={`p-5 transition-all shadow-sm ${ isRel ? "border-emerald-200 bg-emerald-50/10 hover:border-emerald-300" : "border-slate-200 hover:border-slate-300 bg-white" }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                            <div className="flex items-start gap-3.5">
                              {/* Day Pill */}
                              <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border font-mono ${ isRel ? "bg-emerald-500 text-white border-emerald-600 shadow-sm" : "bg-slate-100 text-slate-700 border-slate-200" }`}>
                                <span className="text-[9px] uppercase font-bold leading-tight">DAY</span>
                                <span className="text-base font-black leading-none">{d.dayNumber < 10 ? `0${d.dayNumber}` : d.dayNumber}</span>
                              </div>

                              {/* Title & Metadata */}
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-extrabold text-sm text-slate-900">
                                    Day {d.dayNumber}: {d.title}
                                  </h4>
                                  {parentMod && (
                                    <Badge variant="info" className="text-[10px]">
                                      {parentMod.title}
                                    </Badge>
                                  )}
                                  <Badge variant="secondary" className="text-[10px] font-mono">
                                    {d.topics?.length || 0} Topics
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                  {d.description || `Comprehensive theory, live code demonstrations, and hands-on exercises for Day ${d.dayNumber}.`}
                                </p>
                              </div>
                            </div>

                            {/* Release Status & Action Controls */}
                            <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
                              {isRel ? (
                                <Badge variant="success" className="px-3 py-1 text-xs">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1" />
                                  <Unlock className="w-3.5 h-3.5 mr-1" />
                                  Released to Students
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="px-3 py-1 text-xs">
                                  <Lock className="w-3.5 h-3.5 mr-1" />
                                  Locked (Hidden)
                                </Badge>
                              )}

                              {activeBatch && (
                                isRel ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => unReleaseDay(activeBatch.id, d.id)}
                                    className="hover:bg-red-50 hover:text-red-600 text-xs font-bold"
                                  >
                                    <Lock className="w-3.5 h-3.5 mr-1" />
                                    Lock Day
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => releaseDay(activeBatch.id, d.id)}
                                    className="bg-[#FF5A36] hover:bg-orange-600 text-white text-xs font-bold shadow-sm"
                                  >
                                    <Unlock className="w-3.5 h-3.5 mr-1" />
                                    Release Day {d.dayNumber}
                                  </Button>
                                )
                              )}
                            </div>
                          </div>

                          {/* Full Topic Breakdown Syllabus */}
                          {d.topics && d.topics.length > 0 ? (
                            <div className="mt-3.5 pt-1">
                              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Day {d.dayNumber} Syllabus & Topic Breakdown ({d.topics.length})
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {d.topics.map((t, idx) => (
                                  <div
                                    key={t.id || idx}
                                    className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2.5 flex items-start gap-2 text-left"
                                  >
                                    <span className="text-[10px] font-mono font-extrabold text-[#FF5A36] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 shrink-0">
                                      {d.dayNumber}.{idx + 1}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-700 leading-snug">
                                      {t.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-xs text-slate-400 italic">
                              No topic breakdown recorded for this day.
                            </div>
                          )}
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()}

          {/* 7. DAILY PERFORMANCE MARKS TAB (New Dedicated Page) */}
          {activeTab === "marks" && (() => {
            // Filter submissions
            const filteredSubs = validTestSubmissions.filter((sub) => {
              const student = students.find((s) => s.id === sub.studentId);
              const matchSearch = !marksSearch || 
                (student?.fullName.toLowerCase().includes(marksSearch.toLowerCase()) ?? false) ||
                (student?.email.toLowerCase().includes(marksSearch.toLowerCase()) ?? false) ||
                (sub.testId.toLowerCase().includes(marksSearch.toLowerCase()));
              
              const matchBatch = marksBatchFilter === "all" || 
                (marksBatchFilter === "unassigned" ? !student?.batchId : student?.batchId === marksBatchFilter);
              
              const matchDay = marksDayFilter === "all" || sub.dayId === marksDayFilter;
              const matchType = marksTypeFilter === "all" || sub.testType === marksTypeFilter;

              return matchSearch && matchBatch && matchDay && matchType;
            });

            const evaluatedSubs = validTestSubmissions.filter(s => typeof s.score === "number" && (s.maxScore ?? 0) > 0);
            const dailySubs = evaluatedSubs.filter(s => s.testType === "daily");
            const avgDailyScore = dailySubs.length > 0
              ? (dailySubs.reduce((acc, s) => acc + (s.percentage ?? Math.round(((s.score || 0) / (s.maxScore || 10)) * 100)), 0) / dailySubs.length).toFixed(1) + "%"
              : "0%";

            const pendingEvaluations = validTestSubmissions.filter(s => s.evalStatus === "pending").length;

            // Highest score student
            let topStudentName = "N/A";
            let topScore = 0;
            students.forEach((st) => {
              const avg = studentDailyPct(st.id);
              if (avg !== null && avg > topScore) {
                topScore = avg;
                topStudentName = `${st.fullName} (${avg}%)`;
              }
            });

            return (
              <div className="space-y-6">
                {/* Real-time KPI summary bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Evaluations"
                    value={evaluatedSubs.length}
                    subtitle="Tests graded on Convex Cloud"
                    trend={`${validTestSubmissions.length} total submitted`}
                    trendType="neutral"
                    icon={Award}
                    iconColor="orange"
                  />
                  <StatCard
                    title="Daily Quiz Average"
                    value={avgDailyScore}
                    subtitle="Mean score across daily tests"
                    trend={dailySubs.length > 0 ? `${dailySubs.length} quizzes taken` : "0 submissions"}
                    trendType={dailySubs.length > 0 ? "up" : "neutral"}
                    icon={TrendingUp}
                    iconColor="emerald"
                  />
                  <StatCard
                    title="Top Performing Learner"
                    value={topStudentName}
                    subtitle="Highest daily quiz aggregate"
                    trend={topScore > 0 ? `${topScore}% Average` : "No data"}
                    trendType={topScore > 0 ? "up" : "neutral"}
                    icon={GraduationCap}
                    iconColor="indigo"
                  />
                  <StatCard
                    title="Pending Evaluations"
                    value={pendingEvaluations}
                    subtitle="Awaiting manual or auto review"
                    trend={pendingEvaluations === 0 ? "All graded" : "Action required"}
                    trendType={pendingEvaluations === 0 ? "up" : "down"}
                    icon={Clock}
                    iconColor="amber"
                  />
                </div>

                {/* Filters & View Switcher */}
                <Card className="p-4 border-slate-200/80 bg-white rounded-2xl shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={marksViewMode === "submissions" ? "default" : "outline"}
                        onClick={() => setMarksViewMode("submissions")}
                        className={`text-xs ${marksViewMode === "submissions" ? "bg-[#FF5A36] text-white hover:bg-orange-600" : ""}`}
                      >
                        Submissions Log ({filteredSubs.length})
                      </Button>
                      <Button
                        size="sm"
                        variant={marksViewMode === "matrix" ? "default" : "outline"}
                        onClick={() => setMarksViewMode("matrix")}
                        className={`text-xs ${marksViewMode === "matrix" ? "bg-[#FF5A36] text-white hover:bg-orange-600" : ""}`}
                      >
                        Student Progression Matrix
                      </Button>
                    </div>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">Search Student / Test</label>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          type="text"
                          placeholder="Filter by student name..."
                          value={marksSearch}
                          onChange={(e) => setMarksSearch(e.target.value)}
                          className="pl-8 text-xs h-9"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">Batch</label>
                      <Select
                        value={marksBatchFilter}
                        onChange={(e) => setMarksBatchFilter(e.target.value)}
                        className="text-xs h-9"
                      >
                        <option value="all">All Batches</option>
                        {batches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                        <option value="unassigned">Unassigned</option>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">Curriculum Day</label>
                      <Select
                        value={marksDayFilter}
                        onChange={(e) => setMarksDayFilter(e.target.value)}
                        className="text-xs h-9"
                      >
                        <option value="all">All Days (1–40)</option>
                        {allDays.map((d) => (
                          <option key={d.id} value={d.id}>Day {d.dayNumber}: {d.title}</option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">Test Type</label>
                      <Select
                        value={marksTypeFilter}
                        onChange={(e) => setMarksTypeFilter(e.target.value)}
                        className="text-xs h-9"
                      >
                        <option value="all">All Test Types</option>
                        <option value="daily">Daily Quizzes</option>
                        <option value="final">Final Master Exam</option>
                      </Select>
                    </div>
                  </div>
                </Card>

                {/* VIEW 1: Submissions Log Table */}
                {marksViewMode === "submissions" && (
                  <Card className="p-6 border-slate-200/80 bg-white rounded-2xl shadow-2xs space-y-4">
                    <PageHeader
                      title="Day-to-Day Student Performance Marks"
                      subtitle="Live records of student test scores, percentage grades, test case results, and submission timestamps."
                    />

                    {filteredSubs.length === 0 ? (
                      <EmptyState
                        icon={Award}
                        title="No Test Marks Found"
                        description="No submissions match the selected student, batch, or day filters."
                      />
                    ) : (
                      <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student</TableHead>
                              <TableHead>Batch</TableHead>
                              <TableHead>Day / Test</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Marks Obtained</TableHead>
                              <TableHead>Percentage</TableHead>
                              <TableHead>Eval Status</TableHead>
                              <TableHead>Submitted At</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredSubs.map((sub) => {
                              const student = students.find((s) => s.id === sub.studentId);
                              const batch = batches.find((b) => b.id === (sub.batchId || student?.batchId));
                              const day = allDays.find((d) => d.id === sub.dayId);
                              const scorePct = sub.percentage ?? (sub.score !== undefined && sub.maxScore > 0 ? Math.round((sub.score / sub.maxScore) * 100) : null);

                              return (
                                <TableRow key={sub.id} className="hover:bg-slate-50/70">
                                  <TableCell className="font-bold text-slate-800">
                                    <div className="flex items-center gap-2.5">
                                      <Avatar size="sm">
                                        <AvatarFallback className="bg-orange-100 text-[#FF5A36] text-[10px] font-bold">
                                          {(student?.fullName || "ST").slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="text-xs">{student?.fullName || sub.studentId}</div>
                                        <div className="text-[10px] text-slate-400 font-mono">{student?.email || "No email"}</div>
                                      </div>
                                    </div>
                                  </TableCell>

                                  <TableCell>
                                    <Badge variant="outline" className="text-[10px]">
                                      {batch?.name || "Unassigned"}
                                    </Badge>
                                  </TableCell>

                                  <TableCell>
                                    <div className="font-medium text-xs text-slate-800">
                                      {day ? `Day ${day.dayNumber}: ${day.title}` : sub.dayId || sub.testId}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono">ID: {sub.testId}</div>
                                  </TableCell>

                                  <TableCell>
                                    <Badge 
                                      variant={sub.testType === "final" ? "default" : "secondary"}
                                      className={`text-[10px] uppercase ${sub.testType === "final" ? "bg-purple-600 text-white" : ""}`}
                                    >
                                      {sub.testType === "final" ? "Final Exam" : "Daily Quiz"}
                                    </Badge>
                                  </TableCell>

                                  <TableCell className="font-mono font-bold text-xs">
                                    {sub.score !== undefined ? (
                                      <span className="text-slate-900">
                                        {sub.score} <span className="text-slate-400 font-normal">/ {sub.maxScore}</span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 italic font-normal">Pending</span>
                                    )}
                                  </TableCell>

                                  <TableCell>
                                    {scorePct !== null ? (
                                      <Badge 
                                        variant={scorePct >= (config.dailyPerfThreshold || 70) ? "success" : "destructive"}
                                        className="text-[10px] font-mono font-bold"
                                      >
                                        {scorePct}%
                                      </Badge>
                                    ) : (
                                      <span className="text-[11px] text-slate-400">-</span>
                                    )}
                                  </TableCell>

                                  <TableCell>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${ sub.evalStatus === "auto" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : sub.evalStatus === "manual" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-amber-50 text-amber-700 border border-amber-200" }`}>
                                      {sub.evalStatus === "auto" ? "AI Auto" : sub.evalStatus === "manual" ? "Admin" : "Pending"}
                                    </span>
                                  </TableCell>

                                  <TableCell className="font-mono text-[11px] text-slate-500">
                                    {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </Card>
                )}

                {/* VIEW 2: Student Progression Matrix */}
                {marksViewMode === "matrix" && (
                  <Card className="p-6 border-slate-200/80 bg-white rounded-2xl shadow-2xs space-y-4">
                    <PageHeader
                      title="Day-wise Student Marks Matrix"
                      subtitle="Comprehensive overview of student completion and marks across curriculum days."
                    />

                    <div className="border border-slate-200/80 rounded-xl overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[180px] sticky left-0 bg-slate-50/90 backdrop-blur z-10">Student</TableHead>
                            <TableHead className="min-w-[120px]">Batch</TableHead>
                            <TableHead className="min-w-[100px]">Aggregate</TableHead>
                            {allDays.slice(0, 15).map((d) => (
                              <TableHead key={d.id} className="min-w-[70px] text-center font-mono text-[10px]">
                                Day {d.dayNumber}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((st) => {
                            const subs = studentSubs(st.id);
                            const dailyAvg = studentDailyPct(st.id);
                            const batch = batches.find(b => b.id === st.batchId);

                            return (
                              <TableRow key={st.id}>
                                <TableCell className="font-bold text-slate-800 sticky left-0 bg-white z-10">
                                  <div className="text-xs truncate max-w-[160px]">{st.fullName}</div>
                                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">{st.email}</div>
                                </TableCell>

                                <TableCell>
                                  <Badge variant="outline" className="text-[10px]">
                                    {batch?.name || "Unassigned"}
                                  </Badge>
                                </TableCell>

                                <TableCell className="font-mono font-bold text-xs">
                                  {dailyAvg !== null ? (
                                    <Badge variant={dailyAvg >= (config.dailyPerfThreshold || 70) ? "success" : "secondary"}>
                                      {dailyAvg}%
                                    </Badge>
                                  ) : (
                                    <span className="text-slate-400 font-normal italic text-[10px]">No tests</span>
                                  )}
                                </TableCell>

                                {allDays.slice(0, 15).map((d) => {
                                  const daySub = subs.find(s => s.dayId === d.id);
                                  const dayScore = daySub?.percentage ?? (daySub?.score !== undefined && daySub.maxScore > 0 ? Math.round((daySub.score / daySub.maxScore) * 100) : null);

                                  return (
                                    <TableCell key={d.id} className="text-center p-2">
                                      {dayScore !== null ? (
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${ dayScore >= 70 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800" }`}>
                                          {dayScore}%
                                        </span>
                                      ) : (
                                        <span className="text-slate-300 font-mono text-xs">-</span>
                                      )}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                )}
              </div>
            );
          })()}

          {/* 8. REAL ANALYTICS TAB */}
          {activeTab === "analytics" && (() => {
            // Real Analytics Computations directly from live database
            const gradedSubmissions = validTestSubmissions.filter(s => typeof s.score === "number" && (s.maxScore ?? 0) > 0);
            const realAvgScore = gradedSubmissions.length > 0
              ? (gradedSubmissions.reduce((sum, s) => sum + (s.percentage ?? Math.round(((s.score || 0) / (s.maxScore || 10)) * 100)), 0) / gradedSubmissions.length).toFixed(1) + "%"
              : "0.0%";

            const activeBatchesList = batches.filter(b => batchStatus(b) === "active");
            const totalCurriculumDays = allDays.length || 40;
            const realCohortCompletion = activeBatchesList.length > 0
              ? Math.round(
                  activeBatchesList.reduce((sum, b) => {
                    const relCount = allDays.filter(d => batchReleased(b.id, d.id)).length;
                    return sum + (relCount / totalCurriculumDays) * 100;
                  }, 0) / activeBatchesList.length
                ) + "%"
              : "0%";

            const totalIncidents = testSessionData.reduce((acc, ts) => acc + (ts.tabSwitchCount || 0) + (ts.warningCount || 0), 0) + testEventData.length;
            const eligibleCount = students.filter(s => studentCert(s.id).eligible).length;

            return (
              <div className="space-y-6">
                {/* 100% Real Live Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Activity Sessions"
                    value={sessionData.length}
                    subtitle="Real-time student runtimes"
                    trend={`${sessionData.length} logged sessions`}
                    trendType="neutral"
                    icon={Activity}
                    iconColor="indigo"
                  />
                  <StatCard
                    title="Average Test Score"
                    value={realAvgScore}
                    subtitle={`Based on ${gradedSubmissions.length} graded test(s)`}
                    trend={gradedSubmissions.length > 0 ? "Real Convex Data" : "No submissions"}
                    trendType={gradedSubmissions.length > 0 ? "up" : "neutral"}
                    icon={TrendingUp}
                    iconColor="emerald"
                  />
                  <StatCard
                    title="Active Cohort Completion"
                    value={realCohortCompletion}
                    subtitle={`${activeBatchesList.length} active batch schedules`}
                    trend={`${totalCurriculumDays} curriculum days`}
                    trendType="neutral"
                    icon={CheckCircle2}
                    iconColor="orange"
                  />
                  <StatCard
                    title="Proctoring Incidents"
                    value={totalIncidents}
                    subtitle="Total tab switches & warnings"
                    trend={totalIncidents > 0 ? "Security Events" : "Clean Sessions"}
                    trendType={totalIncidents > 0 ? "down" : "neutral"}
                    icon={AlertCircle}
                    iconColor="amber"
                  />
                </div>

                {/* Cohort Performance Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="p-5 border-slate-200/80 bg-white rounded-2xl shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono">Certification Eligibility</h4>
                      <Badge variant={eligibleCount > 0 ? "success" : "secondary"}>
                        {eligibleCount} / {students.length} Eligible
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Requires ≥{config.dailyPerfThreshold || 70}% on daily quizzes and ≥{config.finalExamThreshold || 80}% on the final exam.
                    </p>
                    <Progress value={students.length > 0 ? (eligibleCount / students.length) * 100 : 0} className="h-2" />
                  </Card>

                  <Card className="p-5 border-slate-200/80 bg-white rounded-2xl shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono">Active Batches</h4>
                      <Badge variant="outline">{activeBatchesList.length} Active</Badge>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Total {batches.length} cohorts configured with {students.filter(s => s.batchId).length} enrolled students.
                    </p>
                    <div className="flex gap-2">
                      {batches.map(b => (
                        <Badge key={b.id} variant="secondary" className="text-[10px]">
                          {b.name} ({students.filter(s => s.batchId === b.id).length})
                        </Badge>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-5 border-slate-200/80 bg-white rounded-2xl shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono">Integrity Status</h4>
                      <Badge variant={totalIncidents === 0 ? "success" : "destructive"}>
                        {totalIncidents === 0 ? "100% Clean" : `${totalIncidents} Events`}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Monitors real-time browser visibility and test proctoring telemetry during evaluations.
                    </p>
                  </Card>
                </div>

                {/* Detailed Student Certification Audit Table */}
                <Card className="p-6 border-slate-200/80 bg-white rounded-2xl shadow-2xs space-y-4">
                  <PageHeader
                    title="Student Performance & Certification Audit"
                    subtitle="Verify daily quiz completions and final certification eligibility criteria."
                  />
                  <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Batch</TableHead>
                          <TableHead>Daily Test Avg</TableHead>
                          <TableHead>Final Exam Score</TableHead>
                          <TableHead>Certification Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((st) => {
                          const cert = studentCert(st.id);
                          return (
                            <TableRow key={st.id}>
                              <TableCell className="font-bold text-slate-800">
                                <div className="flex items-center gap-2.5">
                                  <Avatar size="sm">
                                    <AvatarFallback>{st.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div>{st.fullName}</div>
                                    <div className="text-[11px] text-slate-400 font-mono">{st.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-slate-600">
                                <Badge variant="outline" className="text-[11px]">
                                  {batches.find(b => b.id === st.batchId)?.name || "Unassigned"}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono font-bold">{cert.daily !== null ? `${cert.daily}%` : "No tests"}</TableCell>
                              <TableCell className="font-mono font-bold">{cert.finalPct !== null ? `${cert.finalPct}%` : "Not attempted"}</TableCell>
                              <TableCell>
                                <Badge variant={cert.eligible ? "success" : "secondary"} className="uppercase text-[10px]">
                                  {cert.eligible ? "Eligible" : "Ineligible"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
            );
          })()}

          {/* 8. TEST MONITOR TAB */}
          {activeTab === "tests" && (
            <Card className="p-6 border-slate-200/80 bg-white rounded-2xl shadow-2xs space-y-4">
              <PageHeader
                title="Assessment Submissions & Test Monitor"
                subtitle="Live stream of student assessment activity, evaluations, and submission timestamps."
                badge={
                  <span className="text-xs text-slate-500 font-mono font-bold">
                    ({validTestSubmissions.length} Total Submissions)
                  </span>
                }
              />
              <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Test ID</TableHead>
                      <TableHead>Evaluation Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Submitted At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validTestSubmissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="p-8 text-center text-slate-400">
                          No assessment submissions currently recorded.
                        </TableCell>
                      </TableRow>
                    ) : (
                      validTestSubmissions.map((sub) => {
                        const student = students.find(s => s.id === sub.studentId);
                        const batch = batches.find(b => b.id === (sub.batchId || student?.batchId));
                        return (
                          <TableRow key={sub.id}>
                            <TableCell className="font-bold text-slate-800">{student?.fullName || sub.studentId}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px]">
                                {batch?.name || "Unassigned"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono">{sub.testId} ({sub.testType})</TableCell>
                            <TableCell><StatusPill status={sub.evalStatus} /></TableCell>
                            <TableCell className="font-mono font-bold">
                              {sub.score !== undefined ? `${sub.score} / ${sub.maxScore || 10}` : "-"}
                            </TableCell>
                            <TableCell className="text-slate-500 font-mono text-[11px]">
                              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "N/A"}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {/* 9. ANNOUNCEMENTS TAB */}
          {activeTab === "announcements" && (
            <Card className="p-6 border-slate-200/80 bg-white rounded-2xl shadow-2xs space-y-4">
              <PageHeader
                title={`Announcements (${announcements.length})`}
                subtitle="Broadcast updates, schedules, and important notices to all enrolled learners."
                action={
                  <Button
                    onClick={() => { setAnnForm({ id: "", title: "", content: "", author: "Director Admin", isPinned: false }); setIsAnnEditing(true); }}
                    className="bg-[#FF5A36] text-white text-xs font-bold hover:bg-orange-600 shadow-md shadow-orange-500/20"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create Announcement
                  </Button>
                }
              />

              <div className="space-y-3">
                {announcements.map((a) => (
                  <Card key={a.id} className="p-4 space-y-2 bg-white border-slate-200/80 rounded-xl">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900">{a.title}</h4>
                      <div className="flex items-center gap-2">
                        {a.isPinned && <Badge variant="orange" className="text-[9px] font-bold">Pinned</Badge>}
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleDeleteAnn(a.id)}
                          className="text-[10px] font-bold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{a.content}</p>
                    <div className="text-[10px] font-mono text-slate-400">By {a.author} • {new Date(a.publishedAt).toLocaleDateString()}</div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* Announcement Modal */}
          {isAnnEditing && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl bg-white animate-in zoom-in-95">
                <h3 className="font-extrabold text-sm text-slate-900">Create Announcement</h3>
                <Input
                  type="text"
                  placeholder="Title"
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Announcement Message..."
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none h-24"
                  required
                />
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAnnEditing(false)}>Cancel</Button>
                  <Button type="button" size="sm" onClick={(e: any) => handleSaveAnn(e)} className="bg-[#FF5A36] text-white hover:bg-orange-600 font-bold">Publish</Button>
                </div>
              </Card>
            </div>
          )}

          {/* 10. AUDIT LOGS TAB */}
          {activeTab === "audit" && (
            <Card className="p-6 border-slate-200/80 bg-white rounded-2xl shadow-2xs space-y-4">
              <PageHeader
                title="Administrative Audit Timeline"
                subtitle="Complete audit trail of user admissions, grade changes, batch transfers, and content releases."
              />
              <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="font-bold text-slate-800 text-xs">{log.userName || log.userEmail}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] font-mono">
                            {log.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="info" className="font-bold text-[10px]">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 text-xs font-sans">{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {/* 11. AI COPILOT TAB */}
          {activeTab === "copilot" && (
            <Card className="p-6 border-slate-200/80 bg-white rounded-2xl shadow-2xs space-y-4 flex flex-col h-[78vh]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF5A36] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      Kriora Admin AI Copilot
                      <Badge variant="success" className="text-[9px] font-mono font-bold">
                        <Zap className="w-2.5 h-2.5 mr-1" /> Autonomous Execution Active
                      </Badge>
                    </h3>
                    <p className="text-[11px] text-slate-400">Ask to generate & broadcast announcements, summarize batch performance, or manage courses.</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("announcements")}
                    className="text-[11px] font-bold"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    Announcements ({announcements.length})
                  </Button>
                </div>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-50/70 rounded-xl border border-slate-100">
                {copilotMessages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-2xl space-y-2.5 ${m.sender === "user" ? "items-end" : "items-start"}`}>
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${ m.sender === "user" ? "bg-slate-900 text-white rounded-br-none shadow-sm" : "bg-white border border-slate-200/80 text-slate-800 rounded-bl-none shadow-sm whitespace-pre-wrap" }`}>
                        {m.text}
                      </div>

                      {/* Autonomous Action Card */}
                      {m.actionExecuted && (
                        <div className={`p-4 rounded-xl border text-xs shadow-sm transition-all ${ m.actionExecuted.status === "success" ? "bg-emerald-50/80 border-emerald-200 text-emerald-950" : "bg-rose-50/80 border-rose-200 text-rose-950" }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 font-bold">
                              {m.actionExecuted.status === "success" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-rose-600" />
                              )}
                              <span>
                                {m.actionExecuted.status === "success" 
                                  ? "⚡ Action Executed & Published to All Students" 
                                  : "Action Execution Encountered an Issue"}
                              </span>
                            </div>
                            <Badge variant="success" className="text-[10px] font-mono">
                              Convex Cloud
                            </Badge>
                          </div>

                          {m.actionExecuted.details && (
                            <div className="bg-white/90 p-3 rounded-lg border border-emerald-200/60 space-y-1.5 mt-2">
                              <p className="font-extrabold text-slate-900 text-xs">
                                📢 {m.actionExecuted.details.title}
                              </p>
                              <p className="text-[11px] text-slate-600 whitespace-pre-wrap line-clamp-3">
                                {m.actionExecuted.details.content}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                                <span>Author: {m.actionExecuted.details.author || "Director Admin"}</span>
                                <button
                                  type="button"
                                  onClick={() => setActiveTab("announcements")}
                                  className="text-[#FF5A36] font-bold hover:underline flex items-center gap-0.5"
                                >
                                  View in Announcements Tab <ArrowUpRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {copilotTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-2 text-xs text-slate-500">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF5A36]" />
                      <span>Copilot is formulating response & executing actions...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Action Suggestion Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold shrink-0">Quick Actions:</span>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={copilotTyping}
                  onClick={() => sendCopilotPrompt("Generate an announcement wishing all students best of luck for the upcoming assessments and send it to everyone.")}
                  className="bg-white hover:bg-orange-50 hover:border-orange-200 text-slate-700"
                >
                  <Megaphone className="w-3 h-3 mr-1 text-[#FF5A36]" />
                  Wish Students Best of Luck
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={copilotTyping}
                  onClick={() => sendCopilotPrompt("Write and post an announcement reminding students to complete their daily Python coding tasks and submit on time.")}
                  className="bg-white hover:bg-orange-50 hover:border-orange-200 text-slate-700"
                >
                  <Sparkles className="w-3 h-3 mr-1 text-[#FF5A36]" />
                  Daily Task Reminder
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={copilotTyping}
                  onClick={() => sendCopilotPrompt("Summarize the current pending student registrations and overall LMS batch statistics.")}
                  className="bg-white hover:bg-orange-50 hover:border-orange-200 text-slate-700"
                >
                  <BarChart2 className="w-3 h-3 mr-1 text-[#FF5A36]" />
                  Batch & Student Summary
                </Button>
              </div>

              {/* Input Bar */}
              <form onSubmit={handleCopilot} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Ask AI Copilot to generate & publish announcements to all students, plan curriculum, or analyze batches..."
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  className="flex-1 p-3 text-xs"
                />
                <Button
                  type="submit"
                  disabled={copilotTyping || !copilotInput.trim()}
                  className="px-5 bg-[#FF5A36] text-white text-xs font-bold rounded-xl hover:bg-orange-600 shadow-md shadow-orange-500/20"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  <span>Send</span>
                </Button>
              </form>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
