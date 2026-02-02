// src/components/Profile/ProjectGrid.tsx
"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/src/context/ProjectsContext";
import { deleteProject, updateProject } from "@/src/lib/api/project";
import type { ProjectInfo } from "@/src/types/projectinfo";

type ProjectGridProps = {
  projects: ProjectInfo[];
  emptyLabel?: string;
  showPromptBubbles?: boolean;
};

type CardStyle = {
  kind: "gradient" | "image";
  value: string;
};

const gradientOptions: Array<{ id: string; label: string; value: string }> = [
  { id: "sidebar-sky", label: "Sky", value: "linear-gradient(90deg, #7dd3fc, #c7d2fe)" },
  { id: "mist", label: "Mist", value: "linear-gradient(90deg, #bae6fd, #dbeafe)" },
  { id: "ice", label: "Ice", value: "linear-gradient(90deg, #e0f2fe, #dbeafe)" },
];

const imageOptions: Array<{ id: string; label: string; value: string }> = [
  { id: "homeimage3", label: "Glass", value: "/test2.png" },
  { id: "homeimage4", label: "Wave", value: "/test1.jpg" },
  { id: "test1", label: "Studio", value: "/background1.png" },
  { id: "test2", label: "Gradient", value: "/background2.png" },
];

const emptyPrompts = [
  "Validate an idea",
  "Define a problem",
  "Draft a solution",
  "Identify target users",
  "Map key risks",
  "Plan a quick MVP",
  "Outline research steps",
  "Write a project brief",
];
const promptPositions = [
  "chip-1",
  "chip-2",
  "chip-3",
  "chip-4",
  "chip-5",
  "chip-6",
  "chip-7",
  "chip-8",
];

export default function ProjectGrid({
  projects,
  emptyLabel,
  showPromptBubbles = false,
}: ProjectGridProps) {
  const {
    projects: allProjects,
    setProjects,
    currentProjectId,
    setCurrentProjectId,
  } = useProjects();
  const router = useRouter();
  const [projectToDelete, setProjectToDelete] = useState<ProjectInfo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [projectToRename, setProjectToRename] = useState<ProjectInfo | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [openStyleForId, setOpenStyleForId] = useState<string | null>(null);
  const [cardStyles, setCardStyles] = useState<Record<string, CardStyle>>({});
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const openProject = (projectId: string, stage?: ProjectInfo["current_stage"]) => {
    // ✅ 你 stage 页面如果用 query 参数，就这样
    // 如果你的 stage 页面不需要 stage 参数，也可以删掉 stage 部分
    const qs = new URLSearchParams();
    qs.set("projectId", String(projectId));
    if (stage) qs.set("stage", stage);

    router.push(`/stage?${qs.toString()}`);
  };

  useEffect(() => {
    const saved = window.localStorage.getItem("profile-project-card-styles");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Record<string, CardStyle>;
      setCardStyles(parsed);
    } catch {
      setCardStyles({});
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("profile-project-card-styles", JSON.stringify(cardStyles));
  }, [cardStyles]);

  const updateCardStyle = (projectId: string, style: CardStyle) => {
    setCardStyles((prev) => ({ ...prev, [projectId]: style }));
  };

  const confirmDelete = async () => {
    if (!projectToDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProject(String(projectToDelete.id));
      setProjects((prev) => prev.filter((p) => String(p.id) !== String(projectToDelete.id)));
      if (String(currentProjectId) === String(projectToDelete.id)) {
        const next = allProjects.find((p) => String(p.id) !== String(projectToDelete.id));
        setCurrentProjectId(next ? String(next.id) : "");
      }
      setProjectToDelete(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete project.";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmRename = async () => {
    if (!projectToRename || isRenaming) return;
    const nextTitle = renameValue.trim();
    if (!nextTitle) {
      setRenameError("Project name cannot be empty.");
      return;
    }
    setIsRenaming(true);
    setRenameError(null);
    try {
      const updated = await updateProject(String(projectToRename.id), { title: nextTitle });
      setProjects((prev) =>
        prev.map((p) => (String(p.id) === String(projectToRename.id) ? { ...p, title: updated.title } : p))
      );
      setProjectToRename(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to rename project.";
      setRenameError(message);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleArchiveToggle = async (project: ProjectInfo) => {
    if (archivingId) return;
    const projectId = String(project.id);
    const willArchive = project.is_archived !== true;
    setArchivingId(projectId);
    try {
      await updateProject(projectId, { is_archived: willArchive ? "Y" : "N" });
      if (willArchive && String(currentProjectId) === projectId) {
        const next = allProjects.find((p) => p.is_archived !== true && String(p.id) !== projectId);
        setCurrentProjectId(next ? String(next.id) : "");
      }
      setProjects((prev) =>
        prev.map((p) =>
          String(p.id) === projectId ? { ...p, is_archived: willArchive } : p
        )
      );
    } catch (error) {
      console.error("Archive toggle failed:", error);
    } finally {
      setArchivingId(null);
    }
  };

  return (
    <section className="mt-6">
      <div className="grid md:grid-cols-2 gap-6">
        {projects.length === 0 && (
          <div className="col-span-full">
            {showPromptBubbles ? (
              <div className="relative overflow-hidden rounded-[36px] border border-sky-200/60 bg-gradient-to-b from-white via-white to-sky-50/60 px-6 py-10 shadow-[0_14px_30px_rgba(15,23,42,0.05)] sm:px-10">
                <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-sky-100/60 blur-2xl" />
                <div className="absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-blue-100/50 blur-2xl" />

                <div className="pointer-events-none absolute inset-0">
                  <span className="bubble bubble-1" />
                  <span className="bubble bubble-2" />
                  <span className="bubble bubble-3" />
                  <span className="bubble bubble-4" />
                  <span className="bubble bubble-5" />
                </div>

                <div className="relative text-center">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Start your first project
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Need inspiration? Pick a prompt to get going.
                  </p>
                </div>

                <div className="relative mt-6 h-44">
                  <div className="bubble-field">
                    {emptyPrompts.map((prompt, index) => (
                      <span
                        key={prompt}
                        className={`bubble-chip ${promptPositions[index] ?? "chip-1"}`}
                      >
                        {prompt}
                      </span>
                    ))}
                  </div>
                </div>

                <style jsx>{`
                  .bubble {
                    position: absolute;
                    border-radius: 9999px;
                    background: radial-gradient(
                      circle at 30% 30%,
                      rgba(255, 255, 255, 0.9),
                      rgba(125, 211, 252, 0.4) 45%,
                      rgba(59, 130, 246, 0.2) 70%,
                      rgba(59, 130, 246, 0.05) 100%
                    );
                    filter: blur(0.2px);
                    opacity: 0.9;
                    animation: float 8s ease-in-out infinite;
                  }

                  .bubble-1 {
                    width: 110px;
                    height: 110px;
                    top: -10px;
                    left: 22%;
                    animation-duration: 10s;
                  }

                  .bubble-2 {
                    width: 70px;
                    height: 70px;
                    top: 12%;
                    right: 12%;
                    animation-duration: 9s;
                    animation-delay: -2s;
                  }

                  .bubble-3 {
                    width: 48px;
                    height: 48px;
                    bottom: 18%;
                    left: 12%;
                    animation-duration: 7.5s;
                    animation-delay: -1s;
                  }

                  .bubble-4 {
                    width: 90px;
                    height: 90px;
                    bottom: -20px;
                    right: 28%;
                    animation-duration: 11s;
                    animation-delay: -3s;
                  }

                  .bubble-5 {
                    width: 56px;
                    height: 56px;
                    top: 35%;
                    left: 55%;
                    animation-duration: 8.5s;
                    animation-delay: -4s;
                  }

                  .bubble-field {
                    position: relative;
                    height: 100%;
                  }

                  .bubble-chip {
                    position: absolute;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px 16px;
                    font-size: 0.875rem;
                    color: #475569;
                    background: rgba(255, 255, 255, 0.85);
                    border: 1px solid rgba(226, 232, 240, 0.9);
                    border-radius: 9999px;
                    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
                    animation: chip-float 7s ease-in-out infinite;
                    white-space: nowrap;
                  }

                  .chip-1 {
                    top: 0%;
                    left: 2%;
                    animation-duration: 7.2s;
                  }

                  .chip-2 {
                    top: 8%;
                    left: 40%;
                    animation-duration: 9.4s;
                    animation-delay: -1.6s;
                  }

                  .chip-3 {
                    top: 4%;
                    right: 2%;
                    animation-duration: 10.2s;
                    animation-delay: -2.4s;
                  }

                  .chip-4 {
                    top: 58%;
                    left: 6%;
                    animation-duration: 8.6s;
                    animation-delay: -2.2s;
                  }

                  .chip-5 {
                    top: 64%;
                    left: 48%;
                    animation-duration: 9.1s;
                    animation-delay: -3.1s;
                  }

                  .chip-6 {
                    top: 46%;
                    right: 4%;
                    animation-duration: 10.6s;
                    animation-delay: -3.6s;
                  }

                  .chip-7 {
                    top: 22%;
                    left: 64%;
                    animation-duration: 8.2s;
                    animation-delay: -1.2s;
                  }

                  .chip-8 {
                    top: 30%;
                    left: 14%;
                    animation-duration: 9.8s;
                    animation-delay: -2.8s;
                  }

                  @keyframes float {
                    0%,
                    100% {
                      transform: translate3d(0, 0, 0);
                    }
                    50% {
                      transform: translate3d(0, -10px, 0);
                    }
                  }

                  @keyframes chip-float {
                    0% {
                      transform: translate3d(-8px, 0, 0);
                    }
                    50% {
                      transform: translate3d(10px, -8px, 0);
                    }
                    100% {
                      transform: translate3d(18px, 0, 0);
                    }
                  }
                `}</style>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-sky-100 bg-white/80 px-6 py-10 text-center text-slate-500">
                {emptyLabel ?? "No projects available."}
              </div>
            )}
          </div>
        )}
        {projects.map((p) => (
          <div key={p.id} className="relative">
          <div
            role="button"
            tabIndex={0}
            onClick={() => openProject(String(p.id), p.current_stage)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openProject(String(p.id), p.current_stage);
              }
            }}
            className="relative text-left bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden
                       transition hover:-translate-y-[1px] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-sky-200/40"
          >
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleArchiveToggle(p);
                }}
                disabled={archivingId === String(p.id)}
                className="rounded-full bg-white/90 text-slate-600 text-xs font-semibold px-3 py-1 shadow-sm
                           hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
              >
                {archivingId === String(p.id)
                  ? "Saving..."
                  : p.is_archived
                  ? "Restore"
                  : "Archive"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenStyleForId((prev) => (prev === String(p.id) ? null : String(p.id)));
                }}
                className="rounded-full bg-white/90 text-slate-600 text-xs font-semibold px-3 py-1 shadow-sm
                           hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                Style
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRenameValue(p.title ?? "");
                  setRenameError(null);
                  setProjectToRename(p);
                }}
                className="rounded-full bg-white/90 text-slate-600 text-xs font-semibold px-3 py-1 shadow-sm
                           hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setProjectToDelete(p);
                }}
                className="rounded-full bg-white/90 text-slate-600 text-xs font-semibold px-3 py-1 shadow-sm
                           hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                Delete
              </button>
            </div>
            <div
              className="h-28"
              style={getHeaderStyle(cardStyles[String(p.id)])}
            />
            <div className="p-4">
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">
                {stageLabel(p.current_stage)}
              </span>

              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                {p.title}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Updated {formatUpdatedAt(p.updated_at)}
              </p>

              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400"
                  style={{ width: `${stageToProgress(p.current_stage)}%` }}
                />
              </div>
            </div>
          </div>
          {openStyleForId === String(p.id) && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-4 top-12 z-20 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Card style</span>
                <button
                  type="button"
                  onClick={() => setOpenStyleForId(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  x
                </button>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Colors</p>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {gradientOptions.map((opt) => {
                    const isActive =
                      cardStyles[String(p.id)]?.kind === "gradient" &&
                      cardStyles[String(p.id)]?.value === opt.value;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateCardStyle(String(p.id), { kind: "gradient", value: opt.value })}
                        className={`h-8 w-8 rounded-full ring-2 ${
                          isActive ? "ring-sky-500" : "ring-transparent"
                        }`}
                        style={{ backgroundImage: opt.value }}
                        title={opt.label}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Images</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {imageOptions.map((opt) => {
                    const isActive =
                      cardStyles[String(p.id)]?.kind === "image" &&
                      cardStyles[String(p.id)]?.value === opt.value;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateCardStyle(String(p.id), { kind: "image", value: opt.value })}
                        className={`h-12 rounded-xl border ${
                          isActive ? "border-sky-500" : "border-slate-200"
                        }`}
                        style={{
                          backgroundImage: `url(${opt.value})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                        title={opt.label}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => updateCardStyle(String(p.id), { kind: "gradient", value: gradientOptions[0].value })}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setOpenStyleForId(null)}
                  className="rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-sky-600"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
          </div>
        ))}
      </div>

      {projectToDelete && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center backdrop-blur-sm z-50">
          <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-xl relative text-center">

            <h2 className="text-2xl font-bold text-gray-900">
              Are you sure you want to delete this project?
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              This action cannot be undone.
            </p>

            {deleteError && (
              <p className="mt-4 text-sm text-rose-600">{deleteError}</p>
            )}

            <div className="mt-8 flex justify-center gap-6">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-10 py-3 bg-indigo-500 text-white font-semibold rounded-full shadow hover:bg-indigo-600 disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Yes"}
              </button>
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-10 py-3 bg-slate-200 text-slate-700 font-semibold rounded-full shadow hover:bg-slate-300"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {projectToRename && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center backdrop-blur-sm z-50">
          <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-xl relative text-center">
            <h2 className="text-2xl font-bold text-gray-900">Rename project</h2>
            <p className="mt-3 text-sm text-slate-500">
              Update the project name. This will be visible to you everywhere.
            </p>

            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="mt-6 w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="Enter new project name"
            />

            {renameError && (
              <p className="mt-3 text-sm text-rose-600">{renameError}</p>
            )}

            <div className="mt-8 flex justify-center gap-6">
              <button
                type="button"
                onClick={confirmRename}
                disabled={isRenaming}
                className="px-10 py-3 bg-sky-500 text-white font-semibold rounded-full shadow hover:bg-sky-600 disabled:opacity-60"
              >
                {isRenaming ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setProjectToRename(null)}
                className="px-10 py-3 bg-slate-100 text-slate-700 font-semibold rounded-full shadow hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function stageLabel(stage: ProjectInfo["current_stage"]) {
  switch (stage) {
    case "problem":
      return "Problem";
    case "market":
      return "Market";
    case "tech":
      return "Tech";
    case "report":
      return "Report";
    default:
      return "Unknown";
  }
}

function stageToProgress(stage: ProjectInfo["current_stage"]) {
  return stage === "problem" ? 25 : stage === "market" ? 50 : stage === "tech" ? 75 : 100;
}

function formatUpdatedAt(value: string) {
  if (!value) return "unknown";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

function getHeaderStyle(style?: CardStyle): CSSProperties {
  if (!style || style.kind === "gradient") {
    return {
      backgroundImage: style?.value ?? gradientOptions[0].value,
    };
  }
  return {
    backgroundImage: `url(${style.value})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}
