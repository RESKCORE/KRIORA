import React from 'react';
import { Award, Flame, CheckCircle2, Target, Bookmark } from 'lucide-react';
import type { PracticeStats } from '../../lib/practice/types';

interface PracticeStatsProps {
  stats: PracticeStats;
  totalCatalogCount: number;
  easyTotal: number;
  mediumTotal: number;
  hardTotal: number;
  bookmarkedCount: number;
}

export const PracticeStatsCard: React.FC<PracticeStatsProps> = ({
  stats,
  totalCatalogCount,
  easyTotal,
  mediumTotal,
  hardTotal,
  bookmarkedCount,
}) => {
  const percentSolved =
    totalCatalogCount > 0 ? Math.round((stats.totalSolved / totalCatalogCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Solved Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Solved</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{stats.totalSolved}</span>
              <span className="text-xs font-semibold text-slate-400">/ {totalCatalogCount}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5A36] shadow-2xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-600 font-medium mb-1.5">
            <span>Overall Progress</span>
            <span className="font-bold text-[#FF5A36]">{percentSolved}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#FF5A36] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(percentSolved, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Difficulty Breakdown</p>
          <Award className="w-4 h-4 text-[#FF5A36]" />
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Easy
            </span>
            <span className="font-bold text-slate-800">
              {stats.easySolved} <span className="text-slate-400 font-normal">/ {easyTotal}</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Medium
            </span>
            <span className="font-bold text-slate-800">
              {stats.mediumSolved} <span className="text-slate-400 font-normal">/ {mediumTotal}</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Hard
            </span>
            <span className="font-bold text-slate-800">
              {stats.hardSolved} <span className="text-slate-400 font-normal">/ {hardTotal}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Practice Streak Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Practice Streak</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-[#FF5A36]">{stats.currentStreak}</span>
              <span className="text-xs font-bold text-slate-500">days</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF5A36] shadow-2xs">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4 flex items-center gap-1 font-medium">
          {stats.currentStreak > 0 ? '🔥 Keep the momentum going!' : 'Solve a problem today to start a streak!'}
        </p>
      </div>

      {/* Accuracy & Bookmarks Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Accuracy & Saved</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{stats.successRate}%</span>
              <span className="text-xs font-semibold text-slate-400">pass rate</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
            <Target className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 text-xs font-medium text-slate-500">
          <span>Total attempts: <strong className="text-slate-900 font-bold">{stats.totalAttempts}</strong></span>
          <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-bold">
            <Bookmark className="w-3.5 h-3.5 fill-amber-500/30" /> {bookmarkedCount} saved
          </span>
        </div>
      </div>
    </div>
  );
};
