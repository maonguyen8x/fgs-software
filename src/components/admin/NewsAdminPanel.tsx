"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Rss } from "lucide-react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { NewsContentEditor } from "@/components/admin/NewsContentEditor";
const PAGE_SIZE_CHOICES = [10, 15, 30];
const NEWS_LOCALES = [
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "vi", label: "Tiếng Việt" },
] as const;
type NewsLocale = (typeof NEWS_LOCALES)[number]["value"];

export interface AdminNewsItem {
  id: string;
  title: string;
  titleJa: string | null;
  titleVi: string | null;
  summary: string;
  summaryJa: string | null;
  summaryVi: string | null;
  content: string;
  contentJa: string | null;
  contentVi: string | null;
  imageUrl: string | null;
  authorName: string;
  source: string;
  status: string;
  createdAt: string;
}

interface NewsAdminPanelProps {
  items: AdminNewsItem[];
  pageSize: number;
  rssFeeds: string[];
}

const AI_TOPIC_PRESETS = [
  { label: "AI", topic: "Latest developments in artificial intelligence" },
  { label: "Work processes", topic: "Modern work processes and project management in IT companies" },
  { label: "Labor law", topic: "Overview of labor law basics for employers and employees in Japan and Vietnam" },
  { label: "Insurance law", topic: "Overview of social and health insurance rules for employees in Japan and Vietnam" },
  { label: "Latest laws", topic: "Recent legal and regulatory changes affecting technology companies" },
  { label: "Technology", topic: "Technology industry news and trends" },
] as const;

const emptyForm = {
  title: "",
  titleJa: "",
  titleVi: "",
  summary: "",
  summaryJa: "",
  summaryVi: "",
  content: "",
  contentJa: "",
  contentVi: "",
  imageUrl: "",
  authorName: "",
};

function sourceLabel(source: string): string {
  try {
    const url = new URL(source);
    if (url.protocol === "https:") return url.hostname;
  } catch {
    // Manual articles use a source label rather than a URL.
  }
  return source;
}

export function NewsAdminPanel({ items, pageSize, rssFeeds: initialRssFeeds }: NewsAdminPanelProps) {
  const router = useRouter();
  const articleFormRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState(emptyForm);
  const [topic, setTopic] = useState("");
  const [aiAuthor, setAiAuthor] = useState("");
  const [selectedLocales, setSelectedLocales] = useState<NewsLocale[]>([]);
  const [contentLocale, setContentLocale] = useState<NewsLocale>("en");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [size, setSize] = useState(String(pageSize));
  const [rssFeeds, setRssFeeds] = useState(initialRssFeeds.join("\n"));

  const request = async (url: string, init: RequestInit, okMessage: string) => {
    setBusy(true);
    try {
      const res = await fetch(url, {
        ...init,
        headers: { ...init.headers, "Content-Type": "application/json" },
      });
      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const data = (await res.json()) as { error?: unknown };
          if (typeof data.error === "string") message = data.error;
          else if (Array.isArray(data.error)) {
            message = data.error
              .map((issue) =>
                issue && typeof issue === "object" && "message" in issue
                  ? String(issue.message)
                  : ""
              )
              .filter(Boolean)
              .join(". ") || message;
          }
        } catch {
          // Non-JSON responses still surface their HTTP status instead of a generic toast.
        }
        toast.error(message);
        return false;
      }
      toast.success(okMessage);
      router.refresh();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reach the server.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const createArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && selectedLocales.length === 0) {
      toast.error("Vui lòng chọn vào ngôn ngữ trước khi tạo bài viết");
      return;
    }
    const primaryLocale = selectedLocales[0] ?? "en";
    const primaryFields =
      primaryLocale === "ja"
        ? { title: form.titleJa, summary: form.summaryJa, content: form.contentJa }
        : primaryLocale === "vi"
          ? { title: form.titleVi, summary: form.summaryVi, content: form.contentVi }
          : { title: form.title, summary: form.summary, content: form.content };
    const payload = {
      ...form,
      title: form.title || primaryFields.title,
      summary: form.summary || primaryFields.summary,
      content: form.content || primaryFields.content,
      imageUrl: editingId ? form.imageUrl : form.imageUrl || undefined,
    };
    const ok = editingId
      ? await request(`/api/admin/news/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) }, "Article updated")
      : await request("/api/admin/news", { method: "POST", body: JSON.stringify({ ...payload, status: "pending" }) }, "Article created (pending approval)");
    if (ok) {
      setForm(emptyForm);
      setEditingId(null);
      setSelectedLocales([]);
      setContentLocale("en");
    }
  };

  const startEdit = (item: AdminNewsItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      titleJa: item.titleJa ?? "",
      titleVi: item.titleVi ?? "",
      summary: item.summary,
      summaryJa: item.summaryJa ?? "",
      summaryVi: item.summaryVi ?? "",
      content: item.content,
      contentJa: item.contentJa ?? "",
      contentVi: item.contentVi ?? "",
      imageUrl: item.imageUrl ?? "",
      authorName: item.authorName,
    });
    setSelectedLocales([
      "en",
      ...(item.titleJa || item.summaryJa || item.contentJa ? ["ja" as const] : []),
      ...(item.titleVi || item.summaryVi || item.contentVi ? ["vi" as const] : []),
    ]);
    setContentLocale("en");
    toast.info(`Editing: ${item.title}`);
    requestAnimationFrame(() =>
      articleFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const ensureGenerationLocales = () => {
    if (selectedLocales.length > 0) return true;
    toast.error("Vui lòng chọn vào ngôn ngữ trước khi tạo bài viết");
    return false;
  };

  const generateTopics = async (topics: readonly string[]) => {
    if (!ensureGenerationLocales()) return;
    if (!aiAuthor.trim()) {
      toast.error("Enter an author name first");
      return;
    }
    for (const t of topics) {
      const ok = await request(
        "/api/admin/news/generate",
        { method: "POST", body: JSON.stringify({ topic: t, authorName: aiAuthor, locales: selectedLocales }) },
        "AI article generated (pending approval)"
      );
      if (!ok) break;
    }
  };

  const generateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensureGenerationLocales()) return;
    const ok = await request(
      "/api/admin/news/generate",
      { method: "POST", body: JSON.stringify({ topic, authorName: aiAuthor, locales: selectedLocales }) },
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

  const saveRssFeeds = async () => {
    const feeds = rssFeeds
      .split(/\r?\n/)
      .map((feed) => feed.trim())
      .filter(Boolean);
    await request(
      "/api/admin/news/settings",
      { method: "PUT", body: JSON.stringify({ rssFeeds: feeds }) },
      "RSS feeds saved"
    );
  };

  const syncRssFeeds = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/news/sync", { method: "POST" });
      const result = (await response.json()) as {
        error?: string;
        imported?: number;
        duplicates?: number;
        rejectedMissingImage?: number;
        failedFeeds?: Array<{ feedUrl: string; error: string }>;
      };
      if (!response.ok) {
        toast.error(result.error || `RSS sync failed (${response.status}).`);
        return;
      }

      const imported = result.imported ?? 0;
      const details = [
        `${imported} imported to pending review`,
        result.duplicates ? `${result.duplicates} duplicate${result.duplicates === 1 ? "" : "s"} skipped` : "",
        result.rejectedMissingImage ? `${result.rejectedMissingImage} without images skipped` : "",
        result.failedFeeds?.length ? `${result.failedFeeds.length} feed${result.failedFeeds.length === 1 ? "" : "s"} failed` : "",
      ].filter(Boolean);
      toast.success(details.join(" · "));
      if (result.failedFeeds?.length) {
        toast.error(result.failedFeeds.map((feed) => `${sourceLabel(feed.feedUrl)}: ${feed.error}`).join("\n"));
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reach the server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_auto] md:items-end">
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

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Rss className="h-4 w-4 text-orange-600" aria-hidden />
            <Label htmlFor="news-rss-feeds">RSS feed URLs</Label>
          </div>
          <textarea
            id="news-rss-feeds"
            className="min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={rssFeeds}
            onChange={(event) => setRssFeeds(event.target.value)}
            placeholder={"https://example.com/feed.xml\nhttps://another-source.com/rss"}
            spellCheck={false}
          />
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-500">
            Add up to 10 public HTTPS feeds, one URL per line. Sync imports only entries with an image, keeps a short feed excerpt with source attribution, and saves every entry as pending until an admin approves it. Only use feeds whose terms allow reusing their excerpts and images.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={saveRssFeeds} disabled={busy} variant="outline" className="cursor-pointer">
            Save feeds
          </Button>
          <Button type="button" onClick={syncRssFeeds} disabled={busy} className="cursor-pointer">
            <RefreshCw className={`mr-2 h-4 w-4 ${busy ? "animate-spin" : ""}`} aria-hidden />
            Sync RSS now
          </Button>
        </div>
      </section>

      <form onSubmit={generateArticle} className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <div className="md:col-span-2">
          <h3 className="font-semibold text-heading">Generate with AI</h3>
          <p className="text-sm text-muted-theme">Generated articles stay pending until you approve them. Choose one or more output languages.</p>
        </div>
        <div>
          <Label>Topic</Label>
          <Input className="mt-1" value={topic} onChange={(e) => setTopic(e.target.value)} required minLength={3} />
        </div>
        <div>
          <Label>Author name</Label>
          <Input className="mt-1" value={aiAuthor} onChange={(e) => setAiAuthor(e.target.value)} required />
        </div>
        <fieldset className="space-y-2 md:col-span-2">
          <legend className="text-sm font-medium text-slate-700">Article languages</legend>
          <div className="flex flex-wrap gap-2">
            {NEWS_LOCALES.map(({ value, label }) => {
              const checked = selectedLocales.includes(value);
              return (
                <label
                  key={value}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    checked
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setSelectedLocales((current) =>
                        checked
                          ? current.filter((locale) => locale !== value)
                          : [...current, value]
                      )
                    }
                    className="accent-blue-600"
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button
            type="submit"
            disabled={busy}
            className="cursor-pointer rounded-lg shadow-sm"
            onClick={(event) => {
              if (!ensureGenerationLocales()) event.preventDefault();
            }}
          >
            {busy ? "Generating..." : "Generate"}
          </Button>
          {AI_TOPIC_PRESETS.map((p) => (
            <Button
              key={p.label}
              type="button"
              variant="outline"
              disabled={busy}
              className="cursor-pointer rounded-lg border-blue-200 bg-white text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
              onClick={() => void generateTopics([p.topic])}
            >
              Create: {p.label}
            </Button>
          ))}
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            className="cursor-pointer rounded-lg bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
            onClick={() => void generateTopics(AI_TOPIC_PRESETS.map((p) => p.topic))}
          >
            Create all topics
          </Button>
        </div>
      </form>

      <form
        ref={articleFormRef}
        id="news-article-form"
        onSubmit={createArticle}
        className="scroll-mt-24 grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <h3 className="font-semibold text-heading">{editingId ? "Edit article" : "New article"}</h3>
        </div>
        <div className="md:col-span-2">
          <LocaleTabs
            key={`${editingId ?? "new"}-title`}
            prefix="title"
            labels={{ en: "English", ja: "日本語", vi: "Tiếng Việt" }}
            values={form}
            onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
            sectionTitle="Title"
          />
        </div>
        <div>
          <Label>Author name</Label>
          <Input className="mt-1" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} required />
        </div>
        <div className="md:col-span-2">
          <LocaleTabs
            key={`${editingId ?? "new"}-summary`}
            prefix="summary"
            labels={{ en: "English", ja: "日本語", vi: "Tiếng Việt" }}
            values={form}
            onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
            multiline
            sectionTitle="Summary"
          />
        </div>
        <div className="md:col-span-2">
          <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/40 p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Article content</p>
            <div className="flex flex-wrap gap-1 border-b border-slate-200" role="tablist" aria-label="Article content language">
              {NEWS_LOCALES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={contentLocale === value}
                  onClick={() => setContentLocale(value)}
                  className={`rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                    contentLocale === value
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-slate-500 hover:text-blue-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <NewsContentEditor
              key={contentLocale}
              id={`news-content-editor-${contentLocale}`}
              value={form[contentLocale === "en" ? "content" : contentLocale === "ja" ? "contentJa" : "contentVi"]}
              onChange={(content) =>
                setForm((current) => ({
                  ...current,
                  [contentLocale === "en" ? "content" : contentLocale === "ja" ? "contentJa" : "contentVi"]: content,
                }))
              }
            />
            <p className="text-xs text-slate-500">
              Formatting supports Markdown, bold, italic, text color, font family, and letter case.
            </p>
          </div>
        </div>
        <div className="md:col-span-2">
          <Label>Image URL</Label>
          <Input
            className="mt-1"
            value={form.imageUrl}
            placeholder="Paste an image URL or upload an image below"
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <ImageUploadField
            value={form.imageUrl}
            onChange={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))}
            label="Or upload an image (up to 5 MB)"
            hint="Uploads use configured Cloudinary/Vercel Blob storage. Configure cloud storage for durable production uploads; local disk is only a fallback."
          />
          <p className="mt-2 text-xs text-slate-500">
            Image storage and delivery may use hosting/storage quota and bandwidth. Optimized, smaller images help keep usage low.
          </p>
        </div>
        <div className="md:col-span-2">
          <Button
            type="submit"
            disabled={busy}
            className="cursor-pointer"
            onClick={(event) => {
              if (!editingId && selectedLocales.length === 0) {
                event.preventDefault();
                toast.error("Vui lòng chọn vào ngôn ngữ trước khi tạo bài viết");
              }
            }}
          >
            {editingId ? "Save" : "Create"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" className="ml-2 cursor-pointer" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
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
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  {item.title}
                  <span className="ml-2 text-xs text-muted-theme">({sourceLabel(item.source)})</span>
                </td>
                <td className="px-4 py-3">{item.authorName}</td>
                <td className="px-4 py-3">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Badge variant={item.status === "active" ? "default" : "secondary"}>{item.status}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right"><div className="inline-flex items-center gap-1.5">
                  {item.status !== "active" && (
                    <Button type="button" size="sm" disabled={busy} onClick={() => setStatus(item.id, "active")} className="h-8 cursor-pointer rounded-lg border-0 bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700">
                      Approve
                    </Button>
                  )}
                  {item.status === "active" && (
                    <Button type="button" size="sm" disabled={busy} onClick={() => setStatus(item.id, "inactive")} className="h-8 cursor-pointer rounded-lg border-0 bg-slate-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-slate-700">
                      Deactivate
                    </Button>
                  )}
                  <Button type="button" size="sm" disabled={busy} onClick={() => startEdit(item)} className="h-8 cursor-pointer rounded-lg border-0 bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">
                    Edit
                  </Button>
                  <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => remove(item.id)} className="h-8 cursor-pointer rounded-lg border-red-200 px-3 text-xs font-semibold text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700">
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
