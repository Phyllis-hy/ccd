// src/components/ProjectSidebar.tsx
"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useProjects } from "@/src/context/ProjectsContext";
import { useAuth } from "@/src/context/AuthContext";
import type { ProjectInfo } from "@/src/types/projectinfo";
import { createProject, getProjects } from "@/src/lib/api/project";

export default function ProjectSidebar({ onToggle }: { onToggle: () => void }) {
    const { projects, setProjects, currentProjectId, setCurrentProjectId, current_user } =
        useProjects();
    const { user } = useAuth();
    const router = useRouter();

    const [showModal, setShowModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");

    const handleCreateProject = async () => {
        const name = newProjectName.trim();
        if (!name) return;
   
            // 1) 创建（只调用一次）
            const created = await createProject(name, current_user);

            // 2) 刷新列表
            const list = await getProjects();
            setProjects(list);

            // 3) 选中新建项目（用 created）
            setCurrentProjectId(created.id);
            setNewProjectName("");
            setShowModal(false);
    };

    return (
        <>
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-2 shadow-sm backdrop-blur">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                        {user?.name || user?.email || "User"}
                    </p>
                    <p className="text-[11px] text-slate-400">Workspace</p>
                </div>
                <button
                    type="button"
                    onClick={onToggle}
                    className="ml-auto h-8 w-8 rounded-full border border-slate-200/70 bg-white text-slate-600 shadow hover:bg-slate-100"
                    aria-label="Collapse sidebar"
                >
                    ←
                </button>
            </div>
            {/* New Project button */}
            <button
                className="w-full rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:brightness-110"
                onClick={() => setShowModal(true)}
            >
                New Project
            </button>

            {/* 项目卡片列表 */}
            <div className="mt-5 space-y-4">
                {projects.map((project) => {
                    const isSelected = currentProjectId === project.id;

                    return (
                        <button
                            key={project.id}
                            type="button"
                            onClick={() => {
                                setCurrentProjectId(project.id);
                                router.push("/stage");
                            }}
                            className={[
                                "rounded-2xl shadow-sm overflow-hidden border border-slate-200/70 bg-gradient-to-b from-white/80 to-sky-50/60 hover:border-sky-300 transition cursor-pointer backdrop-blur",
                                "hover:shadow-sky-200/40",
                                // ✅ 让 button 不继承默认样式
                                "text-left w-full",
                                // ✅ 可选：选中态高亮（不想要可删）
                                isSelected ? "border-sky-400 ring-2 ring-sky-300/40" : "",
                            ].join(" ")}
                        >
                            <div className="h-14 bg-gradient-to-r from-sky-300 via-blue-200 to-indigo-200" />

                            <div className="p-3">
                                <h3 className="mt-1 text-sm font-semibold text-slate-900">
                                    {project.title}
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    {project.updated_at} · {project.current_stage}
                                </p>

                                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-sky-400"
                                        style={{
                                            width: `${stageToProgress(project.current_stage)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* New Project 弹窗 */}
            {showModal &&
                typeof document !== "undefined" &&
                createPortal(
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 rounded-full bg-indigo-500 px-4 py-1.5 text-white"
                            >
                                X
                            </button>

                            <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
                                Enter Project Name ...
                            </h2>

                            <input
                                type="text"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="Type your project name..."
                                className="mb-6 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
                            />

                            <div className="text-center">
                                <button
                                    onClick={handleCreateProject}
                                    className="rounded-full bg-indigo-500 px-10 py-3 font-semibold text-white shadow hover:bg-indigo-600"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}

function stageToProgress(stage: ProjectInfo["current_stage"]) {
    return stage === "problem" ? 25 : stage === "market" ? 50 : stage === "tech" ? 75 : 100;
}
