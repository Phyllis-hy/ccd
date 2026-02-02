// src/components/SummarySection.tsx
"use client";

import { useEffect, useState } from "react";
import { getSummary, type SummaryResponse } from "@/src/lib/api/summaryApi";
import VersionDropdown from "./VersionDropdown";

interface SummarySectionProps {
  stage: number;
  onConfirm?: () => void;   // 点击 Confirm
  onClose?: () => void;     // 点击右上角 X
}

export default function SummarySection({
  stage,
  onConfirm,
  onClose,
}: SummarySectionProps) {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const result = await getSummary("mock-project-id", stage);
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
        {/* 左侧标题 */}
        <h3 className="text-sm font-semibold text-slate-800">
          Summary
        </h3>

        {/* 右侧按钮区：Confirm / Share / Version / X 平行排列 */}
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

      {/* ✅ 内容区（滚动） */}
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
              {data.currentSummary}
            </p>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                  History
                </span>
                <span className="text-[10px] text-slate-400">
                  mock data · API placeholder
                </span>
              </div>

              {data.history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-700"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-800">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="line-clamp-2">{item.content}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
