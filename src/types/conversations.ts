
import type { MessageRole } from "@/src/types/common";


export interface ConversationMessage {
    id: number;
    role: MessageRole;  // 'user' | 'ai'
    content: string;
    created_at: string;
    summary_text?: string;
    verification?: Record<string, unknown>;
    is_summary?: boolean;
    is_completed?: boolean | "Y" | "N" | "y" | "n";
}
