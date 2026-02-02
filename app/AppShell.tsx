"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import PrimaryNav from "../src/components/PrimaryNav";
import Sidebar from "../src/components/Sidebar";
import { ProjectsProvider } from "../src/context/ProjectsContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  // ✅ 只在 stage（chatbox 工作区）显示 Sidebar
  const showWorkspaceSidebar = pathname.startsWith("/stage");
  const isProfile = pathname.startsWith("/profile");

  return (
    <ProjectsProvider>
      <div className="print-shell relative flex h-full overflow-hidden">
        {/* 左侧主导航：你如果也想 profile 隐藏，我也可以再加条件 */}
        <PrimaryNav />

        {/* ✅ 仅在 /stage 显示中间侧边栏 */}
        {showWorkspaceSidebar && (
          <Sidebar open={open} onToggle={() => setOpen((prev) => !prev)} />
        )}

        {/* ✅ 仅在 /stage 显示 toggle（收起状态时显示） */}
        {showWorkspaceSidebar && !open && (
          <button
            onClick={() => setOpen(true)}
            className={`
              print-hide
              absolute top-8 left-[82px] z-30
              h-9 w-9 -translate-x-1/2
              rounded-full border border-slate-700/60
              bg-slate-800/90 text-white shadow-lg
              transition-all duration-300 hover:bg-slate-700
            `}
            aria-label="Expand sidebar"
          >
            →
          </button>
        )}

        {/* 主内容区：/profile 现在会自然变宽 */}
        <main className={`print-main flex-1 min-h-0 overflow-hidden ${isProfile ? "p-0" : "p-6"}`}>
          <div
            className={`print-panel h-full w-full ${
              isProfile
                ? "bg-transparent border-0 shadow-none rounded-none"
                : "rounded-2xl bg-white/20 backdrop-blur-md border border-white/10"
            }`}
          >
            {children}
          </div>
        </main>
      </div>
    </ProjectsProvider>
  );
}
