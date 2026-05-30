/**
 * Per-page metadata builders: canonical URLs, Open Graph + Twitter cards, dynamic OG image.
 * Used by each public route's `generateMetadata` (docs/ROUTES.md "Rendering / SEO checklist").
 */
import type { Metadata } from "next";
import { branding } from "@/lib/config";

export function appUrl(): string {
  return process.env.APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
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
