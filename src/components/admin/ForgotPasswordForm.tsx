"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

export function ForgotPasswordForm({ loginHref }: { loginHref: string }) {
  const t = useTranslations("admin.forgot");
  const tl = useTranslations("admin.login");
  const te = useTranslations("admin.errors");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorKey, setErrorKey] = useState<"email_invalid" | "request_failed" | "network" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorKey(null);
    try {
      const res = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrorKey(data.code === "EMAIL_INVALID" ? "email_invalid" : "request_failed");
        return;
      }
      setSent(true);
    } catch {
      setErrorKey("network");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Card className="w-full max-w-md border-primary-100/80 bg-surface shadow-xl dark:border-slate-700">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl text-primary-theme">{t("title")}</CardTitle>
          <p className="text-sm text-muted-theme">{t("subtitle")}</p>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              {t("sent")}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <RequiredLabel htmlFor="email" required>
                  {tl("email")}
                </RequiredLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {loading ? t("sending") : t("send")}
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-muted-theme">
            <Link href={loginHref} className="cursor-pointer font-medium text-primary-600 hover:underline dark:text-primary-400">
              {tl("back_to_sign_in")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
