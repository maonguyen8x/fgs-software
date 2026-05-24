"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

export function ResetPasswordForm({ loginHref }: { loginHref: string }) {
  const t = useTranslations("admin.reset");
  const tl = useTranslations("admin.login");
  const te = useTranslations("admin.errors");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<"password_min" | "password_mismatch" | "reset_invalid" | "network" | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorKey(null);
    if (password.length < 8) {
      setErrorKey("password_min");
      return;
    }
    if (password !== confirm) {
      setErrorKey("password_mismatch");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        setErrorKey("reset_invalid");
        return;
      }
      setDone(true);
      setTimeout(() => router.push(loginHref), 2000);
    } catch {
      setErrorKey("network");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center bg-surface">
          <p className="text-sm text-red-600 dark:text-red-400">{t("invalid_link")}</p>
          <Link href={loginHref} className="mt-4 inline-block cursor-pointer text-primary-600 hover:underline dark:text-primary-400">
            {tl("back_to_sign_in")}
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Card className="w-full max-w-md border-primary-100/80 bg-surface shadow-xl dark:border-slate-700">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl text-primary-theme">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              {t("done")}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <RequiredLabel htmlFor="password" required>
                  {t("new_password")}
                </RequiredLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <RequiredLabel htmlFor="confirm" required>
                  {t("confirm_password")}
                </RequiredLabel>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              {errorKey && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300" role="alert">
                  {te(errorKey)}
                </div>
              )}
              <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                {loading ? t("saving") : t("submit")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
