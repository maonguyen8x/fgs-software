"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocaleTabs } from "./LocaleTabs";
import { ImageUploadField } from "./ImageUploadField";
import { ImageUrlsField } from "./ImageUrlsField";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";

interface WorkFormProps {
  initial?: {
    id?: string;
    title: string;
    titleJa?: string | null;
    titleVi?: string | null;
    summary: string;
    summaryJa?: string | null;
    summaryVi?: string | null;
    description: string;
    descriptionJa?: string | null;
    descriptionVi?: string | null;
    thumbnail?: string | null;
    gallery?: string[];
    techStack: string[];
    category: string;
    duration?: string | null;
    demoUrl?: string | null;
    githubUrl?: string | null;
    order: number;
    isVisible: boolean;
    featured: boolean;
  };
}

export function WorkForm({ initial }: WorkFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    titleJa: initial?.titleJa ?? "",
    titleVi: initial?.titleVi ?? "",
    summary: initial?.summary ?? "",
    summaryJa: initial?.summaryJa ?? "",
    summaryVi: initial?.summaryVi ?? "",
    description: initial?.description ?? "",
    descriptionJa: initial?.descriptionJa ?? "",
    descriptionVi: initial?.descriptionVi ?? "",
    thumbnail: initial?.thumbnail ?? "",
    gallery: initial?.gallery ?? [],
    techStack: initial?.techStack?.join(", ") ?? "",
    category: initial?.category ?? "web",
    duration: initial?.duration ?? "",
    demoUrl: initial?.demoUrl ?? "",
    githubUrl: initial?.githubUrl ?? "",
    order: initial?.order?.toString() ?? "0",
    isVisible: initial?.isVisible ?? true,
    featured: initial?.featured ?? false,
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
      description: form.description,
      descriptionJa: form.descriptionJa || undefined,
      descriptionVi: form.descriptionVi || undefined,
      thumbnail: form.thumbnail || undefined,
      gallery: form.gallery.filter((url) => url.trim().length > 0),
      techStack: form.techStack.split(",").map((s) => s.trim()).filter(Boolean),
      category: form.category,
      duration: form.duration || undefined,
      demoUrl: form.demoUrl || undefined,
      githubUrl: form.githubUrl || undefined,
      order: parseInt(form.order, 10) || 0,
      isVisible: form.isVisible,
      featured: form.featured,
    };

    const url = initial?.id ? `/api/admin/works/${initial.id}` : "/api/admin/works";
    const method = initial?.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      showAdminErrorToast("Failed to save work");
      return;
    }
    showAdminSuccessToast("Work saved");
    router.push("/admin/works");
    router.refresh();
  };

  const tabLabels = { en: "English", ja: "日本語", vi: "Tiếng Việt" };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 rounded-xl border bg-white p-8 shadow-sm">
      <LocaleTabs
        prefix="title"
        labels={tabLabels}
        values={{ title: form.title, titleJa: form.titleJa, titleVi: form.titleVi }}
        onChange={update}
        required
      />
      <LocaleTabs
        prefix="summary"
        labels={tabLabels}
        values={{ summary: form.summary, summaryJa: form.summaryJa, summaryVi: form.summaryVi }}
        onChange={update}
        required
      />
      <LocaleTabs
        prefix="description"
        labels={tabLabels}
        values={{
          description: form.description,
          descriptionJa: form.descriptionJa,
          descriptionVi: form.descriptionVi,
        }}
        onChange={update}
        multiline
        required
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Category</Label>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="api">API</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <Label>Duration</Label>
          <Input className="mt-1" value={form.duration} onChange={(e) => update("duration", e.target.value)} />
        </div>
        <div>
          <Label>Tech stack (comma-separated)</Label>
          <Input className="mt-1" value={form.techStack} onChange={(e) => update("techStack", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <ImageUploadField
            label="Ảnh đại diện sản phẩm"
            hint="Hiển thị trên danh sách Sản phẩm và đầu trang chi tiết"
            value={form.thumbnail}
            onChange={(url) => update("thumbnail", url)}
          />
        </div>
        <div className="md:col-span-2">
          <ImageUrlsField
            label="Thư viện hình ảnh sản phẩm"
            hint="Chọn nhiều ảnh cùng lúc — hiển thị trên trang chi tiết khi khách bấm Xem chi tiết."
            urls={form.gallery}
            onChange={(gallery) => setForm((f) => ({ ...f, gallery }))}
          />
        </div>
        <div>
          <Label>Demo URL</Label>
          <Input className="mt-1" value={form.demoUrl} onChange={(e) => update("demoUrl", e.target.value)} />
        </div>
        <div>
          <Label>GitHub URL</Label>
          <Input className="mt-1" value={form.githubUrl} onChange={(e) => update("githubUrl", e.target.value)} />
        </div>
        <div>
          <Label>Order</Label>
          <Input type="number" className="mt-1" value={form.order} onChange={(e) => update("order", e.target.value)} />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))}
          />
          Visible
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
          />
          Featured on homepage
        </label>
      </div>

      <Button type="submit" disabled={loading} className="cursor-pointer">
        {loading ? "Saving..." : "Save Work"}
      </Button>
    </form>
  );
}
