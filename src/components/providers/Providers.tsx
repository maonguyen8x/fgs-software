"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { DevAutoReload } from "@/components/dev/DevAutoReload";

export function Providers({
  children,
  defaultTheme = "light",
}: {
  children: React.ReactNode;
  defaultTheme?: "light" | "dark";
}) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme={defaultTheme}>
        {process.env.NODE_ENV === "development" && <DevAutoReload />}
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
