// src/types/chat.ts
export type ChatRole = "user" | "ai" |"system";

export interface ChatMessage {
  id: number;
  role: ChatRole;      // user or ai
  text: string;        // Message content
  createdAt: string;   // Timestamp (ISO format)
}
