import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { MessageStatusButton } from "@/components/admin/MessageStatusButton";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { format } from "date-fns";

export default async function AdminMessagesPage() {
  const messages = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AdminPageShell title="Contact Messages">
      <div className="space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="rounded-lg border bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{msg.name} — {msg.email}</p>
                {msg.company && <p className="text-sm text-slate-500">{msg.company}</p>}
                <p className="mt-1 text-xs text-slate-400">{format(msg.createdAt, "PPpp")}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{msg.status}</Badge>
                <MessageStatusButton id={msg.id} currentStatus={msg.status} />
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
              {msg.projectType && <p><strong>Project:</strong> {msg.projectType}</p>}
              {msg.budget && <p><strong>Budget:</strong> {msg.budget}</p>}
              {msg.phone && <p><strong>Phone:</strong> {msg.phone}</p>}
            </div>
            <p className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm">{msg.message}</p>
          </div>
        ))}
        {messages.length === 0 && <p className="text-slate-500">No messages yet.</p>}
      </div>
    </AdminPageShell>
  );
}
