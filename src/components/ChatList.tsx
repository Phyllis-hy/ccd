// src/components/ChatList.tsx
"use client";

import type { ChatMessage } from "../types/chat";
import MessageBubble from "./MessageBubble";

interface ChatListProps {
  messages: ChatMessage[];
  loading?: boolean;                 // 可选：是否在加载
  hasMore?: boolean;                 // 可选：是否还有更多历史消息
  onLoadMore?: () => void | Promise<void>; // 可选：点击加载更多时触发
}

export default function ChatList({
  messages,
  loading,
  hasMore,
  onLoadMore,
}: ChatListProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* “加载更多”按钮放在最上方（可选） */}
      {hasMore && (
        <button
          type="button"
          disabled={loading}
          onClick={onLoadMore}
          className="self-center mb-1 rounded-full border border-sky-100 bg-white px-3 py-1 text-xs text-slate-500 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load previous messages"}
        </button>
      )}

      {messages.map((msg, index) => (
        <MessageBubble
          key={`${msg.role}-${msg.id}-${index}`}
          message={msg}
        />
      ))}
    </div>
  );
}
