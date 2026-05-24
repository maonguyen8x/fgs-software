import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminChatPage() {
  const sessions = await prisma.chatSession.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
    take: 50,
  });

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold">AI Chat Conversations</h1>
      <p className="mb-8 text-sm text-slate-500">
        Visitor conversations from the website chatbot assistant.
      </p>
      <div className="space-y-6">
        {sessions.map((session) => (
          <div key={session.id} className="overflow-hidden rounded-xl border bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-5 py-3">
              <div>
                <p className="font-medium text-slate-900">
                  {session.visitorName ?? "Anonymous visitor"}
                </p>
                <p className="text-xs text-slate-500">
                  {session.email ?? "No email"} · Locale: {session.locale} ·{" "}
                  {format(session.updatedAt, "PPpp")}
                </p>
              </div>
              <Badge>{session.messages.length} messages</Badge>
            </div>
            <div className="max-h-80 space-y-3 overflow-y-auto p-5">
              {session.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={
                    msg.role === "user"
                      ? "ml-8 rounded-lg bg-primary-50 px-4 py-2 text-sm"
                      : "mr-8 rounded-lg bg-slate-100 px-4 py-2 text-sm"
                  }
                >
                  <span className="mb-1 block text-xs font-semibold uppercase text-slate-400">
                    {msg.role}
                  </span>
                  <p className="whitespace-pre-wrap text-slate-700">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <p className="text-center text-slate-500">No chat sessions yet.</p>
        )}
      </div>
    </div>
  );
}
