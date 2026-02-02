// src/components/MessageBubble.tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

import type { ChatMessage } from "../types/chat";
import { useAuth } from "@/src/context/AuthContext";

interface MessageBubbleProps {
  message: ChatMessage;
}

function Avatar({ role, initials }: { role: ChatMessage["role"]; initials: string }) {
  const isUser = role === "user";
  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shadow-sm ${
        isUser ? "bg-indigo-500 text-white" : "bg-emerald-500 text-white"
      }`}
    >
      {isUser ? initials : "AI"}
    </div>
  );
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const { user } = useAuth();
  const displayName =
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "User";
  const userInitials = displayName.slice(0, 2).toUpperCase();

  // Show backend AI text directly without frontend section filtering.
  const text = message.text ?? "";
  const rawTime = message.createdAt;
  const timeLabel =
    rawTime && !isNaN(Date.parse(rawTime))
      ? new Date(rawTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <div
      className={`flex w-full gap-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex items-end gap-2">
          <Avatar role={message.role} initials={userInitials} />
          <div className="flex flex-col items-start chat-bubble-animate-left">
            <div className="max-w-[70vw] rounded-3xl bg-white px-4 py-2 text-sm text-slate-800 shadow-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mb-2 list-disc pl-5 last:mb-0">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 last:mb-0">{children}</ol>,
                  li: ({ children }) => <li className="mb-1 last:mb-0">{children}</li>,
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
            {timeLabel && (
              <span className="mt-1 text-[11px] text-slate-400">
                {timeLabel}
              </span>
            )}
          </div>
        </div>
      )}

      {isUser && (
        <div className="flex items-end gap-2">
          <div className="flex flex-col items-end chat-bubble-animate-right">
            <div className="max-w-[70vw] rounded-3xl bg-indigo-500 px-4 py-2 text-sm text-white shadow-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mb-2 list-disc pl-5 last:mb-0">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 last:mb-0">{children}</ol>,
                  li: ({ children }) => <li className="mb-1 last:mb-0">{children}</li>,
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
            {timeLabel && (
              <span className="mt-1 text-[11px] text-slate-300">
                {timeLabel}
              </span>
            )}
          </div>
          <Avatar role={message.role} initials={userInitials} />
        </div>
      )}
    </div>
  );
}
