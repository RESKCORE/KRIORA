import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Circle,
  Bookmark,
  ChevronRight,
  Filter,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import type { PracticeProblem, ProblemDifficulty, ProblemStatus } from '../../lib/practice/types';
import { PRACTICE_TOPICS } from '../../lib/practice/catalog';

interface PracticeProblemListProps {
  problems: PracticeProblem[];
  progressMap: Record<string, { status: ProblemStatus; bookmarked?: boolean; attemptsCount?: number }>;
  bookmarkedIds: Set<string>;
  onSelectProblem: (problemId: string) => void;
  onToggleBookmark: (problemId: string, e: React.MouseEvent) => void;
  onNavigateToCurriculumDay?: (dayNumber: number) => void;
}

export const PracticeProblemList: React.FC<PracticeProblemListProps> = ({
  problems,
  progressMap,
  bookmarkedIds,
  onSelectProblem,
  onToggleBookmark,
  onNavigateToCurriculumDay,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchNum = p.problemNumber.toString().includes(q);
        const matchTopic = p.topic.toLowerCase().includes(q);
        const matchCurriculum = p.relatedCurriculumTopic?.toLowerCase().includes(q);
        if (!matchTitle && !matchNum && !matchTopic && !matchCurriculum) return false;
      }

      // Topic
      if (selectedTopic !== 'All' && p.topic !== selectedTopic) {
        return false;
      }

      // Difficulty
      if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) {
        return false;
      }

      // Status
      const userProgress = progressMap[p.id];
      const status = userProgress?.status || 'Not Attempted';
      const isBookmarked = bookmarkedIds.has(p.id) || !!userProgress?.bookmarked;

      if (selectedStatus === 'Solved' && status !== 'Solved') return false;
      if (selectedStatus === 'Attempted' && status !== 'Attempted') return false;
      if (selectedStatus === 'Not Attempted' && status !== 'Not Attempted') return false;
      if (selectedStatus === 'Bookmarked' && !isBookmarked) return false;

      return true;
    });
  }, [problems, searchQuery, selectedTopic, selectedDifficulty, selectedStatus, progressMap, bookmarkedIds]);

  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage) || 1;
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProblems.slice(start, start + itemsPerPage);
  }, [filteredProblems, currentPage, itemsPerPage]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTopic('All');
    setSelectedDifficulty('All');
    setSelectedStatus('All');
    setCurrentPage(1);
  };

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

  const getStatusIcon = (problemId: string) => {
    const prog = progressMap[problemId];
    const status = prog?.status || 'Not Attempted';

    if (status === 'Solved') {
      return (
        <span title="Solved" className="text-emerald-500 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </span>
      );
    }
    if (status === 'Attempted') {
      return (
        <span title="Attempted" className="text-amber-500 flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </span>
      );
    }
    return (
      <span title="Not Attempted" className="text-slate-300 flex items-center justify-center">
        <Circle className="w-4 h-4" />
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, number, or keyword..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF5A36] focus:ring-1 focus:ring-[#FF5A36] transition-all font-medium"
            />
          </div>

          {/* Filter Pills / Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF5A36]"
            >
              <option value="All">All Status</option>
              <option value="Solved">Solved</option>
              <option value="Attempted">Attempted</option>
              <option value="Not Attempted">Unsolved</option>
              <option value="Bookmarked">★ Bookmarked</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF5A36]"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Reset Button */}
            {(searchQuery || selectedTopic !== 'All' || selectedDifficulty !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Topic Pills Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-slate-400 text-xs font-bold mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Topics:
          </span>
          {PRACTICE_TOPICS.map((topic) => {
            const isSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(topic);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF5A36] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/70 font-semibold">
          <span>
            Showing <strong className="text-slate-900 font-bold">{filteredProblems.length}</strong> problems
          </span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>

        {filteredProblems.length === 0 ? (
          <div className="py-16 text-center">
            <Sparkles className="w-10 h-10 text-orange-400 mx-auto mb-3 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900">No practice problems match your filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try resetting your search query or topic filter to explore more problems from the catalog.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-[#FF5A36] hover:bg-[#e04826] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedProblems.map((problem) => {
              const isBookmarked = bookmarkedIds.has(problem.id) || !!progressMap[problem.id]?.bookmarked;
              const isSolved = progressMap[problem.id]?.status === 'Solved';

              return (
                <div
                  key={problem.id}
                  onClick={() => onSelectProblem(problem.id)}
                  className="p-4 flex items-center justify-between hover:bg-orange-50/40 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0">{getStatusIcon(problem.id)}</div>

                    {/* Problem Number */}
                    <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-[#FF5A36] transition-colors w-8">
                      #{problem.problemNumber}
                    </span>

                    {/* Title and Curriculum Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-bold transition-colors truncate ${
                            isSolved ? 'text-slate-600' : 'text-slate-900 group-hover:text-[#FF5A36]'
                          }`}
                        >
                          {problem.title}
                        </h4>
                        {problem.relatedCurriculumTopic && (
                          <span
                            onClick={(e) => {
                              if (problem.relatedDay && onNavigateToCurriculumDay) {
                                e.stopPropagation();
                                onNavigateToCurriculumDay(problem.relatedDay);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200/60 hover:bg-orange-100 transition-colors"
                            title={problem.relatedDay ? `Navigate to Day ${problem.relatedDay} in Syllabus` : undefined}
                          >
                            <BookOpen className="w-3 h-3 text-[#FF5A36]" />
                            {problem.relatedDay ? `Day ${problem.relatedDay}: ` : ''}
                            {problem.relatedCurriculumTopic}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <span className="text-slate-600">{problem.topic}</span>
                        {problem.topics && problem.topics.length > 1 && (
                          <span className="text-slate-400">• {problem.topics.slice(1).join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Difficulty & Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div>{getDifficultyBadge(problem.difficulty)}</div>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={(e) => onToggleBookmark(problem.id, e)}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Problem'}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'text-amber-500 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                    </button>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF5A36] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/70 font-semibold">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 rounded-lg font-bold transition-colors cursor-pointer"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-[#FF5A36] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 rounded-lg font-bold transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
