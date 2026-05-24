"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { GoogleMapsAddressField, GoogleMapsLinkSettings } from "@/components/admin/MapLocationSettings";

const fields = [
  { key: "company_name", labelKey: "company_name" },
  { key: "admin_email", labelKey: "admin_email" },
  { key: "admin_email_cc", labelKey: "admin_email_cc" },
  { key: "address", labelKey: "address" },
  { key: "phone", labelKey: "phone" },
  { key: "working_hours", labelKey: "working_hours" },
  { key: "linkedin_url", labelKey: "linkedin_url" },
  { key: "github_url", labelKey: "github_url" },
  { key: "facebook_url", labelKey: "facebook_url" },
  { key: "ga_id", labelKey: "ga_id" },
  { key: "meta_title", labelKey: "meta_title" },
  { key: "meta_description", labelKey: "meta_description", textarea: true },
  { key: "hero_headline", labelKey: "hero_headline" },
  { key: "hero_headline_ja", labelKey: "hero_headline_ja" },
  { key: "hero_headline_vi", labelKey: "hero_headline_vi" },
  { key: "hero_subheadline", labelKey: "hero_subheadline" },
  { key: "hero_subheadline_ja", labelKey: "hero_subheadline_ja" },
  { key: "hero_subheadline_vi", labelKey: "hero_subheadline_vi" },
  { key: "chatbot_enabled", labelKey: "chatbot_enabled" },
  { key: "chatbot_name", labelKey: "chatbot_name" },
  { key: "chatbot_name_ja", labelKey: "chatbot_name_ja" },
  { key: "chatbot_name_vi", labelKey: "chatbot_name_vi" },
] as const;

const sections = [
  {
    id: "company",
    titleKey: "section_company",
    keys: ["company_name", "admin_email", "admin_email_cc", "address", "phone", "working_hours"],
  },
  { id: "social", titleKey: "section_social", keys: ["linkedin_url", "github_url", "facebook_url", "ga_id"] },
  { id: "seo", titleKey: "section_seo", keys: ["meta_title", "meta_description"] },
  {
    id: "hero",
    titleKey: "section_hero",
    keys: [
      "hero_headline",
      "hero_headline_ja",
      "hero_headline_vi",
      "hero_subheadline",
      "hero_subheadline_ja",
      "hero_subheadline_vi",
    ],
  },
  {
    id: "chatbot",
    titleKey: "section_chatbot",
    keys: ["chatbot_enabled", "chatbot_name", "chatbot_name_ja", "chatbot_name_vi"],
  },
  { id: "maps", titleKey: "section_maps", keys: [] },
] as const;

type FieldKey = (typeof fields)[number]["key"];
type SectionKey = (typeof sections)[number]["keys"][number];

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const t = useTranslations("admin.settings.form");
  const router = useRouter();
  const [values, setValues] = useState(settings);
  const [loading, setLoading] = useState(false);

  const patchValues = (patch: Record<string, string>) => {
    setValues((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);
    if (!res.ok) {
      showAdminErrorToast(t("save_failed"));
      return;
    }
    showAdminSuccessToast(t("save_success"));
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {sections.map((section) => (
        <div
          key={section.id}
          className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <h2 className="mb-4 text-lg font-semibold text-primary-700 dark:text-primary-400">
            {t(section.titleKey)}
          </h2>
          <div className="space-y-4">
            {section.id === "maps" && (
              <>
                <GoogleMapsAddressField values={values} onChange={patchValues} />
                <GoogleMapsLinkSettings values={values} onChange={patchValues} />
              </>
            )}
            {section.id !== "maps" &&
              fields
                .filter((f) => (section.keys as readonly SectionKey[]).includes(f.key as SectionKey))
                .map((field) => {
                  const { key, labelKey } = field;
                  const isTextarea = "textarea" in field && field.textarea;
                  return (
                    <div key={key}>
                      <Label>{t(labelKey)}</Label>
                      {isTextarea ? (
                        <Textarea
                          className="mt-1"
                          value={values[key] ?? ""}
                          onChange={(e) => patchValues({ [key]: e.target.value })}
                        />
                      ) : (
                        <Input
                          className="mt-1"
                          value={values[key] ?? ""}
                          onChange={(e) => patchValues({ [key]: e.target.value })}
                        />
                      )}
                    </div>
                  );
                })}
          </div>
        </div>
      ))}
      <Button type="submit" disabled={loading} className="cursor-pointer">
        {loading ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
