import React, { useState, useMemo } from "react";
import {
  Code,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Sparkles,
  BookOpen,
  Award,
  Users,
  Copy,
  Check,
  RotateCcw,
  X,
  FileCode,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PRACTICE_PROBLEMS_CATALOG, PRACTICE_TOPICS } from "../../lib/practice/catalog";
import type { PracticeProblem, ProblemDifficulty } from "../../lib/practice/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminPracticeArenaProps {
  actorEmail: string;
}

export default function AdminPracticeArena({ actorEmail }: AdminPracticeArenaProps) {
  // Query live submissions and progress from Convex
  const practiceOverview = useQuery(api.lms.getAdminPracticeOverview, {
    actorEmail,
  });

  // Sub-tab: 'questions' | 'submissions' | 'students'
  const [activeTab, setActiveTab] = useState<"questions" | "submissions" | "students">("questions");

  // Questions filter state
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionTopicFilter, setQuestionTopicFilter] = useState("All");
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState("All");

  // Submissions filter state
  const [subSearch, setSubSearch] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState("All");

  // Selected question modal state
  const [selectedQuestion, setSelectedQuestion] = useState<PracticeProblem | null>(null);

  // Selected submission modal state (for code inspection)
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // On-demand code query for inspected submission
  const inspectedCode = useQuery(
    api.lms.getAdminSubmissionCode,
    selectedSubmission ? { submissionId: selectedSubmission.id, actorEmail } : "skip"
  );

  // Filtered Questions Catalog
  const filteredQuestions = useMemo(() => {
    return PRACTICE_PROBLEMS_CATALOG.filter((q) => {
      if (questionSearch.trim()) {
        const s = questionSearch.toLowerCase().trim();
        const matchTitle = q.title.toLowerCase().includes(s);
        const matchNum = q.problemNumber.toString().includes(s);
        const matchTopic = q.topic.toLowerCase().includes(s);
        const matchCurriculum = q.relatedCurriculumTopic?.toLowerCase().includes(s);
        if (!matchTitle && !matchNum && !matchTopic && !matchCurriculum) return false;
      }
      if (questionTopicFilter !== "All" && q.topic !== questionTopicFilter) {
        return false;
      }
      if (questionDifficultyFilter !== "All" && q.difficulty !== questionDifficultyFilter) {
        return false;
      }
      return true;
    });
  }, [questionSearch, questionTopicFilter, questionDifficultyFilter]);

  // Filtered Submissions
  const submissionsList = practiceOverview?.submissions || [];
  const filteredSubmissions = useMemo(() => {
    return submissionsList.filter((sub: any) => {
      if (subSearch.trim()) {
        const s = subSearch.toLowerCase().trim();
        const matchStudent = (sub.studentName || "").toLowerCase().includes(s) || (sub.studentEmail || "").toLowerCase().includes(s);
        const matchProblem = (sub.problemId || "").toLowerCase().includes(s);
        if (!matchStudent && !matchProblem) return false;
      }
      if (subStatusFilter !== "All" && sub.status !== subStatusFilter) {
        return false;
      }
      return true;
    });
  }, [submissionsList, subSearch, subStatusFilter]);

  // Student Aggregations
  const studentPracticeMap = useMemo(() => {
    const map = new Map<string, { studentName: string; studentEmail: string; batchId: string; totalAttempts: number; solvedCount: number; lastSubmittedAt: string }>();
    submissionsList.forEach((sub: any) => {
      const key = sub.studentEmail || sub.studentId;
      const existing = map.get(key) || {
        studentName: sub.studentName || key,
        studentEmail: sub.studentEmail || key,
        batchId: sub.studentBatchId || "Unassigned",
        totalAttempts: 0,
        solvedCount: 0,
        lastSubmittedAt: sub.submittedAt,
      };
      existing.totalAttempts += 1;
      if (sub.status === "Accepted") {
        existing.solvedCount += 1;
      }
      if (new Date(sub.submittedAt).getTime() > new Date(existing.lastSubmittedAt).getTime()) {
        existing.lastSubmittedAt = sub.submittedAt;
      }
      map.set(key, existing);
    });
    return Array.from(map.values());
  }, [submissionsList]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getDifficultyBadge = (diff: ProblemDifficulty) => {
    switch (diff) {
      case "Easy":
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Easy</span>;
      case "Medium":
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Medium</span>;
      case "Hard":
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Hard</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Accepted") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
        <XCircle className="w-3.5 h-3.5" /> {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Practice Info */}
      <Card className="bg-gradient-to-r from-orange-50/90 via-white to-amber-50/40 border-orange-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#FF5A36] bg-orange-100/80 border border-orange-200">
                <Code className="w-3.5 h-3.5" />
                <span>Practice Arena Management</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Cloud Sync Active
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Student Practice Arena Monitor
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed font-medium">
              Real-time telemetry of student practice sessions, instant code inspection, automated evaluation stats, and curriculum question browsing.
            </p>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Questions</p>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {PRACTICE_PROBLEMS_CATALOG.length}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5A36]">
              <Code className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium">13 curriculum topics covered</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Submissions</p>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {submissionsList.length.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium">Logged practice attempts</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Problems Solved</p>
              <div className="text-3xl font-black text-[#FF5A36] mt-1">
                {practiceOverview?.solvedCount || 0}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF5A36]">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium">Unique student solves</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Practicing Students</p>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {studentPracticeMap.length}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium">Active practice participants</p>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("questions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "questions"
              ? "bg-[#FF5A36] text-white shadow-md shadow-orange-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Questions Catalog ({filteredQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "submissions"
              ? "bg-[#FF5A36] text-white shadow-md shadow-orange-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Student Submissions ({submissionsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "students"
              ? "bg-[#FF5A36] text-white shadow-md shadow-orange-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Student Leaderboard ({studentPracticeMap.length})</span>
        </button>
      </div>

      {/* ── TAB 1: QUESTIONS CATALOG ───────────────────────────────────────── */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {/* Search & Topic Filters */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions by title, number, topic..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF5A36] font-medium"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={questionDifficultyFilter}
                  onChange={(e) => setQuestionDifficultyFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF5A36]"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                {(questionSearch || questionTopicFilter !== "All" || questionDifficultyFilter !== "All") && (
                  <button
                    onClick={() => {
                      setQuestionSearch("");
                      setQuestionTopicFilter("All");
                      setQuestionDifficultyFilter("All");
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                )}
              </div>
            </div>

            {/* Topic Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
              <span className="text-slate-400 text-xs font-bold mr-1 shrink-0">Topics:</span>
              {PRACTICE_TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setQuestionTopicFilter(topic)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    questionTopicFilter === topic
                      ? "bg-[#FF5A36] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Question Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 w-16">#</th>
                  <th className="py-3.5 px-4">Question Title</th>
                  <th className="py-3.5 px-4">Topic</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Curriculum Link</th>
                  <th className="py-3.5 px-4">Test Cases</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-orange-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#{q.problemNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{q.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{q.description.slice(0, 80)}...</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {q.topic}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getDifficultyBadge(q.difficulty)}</td>
                    <td className="py-3.5 px-4">
                      {q.relatedCurriculumTopic ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                          <BookOpen className="w-3 h-3 text-[#FF5A36]" />
                          {q.relatedDay ? `Day ${q.relatedDay}` : ""}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                      {q.publicTestCases.length} public / {q.hiddenTestCases?.length || 0} hidden
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedQuestion(q)}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#FF5A36]" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: STUDENT SUBMISSIONS ────────────────────────────────────── */}
      {activeTab === "submissions" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name, email, problem..."
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF5A36] font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={subStatusFilter}
                onChange={(e) => setSubStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF5A36]"
              >
                <option value="All">All Statuses</option>
                <option value="Accepted">Accepted</option>
                <option value="Wrong Answer">Wrong Answer</option>
                <option value="Runtime Error">Runtime Error</option>
                <option value="Time Limit Exceeded">Time Limit Exceeded</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            {filteredSubmissions.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-600">No student practice submissions found matching criteria.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Problem</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Tests Passed</th>
                    <th className="py-3.5 px-4">Runtime</th>
                    <th className="py-3.5 px-4">Submitted At</th>
                    <th className="py-3.5 px-4 text-right">Submitted Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.map((sub: any) => {
                    const prob = PRACTICE_PROBLEMS_CATALOG.find((p) => p.id === sub.problemId);
                    return (
                      <tr key={sub.id} className="hover:bg-orange-50/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{sub.studentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{sub.studentEmail}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">
                            {prob ? `#${prob.problemNumber} ${prob.title}` : sub.problemId}
                          </div>
                          {prob && (
                            <div className="text-[11px] text-slate-500">{prob.topic}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(sub.status)}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {sub.passedTests} / {sub.totalTests}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">{sub.runtimeMs}ms</td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {new Date(sub.submittedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedSubmission(sub)}
                            className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <FileCode className="w-3.5 h-3.5 text-[#FF5A36]" />
                            <span>View Code</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: STUDENT LEADERBOARD / METRICS ──────────────────────────── */}
      {activeTab === "students" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          {studentPracticeMap.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-600">No student practice telemetry recorded yet.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Cohort Batch</th>
                  <th className="py-3.5 px-4">Total Attempts</th>
                  <th className="py-3.5 px-4">Accepted Solves</th>
                  <th className="py-3.5 px-4">Success Rate</th>
                  <th className="py-3.5 px-4 text-right">Last Submission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentPracticeMap.map((st) => {
                  const rate = st.totalAttempts > 0 ? Math.round((st.solvedCount / st.totalAttempts) * 100) : 0;
                  return (
                    <tr key={st.studentEmail} className="hover:bg-orange-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{st.studentName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{st.studentEmail}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {st.batchId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{st.totalAttempts}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{st.solvedCount}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-xs text-[#FF5A36]">{rate}%</span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 font-medium">
                        {new Date(st.lastSubmittedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── QUESTION INSPECT MODAL ────────────────────────────────────────── */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">#{selectedQuestion.problemNumber}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedQuestion.title}</h3>
                <div>{getDifficultyBadge(selectedQuestion.difficulty)}</div>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-400 uppercase text-[10px] mb-1">Description</h4>
                <p className="text-slate-800 whitespace-pre-line text-sm leading-relaxed">{selectedQuestion.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-400 uppercase text-[10px] mb-1">Input Format</h4>
                  <pre className="font-mono text-slate-800 whitespace-pre-wrap">{selectedQuestion.inputFormat}</pre>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-400 uppercase text-[10px] mb-1">Output Format</h4>
                  <pre className="font-mono text-slate-800 whitespace-pre-wrap">{selectedQuestion.outputFormat}</pre>
                </div>
              </div>

              {selectedQuestion.solution && (
                <div>
                  <h4 className="font-bold text-slate-400 uppercase text-[10px] mb-1">Official Reference Code</h4>
                  <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                    {selectedQuestion.solution.code}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <Button
                variant="outline"
                onClick={() => setSelectedQuestion(null)}
                className="font-bold text-xs rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── CODE INSPECT MODAL ────────────────────────────────────────────── */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <div className="text-xs font-bold text-slate-500">Student Submission Inspector</div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedSubmission.studentName} — {selectedSubmission.problemId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div>Status: {getStatusBadge(selectedSubmission.status)}</div>
                <div>Passed: <strong>{selectedSubmission.passedTests}/{selectedSubmission.totalTests}</strong> tests</div>
                <div>Runtime: <strong>{selectedSubmission.runtimeMs}ms</strong></div>
              </div>

              <button
                onClick={() => copyToClipboard(inspectedCode || selectedSubmission.code || "")}
                disabled={!inspectedCode && !selectedSubmission.code}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto bg-slate-950 flex-1">
              {inspectedCode === undefined && !selectedSubmission.code ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <RefreshCw className="w-5 h-5 text-orange-500 animate-spin mx-auto mb-2" />
                  <p>Loading student Python code...</p>
                </div>
              ) : (
                <pre className="text-slate-100 font-mono text-xs leading-relaxed whitespace-pre">
                  {inspectedCode || selectedSubmission.code || "# No code recorded"}
                </pre>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <Button
                variant="outline"
                onClick={() => setSelectedSubmission(null)}
                className="font-bold text-xs rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
