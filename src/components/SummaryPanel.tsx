// src/components/SummaryPanel.tsx
"use client";

import VersionDropdown from "./VersionDropdown";

type HistoryItem = {
  id: number;
  title: string;
  time: string;
  preview: string;
};

const history: HistoryItem[] = [
  {
    id: 1,
    title: "Previous summary #1",
    time: "13:28",
    preview:
      "这是第一条历史总结的占位内容，未来可以展示用户之前保存过的总结版本。",
  },
  {
    id: 2,
    title: "Previous summary #2",
    time: "12:48",
    preview: "这是第二条历史总结的占位内容，用于展示更早阶段的总结记录。",
  },
];

type SummaryPanelProps = {
  onClose?: () => void;
};

export default function SummaryPanel({ onClose }: SummaryPanelProps) {
  return (
    <div className="flex h-full flex-col text-sm text-gray-800">
      {/* Top toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Summary</h2>

        <div className="flex items-center gap-2">
          <button className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">
            Confirm
          </button>

          <button className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">
            Share
          </button>

          <VersionDropdown />

          {/* Close button */}
          <button
            type="button"
            aria-label="Close summary"
            onClick={onClose}
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Top divider line */}
      <div className="mt-2 mb-4 h-px w-full bg-gray-200" />

      {/* Current summary */}
      <div className="mb-4">
        <p className="text-xs leading-relaxed text-gray-700">
          这是项目「mock-project-id」在阶段 0 的 mock 总结。这里将展示由 AI
          生成的当前阶段概要内容，用于帮助用户快速回顾本阶段的关键信息。
        </p>
      </div>

      {/* History title row */}
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold">History</span>
        <span className="text-[11px] text-gray-400">
          mock data · API placeholder
        </span>
      </div>

      {/* History list */}
      <div className="mb-2 space-y-2">
        {history.map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-sky-50/70 px-3 py-2 text-xs"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-medium text-gray-800">{item.title}</span>
              <span className="text-[11px] text-gray-400">{item.time}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-600">
              {item.preview}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
