import React from 'react';

interface ActivityRecord {
  date: string;
  count: number;
}

interface PracticeHeatmapProps {
  activity: ActivityRecord[];
}

export const PracticeHeatmap: React.FC<PracticeHeatmapProps> = ({ activity }) => {
  const activityMap = new Map<string, number>(activity.map((a) => [a.date, a.count]));

  // Generate last 16 weeks of dates (112 days)
  const days: { dateStr: string; dayOfWeek: number; count: number; label: string }[] = [];
  const today = new Date();
  
  for (let i = 111; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    const count = activityMap.get(dateStr) || 0;
    days.push({
      dateStr,
      dayOfWeek: d.getDay(),
      count,
      label: `${count} submissions on ${d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`,
    });
  }

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-slate-100 hover:bg-slate-200 border border-slate-200/60';
    if (count === 1) return 'bg-orange-100 border border-orange-200 text-orange-700';
    if (count <= 3) return 'bg-orange-300 border border-orange-400 text-orange-950';
    if (count <= 6) return 'bg-orange-500 border border-orange-600 text-white';
    return 'bg-[#FF5A36] border border-orange-600 text-white font-bold shadow-xs';
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 mb-6 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Coding Activity Matrix (Last 16 Weeks)
        </h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span>Less</span>
          <span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200/60" />
          <span className="w-3 h-3 rounded-sm bg-orange-100 border border-orange-200" />
          <span className="w-3 h-3 rounded-sm bg-orange-300 border border-orange-400" />
          <span className="w-3 h-3 rounded-sm bg-orange-500 border border-orange-600" />
          <span className="w-3 h-3 rounded-sm bg-[#FF5A36]" />
          <span>More</span>
        </div>
      </div>

      {/* Grid of days */}
      <div className="overflow-x-auto pb-1">
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 w-max py-1">
          {days.map((day) => (
            <div
              key={day.dateStr}
              title={day.label}
              className={`w-3.5 h-3.5 rounded-sm transition-transform duration-100 hover:scale-125 cursor-pointer ${getColorClass(
                day.count
              )}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
