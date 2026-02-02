// src/types/chat.ts
export type ChatRole = "user" | "ai" |"system";

export interface ChatMessage {
  id: number;
  role: ChatRole;      // user 或 ai
  text: string;        // 消息内容
  createdAt: string;   // 时间（先用字符串 / ISO）
}
