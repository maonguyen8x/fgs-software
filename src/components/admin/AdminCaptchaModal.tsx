"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PuzzleCaptcha } from "@/components/admin/PuzzleCaptcha";
import { setDeviceTrustToken } from "@/lib/admin-device-client";

interface AdminCaptchaModalProps {
  open: boolean;
  email: string;
  loginPendingToken: string;
  deviceId: string;
  onSuccess: (deviceTrustToken: string) => void;
  onError: (error: "captcha_required" | "session_expired" | "network") => void;
}

export function AdminCaptchaModal({
  open,
  email,
  loginPendingToken,
  deviceId,
  onSuccess,
  onError,
}: AdminCaptchaModalProps) {
  const t = useTranslations("admin.login");
  const [completing, setCompleting] = useState(false);

  if (!open) return null;

  const handleVerified = async (captchaPassToken: string) => {
    setCompleting(true);
    try {
      const res = await fetch("/api/admin/auth/complete-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ loginPendingToken, captchaPassToken, deviceId }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        deviceTrustToken?: string;
      };

      if (!res.ok || !data.ok) {
        if (data.error === "session_expired") {
          onError("session_expired");
        } else if (data.error === "captcha_required") {
          onError("captcha_required");
        } else {
          onError("network");
        }
        return;
      }

      if (data.deviceTrustToken) {
        setDeviceTrustToken(email, data.deviceTrustToken);
        onSuccess(data.deviceTrustToken);
      } else {
        onSuccess("");
      }
    } catch {
      onError("network");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-captcha-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 bg-linear-to-r from-primary-600 to-primary-700 px-5 py-4 text-white dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <h2 id="admin-captcha-title" className="text-base font-semibold sm:text-lg">
                {t("captcha_modal_title")}
              </h2>
              <p className="text-xs text-primary-100/90 sm:text-sm">{t("captcha_modal_subtitle")}</p>
            </div>
          </div>
        </div>

        <div className="relative p-4 sm:p-5">
          {completing && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-b-2xl bg-white/80 dark:bg-slate-900/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          )}
          <PuzzleCaptcha
            variant="modal"
            labels={{
              title: t("puzzle_title"),
              hint: t("puzzle_hint"),
              flipHint: t("puzzle_flip_hint"),
              drag: t("puzzle_drag"),
              flipDrag: t("puzzle_flip_drag"),
              verifying: t("puzzle_verifying"),
              success: t("puzzle_success"),
              failed: t("puzzle_failed"),
              refresh: t("puzzle_refresh"),
            }}
            onVerified={(token) => void handleVerified(token)}
            onReset={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
