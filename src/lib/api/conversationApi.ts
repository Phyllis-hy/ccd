// src/lib/api/conversation.ts
import type { Stage } from "@/src/types/common";
import type { ConversationMessage } from "@/src/types/conversations";
import type { ChatMessage } from "@/src/types/chat";
import { apiGet, apiPost } from "@/src/lib/api/request";

type ConversationListResponse = {
    messages: ConversationMessage[];
};

type ConversationPostResponse = {
    user_message: ConversationMessage;
    ai_message: ConversationMessage | null;
};

type ConversationMeta = {
    summaryText?: string;
    isComplete?: boolean;
};

const STAGE_COMPLETE_MESSAGE = "This stage is over, please generate summary.";

function toBooleanFlag(value: unknown): boolean {
    if (value === true) return true;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return normalized === "y" || normalized === "yes" || normalized === "true" || normalized === "1";
    }
    if (typeof value === "number") return value === 1;
    return false;
}

// ?? -> ?? ChatMessage ??(???????)
function toChatMessage(m: ConversationMessage, overrideId?: number): ChatMessage {
    const isComplete = toBooleanFlag(m.is_completed);
    const shouldOverride =
        m.role === "ai" && isComplete && !m.is_summary && (overrideId == null || m.id === overrideId);
    const text = shouldOverride ? STAGE_COMPLETE_MESSAGE : m.content;
    return {
        id: m.id,
        role: m.role,           // "user" | "ai" | "system"
        text,                   // ??? content
        createdAt: m.created_at // ??? created_at
    };
}

// ??????(????)
export async function getConversationMessages(
    projectId: string,
    stage: Stage
): Promise<ConversationMessage[]> {
    const res = await apiGet<ConversationListResponse>(
        `/api/projects/${projectId}/conversations?stage=${encodeURIComponent(stage)}`
    );
    return res.messages;
}

// ????(????)
export async function sendConversationMessage(
    projectId: string,
    payload: { stage: Stage; content: string; search_enabled?: boolean }
): Promise<ConversationPostResponse> {
    const res = await apiPost<ConversationPostResponse>(
        `/api/projects/${projectId}/conversations`,
        payload
    );
    return res;
}

/**
 * ?????(??? mock ? fetchMessagesPage ?????)
 * page=1 ??????
 */
export async function fetchMessagesPage(
    projectId: string,
    stage: Stage,
    page: number,
    pageSize: number
): Promise<{ items: ChatMessage[]; hasMore: boolean; meta: ConversationMeta }> {
    const all = await getConversationMessages(projectId, stage);

    // ??:?? created_at(???????)
    const sorted = [...all].sort(
        (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)
    );

    const total = sorted.length;
    const start = Math.max(total - page * pageSize, 0);
    const end = total - (page - 1) * pageSize;

    const slice = sorted.slice(start, end); // ????
    const latestSummary = [...sorted].reverse().find((msg) => msg.is_summary);
    const latestComplete = [...sorted].reverse().find((msg) => msg.is_completed != null);
    const latestCompleteId = latestComplete?.id;
    const items = slice
        .filter((m) => !m.is_summary)
        .map((m) => toChatMessage(m, latestCompleteId));
    const hasMore = start > 0;

    return {
        items,
        hasMore,
        meta: {
            summaryText: latestSummary?.summary_text,
            isComplete: latestComplete
                ? toBooleanFlag(latestComplete.is_completed)
                : undefined,
        },
    };
}
