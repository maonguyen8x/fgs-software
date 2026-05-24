"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocaleTabs } from "./LocaleTabs";
import { toast } from "sonner";

interface BlogFormProps {
  initial?: {
    id?: string;
    title: string;
    titleJa?: string | null;
    titleVi?: string | null;
    summary: string;
    summaryJa?: string | null;
    summaryVi?: string | null;
    content: string;
    contentJa?: string | null;
    contentVi?: string | null;
    thumbnail?: string | null;
    tags: string[];
    status: string;
    publishedAt?: Date | string | null;
  };
}

export function BlogForm({ initial }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    titleJa: initial?.titleJa ?? "",
    titleVi: initial?.titleVi ?? "",
    summary: initial?.summary ?? "",
    summaryJa: initial?.summaryJa ?? "",
    summaryVi: initial?.summaryVi ?? "",
    content: initial?.content ?? "",
    contentJa: initial?.contentJa ?? "",
    contentVi: initial?.contentVi ?? "",
    thumbnail: initial?.thumbnail ?? "",
    tags: initial?.tags?.join(", ") ?? "",
    status: initial?.status ?? "draft",
    publishedAt: initial?.publishedAt
      ? new Date(initial.publishedAt).toISOString().slice(0, 16)
      : "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title: form.title,
      titleJa: form.titleJa || undefined,
      titleVi: form.titleVi || undefined,
      summary: form.summary,
      summaryJa: form.summaryJa || undefined,
      summaryVi: form.summaryVi || undefined,
      content: form.content,
      contentJa: form.contentJa || undefined,
      contentVi: form.contentVi || undefined,
      thumbnail: form.thumbnail || undefined,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      status: form.status,
      publishedAt: form.status === "published" && form.publishedAt
        ? new Date(form.publishedAt).toISOString()
        : form.status === "published"
          ? new Date().toISOString()
          : null,
    };

    const url = initial?.id ? `/api/admin/blog/${initial.id}` : "/api/admin/blog";
    const method = initial?.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Failed to save post");
      return;
    }
    toast.success("Post saved");
    router.push("/admin/blog");
    router.refresh();
  };

  const tabLabels = { en: "English", ja: "日本語", vi: "Tiếng Việt" };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 rounded-xl border bg-white p-8 shadow-sm">
      <LocaleTabs prefix="title" labels={tabLabels} values={form} onChange={update} required />
      <LocaleTabs prefix="summary" labels={tabLabels} values={form} onChange={update} required />
      <LocaleTabs prefix="content" labels={tabLabels} values={form} onChange={update} multiline required />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Thumbnail URL</Label>
          <Input className="mt-1" value={form.thumbnail} onChange={(e) => update("thumbnail", e.target.value)} />
        </div>
        <div>
          <Label>Tags (comma-separated)</Label>
          <Input className="mt-1" value={form.tags} onChange={(e) => update("tags", e.target.value)} />
        </div>
        <div>
          <Label>Status</Label>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        {form.status === "published" && (
          <div>
            <Label>Published at</Label>
            <Input
              type="datetime-local"
              className="mt-1"
              value={form.publishedAt}
              onChange={(e) => update("publishedAt", e.target.value)}
            />
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading} className="cursor-pointer">
        {loading ? "Saving..." : "Save Post"}
      </Button>
    </form>
  );
}
