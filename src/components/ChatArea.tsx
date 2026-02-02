// src/components/ChatArea.tsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { Sparkles, Target, Users, Send } from "lucide-react";
import ChatList from "./ChatList";
import type { ChatMessage } from "../types/chat";
import type { Stage } from "@/src/types/common";
import {
    fetchMessagesPage,
    sendConversationMessage,
} from "@/src/lib/api/conversationApi";
import type { ConversationMessage } from "@/src/types/conversations";
const PAGE_SIZE = 20;
const STAGE_COMPLETE_MESSAGE = "This stage is over, please generate summary.";
const INPUT_MAX_LINES = 4;

type ChatAreaProps = {
    projectId: string | null;
    stage: Stage;
    onConversationMeta?: (meta: {
        stage: Stage;
        summaryText?: string;
        isComplete?: boolean;
    }) => void;
    compact?: boolean;
};

export default function ChatArea({ projectId, stage, onConversationMeta, compact = false }: ChatAreaProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isBooting, setIsBooting] = useState(true);
    const [searchEnabled, setSearchEnabled] = useState(true);

    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const inputUserResizedRef = useRef(false);
    const inputWrapperRef = useRef<HTMLDivElement>(null);
    const inputDefaultHeightRef = useRef<number | null>(null);
    const inputResizeStateRef = useRef<{
        startY: number;
        startHeight: number;
        minHeight: number;
    } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const loadingRef = useRef(false);
    const isNearBottomRef = useRef(true);

    const modeRef = useRef<"reset" | "prepend" | "append">("reset");
    const prevScrollHeightRef = useRef(0);
    const prevScrollTopRef = useRef(0);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    }, []);

    const toBooleanFlag = useCallback((value: unknown): boolean => {
        if (value === true) return true;
        if (typeof value === "string") {
            const normalized = value.trim().toLowerCase();
            return normalized === "y" || normalized === "yes" || normalized === "true" || normalized === "1";
        }
        if (typeof value === "number") return value === 1;
        return false;
    }, []);

    const toChatMessage = useCallback(
        (m: ConversationMessage): ChatMessage => {
            const isComplete = toBooleanFlag(m.is_completed);
            const shouldOverride =
                m.role === "ai" && isComplete && !m.is_summary;
            return {
                id: m.id,
                role: m.role,
                text: shouldOverride ? STAGE_COMPLETE_MESSAGE : m.content,
                createdAt: m.created_at,
            };
        },
        [toBooleanFlag]
    );

    const loadPage = useCallback(
        async (p: number, mode: "reset" | "prepend") => {
            if (!projectId) return;
            if (loadingRef.current) return;

            const el = scrollRef.current;
            if (el && mode === "prepend") {
                prevScrollHeightRef.current = el.scrollHeight;
                prevScrollTopRef.current = el.scrollTop;
            }

            loadingRef.current = true;
            setLoading(true);
            modeRef.current = mode;

            try {
                const { items, hasMore, meta } = await fetchMessagesPage(
                    projectId,
                    stage,
                    p,
                    PAGE_SIZE
                );

                setMessages((prev) => (mode === "reset" ? items : [...items, ...prev]));
                setHasMore(hasMore);
                setPage(p);
                if (meta.summaryText || meta.isComplete != null) {
                    onConversationMeta?.({ ...meta, stage });
                }
            } finally {
                loadingRef.current = false;
                setLoading(false);
                if (mode === "reset") {
                    setIsBooting(false);
                }
            }
        },
        [projectId, stage, onConversationMeta]
    );

    useLayoutEffect(() => {
        if (!projectId) {
            setMessages([]);
            setPage(1);
            setHasMore(true);
            setIsBooting(false);
            return;
        }

        setMessages([]);
        setPage(1);
        setHasMore(true);
        setIsBooting(true);

        loadPage(1, "reset");
    }, [projectId, stage, loadPage]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = window.localStorage.getItem("ideasense.searchEnabled");
        if (stored != null) {
            const normalized = stored.trim().toLowerCase();
            setSearchEnabled(normalized === "1" || normalized === "true" || normalized === "yes");
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem("ideasense.searchEnabled", searchEnabled ? "1" : "0");
    }, [searchEnabled]);

    useLayoutEffect(() => {
        const wrapper = inputWrapperRef.current;
        if (!wrapper) return;
        if (inputDefaultHeightRef.current == null) {
            inputDefaultHeightRef.current = wrapper.getBoundingClientRect().height;
        }
    }, []);

    const hasUserMessage = messages.some((message) => message.role === "user");
    const shouldShowStageNotice =
        (stage === "problem" || stage === "market" || stage === "tech") &&
        !hasUserMessage;

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const mode = modeRef.current;

        if (mode === "reset") {
            requestAnimationFrame(() => scrollToBottom("auto"));
            return;
        }

        if (mode === "prepend") {
            const newScrollHeight = el.scrollHeight;
            const delta = newScrollHeight - prevScrollHeightRef.current;
            el.scrollTop = prevScrollTopRef.current + delta;
            return;
        }

        if (mode === "append") {
            if (isNearBottomRef.current) {
                requestAnimationFrame(() => scrollToBottom("auto"));
            }
        }
    }, [messages, scrollToBottom]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const handleScroll = () => {
            const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
            isNearBottomRef.current = distanceToBottom < 80;
            setShowScrollToBottom(distanceToBottom > 80);

            if (el.scrollTop < 40 && hasMore && !loadingRef.current) {
                loadPage(page + 1, "prepend");
            }
        };

        handleScroll();
        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, [hasMore, page, loadPage]);

    const handleSend = useCallback(async () => {
        if (!projectId) return;
        const content = input.trim();
        if (!content) return;

        setInput("");
        if (inputWrapperRef.current) {
            inputWrapperRef.current.style.height = "";
        }
        inputUserResizedRef.current = false;
        const localUserMsg: ChatMessage = {
            id: Date.now(),
            role: "user",
            text: content,
            createdAt: new Date().toISOString(),
        };

        modeRef.current = "append";
        setMessages((prev) => [...prev, localUserMsg]);
        setTimeout(() => scrollToBottom("auto"), 0);

        try {
            const res = await sendConversationMessage(projectId, {
                stage,
                content,
                search_enabled: searchEnabled,
            });

            const serverUser = toChatMessage(res.user_message);
            const serverAi =
                res.ai_message && !res.ai_message.is_summary
                    ? toChatMessage(res.ai_message)
                    : null;
            if (res.ai_message) {
                const summaryText = res.ai_message.is_summary
                    ? res.ai_message.summary_text
                    : undefined;
                const isComplete = toBooleanFlag(res.ai_message.is_completed);
                if (summaryText || isComplete) {
                    onConversationMeta?.({ stage, summaryText, isComplete });
                }
            }

            modeRef.current = "append";
            setMessages((prev) => {
                const next = [...prev];

                for (let i = next.length - 1; i >= 0; i--) {
                    if (next[i].role === "user" && next[i].text === content) {
                        next[i] = serverUser;
                        break;
                    }
                }

                if (serverAi) next.push(serverAi);
                return next;
            });

            setTimeout(() => scrollToBottom("auto"), 0);
        } catch (e) {
            modeRef.current = "append";
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: "system",
                    text: "Failed to send message.",
                    createdAt: new Date().toISOString(),
                },
            ]);
        }
    }, [projectId, stage, input, scrollToBottom, toChatMessage, onConversationMeta, toBooleanFlag]);

    const getInputMaxHeight = useCallback((el: HTMLTextAreaElement) => {
        const styles = window.getComputedStyle(el);
        const lineHeight = Number.parseFloat(styles.lineHeight || "24");
        return lineHeight * INPUT_MAX_LINES;
    }, []);

    const handleInput = useCallback((value: string) => {
        setInput(value);
        const el = inputRef.current;
        const wrapper = inputWrapperRef.current;
        if (!el || !wrapper) return;
        const wrapperStyles = window.getComputedStyle(wrapper);
        const paddingTop = Number.parseFloat(wrapperStyles.paddingTop || "0");
        const paddingBottom = Number.parseFloat(wrapperStyles.paddingBottom || "0");
        const maxHeight = getInputMaxHeight(el);
        const scrollHeight = el.scrollHeight;
        const baseHeight = Math.min(scrollHeight, maxHeight) + paddingTop + paddingBottom;
        const currentHeight = wrapper.getBoundingClientRect().height;
        if (inputUserResizedRef.current) {
            wrapper.style.height = `${Math.max(currentHeight, baseHeight)}px`;
        } else {
            wrapper.style.height = `${baseHeight}px`;
        }
        if (!value.trim()) {
            inputUserResizedRef.current = false;
            wrapper.style.height = "";
        }
    }, [getInputMaxHeight]);

    const handleResizeMove = useCallback((e: PointerEvent) => {
        const state = inputResizeStateRef.current;
        const wrapper = inputWrapperRef.current;
        if (!state || !wrapper) return;
        const delta = e.clientY - state.startY;
        // Drag up to grow, drag down to shrink.
        const nextHeight = Math.max(state.minHeight, state.startHeight - delta);
        wrapper.style.height = `${nextHeight}px`;
    }, []);

    const handleResizeEnd = useCallback(() => {
        const wrapper = inputWrapperRef.current;
        const minHeight = inputDefaultHeightRef.current;
        if (wrapper && typeof minHeight === "number") {
            const currentHeight = wrapper.getBoundingClientRect().height;
            inputUserResizedRef.current = currentHeight > minHeight + 1;
        }
        inputResizeStateRef.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("pointermove", handleResizeMove);
        window.removeEventListener("pointerup", handleResizeEnd);
    }, [handleResizeMove]);

    const handleResizeStart = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            const wrapper = inputWrapperRef.current;
            if (!wrapper) return;
            const startHeight = wrapper.getBoundingClientRect().height;
            const minHeight =
                inputDefaultHeightRef.current ?? startHeight;
            inputResizeStateRef.current = {
                startY: e.clientY,
                startHeight,
                minHeight,
            };
            document.body.style.cursor = "ns-resize";
            document.body.style.userSelect = "none";
            window.addEventListener("pointermove", handleResizeMove);
            window.addEventListener("pointerup", handleResizeEnd);
        },
        [handleResizeEnd, handleResizeMove]
    );

    const handleInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        },
        [handleSend]
    );

    const isBubbleNotice = stage === "market" || stage === "tech";
    const stageNoticeText =
        stage === "problem"
            ? "Please Describe Your Idea."
            : isBubbleNotice
            ? "We are entering a new stage. You can return to previous stages to review content. Type continue to proceed."
            : null;

    const isInitialLoading = isBooting;

    const heroContainerClass = compact
        ? "relative w-full max-w-[960px] px-6 py-10 md:px-10 md:py-12"
        : "relative w-full max-w-[1100px] px-4 py-10 md:px-6 md:py-12";

    const heroCardGridClass = compact
        ? "mt-8 grid gap-4 text-center text-sm text-slate-500 md:mt-10 md:grid-cols-2 md:gap-5"
        : "mt-8 grid gap-4 text-center text-sm text-slate-500 md:mt-10 md:grid-cols-3 md:gap-5";

    return (
        <div className="relative h-full min-h-0 flex flex-col rounded-3xl bg-gradient-to-b from-white via-sky-50/50 to-sky-100/70 border border-sky-100 shadow-[0_18px_40px_rgba(14,116,144,0.12)] overflow-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(140px_80px_at_18%_10%,rgba(186,230,253,0.6),transparent_60%),radial-gradient(160px_90px_at_85%_25%,rgba(191,219,254,0.5),transparent_62%),radial-gradient(140px_90px_at_30%_80%,rgba(224,231,255,0.55),transparent_65%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-50 [background:linear-gradient(120deg,rgba(255,255,255,0.45),transparent_60%)]" />
            <div className="relative shrink-0 h-3 bg-white/80" />

            <div ref={scrollRef} className="relative flex-1 min-h-0 overflow-y-auto px-5 py-4">
                {!isInitialLoading && shouldShowStageNotice && stageNoticeText && (
                    <div
                        className={`pointer-events-none absolute inset-x-0 flex justify-center ${
                            isBubbleNotice ? "top-0" : "inset-y-0 items-center"
                        }`}
                    >
                        {isBubbleNotice ? (
                            <div className="mt-2 inline-flex max-w-[520px] rounded-2xl border border-sky-200/70 bg-white/80 px-4 py-3 text-sm text-slate-700 text-center shadow-sm">
                                {stageNoticeText}
                            </div>
                        ) : (
                            <div className={heroContainerClass}>
                                <h2 className="mt-2 text-center text-3xl font-semibold text-slate-900 md:text-4xl">
                                    Ready to Achieve Great Things?
                                </h2>
                                <p className="mt-3 mx-auto max-w-[720px] text-center text-sm text-slate-500 md:text-[15px]">
                                    Describe your project in a few sentences: what it does, who it helps, and why now.
                                </p>
                                <p className="mt-2 mx-auto max-w-[720px] text-center text-sm text-slate-500 md:text-[14px]">
                                    Start with a clear problem, the target user, and why it matters. We will guide you step
                                    by step.
                                </p>

                                <div className={heroCardGridClass}>
                                    <div className="rounded-3xl border border-white/70 bg-white/85 px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur md:px-6 md:py-6">
                                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-sky-600 shadow-sm md:h-12 md:w-12">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                        <div className="mt-4 text-sm font-semibold text-slate-800 md:text-base">Define the Problem</div>
                                        <div className="mt-2 text-sm text-slate-500">
                                            Identify the pain point <br />
                                            and why it matters.
                                        </div>
                                    </div>
                                    <div className="rounded-3xl border border-white/70 bg-white/85 px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur md:px-6 md:py-6">
                                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 shadow-sm md:h-12 md:w-12">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div className="mt-4 text-sm font-semibold text-slate-800 md:text-base">Target Users</div>
                                        <div className="mt-2 text-sm text-slate-500">
                                            Describe who feels <br />
                                            the problem most.
                                        </div>
                                    </div>
                                    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/85 px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur md:px-6 md:py-6">
                                        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-200/50 blur-2xl" />
                                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-violet-600 shadow-sm md:h-12 md:w-12">
                                            <Target className="h-5 w-5" />
                                        </div>
                                        <div className="mt-4 text-sm font-semibold text-slate-800 md:text-base">DVF Lens</div>
                                        <div className="mt-2 text-sm text-slate-500">
                                            D: user pain & demand <br />
                                            V: business strength <br />
                                            F: ability to deliver
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {!isInitialLoading && (
                    <ChatList
                        messages={messages}
                        loading={loading}
                        hasMore={hasMore}
                        onLoadMore={() => loadPage(page + 1, "prepend")}
                    />
                )}
            </div>

            <div className="relative shrink-0 bg-white/80 px-5 py-3">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex w-full items-center justify-between px-1 text-[11px] text-slate-500">
                        <div className="flex items-center gap-2">
                            <span>Search verification</span>
                            <button
                                type="button"
                                aria-pressed={searchEnabled}
                                onClick={() => setSearchEnabled((v) => !v)}
                                className={`relative h-5 w-9 rounded-full transition ${
                                    searchEnabled ? "bg-emerald-400" : "bg-slate-300"
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition ${
                                        searchEnabled ? "translate-x-4" : ""
                                    }`}
                                />
                            </button>
                            <span className="text-[10px] text-slate-400">
                                {searchEnabled ? "On" : "Off"}
                            </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                            Applies to searchable questions
                        </span>
                    </div>
                    <div
                        ref={inputWrapperRef}
                        className="relative flex w-full items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/90 px-3 py-2 shadow-[0_14px_32px_rgba(15,23,42,0.12)] backdrop-blur transition focus-within:border-sky-300/70 focus-within:ring-2 focus-within:ring-sky-200/60 overflow-hidden"
                    >
                        <div
                            onPointerDown={handleResizeStart}
                            className="absolute inset-x-0 top-0 h-3 cursor-ns-resize"
                            aria-hidden="true"
                        />
                        <textarea
                            ref={inputRef}
                            rows={1}
                            value={input}
                            onChange={(e) => handleInput(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                            placeholder="Type your message..."
                            className="flex-1 self-stretch bg-transparent text-sm focus:outline-none text-slate-700 placeholder:text-slate-400 resize-none leading-6 min-h-[24px] h-full min-h-0 overflow-y-auto py-1"
                        />

                        <button
                            onClick={handleSend}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white text-sm font-medium shadow-sm"
                        >
                            <Send className="h-4 w-4" />
                            Send
                        </button>
                    </div>
                </div>
            </div>

            {showScrollToBottom && (
                <button
                    onClick={() => scrollToBottom("smooth")}
                    className="absolute right-5 bottom-24 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs px-3 py-1 shadow hover:brightness-110"
                >
                    Scroll to bottom
                </button>
            )}
        </div>
    );
}
