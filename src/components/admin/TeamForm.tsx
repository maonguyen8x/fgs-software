"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { Label } from "@/components/ui/label";
import { LocaleTabs } from "./LocaleTabs";
import { toast } from "sonner";

interface TeamFormProps {
  initial?: {
    id?: string;
    name: string;
    role: string;
    roleJa?: string | null;
    roleVi?: string | null;
    bio?: string | null;
    bioJa?: string | null;
    bioVi?: string | null;
    avatar?: string | null;
    experience?: number | null;
    skills: string[];
    linkedin?: string | null;
    github?: string | null;
    order: number;
    isVisible: boolean;
    featured: boolean;
  };
}

export function TeamForm({ initial }: TeamFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    role: initial?.role ?? "",
    roleJa: initial?.roleJa ?? "",
    roleVi: initial?.roleVi ?? "",
    bio: initial?.bio ?? "",
    bioJa: initial?.bioJa ?? "",
    bioVi: initial?.bioVi ?? "",
    avatar: initial?.avatar ?? "",
    experience: initial?.experience?.toString() ?? "",
    skills: initial?.skills?.join(", ") ?? "",
    linkedin: initial?.linkedin ?? "",
    github: initial?.github ?? "",
    order: initial?.order?.toString() ?? "0",
    isVisible: initial?.isVisible ?? true,
    featured: initial?.featured ?? false,
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: form.name,
      role: form.role,
      roleJa: form.roleJa || undefined,
      roleVi: form.roleVi || undefined,
      bio: form.bio || undefined,
      bioJa: form.bioJa || undefined,
      bioVi: form.bioVi || undefined,
      avatar: form.avatar || undefined,
      experience: form.experience ? parseInt(form.experience, 10) : undefined,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      linkedin: form.linkedin || undefined,
      github: form.github || undefined,
      order: parseInt(form.order, 10) || 0,
      isVisible: form.isVisible,
      featured: form.featured,
    };

    const url = initial?.id ? `/api/admin/team/${initial.id}` : "/api/admin/team";
    const method = initial?.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Failed to save");
      return;
    }
    toast.success("Saved successfully");
    router.push("/admin/team");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 rounded-lg border bg-white p-6">
      <div>
        <RequiredLabel required>Name</RequiredLabel>
        <Input className="mt-1" value={form.name} onChange={(e) => update("name", e.target.value)} required />
      </div>
      <LocaleTabs
        prefix="role"
        labels={{ en: "English", ja: "日本語", vi: "Tiếng Việt" }}
        values={form}
        onChange={update}
        required
      />
      <LocaleTabs
        prefix="bio"
        labels={{ en: "English", ja: "日本語", vi: "Tiếng Việt" }}
        values={form}
        onChange={update}
        multiline
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Avatar URL</Label>
          <Input className="mt-1" value={form.avatar} onChange={(e) => update("avatar", e.target.value)} />
        </div>
        <div>
          <Label>Years of Experience</Label>
          <Input type="number" className="mt-1" value={form.experience} onChange={(e) => update("experience", e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Skills (comma-separated)</Label>
        <Input className="mt-1" value={form.skills} onChange={(e) => update("skills", e.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>LinkedIn</Label>
          <Input className="mt-1" value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
        </div>
        <div>
          <Label>GitHub</Label>
          <Input className="mt-1" value={form.github} onChange={(e) => update("github", e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Display Order</Label>
        <Input type="number" className="mt-1 w-32" value={form.order} onChange={(e) => update("order", e.target.value)} />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))} />
          Visible
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
          Featured on Home
        </label>
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
    </form>
  );
}
