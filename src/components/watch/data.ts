// Server-side mappers that turn the public query rows (live streams, recent videos,
// channel products/tiers) into the plain serialisable prop shapes the watch client
// components consume. No Prisma types cross the client boundary — only these shapes do.
// Structural interfaces keep the mappers DB- and fixture-agnostic (and `any`-free).
import { catImage } from "@/lib/img";
import type { UpNextItem, WatchDrop, WatchTier, WatchCompetition } from "./types";

interface CreatorRow {
  name: string;
  handle: string;
  brand: string;
  brand2: string;
  category?: string | null;
}
interface ChannelRefRow {
  handle: string;
  creator: CreatorRow;
}
interface StreamRow {
  id: string;
  title: string;
  category: string;
  viewers: number;
  channel: ChannelRefRow;
}
interface VideoRow {
  id: string;
  slug: string;
  title: string;
  thumbUrl: string;
  durationSec: number;
  views: number;
  publishedAt: Date | null;
  channel: ChannelRefRow;
}
interface ProductRow {
  name: string;
  priceCast: number;
  edition: string | null;
  imgUrl: string;
}
interface TierRow {
  name: string;
  priceCast: number;
  perks: string[];
  popular: boolean;
}

function hhmmss(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0");
  const ss = String(s).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Build the vertical up-next list: live streams first (with a live badge), then recent VODs. */
export function buildUpNext(
  streams: StreamRow[],
  videos: VideoRow[],
  excludeSlug: string,
  agoOf: (d: Date | null) => string,
): UpNextItem[] {
  const live: UpNextItem[] = streams.slice(0, 6).map((s) => ({
    id: `live-${s.id}`,
    title: s.title,
    handle: s.channel.creator.handle,
    href: `/watch/live/${s.id}`,
    thumbUrl: catImage(s.channel.creator.category, s.id, 336, 190),
    overlay: s.category.toUpperCase(),
    overlayBg: s.channel.creator.brand,
    live: true,
    viewers: s.viewers,
  }));

  const vods: UpNextItem[] = videos
    .filter((v) => v.slug !== excludeSlug)
    .slice(0, 8)
    .map((v) => ({
      id: `vod-${v.id}`,
      title: v.title,
      handle: v.channel.creator.handle,
      href: `/watch/${v.slug}`,
      thumbUrl: v.thumbUrl,
      overlay: (v.channel.creator.category ?? "watch").toUpperCase().slice(0, 12),
      overlayBg: "rgba(0,0,0,0.85)",
      views: v.views,
      ago: agoOf(v.publishedAt),
      dur: hhmmss(v.durationSec),
    }));

  return [...live, ...vods].slice(0, 11);
}

/** The right-column "live drop" card — first channel product, else a demo shaped like the prototype. */
export function buildDropCard(products: ProductRow[], fallbackImg: string): WatchDrop {
  const p = products[0];
  if (p) return { name: p.name, priceCast: p.priceCast, edition: p.edition ?? "limited", imgUrl: p.imgUrl };
  return { name: "limited drop · this stream", priceCast: 1240, edition: "247 / 500 sold", imgUrl: fallbackImg };
}

/** The "live drops" tab grid — channel products, else a demo list shaped like the prototype. */
export function buildDrops(products: ProductRow[], fallbackImg: string): WatchDrop[] {
  if (products.length) {
    return products.map((p) => ({
      name: p.name,
      priceCast: p.priceCast,
      edition: p.edition ?? "limited",
      imgUrl: p.imgUrl,
    }));
  }
  return [
    { name: "retro third kit", priceCast: 1240, edition: "247 / 500 sold", imgUrl: fallbackImg },
    { name: "matchday scarf · away red", priceCast: 400, edition: "limited", imgUrl: fallbackImg },
    { name: "matchday programme · pdf", priceCast: 80, edition: "instant", imgUrl: fallbackImg },
    { name: "ticket bundle · 3-pack", priceCast: 1800, edition: "200 left", imgUrl: fallbackImg },
  ];
}

/** The "competition" tab list — demo entries shaped like the prototype. */
export function buildCompetitions(): WatchCompetition[] {
  return [
    { name: "predict full-time score", entry: 50, ends: "ends 90'" },
    { name: "first scorer next half", entry: 25, ends: "ends 60'" },
    { name: "man-of-the-match vote", entry: 10, ends: "ends 95'" },
  ];
}

/** The "members" tab tier cards — channel tiers, else demo 250/750/2200 CAST tiers. */
export function buildTiers(tiers: TierRow[]): WatchTier[] {
  if (tiers.length) {
    return tiers.map((t) => ({ name: t.name, cast: t.priceCast, perks: t.perks, popular: t.popular }));
  }
  return [
    { name: "tier 1 · stand", cast: 250, perks: ["live chat colour", "members-only post-match", "early drops"] },
    { name: "tier 2 · away pass", cast: 750, perks: ["everything in stand", "every away feed", "tactics weekly"], popular: true },
    { name: "tier 3 · travel", cast: 2200, perks: ["everything in away pass", "training feeds", "credit on every drop"] },
  ];
}
