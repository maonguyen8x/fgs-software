import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { BRAND } from "@/config/brand";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const notoJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: BRAND.companyName,
  description: "IT Outsourcing Partner in Vietnam",
  icons: {
    icon: [{ url: BRAND.logoPath, type: "image/svg+xml" }, { url: BRAND.logoPngPath }],
    apple: BRAND.logoPngPath,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${notoJp.variable} bg-theme font-sans text-theme antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
