import type { Metadata } from "next";
import { branding } from "@/lib/config";
import { ThemeScript } from "@/components/theme";
import { CookieConsent } from "@/components/CookieConsent";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${branding.appName} — ${branding.companyName}`,
    template: `%s · ${branding.appName}`,
  },
  description: `${branding.companyName}: ${branding.tagline}. Live-streaming + VOD powered by ${branding.currencyName}.`,
  applicationName: branding.appName,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Dark-first; ThemeScript flips data-theme from localStorage before paint (no flash).
    <html lang="en" data-theme={branding.defaultTheme} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <ThemeScript />
      </head>
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
