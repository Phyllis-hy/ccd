// src/components/SummarySection.tsx
"use client";

import { useEffect, useState } from "react";
import { getSummary } from "@/src/lib/api/summaryApi";
import type { StageSummary } from "@/src/types/summary";
import type { Stage } from "@/src/types/common";
import VersionDropdown from "./VersionDropdown";

interface SummarySectionProps {
  stage: Stage;
  onConfirm?: () => void;   // Click Confirm
  onClose?: () => void;     // Click X button
}

export default function SummarySection({
  stage,
  onConfirm,
  onClose,
}: SummarySectionProps) {
  const [data, setData] = useState<StageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const result = await getSummary("mock-project-id", stage, "current-user");
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [stage]);

  return (
    <div className="h-full flex flex-col rounded-2xl bg-white/80 border border-slate-200">
      {/* ✅ Header / Toolbar */}
      <div className="shrink-0 px-4 py-3 border-b flex items-center justify-between">
        {/* Left side title */}
        <h3 className="text-sm font-semibold text-slate-800">
          Summary
        </h3>

        {/* Right side button area: Confirm / Share / Version / X horizontally arranged */}
        <div className="flex items-center gap-2">
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-full bg-slate-100 text-xs text-slate-600 hover:bg-slate-200 transition"
          >
            Confirm
          </button>

          <button
            className="px-3 py-1.5 rounded-full bg-slate-100 text-xs text-slate-600 hover:bg-slate-200 transition"
          >
            Share
          </button>

          <VersionDropdown />

          {onClose && (
            <button
              onClick={onClose}
              className="ml-1 text-gray-400 hover:text-gray-700 transition"
              aria-label="Close summary"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ✅ Content area (scrollable) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
        {loading && (
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-3 w-full bg-slate-200 rounded" />
            <div className="h-3 w-5/6 bg-slate-200 rounded" />
          </div>
        )}

        {!loading && data && (
          <>
            <p className="text-xs leading-relaxed text-slate-700">
              {data.summary && data.summary.length > 0
                ? data.summary[0].summaryText
                : "No summary available"}
            </p>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                  History
                </span>
                <span className="text-[10px] text-slate-400">
                  {data.summary.length > 0 ? "mock data · API placeholder" : ""}
                </span>
              </div>

              {data.summary.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-700"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-800">
                      {item.stage}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="line-clamp-2">{item.summaryText}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
