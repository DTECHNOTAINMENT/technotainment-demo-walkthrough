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

/**
 * Per-stream commerce context. Drops/competitions are derived from THIS stream's category +
 * creator (not a single global fixture), so a valorant final sells esports gear and a non-league
 * match sells a football kit — never the other way round.
 */
export interface CommerceCtx {
  /** broad stream category: sports | esports | music | talk | education | … */
  category: string;
  /** the creator's specific category (e.g. "competitive esports") — sharpens imagery. */
  creatorCategory: string;
  /** stable per-stream seed (stream/video id) for deterministic imagery. */
  seed: string;
}

interface DemoDrop {
  name: string;
  priceCast: number;
  edition: string;
}
interface CategoryCommerce {
  drops: DemoDrop[];
  competitions: WatchCompetition[];
}

/** Curated demo commerce per broad category — keyed off the stream's own category. */
const COMMERCE_BY_CATEGORY: Record<string, CategoryCommerce> = {
  esports: {
    drops: [
      { name: "team jersey · pro kit 2026", priceCast: 1400, edition: "312 / 500 sold" },
      { name: "in-game weapon skin · drop", priceCast: 600, edition: "limited" },
      { name: "pro settings + crosshair pack", priceCast: 120, edition: "instant" },
      { name: "bootcamp vod · full series", priceCast: 1800, edition: "vod" },
    ],
    competitions: [
      { name: "predict the map winner", entry: 50, ends: "ends this map" },
      { name: "first blood next round", entry: 25, ends: "ends round 1" },
      { name: "MVP of the series vote", entry: 10, ends: "ends series" },
    ],
  },
  sports: {
    drops: [
      { name: "retro third kit", priceCast: 1240, edition: "247 / 500 sold" },
      { name: "matchday scarf · away red", priceCast: 400, edition: "limited" },
      { name: "matchday programme · pdf", priceCast: 80, edition: "instant" },
      { name: "ticket bundle · 3-pack", priceCast: 1800, edition: "200 left" },
    ],
    competitions: [
      { name: "predict full-time score", entry: 50, ends: "ends 90'" },
      { name: "first scorer next half", entry: 25, ends: "ends 60'" },
      { name: "man-of-the-match vote", entry: 10, ends: "ends 95'" },
    ],
  },
  music: {
    drops: [
      { name: "this set · 96k flac", priceCast: 360, edition: "rentable" },
      { name: "stems pack · members", priceCast: 800, edition: "tier 2+" },
      { name: "signed setlist · print", priceCast: 240, edition: "1 of 50" },
      { name: "next tour · early ticket", priceCast: 2200, edition: "presale" },
    ],
    competitions: [
      { name: "request the next track", entry: 30, ends: "ends this set" },
      { name: "name that sample", entry: 15, ends: "ends 30 min" },
      { name: "shout-out raffle", entry: 10, ends: "ends tonight" },
    ],
  },
  talk: {
    drops: [
      { name: "ad-free archive · season pass", priceCast: 1200, edition: "12 months" },
      { name: "members q&a · submit a question", priceCast: 100, edition: "this week" },
      { name: "behind-the-desk · bonus vod", priceCast: 300, edition: "vod" },
    ],
    competitions: [
      { name: "predict tonight's guest", entry: 20, ends: "ends at the break" },
      { name: "submit a question · drawn live", entry: 10, ends: "ends mid-show" },
    ],
  },
  education: {
    drops: [
      { name: "full course bundle · self-paced", priceCast: 1800, edition: "vod + sheets" },
      { name: "worksheet + notes pack", priceCast: 200, edition: "instant" },
      { name: "1:1 office hour", priceCast: 1500, edition: "5 left" },
    ],
    competitions: [
      { name: "fastest correct solver", entry: 20, ends: "ends this round" },
      { name: "end-of-stream quiz", entry: 10, ends: "ends at close" },
    ],
  },
};

const DEFAULT_COMMERCE: CategoryCommerce = {
  drops: [
    { name: "signed print · limited", priceCast: 320, edition: "1 of 100" },
    { name: "members bonus pack", priceCast: 150, edition: "tier 1+" },
    { name: "this stream · vod", priceCast: 80, edition: "vod" },
  ],
  competitions: [
    { name: "viewer raffle", entry: 20, ends: "ends tonight" },
    { name: "predict the finale", entry: 10, ends: "ends at close" },
  ],
};

/** Map a broad OR specific category string onto one of the commerce buckets. */
function commerceKey(category: string): string {
  const c = category.toLowerCase();
  if (COMMERCE_BY_CATEGORY[c]) return c; // already a broad key (live stream category)
  if (/esport|gaming/.test(c)) return "esports";
  if (/football|soccer|sport|skate|run|climb|circus|trapeze/.test(c)) return "sports";
  if (/music|synth|\bdj\b|folk|ambient|song/.test(c)) return "music";
  if (/talk|show|host|podcast/.test(c)) return "talk";
  if (/chess|workshop|woodwork|repair|novelist|writ|illustrat|ceramic|cook|education|course/.test(c)) return "education";
  return "";
}

function commerceFor(ctx: CommerceCtx): CategoryCommerce {
  return COMMERCE_BY_CATEGORY[commerceKey(ctx.category) || commerceKey(ctx.creatorCategory)] ?? DEFAULT_COMMERCE;
}

/** The right-column "live drop" card — first real channel/stream product, else per-category demo. */
export function buildDropCard(products: ProductRow[], ctx: CommerceCtx): WatchDrop {
  const p = products[0];
  if (p) return { name: p.name, priceCast: p.priceCast, edition: p.edition ?? "limited", imgUrl: p.imgUrl };
  const d = commerceFor(ctx).drops[0];
  return { name: d.name, priceCast: d.priceCast, edition: d.edition, imgUrl: catImage(ctx.creatorCategory, `${ctx.seed}-0`) };
}

/** The "live drops" tab grid — real channel/stream products, else per-category demo (not a global fixture). */
export function buildDrops(products: ProductRow[], ctx: CommerceCtx): WatchDrop[] {
  if (products.length) {
    return products.map((p) => ({
      name: p.name,
      priceCast: p.priceCast,
      edition: p.edition ?? "limited",
      imgUrl: p.imgUrl,
    }));
  }
  return commerceFor(ctx).drops.map((d, i) => ({
    name: d.name,
    priceCast: d.priceCast,
    edition: d.edition,
    imgUrl: catImage(ctx.creatorCategory, `${ctx.seed}-${i}`),
  }));
}

/** The "competition" tab list — per-category entries for THIS stream. */
export function buildCompetitions(ctx: CommerceCtx): WatchCompetition[] {
  return commerceFor(ctx).competitions;
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
