"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
const PAGE_SIZE_CHOICES = [10, 15, 30];

export interface AdminNewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  authorName: string;
  source: string;
  status: string;
  createdAt: string;
}

interface NewsAdminPanelProps {
  items: AdminNewsItem[];
  pageSize: number;
}

const AI_TOPIC_PRESETS = [
  { label: "AI", topic: "Latest developments in artificial intelligence" },
  { label: "Work processes", topic: "Modern work processes and project management in IT companies" },
  { label: "Labor law", topic: "Overview of labor law basics for employers and employees in Japan and Vietnam" },
  { label: "Insurance law", topic: "Overview of social and health insurance rules for employees in Japan and Vietnam" },
  { label: "Latest laws", topic: "Recent legal and regulatory changes affecting technology companies" },
  { label: "Technology", topic: "Technology industry news and trends" },
] as const;

const emptyForm = { title: "", summary: "", content: "", imageUrl: "", authorName: "" };

export function NewsAdminPanel({ items, pageSize }: NewsAdminPanelProps) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [topic, setTopic] = useState("");
  const [aiAuthor, setAiAuthor] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [size, setSize] = useState(String(pageSize));

  const request = async (url: string, init: RequestInit, okMessage: string) => {
    setBusy(true);
    try {
      const res = await fetch(url, {
        ...init,
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(typeof data.error === "string" ? data.error : "Request failed");
        return false;
      }
      toast.success(okMessage);
      router.refresh();
      return true;
    } finally {
      setBusy(false);
    }
  };

  const createArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, imageUrl: form.imageUrl || undefined };
    const ok = editingId
      ? await request(`/api/admin/news/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) }, "Article updated")
      : await request("/api/admin/news", { method: "POST", body: JSON.stringify({ ...payload, status: "pending" }) }, "Article created (pending approval)");
    if (ok) {
      setForm(emptyForm);
      setEditingId(null);
    }
  };

  const startEdit = (item: AdminNewsItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      summary: item.summary,
      content: item.content,
      imageUrl: item.imageUrl ?? "",
      authorName: item.authorName,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const generateTopics = async (topics: readonly string[]) => {
    if (!aiAuthor.trim()) {
      toast.error("Enter an author name first");
      return;
    }
    for (const t of topics) {
      const ok = await request(
        "/api/admin/news/generate",
        { method: "POST", body: JSON.stringify({ topic: t, authorName: aiAuthor }) },
        "AI article generated (pending approval)"
      );
      if (!ok) break;
    }
  };

  const generateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await request(
      "/api/admin/news/generate",
      { method: "POST", body: JSON.stringify({ topic, authorName: aiAuthor }) },
      "AI article generated (pending approval)"
    );
    if (ok) setTopic("");
  };

  const setStatus = (id: string, status: "pending" | "active" | "inactive") =>
    request(`/api/admin/news/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, `Status set to ${status}`);

  const remove = async (id: string) => {
    if (!window.confirm("Delete this article?")) return;
    await request(`/api/admin/news/${id}`, { method: "DELETE" }, "Article deleted");
  };

  const savePageSize = async () => {
    await request("/api/admin/news/settings", { method: "PUT", body: JSON.stringify({ pageSize: Number(size) }) }, "Page size saved");
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 rounded-xl border bg-white p-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Label>Articles per page (News page)</Label>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2 md:w-48"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            {PAGE_SIZE_CHOICES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={savePageSize} disabled={busy} className="cursor-pointer">
          Save page size
        </Button>
      </section>

      <form onSubmit={generateArticle} className="grid gap-4 rounded-xl border bg-white p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <h3 className="font-semibold text-heading">Generate with AI (Ollama)</h3>
          <p className="text-sm text-muted-theme">Generated articles stay pending until you approve them.</p>
        </div>
        <div>
          <Label>Topic</Label>
          <Input className="mt-1" value={topic} onChange={(e) => setTopic(e.target.value)} required minLength={3} />
        </div>
        <div>
          <Label>Author name</Label>
          <Input className="mt-1" value={aiAuthor} onChange={(e) => setAiAuthor(e.target.value)} required />
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button type="submit" disabled={busy} className="cursor-pointer">
            {busy ? "Generating..." : "Generate"}
          </Button>
          {AI_TOPIC_PRESETS.map((p) => (
            <Button key={p.label} type="button" variant="outline" disabled={busy} className="cursor-pointer" onClick={() => void generateTopics([p.topic])}>
              Create: {p.label}
            </Button>
          ))}
          <Button type="button" variant="secondary" disabled={busy} className="cursor-pointer" onClick={() => void generateTopics(AI_TOPIC_PRESETS.map((p) => p.topic))}>
            Create all topics
          </Button>
        </div>
      </form>

      <form onSubmit={createArticle} className="grid gap-4 rounded-xl border bg-white p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <h3 className="font-semibold text-heading">{editingId ? "Edit article" : "New article"}</h3>
        </div>
        <div>
          <Label>Title</Label>
          <Input className="mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <Label>Author name</Label>
          <Input className="mt-1" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} required />
        </div>
        <div className="md:col-span-2">
          <Label>Summary</Label>
          <Input className="mt-1" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} required />
        </div>
        <div className="md:col-span-2">
          <Label>Content</Label>
          <textarea
            className="mt-1 min-h-32 w-full rounded-lg border px-3 py-2 text-sm"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label>Image URL</Label>
          <Input className="mt-1" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={busy} className="cursor-pointer">
            {editingId ? "Save" : "Create"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" className="ml-2 cursor-pointer" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Author</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">
                  {item.title}
                  <span className="ml-2 text-xs text-muted-theme">({item.source})</span>
                </td>
                <td className="px-4 py-3">{item.authorName}</td>
                <td className="px-4 py-3">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Badge variant={item.status === "active" ? "default" : "secondary"}>{item.status}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right"><div className="inline-flex items-center gap-1.5">
                  {item.status !== "active" && (
                    <Button size="sm" disabled={busy} onClick={() => setStatus(item.id, "active")} className="h-8 cursor-pointer rounded-lg border-0 px-3 text-xs font-semibold text-white shadow-sm bg-emerald-600 hover:bg-emerald-700">
                      Approve
                    </Button>
                  )}
                  {item.status === "active" && (
                    <Button size="sm" disabled={busy} onClick={() => setStatus(item.id, "inactive")} className="h-8 cursor-pointer rounded-lg border-0 px-3 text-xs font-semibold text-white shadow-sm bg-fuchsia-500 hover:bg-fuchsia-600">
                      Deactivate
                    </Button>
                  )}
                  <Button size="sm" disabled={busy} onClick={() => startEdit(item)} className="h-8 cursor-pointer rounded-lg border-0 px-3 text-xs font-semibold text-white shadow-sm bg-blue-600 hover:bg-blue-700">
                    Edit
                  </Button>
                  <Button size="sm" disabled={busy} onClick={() => remove(item.id)} className="h-8 cursor-pointer rounded-lg border-0 px-3 text-xs font-semibold text-white shadow-sm bg-red-600 hover:bg-red-700">
                    Delete
                  </Button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
