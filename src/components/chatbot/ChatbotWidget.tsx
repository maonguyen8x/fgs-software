"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Send,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Bot,
  User,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { API_ROUTES } from "@/config/api-routes";
import { useMounted } from "@/hooks/use-mounted";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatbotWidgetProps {
  companyName: string;
  assistantName?: string;
  contactHref: string;
}

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
    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white/90 px-4 py-3 shadow-sm ring-1 ring-slate-200/80">
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

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary-600 text-white" : "bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isUser
            ? "rounded-br-md bg-primary-600 text-white"
            : "rounded-bl-md bg-white/95 text-slate-700 ring-1 ring-slate-200/80"
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
    if (!open) return;
    const sessionId = getSessionId();
    fetch(`${API_ROUTES.chat}?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.messages?.length) {
          setMessages(data.messages);
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
    if (open && !minimized) inputRef.current?.focus();
  }, [open, minimized]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
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
            : code === "AI_UNAVAILABLE"
              ? t("error_ai")
            : code === "VALIDATION_ERROR" || res.status === 400
              ? t("error_invalid")
              : res.status >= 500
                ? t("error_server")
                : t("error");
        throw new Error(msg);
      }

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      const text =
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
          content: text,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { key: "services", label: t("quick.services") },
    { key: "pricing", label: t("quick.pricing") },
    { key: "japan", label: t("quick.japan") },
    { key: "contact", label: t("quick.contact") },
  ];

  const quickPrompts: Record<string, string> = {
    services: t("prompts.services"),
    pricing: t("prompts.pricing"),
    japan: t("prompts.japan"),
    contact: t("prompts.contact"),
  };

  return (
    <>
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
            className="fixed bottom-6 right-6 z-[200] flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 text-white shadow-2xl shadow-primary-500/40 ring-4 ring-white/80"
            aria-label={t("open")}
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-primary-400/30" />
            <MessageCircle className="relative h-7 w-7" />
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-950 shadow">
              AI
            </span>
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
              height: minimized ? "auto" : undefined,
            }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className={cn(
              "fixed bottom-6 right-6 z-[200] flex w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-3xl shadow-2xl shadow-primary-900/20 ring-1 ring-white/20",
              minimized ? "h-auto" : "h-[min(85vh,640px)]"
            )}
            style={{
              background:
                "linear-gradient(165deg, rgba(255,255,255,0.98) 0%, rgba(239,246,255,0.95) 50%, rgba(219,234,254,0.9) 100%)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div className="relative overflow-hidden border-b border-white/60 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 px-4 py-4 text-white">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-4 left-1/4 h-20 w-20 rounded-full bg-primary-300/20 blur-xl" />
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-sm">
                    <Sparkles className="h-5 w-5" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-primary-600 bg-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold tracking-tight">{assistantName}</p>
                    <p className="text-xs text-primary-100">{t("subtitle", { company: companyName })}</p>
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
                  className="flex-1 space-y-4 overflow-y-auto px-4 py-4 scrollbar-thin"
                >
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  {loading && (
                    <div className="flex gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                        <Bot className="h-4 w-4" />
                      </div>
                      <TypingIndicator />
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                {messages.length <= 2 && !loading && (
                  <div className="flex flex-wrap gap-2 border-t border-slate-200/60 bg-white/40 px-4 py-3">
                    {quickActions.map((q) => (
                      <button
                        key={q.key}
                        type="button"
                        onClick={() => sendMessage(quickPrompts[q.key])}
                        className="cursor-pointer rounded-full border border-primary-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-primary-700 shadow-sm transition-all hover:border-primary-400 hover:bg-primary-50 hover:shadow"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="border-t border-slate-200/60 bg-white/60 p-4">
                  <div className="flex items-end gap-2 rounded-2xl bg-white p-2 shadow-inner ring-1 ring-slate-200/80">
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(input);
                        }
                      }}
                      placeholder={t("placeholder")}
                      className="max-h-24 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || loading}
                      className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary-600 text-white transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={t("send")}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <Link
                    href={contactHref}
                    className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-800"
                  >
                    {t("human_handoff")}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
