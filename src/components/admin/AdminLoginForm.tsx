"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { BlueCheckbox } from "@/components/ui/BlueCheckbox";
import { AdminCaptchaModal } from "@/components/admin/AdminCaptchaModal";
import {
  ADMIN_CREDENTIALS_STORAGE_KEY,
  ADMIN_LOGIN_SUCCESS_FLAG,
  ADMIN_SESSION_REMEMBER_KEY,
} from "@/config/admin-auth";
import {
  clearDeviceTrustToken,
  getDeviceTrustToken,
  getOrCreateDeviceId,
  setDeviceTrustToken,
} from "@/lib/admin-device-client";
import { showAdminSuccessToast } from "@/lib/admin-toast";

type AdminErrorKey =
  | "invalid_credentials"
  | "session_expired"
  | "network"
  | "unknown"
  | "captcha_required"
  | "invalid_totp";

interface CheckCredentialsResponse {
  ok?: boolean;
  requiresCaptcha?: boolean;
  loginPendingToken?: string;
  deviceTrustToken?: string;
  error?: string;
}

interface AdminLoginFormProps {
  forgotPasswordHref?: string;
}

export function AdminLoginForm({ forgotPasswordHref = "/admin/forgot-password" }: AdminLoginFormProps) {
  const t = useTranslations("admin.login");
  const tSuccess = useTranslations("admin.login_success");
  const te = useTranslations("admin.errors");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/dashboard";
  const errorCode = searchParams.get("error") as AdminErrorKey | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [errorKey, setErrorKey] = useState<AdminErrorKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTotpStep, setShowTotpStep] = useState(false);
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [loginPendingToken, setLoginPendingToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    if (
      errorCode &&
      ["invalid_credentials", "session_expired", "network", "unknown", "captcha_required", "invalid_totp"].includes(
        errorCode
      )
    ) {
      setErrorKey(errorCode);
    }
  }, [errorCode]);

  useEffect(() => {
    try {
      const rememberSession = localStorage.getItem(ADMIN_SESSION_REMEMBER_KEY) === "true";
      const raw = localStorage.getItem(ADMIN_CREDENTIALS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { email?: string };
        if (parsed.email) setEmail(parsed.email);
        setRememberMe(true);
      } else if (rememberSession) {
        setRememberMe(true);
      }
      setDeviceId(getOrCreateDeviceId());
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  const persistRemember = (shouldRemember: boolean, savedEmail?: string) => {
    if (shouldRemember && savedEmail) {
      localStorage.setItem(ADMIN_CREDENTIALS_STORAGE_KEY, JSON.stringify({ email: savedEmail }));
      localStorage.setItem(ADMIN_SESSION_REMEMBER_KEY, "true");
    } else {
      localStorage.removeItem(ADMIN_CREDENTIALS_STORAGE_KEY);
      localStorage.removeItem(ADMIN_SESSION_REMEMBER_KEY);
    }
  };

  const finishLogin = () => {
    persistRemember(rememberMe, email.trim());
    sessionStorage.setItem(ADMIN_LOGIN_SUCCESS_FLAG, "1");
    showAdminSuccessToast(tSuccess("title"), tSuccess("subtitle"));

    const target = new URL(callbackUrl, window.location.origin);
    target.searchParams.set("login", "success");
    router.push(`${target.pathname}${target.search}`);
    router.refresh();
  };

  const parseJsonResponse = async (res: Response): Promise<CheckCredentialsResponse> => {
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return {};
    return (await res.json().catch(() => ({}))) as CheckCredentialsResponse;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorKey(null);

    const resolvedDeviceId = deviceId || getOrCreateDeviceId();
    if (!deviceId) setDeviceId(resolvedDeviceId);

    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/check-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email: email.trim(),
          password,
          totpCode: totpCode.trim() || undefined,
          rememberMe,
          deviceId: resolvedDeviceId,
          deviceTrustToken: getDeviceTrustToken(email.trim()) ?? undefined,
        }),
      });

      const data = await parseJsonResponse(res);

      if (res.status === 403 && data.error === "requires_totp") {
        setShowTotpStep(true);
        return;
      }

      if (!res.ok) {
        const isJson = (res.headers.get("content-type") ?? "").includes("application/json");

        if (data.error === "invalid_totp") {
          setErrorKey("invalid_totp");
        } else if (!isJson || res.status >= 500 || data.error === "server_error") {
          setErrorKey("network");
        } else if (data.error === "invalid_credentials") {
          clearDeviceTrustToken(email.trim());
          setErrorKey("invalid_credentials");
        } else {
          setErrorKey("invalid_credentials");
        }
        return;
      }

      if (data.ok) {
        if (data.deviceTrustToken) {
          setDeviceTrustToken(email.trim(), data.deviceTrustToken);
        }
        finishLogin();
        return;
      }

      if (data.requiresCaptcha && data.loginPendingToken) {
        setLoginPendingToken(data.loginPendingToken);
        setCaptchaOpen(true);
        return;
      }

      setErrorKey("unknown");
    } catch {
      setErrorKey("network");
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaSuccess = () => {
    setCaptchaOpen(false);
    setLoginPendingToken(null);
    finishLogin();
  };

  const handleCaptchaError = (error: "captcha_required" | "session_expired" | "network") => {
    setCaptchaOpen(false);
    setLoginPendingToken(null);
    setErrorKey(
      error === "session_expired" ? "session_expired" : error === "captcha_required" ? "captcha_required" : "network"
    );
  };

  const canSubmit = hydrated && (!showTotpStep || totpCode.length >= 6);

  return (
    <>
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f6fb] px-4 py-6 dark:bg-[#0b0f17]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.14),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.22),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-primary-400/10 blur-3xl dark:bg-primary-500/15"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 bottom-1/4 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/10"
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[380px]"
        >
          <div className="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-black/40 sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
              <div className="space-y-3.5">
                <div>
                  <RequiredLabel htmlFor="email" required>
                    {t("email")}
                  </RequiredLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder={t("email_placeholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1.5 h-11 border-slate-200/90 bg-white/90 transition-shadow focus-visible:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] dark:border-slate-600 dark:bg-slate-950/50"
                    suppressHydrationWarning
                  />
                </div>

                <div>
                  <RequiredLabel htmlFor="password" required>
                    {t("password")}
                  </RequiredLabel>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder={t("password_placeholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1.5 h-11 border-slate-200/90 bg-white/90 transition-shadow focus-visible:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] dark:border-slate-600 dark:bg-slate-950/50"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              {showTotpStep && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <RequiredLabel htmlFor="totp" required>
                    {t("totp_label")}
                  </RequiredLabel>
                  <p className="mb-1.5 text-xs text-slate-500 dark:text-slate-400">{t("totp_hint")}</p>
                  <Input
                    id="totp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    required
                    className="mt-1 h-11 max-w-[220px] tracking-[0.35em]"
                    suppressHydrationWarning
                  />
                </motion.div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
                {hydrated ? (
                  <BlueCheckbox
                    id="remember"
                    checked={rememberMe}
                    onChange={(checked) => {
                      setRememberMe(checked);
                      if (!checked) persistRemember(false);
                    }}
                    label={t("remember_password")}
                  />
                ) : (
                  <span className="h-5 w-32" />
                )}
                <Link
                  href={forgotPasswordHref}
                  className="cursor-pointer text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 hover:underline dark:text-primary-400 dark:hover:text-primary-300"
                >
                  {t("forgot_password")}
                </Link>
              </div>

              {errorKey && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-200/90 bg-red-50/90 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-300"
                  role="alert"
                >
                  {te(errorKey)}
                </motion.div>
              )}

              <Button
                type="submit"
                className="h-11 w-full cursor-pointer text-[15px] font-semibold shadow-sm shadow-primary-600/15 transition-all hover:shadow-md hover:shadow-primary-600/20"
                disabled={loading || !canSubmit}
              >
                {loading ? t("signing_in") : showTotpStep ? t("verify_and_sign_in") : t("sign_in")}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>

      {loginPendingToken && deviceId && (
        <AdminCaptchaModal
          open={captchaOpen}
          email={email.trim()}
          loginPendingToken={loginPendingToken}
          deviceId={deviceId}
          onSuccess={handleCaptchaSuccess}
          onError={handleCaptchaError}
        />
      )}
    </>
  );
}
