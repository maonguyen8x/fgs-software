"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { BlueCheckbox } from "@/components/ui/BlueCheckbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import {
  ADMIN_CREDENTIALS_STORAGE_KEY,
  ADMIN_LOGIN_SUCCESS_FLAG,
  ADMIN_SESSION_REMEMBER_KEY,
} from "@/config/admin-auth";
import { showAdminSuccessToast } from "@/lib/admin-toast";

type AdminErrorKey =
  | "invalid_credentials"
  | "session_expired"
  | "network"
  | "unknown";

interface AdminLoginFormProps {
  forgotPasswordHref?: string;
}

interface StoredCredentials {
  email: string;
  password: string;
}

export function AdminLoginForm({ forgotPasswordHref = "/admin/forgot-password" }: AdminLoginFormProps) {
  const t = useTranslations("admin.login");
  const tSuccess = useTranslations("admin.login_success");
  const te = useTranslations("admin.errors");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/en";
  const errorCode = searchParams.get("error") as AdminErrorKey | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [errorKey, setErrorKey] = useState<AdminErrorKey | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (errorCode && ["invalid_credentials", "session_expired", "network", "unknown"].includes(errorCode)) {
      setErrorKey(errorCode);
    }
  }, [errorCode]);

  useEffect(() => {
    try {
      const rememberSession = localStorage.getItem(ADMIN_SESSION_REMEMBER_KEY) === "true";
      const raw = localStorage.getItem(ADMIN_CREDENTIALS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredCredentials;
        if (parsed.email) setEmail(parsed.email);
        if (parsed.password) setPassword(parsed.password);
        setRememberMe(true);
      } else if (rememberSession) {
        setRememberMe(true);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  const persistRemember = (shouldRemember: boolean, creds?: StoredCredentials) => {
    if (shouldRemember && creds) {
      localStorage.setItem(ADMIN_CREDENTIALS_STORAGE_KEY, JSON.stringify(creds));
      localStorage.setItem(ADMIN_SESSION_REMEMBER_KEY, "true");
    } else {
      localStorage.removeItem(ADMIN_CREDENTIALS_STORAGE_KEY);
      localStorage.removeItem(ADMIN_SESSION_REMEMBER_KEY);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorKey(null);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        rememberMe: rememberMe ? "true" : "false",
        redirect: false,
      });

      if (result?.error) {
        setErrorKey("invalid_credentials");
        return;
      }

      persistRemember(rememberMe, { email: email.trim(), password });

      sessionStorage.setItem(ADMIN_LOGIN_SUCCESS_FLAG, "1");
      showAdminSuccessToast(tSuccess("title"), tSuccess("subtitle"));

      const target = new URL(callbackUrl, window.location.origin);
      target.searchParams.set("login", "success");
      router.push(`${target.pathname}${target.search}`);
      router.refresh();
    } catch {
      setErrorKey("network");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4 pb-12 pt-16 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:pt-20">
      <Card className="w-full max-w-md border-primary-100/80 bg-surface shadow-xl shadow-primary-900/10 dark:border-slate-700">
        <CardHeader className="space-y-2 pb-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-600/35">
            <Shield className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl text-primary-theme">{t("title")}</CardTitle>
          <p className="text-sm text-muted-theme">{t("subtitle")}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            <div>
              <RequiredLabel htmlFor="email" required>
                {t("email")}
              </RequiredLabel>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                suppressHydrationWarning
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
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
                className="cursor-pointer text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
              >
                {t("forgot_password")}
              </Link>
            </div>
            {errorKey && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
                role="alert"
              >
                {te(errorKey)}
              </div>
            )}
            <Button type="submit" className="w-full cursor-pointer" disabled={loading || !hydrated}>
              {loading ? t("signing_in") : t("sign_in")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
