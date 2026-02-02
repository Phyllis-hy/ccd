"use client";

import ProjectSidebar from "./ProjectSidebar";

export default function Sidebar({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={`
        print-hide
        relative bg-gradient-to-b from-sky-50/70 via-blue-50/60 to-white/70 text-slate-700 transition-all duration-300 backdrop-blur
        [background-image:radial-gradient(180px_120px_at_30%_0%,rgba(186,230,253,0.45),transparent_65%),linear-gradient(to_bottom,rgba(240,249,255,0.7),rgba(239,246,255,0.6),rgba(255,255,255,0.7))]
        ${open ? "w-60 p-4" : "w-0 p-0 overflow-hidden"}
        max-h-screen overflow-y-auto border-r border-slate-200/70
      `}
    >
      {open && <ProjectSidebar onToggle={onToggle} />}
    </aside>
  );
}
