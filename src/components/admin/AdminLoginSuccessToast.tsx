"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ADMIN_LOGIN_SUCCESS_FLAG } from "@/config/admin-auth";
import { showAdminSuccessToast } from "@/lib/admin-toast";

export function AdminLoginSuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("admin.login_success");
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) return;

    const fromQuery = searchParams.get("login") === "success";
    const fromStorage =
      typeof window !== "undefined" &&
      sessionStorage.getItem(ADMIN_LOGIN_SUCCESS_FLAG) === "1";

    if (!fromQuery && !fromStorage) return;

    shownRef.current = true;
    sessionStorage.removeItem(ADMIN_LOGIN_SUCCESS_FLAG);

    showAdminSuccessToast(t("title"), t("subtitle"));

    if (fromQuery) {
      window.setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("login");
        router.replace(url.pathname + url.search, { scroll: false });
      }, 300);
    }
  }, [searchParams, router, t]);

  return null;
}
