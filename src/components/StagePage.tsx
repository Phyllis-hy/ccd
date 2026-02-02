// src/components/StagePage.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StageStepper } from "@/src/components/StageStepper";
import ChatArea from "@/src/components/ChatArea";
import StageSummaryPanel from "@/src/components/StageSummaryPanel";
import { getProjectById, updateProject } from "@/src/lib/api/project";
import type { ProjectInfo } from "@/src/types/projectinfo";
import type { Stage } from "@/src/types/common";
import { useProjects } from "@/src/context/ProjectsContext";
import { getSummary, updateSummary } from "@/src/lib/api/summaryApi";
import { sendConversationMessage } from "@/src/lib/api/conversationApi";

const indexToStage: Stage[] = ["problem", "market", "tech", "report"];

const toBooleanFlag = (value: unknown): boolean => {
    if (value === true) return true;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return normalized === "y" || normalized === "yes" || normalized === "true" || normalized === "1";
    }
    if (typeof value === "number") return value === 1;
    return false;
};

export default function StagePage() {
    const { currentProjectId, current_user, setCurrentProjectId } = useProjects();
    const searchParams = useSearchParams();
    const currentUserId = current_user;
    const projectIdParam = searchParams.get("projectId");
    const currentproject = projectIdParam ?? currentProjectId;

    const [projectdata, setProject] = useState<ProjectInfo | null>(null);
    const [loading, setLoading] = useState(true);

    // ? ????
    const stageToIndex: Record<Stage, number> = useMemo(
        () => ({
            problem: 0,
            market: 1,
            tech: 2,
            report: 3,
        }),
        []
    );

    // ? UI:?????? + ??????
    const [completedStage, setCompletedStage] = useState(0);
    const [viewStage, setViewStage] = useState(0);
    const [reportSummaryVisible, setReportSummaryVisible] = useState(false);
    const [summaryRequestedStage, setSummaryRequestedStage] = useState<Stage | null>(null);
    const [isEditingSummary, setIsEditingSummary] = useState(false);
    const [isStageComplete, setIsStageComplete] = useState(false);

    // ? Summary ??
    const [summaryText, setSummaryText] = useState("");
    const [summaryStageKey, setSummaryStageKey] = useState<Stage | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summarySaving, setSummarySaving] = useState(false);
    const [reportRefreshing, setReportRefreshing] = useState(false);

    // ---- 1) ????:? project ----
    useEffect(() => {
        if (!currentproject) return;
        if (projectIdParam && projectIdParam !== currentProjectId) {
            setCurrentProjectId(projectIdParam);
        }

        setProject(null);
        setLoading(true);
        setCompletedStage(0);
        setViewStage(0);

        getProjectById(currentproject)
            .then((data) => {
                setProject(data);
                setLoading(false);
            })
            .catch(() => {
                setProject(null);
                setLoading(false);
            });
    }, [currentproject, projectIdParam, currentProjectId, setCurrentProjectId]);

    // ---- 2) projectdata ??:?? completed/view ----
    useEffect(() => {
        if (!projectdata) return;
        const idx = stageToIndex[projectdata.current_stage];
        const normalizedIdx = typeof idx === "number" ? idx : 0;
        setCompletedStage(normalizedIdx);
        setViewStage(normalizedIdx);
    }, [projectdata, stageToIndex]);

    useEffect(() => {
        if (viewStage > completedStage) {
            setViewStage(completedStage);
        }
    }, [completedStage, viewStage]);

    // ????? stage key
    const viewStageKey: Stage = indexToStage[viewStage];
    const isReportStage = viewStageKey === "report";

    // ???? current stage index
    const currentStageIndex = projectdata
        ? stageToIndex[projectdata.current_stage]
        : 0;

    const isCurrentStage = viewStage === currentStageIndex;
    const isPastStage = viewStage < currentStageIndex;

    const readyToGenerate = toBooleanFlag(projectdata?.ready_to_gen_sum);
    const isSummaryForViewStage = summaryStageKey === viewStageKey;
    const summaryTextForStage = isSummaryForViewStage ? summaryText : "";
    const hasSummary = summaryTextForStage.trim().length > 0;
    const summaryRequested = summaryRequestedStage === viewStageKey;
    const showSummaryPanel = !isReportStage && (isPastStage || summaryRequested || hasSummary);
    const showGenerateSummary =
        !isReportStage &&
        isCurrentStage &&
        !summaryRequested &&
        !hasSummary &&
        (readyToGenerate || isStageComplete);
    const showSidePanel = showSummaryPanel || showGenerateSummary;
    const showReportSummary = isReportStage && reportSummaryVisible;
    const showGenerateReport = isReportStage && !reportSummaryVisible;

    useEffect(() => {
        setSummaryText("");
        setSummaryRequestedStage(null);
        setIsEditingSummary(false);
        setIsStageComplete(false);
        setSummaryStageKey(null);
    }, [viewStageKey, currentproject]);

    useEffect(() => {
        if (!isReportStage) {
            setReportSummaryVisible(false);
        }
    }, [isReportStage]);

    const viewStageKeyRef = useRef(viewStageKey);

    useEffect(() => {
        viewStageKeyRef.current = viewStageKey;
    }, [viewStageKey]);

    const handleConversationMeta = useCallback(
        (meta: { stage: Stage; summaryText?: string; isComplete?: boolean }) => {
            if (meta.stage !== viewStageKeyRef.current) return;
            if (meta.summaryText) {
                setSummaryText(meta.summaryText);
                setSummaryStageKey(meta.stage);
                setSummaryRequestedStage(meta.stage);
                setIsEditingSummary(false);
            }
            if (typeof meta.isComplete === "boolean") {
                setIsStageComplete(meta.isComplete);
            }
        },
        []
    );

    // ---- 3) ?? viewStage:???? stage summary(? API ??)----
    const reqIdRef = useRef(0);

    useEffect(() => {
        if (!currentproject) return;
        if (!projectdata) return;
        if (!currentUserId) return;

        const reqId = ++reqIdRef.current;
        const shouldLoadSummary = isReportStage
            ? reportSummaryVisible
            : isPastStage || (isCurrentStage && summaryRequested && !hasSummary);

        if (!shouldLoadSummary) {
            if (isReportStage || (!isPastStage && !hasSummary)) {
                setSummaryText("");
                setSummaryStageKey(null);
            }
            setSummaryLoading(false);
            return;
        }

        setSummaryLoading(true);
        (async () => {
            try {
                const res = await getSummary(currentproject, viewStageKey, currentUserId);

                const list = res.summary; // ? res ? StageSummary

                const matched = list
                    .filter((s) => s.stage === viewStageKey)
                    .sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
                    .at(-1);

                if (reqId !== reqIdRef.current) return;
                setSummaryText(matched?.summaryText ?? "");
                setSummaryStageKey(viewStageKey);

            } catch (e) {
                if (reqId !== reqIdRef.current) return;
                console.error("getSummary failed:", e);
                setSummaryText("");
                setSummaryStageKey(null);
            } finally {
                if (reqId === reqIdRef.current) setSummaryLoading(false);
            }
        })();
    }, [
        currentproject,
        projectdata,
        viewStageKey,
        currentUserId,
        isReportStage,
        reportSummaryVisible,
        isPastStage,
        isCurrentStage,
        summaryRequested,
        hasSummary,
    ]);



    // ---- 4) ????:??? completedStage ?? ----
    const handleStageClick = (index: number) => {
        if (index <= completedStage) {
            setViewStage(index);
        }
    };

    // ---- 5) Confirm(?? summary):?????????? ----
    const handleSubmitSummary = async () => {
        if (!currentproject) return;
        if (!currentUserId) return;
        if (!isCurrentStage) return;
        if (summarySaving) return;
        if (!summaryTextForStage.trim()) return;

        setSummarySaving(true);
        try {
            await updateSummary(
                currentproject,
                { stage: viewStageKey, summaryText: summaryTextForStage.trim() },
                currentUserId
            );

            const nextIndex = Math.min(
                currentStageIndex + 1,
                indexToStage.length - 1
            );
            const nextStage = indexToStage[nextIndex];

            await updateProject(currentproject, {
                current_stage: nextStage,
                is_archived: "N",
            });

            const refreshed = await getProjectById(currentproject);
            setProject(refreshed);
            setIsEditingSummary(false);
        } catch (e) {
            console.error("saveSummary failed:", e);
        } finally {
            setSummarySaving(false);
        }
    };

    const handleGenerateSummary = async () => {
        if (!isCurrentStage) return;
        if (isReportStage) return;
        if (!currentproject) return;
        setSummaryRequestedStage(viewStageKey);
        setIsEditingSummary(false);
        setSummaryLoading(true);
        try {
            const res = await sendConversationMessage(currentproject, {
                stage: viewStageKey,
                content: "generate summary",
            });
            if (res.ai_message) {
                const summaryText = res.ai_message.is_summary
                    ? res.ai_message.summary_text
                    : "";
                if (summaryText) {
                    setSummaryText(summaryText);
                    setSummaryStageKey(viewStageKey);
                }
                setSummaryRequestedStage(viewStageKey);
                const isComplete = toBooleanFlag(res.ai_message.is_completed);
                if (isComplete) {
                    setIsStageComplete(true);
                }
            }
        } catch (e) {
            console.error("generate summary failed:", e);
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleRefreshReport = async () => {
        if (!currentproject) return;
        if (!currentUserId) return;
        if (!isReportStage) return;
        if (summaryLoading || reportRefreshing) return;

        const reqId = ++reqIdRef.current;
        setReportRefreshing(true);
        setSummaryLoading(true);
        try {
            const res = await getSummary(currentproject, "report", currentUserId);
            const list = res.summary;
            const matched = list
                .filter((s) => s.stage === "report")
                .sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
                .at(-1);
            if (reqId !== reqIdRef.current) return;
            setSummaryText(matched?.summaryText ?? "");
            setSummaryStageKey("report");
        } catch (e) {
            if (reqId !== reqIdRef.current) return;
            console.error("refresh report failed:", e);
            setSummaryText("");
            setSummaryStageKey(null);
        } finally {
            if (reqId === reqIdRef.current) {
                setSummaryLoading(false);
                setReportRefreshing(false);
            }
        }
    };

    // ---- guard ----
    if (!currentproject)
        return <div className="p-6 text-slate-300">Select a project</div>;
    if (loading)
        return <div className="p-6 text-slate-300">Loading...</div>;
    if (!projectdata)
        return (
            <div className="p-6 text-slate-300">
                Project not found or archived. Restore it to view details.
            </div>
        );

    const summaryPanel = (
        <StageSummaryPanel
            mode="summary"
            viewStageKey={viewStageKey}
            isCurrentStage={isCurrentStage}
            isEditingSummary={isEditingSummary}
            hasSummary={hasSummary}
            summaryLoading={summaryLoading}
            summarySaving={summarySaving}
            summaryText={summaryTextForStage}
            projectTitle={projectdata?.title}
            projectUpdatedAt={projectdata?.updated_at}
            onSummaryChange={(value) => {
                setSummaryText(value);
                setSummaryStageKey(viewStageKey);
            }}
            onSetEditing={(value) => setIsEditingSummary(value)}
            onSubmit={handleSubmitSummary}
            onRefreshReport={isReportStage ? handleRefreshReport : undefined}
            refreshReportLoading={reportRefreshing}
        />
    );

    const generateSummaryPanel = (
        <StageSummaryPanel
            mode="generate"
            onGenerate={handleGenerateSummary}
        />
    );

    return (
        <div className="print-page relative flex flex-col h-screen px-6 pt-2 pb-12 gap-2 overflow-hidden">
            <div className="print-hide">
                <StageStepper
                    completedStage={completedStage}
                    viewStage={viewStage}
                    onStageClick={handleStageClick}
                />
            </div>

            <div className="print-main flex flex-1 min-h-0 gap-4 transition-all">
                {/* Chat:??? Summary ???? */}
                <div
                    className={`
            transition-all duration-500 ease-in-out
            ${showSidePanel ? "basis-[65%]" : "basis-full"} print-full
            flex flex-col min-w-0 min-h-0
          `}
                >
                    {showGenerateReport ? (
                        <div className="flex flex-1 items-center justify-center">
                            <button
                                type="button"
                                onClick={() => setReportSummaryVisible(true)}
                                className="
                    rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-900
                    border border-slate-200 shadow-lg shadow-slate-200/60 transition hover:-translate-y-0.5 hover:bg-slate-50
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300
                  "
                            >
                                Generate Report
                            </button>
                        </div>
                    ) : showReportSummary ? (
                        summaryPanel
                    ) : (
                        <ChatArea
                            key={`${currentproject ?? "project"}-${viewStageKey}`}
                            projectId={currentproject}
                            stage={viewStageKey}
                            onConversationMeta={handleConversationMeta}
                            compact={showSidePanel}
                        />
                    )}
                </div>

                {/* Summary:??? */}
                {showSidePanel && (
                    <div
                        className="
              basis-[35%]
              min-w-[360px]
              transition-all duration-500 ease-in-out
              flex min-h-0 print-hide
            "
                    >
                        {showSummaryPanel ? summaryPanel : generateSummaryPanel}
                    </div>
                )}
            </div>
        </div>
    );
}
