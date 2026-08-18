import React, { useState, useMemo, useEffect, ErrorInfo, ReactNode } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { PracticeStatsCard } from './PracticeStats';
import { PracticeHeatmap } from './PracticeHeatmap';
import { PracticeProblemList } from './PracticeProblemList';
import { PracticeProblemDetail } from './PracticeProblemDetail';
import { PRACTICE_PROBLEMS_CATALOG, PROBLEMS_BY_ID } from '../../lib/practice/catalog';
import type { PracticeProblem, ProblemStatus, PracticeSubmission } from '../../lib/practice/types';
import { RefreshCw, Code, Sparkles } from 'lucide-react';

interface PracticeArenaProps {
  studentEmail?: string;
  initialProblemId?: string | null;
  initialTopic?: string | null;
  onNavigateToCurriculumDay?: (dayNumber: number) => void;
  onClearInitialProblem?: () => void;
}

interface PracticeErrorBoundaryProps {
  children: ReactNode;
}

interface PracticeErrorBoundaryState {
  hasError: boolean;
}

export class PracticeErrorBoundary extends React.Component<PracticeErrorBoundaryProps, PracticeErrorBoundaryState> {
  public declare props: PracticeErrorBoundaryProps;
  public declare state: PracticeErrorBoundaryState;

  constructor(props: PracticeErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Practice Arena recovered from transient query error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-4 max-w-lg mx-auto my-8 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF5A36] flex items-center justify-center mx-auto">
            <Code className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Practice Arena Connecting</h3>
          <p className="text-xs text-slate-500">
            Synchronizing practice problems with backend. Click below to refresh your practice session.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#FF5A36] hover:bg-[#e04826] text-white font-bold text-xs rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Practice Arena</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const PracticeArenaInner: React.FC<PracticeArenaProps> = ({
  studentEmail,
  initialProblemId,
  initialTopic,
  onNavigateToCurriculumDay,
  onClearInitialProblem,
}) => {
  // Query Convex for problems or fallback to local catalog
  const convexProblems = useQuery(api.lms.getPracticeProblems, {
    actorEmail: studentEmail,
  });

  // Query student practice context (progress, submissions, streak, stats)
  const studentContext = useQuery(api.lms.getStudentPracticeContext, {
    actorEmail: studentEmail,
  });

  // Mutations
  const recordSubmissionMutation = useMutation(api.lms.recordPracticeSubmission);
  const toggleBookmarkMutation = useMutation(api.lms.toggleBookmarkProblem);

  // Active selected problem ID
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(initialProblemId || null);

  // Sync initialProblemId prop when updated externally (e.g., from Syllabus "Practice this topic")
  useEffect(() => {
    if (initialProblemId) {
      setSelectedProblemId(initialProblemId);
    }
  }, [initialProblemId]);

  // Combine database problems with local fallback catalog
  // Convex returns lightweight metadata; catalog provides full content
  const allProblems: PracticeProblem[] = useMemo(() => {
    if (convexProblems && convexProblems.length > 0) {
      // Merge Convex metadata (server-side truth) with local catalog (full content)
      return PRACTICE_PROBLEMS_CATALOG.map((local) => {
        const serverMatch = convexProblems.find((sp: any) => sp.id === local.id);
        if (serverMatch) {
          return { ...local, isPublished: serverMatch.isPublished, hasSolution: serverMatch.hasSolution };
        }
        return local;
      });
    }
    return PRACTICE_PROBLEMS_CATALOG;
  }, [convexProblems]);

  // Map of problems by ID
  const problemMap = useMemo(() => {
    const map = new Map<string, PracticeProblem>();
    allProblems.forEach((p) => map.set(p.id, p));
    return map;
  }, [allProblems]);

  // Progress Map
  const progressMap = useMemo(() => {
    return (studentContext?.progressMap || {}) as Record<
      string,
      { status: ProblemStatus; bookmarked?: boolean; attemptsCount?: number }
    >;
  }, [studentContext?.progressMap]);

  // Bookmarks Set
  const bookmarkedIds = useMemo(() => {
    return new Set<string>(studentContext?.bookmarkedIds || []);
  }, [studentContext?.bookmarkedIds]);

  // Active problem object
  const activeProblem = selectedProblemId
    ? problemMap.get(selectedProblemId) || PROBLEMS_BY_ID.get(selectedProblemId) || null
    : null;

  // Submissions for active problem
  const activeProblemSubmissions = useQuery(
    api.lms.getPracticeSubmissions,
    selectedProblemId
      ? {
          problemId: selectedProblemId,
          actorEmail: studentEmail,
        }
      : 'skip'
  ) as PracticeSubmission[] | undefined;

  // Stats calculation
  const totalCatalogCount = allProblems.length;
  const easyTotal = allProblems.filter((p) => p.difficulty === 'Easy').length;
  const mediumTotal = allProblems.filter((p) => p.difficulty === 'Medium').length;
  const hardTotal = allProblems.filter((p) => p.difficulty === 'Hard').length;

  const currentStats = studentContext?.stats || {
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    totalAttempts: 0,
    successRate: 0,
    currentStreak: 0,
  };

  // Handlers
  const handleSelectProblem = (problemId: string) => {
    setSelectedProblemId(problemId);
  };

  const handleBackToList = () => {
    setSelectedProblemId(null);
    if (onClearInitialProblem) {
      onClearInitialProblem();
    }
  };

  const handleToggleBookmark = async (problemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await toggleBookmarkMutation({
        problemId,
        actorEmail: studentEmail,
      });
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleRecordSubmission = async (sub: {
    problemId: string;
    status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded';
    code: string;
    passedTests: number;
    totalTests: number;
    runtimeMs: number;
    submissionRequestId?: string;
  }) => {
    try {
      return await recordSubmissionMutation({
        actorEmail: studentEmail,
        ...sub,
      });
    } catch (err) {
      console.error('Failed to record submission:', err);
      return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 md:px-4 py-4 space-y-6">
      {/* If problem detail is selected, render two-panel workspace */}
      {activeProblem ? (
        <PracticeProblemDetail
          problem={activeProblem}
          isBookmarked={bookmarkedIds.has(activeProblem.id) || !!progressMap[activeProblem.id]?.bookmarked}
          onBack={handleBackToList}
          onToggleBookmark={(id) => handleToggleBookmark(id)}
          onRecordSubmission={handleRecordSubmission}
          submissions={activeProblemSubmissions || []}
          isSolved={progressMap[activeProblem.id]?.status === 'Solved'}
          onNavigateToCurriculumDay={onNavigateToCurriculumDay}
        />
      ) : (
        /* Otherwise, render Practice Overview & Problem Catalog List */
        <div className="space-y-6">
          {/* Header Banner - Clean White Card with Kriora Brand Orange */}
          <div className="bg-gradient-to-br from-orange-50/90 via-white to-amber-50/40 border border-orange-200/80 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#FF5A36] bg-orange-100/80 border border-orange-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Python Practice Arena</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                  Algorithmic Practice Arena
                </h1>
                <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Master Python with 102 curriculum-aligned coding challenges. Write code, test against public and hidden suites with real-time WebAssembly Python execution, and build continuous streaks.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <PracticeStatsCard
            stats={currentStats}
            totalCatalogCount={totalCatalogCount}
            easyTotal={easyTotal}
            mediumTotal={mediumTotal}
            hardTotal={hardTotal}
            bookmarkedCount={bookmarkedIds.size}
          />

          {/* Activity Heatmap */}
          <PracticeHeatmap activity={studentContext?.activityHistory || []} />

          {/* Problem Catalog List */}
          <PracticeProblemList
            problems={allProblems}
            progressMap={progressMap}
            bookmarkedIds={bookmarkedIds}
            onSelectProblem={handleSelectProblem}
            onToggleBookmark={handleToggleBookmark}
            onNavigateToCurriculumDay={onNavigateToCurriculumDay}
          />
        </div>
      )}
    </div>
  );
};

export const PracticeArena: React.FC<PracticeArenaProps> = (props) => {
  return (
    <PracticeErrorBoundary>
      <PracticeArenaInner {...props} />
    </PracticeErrorBoundary>
  );
};
