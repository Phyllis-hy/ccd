// src/components/profile/ProfileStats.tsx
"use client";

type ProfileStatsProps = {
  totalProjects: number;
  archivedProjects: number;
};

export default function ProfileStats({ totalProjects, archivedProjects }: ProfileStatsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="flex items-center justify-between rounded-2xl px-5 py-3 border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs text-slate-400">Projects</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {totalProjects}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold bg-sky-500/10 text-sky-600">
            •
          </span>
          <span className="text-xs font-medium text-slate-700">Total</span>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-2xl px-5 py-3 border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs text-slate-400">Archive</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {archivedProjects}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold bg-slate-100 text-slate-600">
            •
          </span>
          <span className="text-xs font-medium text-slate-700">Stored</span>
        </div>
      </div>
    </section>
  );
}
