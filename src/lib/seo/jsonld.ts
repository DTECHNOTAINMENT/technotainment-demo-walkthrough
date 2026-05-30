/**
 * schema.org JSON-LD builders (docs/ROUTES.md / HANDOFF.md §7). Emit these on public pages
 * so search engines get rich results: VideoObject (+ clip/hasPart key moments), BroadcastEvent
 * (live), Person/Organization, Product (drops), BreadcrumbList.
 */
import { canonical, appUrl } from "./meta";
import { branding } from "@/lib/config";
import { castToFiat } from "@/lib/cast";

type Json = Record<string, unknown>;

export function organization(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: branding.companyName,
    url: appUrl(),
  };
}

export function person(creator: { name: string; handle: string; bio?: string | null }): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: creator.name,
    alternateName: creator.handle,
    description: creator.bio ?? undefined,
    url: canonical(`/c/${creator.handle}`),
  };
}

export function breadcrumb(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: canonical(it.path),
    })),
  };
}

export function videoObject(v: {
  title: string;
  description: string;
  slug: string;
  thumbUrl: string;
  durationSec: number;
  publishedAt?: Date | null;
  kind: "vod" | "clip";
  channel: { creator: { name: string; handle: string } };
  chapters?: { atSec: number; label: string }[];
  live?: boolean;
}): Json {
  const url = canonical(v.kind === "clip" ? `/clip/${v.slug}` : `/watch/${v.slug}`);
  const base: Json = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.title,
    description: v.description,
    thumbnailUrl: [v.thumbUrl],
    uploadDate: (v.publishedAt ?? new Date()).toISOString(),
    duration: isoDuration(v.durationSec),
    contentUrl: url,
    embedUrl: url,
    author: { "@type": "Person", name: v.channel.creator.name },
    publisher: { "@type": "Organization", name: branding.companyName },
  };
  if (v.kind === "clip") base["@type"] = ["VideoObject", "Clip"];
  // hasPart: chapter key moments (docs/ROUTES.md)
  if (v.chapters && v.chapters.length) {
    base.hasPart = v.chapters.map((c, i, arr) => ({
      "@type": "Clip",
      name: c.label,
      startOffset: c.atSec,
      endOffset: arr[i + 1]?.atSec ?? v.durationSec,
      url: `${url}#t=${c.atSec}`,
    }));
  }
  if (v.live) {
    base.publication = {
      "@type": "BroadcastEvent",
      isLiveBroadcast: true,
      startDate: (v.publishedAt ?? new Date()).toISOString(),
    };
  }
  return base;
}

export function broadcastEvent(s: {
  title: string;
  category: string;
  startedAt?: Date | null;
  channel: { creator: { name: string; handle: string } };
  channelHandle: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BroadcastEvent",
    name: s.title,
    isLiveBroadcast: true,
    startDate: (s.startedAt ?? new Date()).toISOString(),
    about: s.category,
    url: canonical(`/c/${s.channelHandle}`),
    performer: { "@type": "Person", name: s.channel.creator.name },
  };
}

export function product(p: {
  name: string;
  priceCast: number;
  imgUrl: string;
  channelHandle: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: [p.imgUrl],
    offers: {
      "@type": "Offer",
      // CAST is closed-loop; surface the fiat equivalent for search engines.
      price: castToFiat(p.priceCast).toFixed(2),
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      url: canonical(`/c/${p.channelHandle}`),
    },
  };
}

/** Seconds -> ISO 8601 duration, e.g. 3661 -> "PT1H1M1S". */
function isoDuration(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${sec || (!h && !m) ? `${sec}S` : ""}`;
}
