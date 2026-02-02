"use client";

import { useState } from "react";

const versions = [
  { id: "v3", label: "Version 3" },
  { id: "v2", label: "Version 2" },
  { id: "v1", label: "Version 1" },
];

export default function VersionDropdown() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(versions[0]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1.5 rounded-full bg-slate-100 text-xs text-slate-700 hover:bg-slate-200 transition flex items-center gap-1"
      >
        {current.label}
        <span className="text-[10px]">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white border shadow-lg overflow-hidden z-50">
          {versions.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setCurrent(v);
                setOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-xs hover:bg-slate-50"
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
