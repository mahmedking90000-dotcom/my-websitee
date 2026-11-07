"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, RefreshCw } from "lucide-react";
import { useWorkspacePreferences } from "@/components/workspace-preferences";

type ProjectChatMessage = {
  id: string;
  senderId: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  sender: { name: string | null; role: string };
};

type ProjectChatProps = {
  projectId: string;
  isAdmin?: boolean;
};

export default function ProjectChat({ projectId, isAdmin = false }: ProjectChatProps) {
  const { locale, t } = useWorkspacePreferences();
  const [messages, setMessages] = useState<ProjectChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/messages`, {
        method: "GET",
        cache: "no-store"
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("messageLoadError"));
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      if (typeof data.currentUserId === "string") setCurrentUserId(data.currentUserId);
      setError("");
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : t("messageLoadError"));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [projectId, t]);

  useEffect(() => {
    void loadMessages();
    const timer = window.setInterval(() => {
      if (!document.hidden) void loadMessages(true);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("messageSendError"));
      setDraft("");
      await loadMessages(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("messageSendError"));
    } finally {
      setSending(false);
    }
  }

  const ownAlignment = locale === "ar" ? "justify-start" : "justify-end";
  const otherAlignment = locale === "ar" ? "justify-end" : "justify-start";

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[.045] shadow-xl shadow-black/10">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-400/15 text-violet-200">
            <MessageCircle size={19} />
          </span>
          <div>
            <h2 className="font-bold">{isAdmin ? t("clientChat") : t("conversationWithNova")}</h2>
            <p className="mt-1 text-xs text-white/45">{t("autoRefresh")}</p>
          </div>
        </div>
        <button type="button" onClick={() => void loadMessages()} aria-label={t("refreshMessages")} title={t("refreshMessages")} className="rounded-lg border border-white/10 p-2 text-white/60 hover:bg-white/5">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="max-h-[480px] min-h-[220px] space-y-3 overflow-y-auto p-4 sm:p-5" aria-live="polite">
        {loading && <p className="py-10 text-center text-sm text-white/45">{t("loadingConversation")}</p>}
        {!loading && messages.length === 0 && (
          <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
            <MessageCircle size={28} className="text-violet-200/60" />
            <p className="mt-3 font-semibold text-white/75">{t("startConversation")}</p>
            <p className="mt-1 text-sm text-white/40">{isAdmin ? t("sendToClient") : t("sendToTeam")}</p>
          </div>
        )}
        {messages.map(message => {
          const mine = message.senderId === currentUserId;
          const senderName = mine
            ? t("you")
            : message.sender?.name || (isAdmin ? t("customer") : t("novaTeam"));
          return (
            <div key={message.id} className={`flex ${mine ? ownAlignment : otherAlignment}`}>
              <div
                data-message-owner={mine ? "self" : "other"}
                className={`chat-message-bubble max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[78%] ${mine ? "chat-message-own rounded-tr-sm" : "chat-message-other rounded-tl-sm"}`}
              >
                <div className="chat-message-meta mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                  <span className="font-semibold">{senderName}</span>
                  <span>·</span>
                  <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString(locale === "ar" ? "ar-EG" : "en-US", { dateStyle: "short", timeStyle: "short" })}</time>
                </div>
                <p className="chat-message-body whitespace-pre-wrap break-words text-sm leading-7">{message.body}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t border-white/10 p-3 sm:p-4">
        <label className="sr-only" htmlFor={`message-${projectId}`}>{t("messagePlaceholder")}</label>
        <div className="flex items-end gap-2">
          <textarea
            id={`message-${projectId}`}
            value={draft}
            onChange={event => setDraft(event.target.value)}
            maxLength={5000}
            rows={2}
            placeholder={t("messagePlaceholder")}
            className="min-h-[52px] flex-1 resize-y rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-violet-300/50"
          />
          <button type="submit" disabled={!draft.trim() || sending} className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-xl bg-violet-300 text-slate-950 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-40" aria-label={t("send")}>
            <Send size={18} />
          </button>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-rose-300">{error}</p>}
        <p className="mt-2 text-[10px] text-white/30">{t("max5000")} · {t("safetyNote")}</p>
      </form>
    </section>
  );
}
