"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Send,
  Sparkles,
  ArrowRight,
  Bot,
  User,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { API_ROUTES } from "@/config/api-routes";
import { useMounted } from "@/hooks/use-mounted";
import { NovaLauncherIcon } from "@/components/chatbot/NovaLauncherIcon";
import { dedupeChatHistory, dedupeConsecutiveChatMessages } from "@/lib/chat/dedupe-messages";
import type { ChatbotPosition } from "@/lib/chatbot-position";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatbotWidgetProps {
  companyName: string;
  assistantName?: string;
  contactHref: string;
  position?: ChatbotPosition;
}

const NOVA_DRAFT_KEY = "fgs-nova-chat-draft";
const NOVA_OPEN_KEY = "fgs-nova-chat-open";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "fgs-chat-session";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function TypingIndicator() {
  return (
    <div className="nova-chat-bubble-assistant flex items-center gap-1 rounded-2xl rounded-bl-md px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full bg-primary-400"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ message, compact }: { message: ChatMessage; compact?: boolean }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex gap-2.5",
        compact && "nova-chat-bubble-row--compact",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "nova-chat-bubble-avatar flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary-600 text-white" : "bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isUser
            ? "nova-chat-bubble-user rounded-br-md bg-primary-600 text-white"
            : "nova-chat-bubble-assistant rounded-bl-md text-slate-700"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </motion.div>
  );
}

export function ChatbotWidget({
  companyName,
  assistantName = "Nova",
  contactHref,
  position = "right",
}: ChatbotWidgetProps) {
  const t = useTranslations("chatbot");
  const locale = useLocale();
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const draft = sessionStorage.getItem(NOVA_DRAFT_KEY);
      if (draft) setInput(draft);
      if (sessionStorage.getItem(NOVA_OPEN_KEY) === "1") setOpen(true);
    } catch {
      /* ignore */
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      sessionStorage.setItem(NOVA_OPEN_KEY, open ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      if (input.trim()) {
        sessionStorage.setItem(NOVA_DRAFT_KEY, input);
      } else {
        sessionStorage.removeItem(NOVA_DRAFT_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [input, mounted]);

  useEffect(() => {
    if (!open) return;
    const sessionId = getSessionId();
    fetch(`${API_ROUTES.chat}?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.messages?.length) {
          setMessages(dedupeChatHistory(data.messages));
          setHasGreeted(true);
        }
      })
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (open && !minimized && !hasGreeted && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: t("welcome", { name: assistantName, company: companyName }),
        },
      ]);
      setHasGreeted(true);
    }
  }, [open, minimized, hasGreeted, messages.length, t, assistantName, companyName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    if (!open || minimized) return;
    requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
  }, [open, minimized]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      setMessages((prev) => dedupeConsecutiveChatMessages([...prev, userMsg]));
      setInput("");
      try {
        sessionStorage.removeItem(NOVA_DRAFT_KEY);
      } catch {
        /* ignore */
      }
      setLoading(true);

      try {
        const res = await fetch(API_ROUTES.chat, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: getSessionId(),
            locale,
            message: trimmed,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          const code = data.code ?? res.status;
          const msg =
            code === "SERVICE_UNAVAILABLE"
              ? t("error_disabled")
              : code === "AI_QUOTA_EXCEEDED"
                ? t("error_ai_quota")
                : code === "AI_UNAVAILABLE"
                  ? t("error_ai")
                  : code === "VALIDATION_ERROR" || res.status === 400
                  ? t("error_invalid")
                  : res.status >= 500
                    ? t("error_server")
                    : t("error");
          throw new Error(msg);
        }

        const reply =
          typeof data.reply === "string"
            ? data.reply
            : typeof data.data?.reply === "string"
              ? data.data.reply
              : "";

        if (!reply) throw new Error(t("error"));

        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: "assistant", content: reply },
        ]);
      } catch (err) {
        const errorText =
          err instanceof TypeError
            ? t("error_network")
            : err instanceof Error && err.message
              ? err.message
              : t("error");
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            content: errorText,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, locale, t]
  );

  const handleSend = useCallback(
    (e?: React.SyntheticEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      void sendMessage(input);
    },
    [input, sendMessage]
  );

  const quickActions = [
    { key: "services", label: t("quick.services") },
    { key: "pricing", label: t("quick.pricing") },
    { key: "japan", label: t("quick.japan") },
    { key: "contact", label: t("quick.contact") },
  ];

  const isEdgePosition = position === "top" || position === "bottom";

  const quickPrompts: Record<string, string> = {
    services: t("prompts.services"),
    pricing: t("prompts.pricing"),
    japan: t("prompts.japan"),
    contact: t("prompts.contact"),
  };

  const stopBubble = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  const widget = (
    <div
      data-nova-chat-root
      className={cn("nova-chat-root", `nova-chat-root--${position}`)}
      aria-live="polite"
    >
      {/* Launcher */}
      <AnimatePresence>
        {mounted && !open && (
          <motion.button
            type="button"
            initial={false}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            onMouseDown={stopBubble}
            onPointerDown={stopBubble}
            className="nova-chat-launcher flex h-[4.25rem] w-[4.25rem] cursor-pointer items-center justify-center rounded-full p-0"
            aria-label={t("open")}
          >
            <NovaLauncherIcon size={68} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={false}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onMouseDown={stopBubble}
            onPointerDown={stopBubble}
            className={cn(
              "nova-chat-panel",
              `nova-chat-panel--${position}`,
              minimized && "nova-chat-panel--minimized"
            )}
          >
            <div className="nova-chat-panel__inner">
            {/* Header */}
            <div
              className={cn(
                "nova-chat-panel__header relative shrink-0 px-4 text-white",
                isEdgePosition ? "py-2" : "py-3"
              )}
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-4 left-1/4 h-20 w-20 rounded-full bg-primary-300/20 blur-xl" />
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "nova-chat-panel__avatar relative flex items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-sm",
                      isEdgePosition ? "h-8 w-8" : "h-10 w-10"
                    )}
                  >
                    <Sparkles className={isEdgePosition ? "h-4 w-4" : "h-5 w-5"} />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-primary-600 bg-emerald-400" />
                  </div>
                  <div>
                    <p className="nova-chat-panel__title font-semibold tracking-tight">{assistantName}</p>
                    {!isEdgePosition && (
                      <p className="text-xs text-primary-100">{t("subtitle", { company: companyName })}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setMinimized((m) => !m)}
                    className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-white/15"
                    aria-label={t("minimize")}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setMinimized(false);
                    }}
                    className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-white/15"
                    aria-label={t("close")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Messages */}
                <div
                  ref={scrollRef}
                  className="nova-chat-panel__messages min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain px-4 py-3 scrollbar-thin"
                >
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} compact={isEdgePosition} />
                  ))}
                  {loading && (
                    <div className={cn("flex gap-2.5", isEdgePosition && "nova-chat-bubble-row--compact")}>
                      <div className="nova-chat-bubble-avatar flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                        <Bot className="h-4 w-4" />
                      </div>
                      <TypingIndicator />
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                {messages.length <= 2 && !loading && (
                  <div
                    className={cn(
                      "nova-chat-panel__footer flex gap-2",
                      isEdgePosition ? "flex-nowrap overflow-x-auto px-2.5 py-1.5" : "flex-wrap px-4 py-3"
                    )}
                  >
                    {quickActions.map((q) => (
                      <button
                        key={q.key}
                        type="button"
                        onClick={() => void sendMessage(quickPrompts[q.key])}
                        className={cn(
                          "nova-chat-quick-action cursor-pointer rounded-full bg-white/90 font-medium text-primary-700 shadow-sm transition-all duration-300 hover:bg-primary-50 hover:text-primary-800 hover:shadow-md",
                          isEdgePosition ? "shrink-0 px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
                        )}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* div (not form) — prevents accidental page reload on Enter/submit */}
                <div
                  className="nova-chat-panel__footer nova-chat-panel__footer--input"
                  role="group"
                  aria-label={t("placeholder")}
                >
                  <div className="nova-chat-input-wrap flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDownCapture={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSend(e);
                        }
                      }}
                      placeholder={t("placeholder")}
                      autoComplete="off"
                      autoCorrect="on"
                      enterKeyHint="send"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      className="nova-chat-input-field max-h-20 min-h-[40px] flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400/90 focus:outline-none"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      disabled={!input.trim() || loading}
                      onClick={(e) => handleSend(e)}
                      className="nova-chat-send-btn flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={t("send")}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <Link
                    href={contactHref}
                    className="nova-chat-handoff-link mt-2 flex items-center justify-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-800"
                  >
                    {t("human_handoff")}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </>
            )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (!mounted) return null;
  return createPortal(widget, document.body);
}
