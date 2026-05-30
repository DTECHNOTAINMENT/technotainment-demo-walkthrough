import type { Metadata } from "next";
import { ThemeScript } from "@/components/theme";
import { CookieConsent } from "@/components/CookieConsent";
import { getBranding } from "@/lib/settings";
import "./globals.css";

// Branding is read from the DB (Admin → control center) at runtime — a rename/recolour needs no
// deploy. Falls back to the seeded defaults in lib/config when no override is set.
export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBranding();
  return {
    title: { default: `${branding.appName} — ${branding.companyName}`, template: `%s · ${branding.appName}` },
    description: `${branding.companyName}: ${branding.tagline}. Live-streaming + VOD powered by ${branding.currencyName}.`,
    applicationName: branding.appName,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const branding = await getBranding();
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
