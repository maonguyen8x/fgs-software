"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SecretInput } from "@/components/ui/secret-input";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { ArrowDownToLine, CheckCircle2, Mail, Save, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { EMAIL_SETTING_KEYS } from "@/lib/email/setting-keys";

type EmailForm = Record<(typeof EMAIL_SETTING_KEYS)[number], string>;

const EMPTY_FORM: EmailForm = {
  email_contact_inbox: "",
  email_gmail_user: "",
  email_gmail_app_password: "",
  email_gmail_from: "",
  email_smtp_host: "smtp.gmail.com",
  email_smtp_port: "587",
  email_smtp_secure: "false",
  email_resend_api_key: "",
  email_resend_from: "",
};

interface EmailStatus {
  configured: boolean;
  inbox: string;
  smtp: boolean;
  resend: boolean;
}

export function EmailSettingsPanel() {
  const t = useTranslations("admin.settings.email");
  const [form, setForm] = useState<EmailForm>(EMPTY_FORM);
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/email-settings");
    if (!res.ok) return;
    const data = (await res.json()) as {
      values?: EmailForm;
      status?: EmailStatus;
    };
    if (data.values) {
      setForm({ ...EMPTY_FORM, ...data.values });
    }
    if (data.status) setStatus(data.status);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = (key: keyof EmailForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/email-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      showAdminErrorToast(data.error ?? t("save_failed"));
      return;
    }
    showAdminSuccessToast(t("save_success"));
    await load();
  };

  const handleImportEnv = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/email-settings/import-env", { method: "POST" });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      showAdminErrorToast(data.error ?? t("import_failed"));
      return;
    }
    showAdminSuccessToast(data.message ?? t("import_success"));
    await load();
  };

  const handleTest = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/email-settings/test", { method: "POST" });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      showAdminErrorToast(data.error ?? t("test_failed"));
      return;
    }
    showAdminSuccessToast(t("test_success", { inbox: data.inbox ?? "" }));
    await load();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary-800">{t("title")}</h2>
            <p className="text-sm text-slate-500">{t("subtitle")}</p>
            {status && (
              <p
                className={cn(
                  "mt-1 inline-flex items-center gap-1 text-xs font-medium",
                  status.configured ? "text-emerald-700" : "text-amber-700"
                )}
              >
                {status.configured && <CheckCircle2 className="h-3.5 w-3.5" />}
                {status.configured ? t("status_ready") : t("status_missing")}
                {status.inbox ? ` → ${status.inbox}` : ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => void handleImportEnv()}
            disabled={loading}
          >
            <ArrowDownToLine className="mr-1 h-4 w-4" />
            {t("import_env")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => void handleTest()}
            disabled={loading}
          >
            <Send className="mr-1 h-4 w-4" />
            {t("test_send")}
          </Button>
          <Button
            type="button"
            size="sm"
            className="cursor-pointer"
            onClick={() => void handleSave()}
            disabled={loading}
          >
            <Save className="mr-1 h-4 w-4" />
            {loading ? t("saving") : t("save")}
          </Button>
        </div>
      </div>

      <p className="mb-4 rounded-lg border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700">
        {t("env_hint")}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>{t("contact_inbox")}</Label>
          <Input
            className="mt-1"
            value={form.email_contact_inbox}
            onChange={(e) => patch("email_contact_inbox", e.target.value)}
            placeholder="contact.fgssoftware@gmail.com"
          />
          <p className="mt-1 text-xs text-slate-500">{t("contact_inbox_hint")}</p>
        </div>

        <div>
          <Label>{t("gmail_user")}</Label>
          <Input
            className="mt-1"
            value={form.email_gmail_user}
            onChange={(e) => patch("email_gmail_user", e.target.value)}
            placeholder="contact.fgssoftware@gmail.com"
          />
        </div>
        <div>
          <Label>{t("gmail_app_password")}</Label>
          <SecretInput
            className="mt-1"
            value={form.email_gmail_app_password}
            onChange={(e) => patch("email_gmail_app_password", e.target.value)}
            placeholder={t("secret_placeholder")}
          />
        </div>
        <div className="md:col-span-2">
          <Label>{t("gmail_from")}</Label>
          <Input
            className="mt-1"
            value={form.email_gmail_from}
            onChange={(e) => patch("email_gmail_from", e.target.value)}
            placeholder="FGS Software <contact.fgssoftware@gmail.com>"
          />
        </div>

        <div>
          <Label>{t("smtp_host")}</Label>
          <Input
            className="mt-1"
            value={form.email_smtp_host}
            onChange={(e) => patch("email_smtp_host", e.target.value)}
          />
        </div>
        <div>
          <Label>{t("smtp_port")}</Label>
          <Input
            className="mt-1"
            value={form.email_smtp_port}
            onChange={(e) => patch("email_smtp_port", e.target.value)}
          />
        </div>

        <div>
          <Label>{t("resend_api_key")}</Label>
          <SecretInput
            className="mt-1"
            value={form.email_resend_api_key}
            onChange={(e) => patch("email_resend_api_key", e.target.value)}
            placeholder={t("secret_placeholder")}
          />
        </div>
        <div>
          <Label>{t("resend_from")}</Label>
          <Input
            className="mt-1"
            value={form.email_resend_from}
            onChange={(e) => patch("email_resend_from", e.target.value)}
            placeholder="FGS Software <contact@fgs-software.com>"
          />
        </div>
      </div>
    </div>
  );
}
