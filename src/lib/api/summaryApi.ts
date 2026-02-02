import type { Stage } from "@/src/types/common";
import type { StageSummary } from "@/src/types/summary";
import { apiGet, apiPost, apiPatchNoData } from "@/src/lib/api/request";

export async function getSummary(
    projectId: string,
    stage: Stage,
    currentUser: string
): Promise<StageSummary> {
    return await apiGet<StageSummary>(
        `/api/projects/${projectId}/assessments` +
        `?stage=${encodeURIComponent(stage)}` +
        `&current_user=${encodeURIComponent(currentUser)}`
    );
}

/**
 * 创建 / 更新阶段总结
 * 后端: PUT /api/projects/{projectId}/summary
 * body: { stage, summaryText }
 * ✅ 返回: StageSummary（统一）
 */
export async function saveSummary(
    projectId: string,
    payload: { stage: Stage; summaryText: string },
    currentUser: string
): Promise<{ message: string }> {
    return await apiPost<{ message: string }>(
        `/api/projects/${projectId}/assessments` +
        `?current_user=${encodeURIComponent(currentUser)}`,
        {
            stage: payload.stage,
            summary_text: payload.summaryText,
        }
    );
}

export async function updateSummary(
    projectId: string,
    payload: { stage: Stage; summaryText: string },
    currentUser: string
): Promise<{ message: string }> {
    try {
        await apiPatchNoData(
            `/api/projects/${projectId}/assessments` +
            `?current_user=${encodeURIComponent(currentUser)}`,
            {
                stage: payload.stage,
                summary_text: payload.summaryText,
            }
        );
        return { message: "ok" };
    } catch (err) {
        if (err instanceof Error && err.message.startsWith("404:")) {
            return await saveSummary(projectId, payload, currentUser);
        }
        throw err;
    }
}

