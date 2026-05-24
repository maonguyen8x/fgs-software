"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { BlueCheckbox } from "@/components/ui/BlueCheckbox";
import { LocaleTabs } from "./LocaleTabs";
import { AvatarImageEditor } from "./AvatarImageEditor";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";

interface FounderFormProps {
  initial?: {
    id?: string;
    name: string;
    role: string;
    roleJa?: string | null;
    roleVi?: string | null;
    slogan?: string | null;
    sloganJa?: string | null;
    sloganVi?: string | null;
    bio?: string | null;
    bioJa?: string | null;
    bioVi?: string | null;
    skills?: string[];
    avatar?: string | null;
    order: number;
    isVisible: boolean;
  };
}

export function FounderForm({ initial }: FounderFormProps) {
  const t = useTranslations("admin.founders");
  const te = useTranslations("admin.founders.errors");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [skillsInput, setSkillsInput] = useState((initial?.skills ?? []).join(", "));
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    role: initial?.role ?? "",
    roleJa: initial?.roleJa ?? "",
    roleVi: initial?.roleVi ?? "",
    slogan: initial?.slogan ?? "",
    sloganJa: initial?.sloganJa ?? "",
    sloganVi: initial?.sloganVi ?? "",
    bio: initial?.bio ?? "",
    bioJa: initial?.bioJa ?? "",
    bioVi: initial?.bioVi ?? "",
    avatar: initial?.avatar ?? "",
    order: initial?.order?.toString() ?? "0",
    isVisible: initial?.isVisible ?? true,
    syncToTeam: true,
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      role: form.role,
      roleJa: form.roleJa || undefined,
      roleVi: form.roleVi || undefined,
      slogan: form.slogan || undefined,
      sloganJa: form.sloganJa || undefined,
      sloganVi: form.sloganVi || undefined,
      bio: form.bio || undefined,
      bioJa: form.bioJa || undefined,
      bioVi: form.bioVi || undefined,
      skills,
      avatar: form.avatar || undefined,
      order: parseInt(form.order, 10) || 0,
      isVisible: form.isVisible,
      syncToTeam: form.syncToTeam,
    };

    const url = initial?.id ? `/api/admin/founders/${initial.id}` : "/api/admin/founders";
    const method = initial?.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      showAdminErrorToast(te("save_failed"));
      return;
    }
    showAdminSuccessToast(t("saved"));
    router.push("/admin/founders");
    router.refresh();
  };

  const tabLabels = { en: t("locale_en"), ja: t("locale_ja"), vi: t("locale_vi") };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-5 rounded-xl border border-theme bg-surface p-6 shadow-sm">
      <div>
        <RequiredLabel htmlFor="founder-name" required>
          {t("name")}
        </RequiredLabel>
        <Input id="founder-name" className="mt-1" value={form.name} onChange={(e) => update("name", e.target.value)} required />
      </div>

      <LocaleTabs prefix="role" labels={tabLabels} values={form} onChange={update} required />

      <div>
        <Label>{t("skills")}</Label>
        <Input
          className="mt-1"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          placeholder={t("skills_placeholder")}
        />
      </div>

      <LocaleTabs prefix="slogan" labels={tabLabels} values={form} onChange={update} multiline />

      <LocaleTabs prefix="bio" labels={tabLabels} values={form} onChange={update} multiline />

      <div>
        <Label>{t("avatar")}</Label>
        <div className="mt-2">
          <AvatarImageEditor value={form.avatar} onChange={(url) => update("avatar", url)} />
        </div>
      </div>

      <div>
        <Label>{t("order")}</Label>
        <Input type="number" className="mt-1 w-32" value={form.order} onChange={(e) => update("order", e.target.value)} />
      </div>

      <BlueCheckbox
        id="founder-visible"
        checked={form.isVisible}
        onChange={(checked) => setForm((f) => ({ ...f, isVisible: checked }))}
        label={t("visible")}
      />
      <BlueCheckbox
        id="founder-sync-team"
        checked={form.syncToTeam}
        onChange={(checked) => setForm((f) => ({ ...f, syncToTeam: checked }))}
        label={t("sync_team")}
      />

      <Button type="submit" disabled={loading} className="cursor-pointer">
        {loading ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
