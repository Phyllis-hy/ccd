// src/components/Profile/ProfilePage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import ProjectGrid from "./ProjectGrid";
import { useProjects } from "@/src/context/ProjectsContext";

export default function ProfilePage() {
  const { addProject, projects } = useProjects();
  const router = useRouter();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [activeTab, setActiveTab] = useState<"projects" | "archive">("projects");

  const archiveEnabled = true;
  const archivedProjects = projects.filter((p) => p.is_archived === true);
  const activeProjects = projects.filter((p) => p.is_archived !== true);
  const visibleProjects = activeTab === "projects" ? activeProjects : archivedProjects;
  const hasVisibleProjects = visibleProjects.length > 0;

  const handleCreate = async () => {
    const name = newProjectName.trim();
    if (!name) return;

    try {
      const project = await addProject(name); // ✅ 全局新增
      setNewProjectName("");
      setShowCreateModal(false);

      // 这里先简单地跳回主 AI 页面（StagePage）
      // 以后你接后端时可以改成 /project/${project.id}
      router.push("/stage");
    } catch (error) {
      console.error("Create project failed:", error);
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-sky-50">
      <div className="relative flex h-full flex-col overflow-y-auto px-6 py-6 md:px-8">
      <ProfileHeader />
      <div className="mt-4">
        <ProfileStats
          totalProjects={projects.length}
          archivedProjects={archivedProjects.length}
        />
      </div>

      <section className="mt-6 flex flex-col flex-1 min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
            <p className="text-sm text-slate-500">
              Blue and clean workspace with quick switching.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur">
            <button
              type="button"
              onClick={() => setActiveTab("projects")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                activeTab === "projects"
                  ? "bg-sky-500 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Projects ({activeProjects.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("archive")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                activeTab === "archive"
                  ? "bg-slate-800 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Archive {archiveEnabled ? `(${archivedProjects.length})` : "(coming soon)"}
            </button>
          </div>
        </div>

        <div
          className={`mt-4 flex-1 min-h-0 pr-2 ${
            hasVisibleProjects ? "overflow-y-auto" : "overflow-hidden"
          }`}
        >
          <ProjectGrid
            projects={visibleProjects}
            emptyLabel={
              activeTab === "projects"
                ? "No projects yet. Create your first one."
                : "Archive is coming soon."
            }
            showPromptBubbles={activeTab === "projects"}
          />
        </div>

        {activeTab === "projects" && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-10 py-3 rounded-full bg-sky-500 text-white font-semibold shadow-md hover:bg-sky-600"
            >
              Create project
            </button>
          </div>
        )}
      </section>

      {/* Create project dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center backdrop-blur-sm z-50">
          <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 px-4 py-1.5 bg-sky-500 text-white rounded-full"
            >
              Close
            </button>

            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Enter Project Name ...
            </h2>

            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Type your project name..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-6 
                         outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
                         text-gray-900 placeholder:text-gray-400"
            />

            <div className="text-center">
              <button
                onClick={handleCreate}
                className="px-10 py-3 bg-sky-500 text-white font-semibold rounded-full shadow hover:bg-sky-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
