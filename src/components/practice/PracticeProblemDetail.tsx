import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  XCircle,
  Play,
  Send,
  RotateCcw,
  BookOpen,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  History,
  Lightbulb,
  Terminal,
  Code2,
  Lock,
  Unlock,
  Clock,
  FileCode,
} from 'lucide-react';
import type {
  PracticeProblem,
  ProblemDifficulty,
  TestExecutionResult,
  PracticeSubmission,
} from '../../lib/practice/types';
import { runPythonWithStdin, normalizeOutput } from '../../lib/pythonRunner';

interface PracticeProblemDetailProps {
  problem: PracticeProblem;
  isBookmarked: boolean;
  onBack: () => void;
  onToggleBookmark: (problemId: string) => void;
  onRecordSubmission: (submission: {
    problemId: string;
    status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded';
    code: string;
    passedTests: number;
    totalTests: number;
    runtimeMs: number;
    submissionRequestId?: string;
  }) => Promise<any>;
  submissions: PracticeSubmission[];
  isSolved: boolean;
  onNavigateToCurriculumDay?: (dayNumber: number) => void;
}

export const PracticeProblemDetail: React.FC<PracticeProblemDetailProps> = ({
  problem,
  isBookmarked,
  onBack,
  onToggleBookmark,
  onRecordSubmission,
  submissions,
  isSolved,
  onNavigateToCurriculumDay,
}) => {
  // Local code editor state (persisted to localStorage per problem)
  const [code, setCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`practice_code_${problem.id}`);
      if (saved) return saved;
    } catch (_) {}
    return problem.starterCode || '# Write your solution here\n';
  });

  // Active tabs
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'hints' | 'submissions' | 'solution'>('description');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcases' | 'results' | 'custom_input'>('testcases');
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);
  const [customInput, setCustomInput] = useState('');

  // UI state
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [isSolutionUnlocked, setIsSolutionUnlocked] = useState(isSolved);
  const [copiedExampleIndex, setCopiedExampleIndex] = useState<number | null>(null);

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    status?: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded';
    isPublicRun?: boolean;
    passedTests: number;
    totalTests: number;
    runtimeMs: number;
    testResults: TestExecutionResult[];
    customOutput?: string;
    customError?: string;
  } | null>(null);

  // Synchronize solution unlock state if problem becomes solved
  useEffect(() => {
    if (isSolved) {
      setIsSolutionUnlocked(true);
    }
  }, [isSolved]);

  // Persist code changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`practice_code_${problem.id}`, code);
    } catch (_) {}
  }, [code, problem.id]);

  // Reset starter code
  const handleResetCode = () => {
    if (window.confirm('Reset code editor to starter template? Your current edits will be lost.')) {
      setCode(problem.starterCode || '# Write your solution here\n');
    }
  };

  // Copy worked example input to clipboard
  const handleCopyInput = (input: string, index: number) => {
    navigator.clipboard.writeText(input);
    setCopiedExampleIndex(index);
    setTimeout(() => setCopiedExampleIndex(null), 2000);
  };

  // Toggle hints
  const toggleHint = (index: number) => {
    setRevealedHints((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Run Code (Public Tests or Custom Input)
  const handleRunCode = useCallback(async () => {
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    setActiveConsoleTab('results');

    try {
      if (activeConsoleTab === 'custom_input' && customInput) {
        // Run with custom input
        const start = performance.now();
        const res = await runPythonWithStdin(code, customInput, 6000);
        const runtime = Math.round(performance.now() - start);

        setExecutionResult({
          status: res.error ? 'Runtime Error' : 'Accepted',
          isPublicRun: true,
          passedTests: res.error ? 0 : 1,
          totalTests: 1,
          runtimeMs: runtime,
          testResults: [],
          customOutput: res.stdout,
          customError: res.error || (res.stderr ? res.stderr : undefined),
        });
      } else {
        // Run against all public test cases
        const testsToRun = problem.publicTestCases;
        const testResults: TestExecutionResult[] = [];
        let passed = 0;
        let totalRuntime = 0;
        let finalStatus: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded' = 'Accepted';

        for (let i = 0; i < testsToRun.length; i++) {
          const tc = testsToRun[i];
          const start = performance.now();
          const res = await runPythonWithStdin(code, tc.input, 6000);
          const runtime = Math.round(performance.now() - start);
          totalRuntime += runtime;

          const normActual = normalizeOutput(res.stdout);
          const normExpected = normalizeOutput(tc.expectedOutput);
          const isPass = !res.error && normActual === normExpected;

          if (isPass) {
            passed++;
          } else if (res.error && res.error.toLowerCase().includes('timeout')) {
            finalStatus = 'Time Limit Exceeded';
          } else if (res.error) {
            finalStatus = 'Runtime Error';
          } else {
            finalStatus = 'Wrong Answer';
          }

          testResults.push({
            testIndex: i + 1,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: res.stdout,
            passed: isPass,
            error: res.error || (res.stderr ? res.stderr : null),
            runtimeMs: runtime,
          });
        }

        if (passed === testsToRun.length) {
          finalStatus = 'Accepted';
        }

        setExecutionResult({
          status: finalStatus,
          isPublicRun: true,
          passedTests: passed,
          totalTests: testsToRun.length,
          runtimeMs: totalRuntime,
          testResults,
        });
      }
    } catch (err: any) {
      setExecutionResult({
        status: 'Runtime Error',
        isPublicRun: true,
        passedTests: 0,
        totalTests: problem.publicTestCases.length,
        runtimeMs: 0,
        testResults: [],
        customError: err?.message || 'Execution failed',
      });
    } finally {
      setIsRunning(false);
    }
  }, [code, customInput, activeConsoleTab, isRunning, isSubmitting, problem.publicTestCases]);

  // Submit Code (Full Suite with Hidden Cases)
  const handleSubmitCode = useCallback(async () => {
    if (isRunning || isSubmitting) return;
    setIsSubmitting(true);
    setActiveConsoleTab('results');

    try {
      const fullSuite = [...problem.publicTestCases, ...(problem.hiddenTestCases || [])];
      const testResults: TestExecutionResult[] = [];
      let passed = 0;
      let totalRuntime = 0;
      let finalStatus: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded' = 'Accepted';

      for (let i = 0; i < fullSuite.length; i++) {
        const tc = fullSuite[i];
        const isHidden = i >= problem.publicTestCases.length;
        const start = performance.now();
        const res = await runPythonWithStdin(code, tc.input, 6000);
        const runtime = Math.round(performance.now() - start);
        totalRuntime += runtime;

        const normActual = normalizeOutput(res.stdout);
        const normExpected = normalizeOutput(tc.expectedOutput);
        const isPass = !res.error && normActual === normExpected;

        if (isPass) {
          passed++;
        } else if (res.error && res.error.toLowerCase().includes('timeout')) {
          finalStatus = 'Time Limit Exceeded';
        } else if (res.error) {
          finalStatus = 'Runtime Error';
        } else {
          finalStatus = 'Wrong Answer';
        }

        testResults.push({
          testIndex: i + 1,
          input: isHidden ? '[Hidden Test Case]' : tc.input,
          expectedOutput: isHidden ? '[Hidden]' : tc.expectedOutput,
          actualOutput: isHidden && !isPass ? (res.error ? res.error : '[Output Mismatched]') : res.stdout,
          passed: isPass,
          error: res.error || (res.stderr ? res.stderr : null),
          runtimeMs: runtime,
        });
      }

      if (passed === fullSuite.length) {
        finalStatus = 'Accepted';
        setIsSolutionUnlocked(true);
      }

      const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      setExecutionResult({
        status: finalStatus,
        isPublicRun: false,
        passedTests: passed,
        totalTests: fullSuite.length,
        runtimeMs: totalRuntime,
        testResults,
      });

      // Record practice submission in Convex
      await onRecordSubmission({
        problemId: problem.id,
        status: finalStatus,
        code,
        passedTests: passed,
        totalTests: fullSuite.length,
        runtimeMs: totalRuntime,
        submissionRequestId: reqId,
      });
    } catch (err: any) {
      setExecutionResult({
        status: 'Runtime Error',
        isPublicRun: false,
        passedTests: 0,
        totalTests: (problem.publicTestCases.length + (problem.hiddenTestCases?.length || 0)),
        runtimeMs: 0,
        testResults: [],
        customError: err?.message || 'Submission evaluation failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [code, isRunning, isSubmitting, problem, onRecordSubmission]);

  const getDifficultyBadge = (difficulty: ProblemDifficulty) => {
    switch (difficulty) {
      case 'Easy':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Easy
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Medium
          </span>
        );
      case 'Hard':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Hard
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-140px)]">
      {/* Top Problem Navigation & Header Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onBack}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Problem Catalog</span>
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <span className="font-mono text-xs font-bold text-slate-400">#{problem.problemNumber}</span>
          <h2 className="text-base font-bold text-slate-900 truncate max-w-xs md:max-w-md">
            {problem.title}
          </h2>
          <div>{getDifficultyBadge(problem.difficulty)}</div>
          {isSolved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Solved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {problem.relatedCurriculumTopic && (
            <button
              onClick={() => {
                if (problem.relatedDay && onNavigateToCurriculumDay) {
                  onNavigateToCurriculumDay(problem.relatedDay);
                }
              }}
              className="hidden lg:flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200/80 text-orange-700 hover:bg-orange-100 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#FF5A36]" />
              <span>{problem.relatedDay ? `Day ${problem.relatedDay}: ` : ''}{problem.relatedCurriculumTopic}</span>
            </button>
          )}

          <button
            onClick={() => onToggleBookmark(problem.id)}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Problem'}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100'
                : 'text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Two-Panel Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Panel: Problem Statement, Hints, Submissions, Solution */}
        <div className="lg:col-span-5 flex flex-col bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs min-h-[500px]">
          {/* Left Tabs */}
          <div className="flex items-center border-b border-slate-100 bg-slate-50/70 px-3 pt-2 gap-2 text-xs">
            <button
              onClick={() => setActiveLeftTab('description')}
              className={`px-3 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeLeftTab === 'description'
                  ? 'bg-white text-[#FF5A36] border-t border-l border-r border-slate-200/80 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" /> Description
            </button>
            <button
              onClick={() => setActiveLeftTab('hints')}
              className={`px-3 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeLeftTab === 'hints'
                  ? 'bg-white text-[#FF5A36] border-t border-l border-r border-slate-200/80 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Hints ({problem.hints?.length || 0})
            </button>
            <button
              onClick={() => setActiveLeftTab('submissions')}
              className={`px-3 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeLeftTab === 'submissions'
                  ? 'bg-white text-[#FF5A36] border-t border-l border-r border-slate-200/80 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Submissions ({submissions.length})
            </button>
            <button
              onClick={() => setActiveLeftTab('solution')}
              className={`px-3 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeLeftTab === 'solution'
                  ? 'bg-white text-[#FF5A36] border-t border-l border-r border-slate-200/80 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {isSolutionUnlocked ? (
                <Unlock className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
              Solution
            </button>
          </div>

          {/* Left Content Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 text-slate-700 text-sm leading-relaxed">
            {activeLeftTab === 'description' && (
              <>
                {/* Curriculum Day Banner */}
                {problem.relatedCurriculumTopic && (
                  <div className="bg-orange-50/70 border border-orange-200/70 rounded-xl p-3 text-xs flex items-start gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#FF5A36] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-orange-800">
                        Curriculum Link: {problem.relatedDay ? `Day ${problem.relatedDay}` : ''}
                      </span>
                      <p className="text-slate-600 mt-0.5 font-medium">{problem.relatedCurriculumTopic}</p>
                    </div>
                  </div>
                )}

                {/* Problem Statement */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Problem Statement</h3>
                  <p className="whitespace-pre-line text-slate-800 font-medium leading-relaxed">{problem.description}</p>
                </div>

                {/* Input Format */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Input Format</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 whitespace-pre-line font-medium">
                    {problem.inputFormat}
                  </div>
                </div>

                {/* Output Format */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Output Format</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 whitespace-pre-line font-medium">
                    {problem.outputFormat}
                  </div>
                </div>

                {/* Constraints */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Constraints</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700 whitespace-pre-line font-medium">
                    {problem.constraints}
                  </div>
                </div>

                {/* Examples */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Examples</h3>
                  <div className="space-y-3">
                    {problem.examples.map((ex, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-700 font-bold">
                          <span>Example {idx + 1}</span>
                          <button
                            onClick={() => handleCopyInput(ex.input, idx)}
                            className="text-[11px] text-slate-500 hover:text-[#FF5A36] flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            {copiedExampleIndex === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy Input
                              </>
                            )}
                          </button>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block mb-0.5 text-[11px]">Input:</span>
                          <pre className="bg-white p-2 rounded-lg text-slate-800 font-mono border border-slate-200/60 whitespace-pre-wrap">
                            {ex.input || '(empty)'}
                          </pre>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block mb-0.5 text-[11px]">Output:</span>
                          <pre className="bg-white p-2 rounded-lg text-emerald-700 font-mono border border-slate-200/60 whitespace-pre-wrap font-bold">
                            {ex.output}
                          </pre>
                        </div>
                        {ex.explanation && (
                          <div className="text-slate-600 text-xs italic bg-white p-2 rounded-lg border border-slate-200/40">
                            <strong>Explanation:</strong> {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Hints Tab */}
            {activeLeftTab === 'hints' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Stuck? Reveal hints sequentially without spoiling the full solution.</span>
                </div>
                {problem.hints && problem.hints.length > 0 ? (
                  problem.hints.map((hint, idx) => {
                    const isRevealed = revealedHints.has(idx);
                    return (
                      <div
                        key={idx}
                        className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs transition-all"
                      >
                        <button
                          onClick={() => toggleHint(idx)}
                          className="w-full p-3 text-left font-bold text-xs text-slate-800 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Hint {idx + 1}
                          </span>
                          {isRevealed ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                        {isRevealed && (
                          <div className="p-3 border-t border-slate-100 text-xs text-slate-700 bg-slate-50 leading-relaxed font-medium">
                            {hint}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">No hints available for this problem.</p>
                )}
              </div>
            )}

            {/* Submissions Tab */}
            {activeLeftTab === 'submissions' && (
              <div className="space-y-3">
                {submissions.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600">No practice submissions recorded yet.</p>
                    <p className="mt-1 text-slate-400">Submit your solution to track your progress history!</p>
                  </div>
                ) : (
                  submissions.map((sub) => {
                    const isAcc = sub.status === 'Accepted';
                    return (
                      <div
                        key={sub.id}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center gap-1 font-bold ${
                              isAcc ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {isAcc ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {sub.status}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {new Date(sub.submittedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 text-[11px] font-medium">
                          <span>Passed: <strong>{sub.passedTests}/{sub.totalTests}</strong> tests</span>
                          <span>Runtime: <strong>{sub.runtimeMs}ms</strong></span>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm('Load this submitted code into the editor?')) {
                              setCode(sub.code);
                            }
                          }}
                          className="w-full mt-1 py-1.5 text-center text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Load Code to Editor
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Official Solution Tab */}
            {activeLeftTab === 'solution' && (
              <div className="space-y-4">
                {!isSolutionUnlocked ? (
                  <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3">
                    <Lock className="w-10 h-10 text-slate-400 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-900">Official Solution Locked</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Solve the problem with all tests passing to unlock the reference solution, or reveal it directly if you need guidance.
                    </p>
                    <button
                      onClick={() => setIsSolutionUnlocked(true)}
                      className="px-4 py-2 bg-[#FF5A36] hover:bg-[#e04826] text-white text-xs font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5" /> Reveal Official Solution
                    </button>
                  </div>
                ) : problem.solution ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 font-bold flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Official Reference Solution Unlocked</span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Approach</h4>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {problem.solution.approach}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">Time Complexity:</span>
                        <span className="font-mono font-bold text-slate-800">{problem.solution.timeComplexity}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">Space Complexity:</span>
                        <span className="font-mono font-bold text-slate-800">{problem.solution.spaceComplexity}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Python Reference Code
                      </h4>
                      <pre className="bg-slate-900 text-emerald-300 rounded-xl p-4 text-xs font-mono overflow-x-auto whitespace-pre border border-slate-800 shadow-xs">
                        {problem.solution.code}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No official solution authored yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Code Editor + Execution Console */}
        <div className="lg:col-span-7 flex flex-col gap-4 min-h-0">
          {/* Code Editor Container */}
          <div className="flex-1 flex flex-col bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs min-h-[340px]">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#FF5A36]" />
                <span className="font-bold text-slate-900">Python 3 (Pyodide WebAssembly)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetCode}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reset to starter template"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>

            {/* Code Textarea / Clean Dark Python Sandbox */}
            <div className="flex-1 relative bg-slate-950 p-2 overflow-hidden">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-slate-950 text-slate-100 font-mono text-sm p-3 outline-none resize-none leading-relaxed selection:bg-orange-500/30 selection:text-white"
                placeholder="Write your Python code here..."
              />
            </div>

            {/* Editor Actions Bottom Bar */}
            <div className="flex items-center justify-between bg-slate-50 border-t border-slate-200 p-3 px-4">
              <span className="text-[11px] text-slate-400 hidden sm:inline font-medium">
                Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono">Ctrl+Enter</kbd> to Run,{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono">Ctrl+Shift+Enter</kbd> to Submit
              </span>

              <div className="flex items-center gap-2 ml-auto">
                {/* Run Code Button */}
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-50 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-slate-700'}`} />
                  <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                </button>

                {/* Submit Code Button - Kriora Orange */}
                <button
                  onClick={handleSubmitCode}
                  disabled={isRunning || isSubmitting}
                  className="px-5 py-2 bg-[#FF5A36] hover:bg-[#e04826] disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20 cursor-pointer active:scale-95"
                >
                  <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                  <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Execution Console Container */}
          <div className="h-60 flex flex-col bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            {/* Console Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveConsoleTab('testcases')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    activeConsoleTab === 'testcases'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Public Tests
                </button>
                <button
                  onClick={() => setActiveConsoleTab('results')}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeConsoleTab === 'results'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-[#FF5A36]" /> Results
                  {executionResult?.status && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        executionResult.status === 'Accepted' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveConsoleTab('custom_input')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    activeConsoleTab === 'custom_input'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Custom Input
                </button>
              </div>

              {executionResult && (
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#FF5A36]" /> {executionResult.runtimeMs}ms
                  </span>
                </div>
              )}
            </div>

            {/* Console Content Body */}
            <div className="flex-1 p-3.5 overflow-y-auto text-xs font-mono bg-white">
              {/* Public Test Cases Tab */}
              {activeConsoleTab === 'testcases' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    {problem.publicTestCases.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTestCaseIndex(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          selectedTestCaseIndex === idx
                            ? 'bg-[#FF5A36] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {problem.publicTestCases[selectedTestCaseIndex] && (
                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-500 font-sans font-bold block mb-1 text-[11px]">Input:</span>
                        <pre className="bg-slate-50 p-2.5 rounded-xl text-slate-900 border border-slate-200 whitespace-pre-wrap">
                          {problem.publicTestCases[selectedTestCaseIndex].input || '(empty)'}
                        </pre>
                      </div>
                      <div>
                        <span className="text-slate-500 font-sans font-bold block mb-1 text-[11px]">Expected Output:</span>
                        <pre className="bg-slate-50 p-2.5 rounded-xl text-emerald-700 font-bold border border-slate-200 whitespace-pre-wrap">
                          {problem.publicTestCases[selectedTestCaseIndex].expectedOutput}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Execution Results Tab */}
              {activeConsoleTab === 'results' && (
                <div>
                  {!executionResult ? (
                    <div className="text-center py-8 text-slate-400 font-sans">
                      <Play className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-[#FF5A36]" />
                      <p className="font-medium">Run or Submit code to view test execution results.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Overall Status Banner */}
                      <div
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          executionResult.status === 'Accepted'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {executionResult.status === 'Accepted' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          )}
                          <span className="font-bold text-sm font-sans">{executionResult.status}</span>
                          <span className="text-xs font-sans font-medium">
                            ({executionResult.passedTests}/{executionResult.totalTests} tests passed)
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/60">
                          {executionResult.isPublicRun ? 'Public Test Run' : 'Full Evaluation Run'}
                        </span>
                      </div>

                      {/* Custom Input Output if any */}
                      {executionResult.customOutput !== undefined && (
                        <div>
                          <span className="text-slate-500 font-sans font-bold block mb-1">Standard Output:</span>
                          <pre className="bg-slate-50 p-2.5 rounded-xl text-slate-900 border border-slate-200 whitespace-pre-wrap">
                            {executionResult.customOutput || '(empty output)'}
                          </pre>
                        </div>
                      )}

                      {/* Error message if any */}
                      {executionResult.customError && (
                        <div>
                          <span className="text-rose-600 font-sans font-bold block mb-1">Runtime Error:</span>
                          <pre className="bg-rose-50 p-2.5 rounded-xl text-rose-800 border border-rose-200 whitespace-pre-wrap font-medium">
                            {executionResult.customError}
                          </pre>
                        </div>
                      )}

                      {/* Per-test case breakdown */}
                      {executionResult.testResults.length > 0 && (
                        <div className="space-y-2">
                          {executionResult.testResults.map((tr, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl border text-xs ${
                                tr.passed
                                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                                  : 'bg-rose-50/50 border-rose-200 text-slate-900'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5 font-sans">
                                <span className="font-bold flex items-center gap-1.5">
                                  {tr.passed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  )}
                                  Test Case {idx + 1}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">{tr.runtimeMs}ms</span>
                              </div>

                              {!tr.passed && (
                                <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
                                  <div>
                                    <span className="text-slate-500 font-sans font-bold block mb-0.5">Expected:</span>
                                    <pre className="bg-white p-2 rounded-lg text-emerald-700 border border-emerald-200 whitespace-pre-wrap font-bold">
                                      {tr.expectedOutput}
                                    </pre>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 font-sans font-bold block mb-0.5">Your Output:</span>
                                    <pre className="bg-white p-2 rounded-lg text-rose-700 border border-rose-200 whitespace-pre-wrap font-bold">
                                      {tr.actualOutput || '(no output)'}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Custom Input Tab */}
              {activeConsoleTab === 'custom_input' && (
                <div className="space-y-2">
                  <span className="text-slate-600 font-sans text-xs font-medium">
                    Provide custom stdin to test arbitrary edge-cases:
                  </span>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter custom input lines here..."
                    className="w-full h-36 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl p-3 text-xs font-mono outline-none focus:border-[#FF5A36] focus:ring-1 focus:ring-[#FF5A36] resize-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
