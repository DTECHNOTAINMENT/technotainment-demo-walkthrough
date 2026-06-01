/**
 * Per-page metadata builders: canonical URLs, Open Graph + Twitter cards, dynamic OG image.
 * Used by each public route's `generateMetadata` (docs/ROUTES.md "Rendering / SEO checklist").
 */
import type { Metadata } from "next";
import { headers } from "next/headers";
import { branding } from "@/lib/config";

/** Last-resort production origin if nothing else resolves (real domain comes from APP_URL). */
const PROD_FALLBACK_ORIGIN = "https://technotainment.fm";

function normalizeOrigin(raw: string | undefined | null): string | null {
  if (!raw) return null;
  let v = raw.trim();
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  return v.replace(/\/+$/, "");
}

/** Origin from explicit env or the hosting platform (Vercel) — never localhost. */
function envOrigin(): string | null {
  return (
    normalizeOrigin(process.env.APP_URL) ??
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeOrigin(process.env.VERCEL_URL) ??
    null
  );
}

/** Origin from the inbound request (proxy-aware) when we're inside a request scope. */
function requestOrigin(): string | null {
  try {
    const h = headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (!host || /localhost|127\.0\.0\.1/.test(host)) return null;
    const proto = h.get("x-forwarded-proto") ?? "https";
    return normalizeOrigin(`${proto}://${host}`);
  } catch {
    return null; // not in a request scope (e.g. build, test)
  }
}

/**
 * Canonical site origin for all SEO URLs (canonical, og:url, og:image, sitemap, robots).
 * Resolution order: APP_URL/site env → Vercel → request origin. In prod we NEVER fall back to
 * localhost (it would poison canonicals + share cards); we use PROD_FALLBACK_ORIGIN instead.
 */
export function appUrl(): string {
  const resolved = envOrigin() ?? requestOrigin();
  if (resolved) return resolved;
  const mode = process.env.LAUNCH_MODE ?? "dev";
  return mode === "prod" ? PROD_FALLBACK_ORIGIN : "http://localhost:3000";
}

export function canonical(path: string): string {
  return `${appUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Dynamic OG image URL via the /api/og service (branded share card). */
export function ogImage(params: { title: string; subtitle?: string; kind?: string }): string {
  const qs = new URLSearchParams({ title: params.title });
  if (params.subtitle) qs.set("subtitle", params.subtitle);
  if (params.kind) qs.set("kind", params.kind);
  return `${appUrl()}/api/og?${qs.toString()}`;
}

export function buildMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "video.other" | "profile";
  noindex?: boolean;
}): Metadata {
  const url = canonical(input.path);
  const image = input.image ?? ogImage({ title: input.title });
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    robots: input.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: branding.appName,
      type: (input.type ?? "website") as "website",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

/** Clamp a description to <=160 chars for SEO (docs/DATA_MODEL.md metaDescription). */
export function clampDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}
