"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { ShieldCheck, Smartphone } from "lucide-react";

export function AdminSecuritySettingsPanel() {
  const t = useTranslations("admin.security");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [enableCode, setEnableCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [busy, setBusy] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/security/2fa");
    if (res.ok) {
      const data = (await res.json()) as { enabled: boolean };
      setEnabled(data.enabled);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const startSetup = async () => {
    setBusy(true);
    const res = await fetch("/api/admin/security/2fa/setup", { method: "POST" });
    setBusy(false);
    const data = await res.json();
    if (!res.ok) {
      showAdminErrorToast(data.error ?? t("setup_failed"));
      return;
    }
    setSetupSecret(data.secret as string);
    setQrDataUrl(data.qrDataUrl as string);
    setEnableCode("");
  };

  const confirmEnable = async () => {
    if (!setupSecret) return;
    setBusy(true);
    const res = await fetch("/api/admin/security/2fa/enable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: setupSecret, code: enableCode.trim() }),
    });
    setBusy(false);
    const data = await res.json();
    if (!res.ok) {
      showAdminErrorToast(data.error ?? t("enable_failed"));
      return;
    }
    showAdminSuccessToast(t("enable_success"));
    setSetupSecret(null);
    setQrDataUrl(null);
    setEnableCode("");
    setEnabled(true);
  };

  const disable2fa = async () => {
    setBusy(true);
    const res = await fetch("/api/admin/security/2fa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: disablePassword, code: disableCode.trim() }),
    });
    setBusy(false);
    const data = await res.json();
    if (!res.ok) {
      showAdminErrorToast(data.error ?? t("disable_failed"));
      return;
    }
    showAdminSuccessToast(t("disable_success"));
    setDisablePassword("");
    setDisableCode("");
    setEnabled(false);
  };

  if (loading) {
    return <p className="text-sm text-slate-500">{t("loading")}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t("totp_title")}</h3>
          <p className="mt-1 text-sm text-slate-500">{t("totp_desc")}</p>
          <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("status")}:{" "}
            <span className={enabled ? "text-emerald-600" : "text-amber-600"}>
              {enabled ? t("status_on") : t("status_off")}
            </span>
          </p>
        </div>
      </div>

      {!enabled && !setupSecret && (
        <Button type="button" className="cursor-pointer" onClick={() => void startSetup()} disabled={busy}>
          <Smartphone className="mr-2 h-4 w-4" />
          {t("start_setup")}
        </Button>
      )}

      {!enabled && setupSecret && qrDataUrl && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{t("scan_qr")}</p>
          <p className="mt-1 text-xs text-slate-500">{t("scan_qr_hint")}</p>
          <div className="mt-4 flex flex-wrap items-start gap-6">
            <Image src={qrDataUrl} alt="2FA QR" width={220} height={220} className="rounded-lg border" unoptimized />
            <div className="min-w-[200px] flex-1 space-y-3">
              <div>
                <Label className="text-xs text-slate-500">{t("manual_secret")}</Label>
                <p className="mt-1 break-all rounded-lg bg-slate-100 p-2 font-mono text-xs dark:bg-slate-800">{setupSecret}</p>
              </div>
              <div>
                <Label htmlFor="enable-code">{t("verify_code")}</Label>
                <Input
                  id="enable-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  className="mt-1 max-w-[180px] tracking-widest"
                  value={enableCode}
                  onChange={(e) => setEnableCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" className="cursor-pointer" disabled={busy || enableCode.length < 6} onClick={() => void confirmEnable()}>
                  {busy ? t("saving") : t("confirm_enable")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    setSetupSecret(null);
                    setQrDataUrl(null);
                  }}
                >
                  {t("cancel")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {enabled && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{t("disable_title")}</p>
          <p className="mt-1 text-xs text-slate-500">{t("disable_desc")}</p>
          <div className="mt-4 grid max-w-md gap-3">
            <div>
              <Label htmlFor="disable-password">{t("password")}</Label>
              <Input
                id="disable-password"
                type="password"
                className="mt-1"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="disable-code">{t("verify_code")}</Label>
              <Input
                id="disable-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                className="mt-1 max-w-[180px] tracking-widest"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              className="cursor-pointer w-fit"
              disabled={busy || !disablePassword || disableCode.length < 6}
              onClick={() => void disable2fa()}
            >
              {busy ? t("saving") : t("disable_btn")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
