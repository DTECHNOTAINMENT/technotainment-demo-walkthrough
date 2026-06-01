// Maps DB rows (streams + videos) into HomeView tile/hero shapes. Server-only helpers.
import type { HomeTile, HeroData } from "@/components/home/HomeView";
import { catImage } from "@/lib/img";

type CreatorRow = { name: string; handle: string; brand: string; brand2: string; category?: string | null };

type StreamRow = {
  id: string;
  title: string;
  category: string;
  viewers: number;
  channel: { handle: string; creator: CreatorRow };
};

type VideoRow = {
  id: string;
  slug: string;
  title: string;
  thumbUrl: string | null;
  durationSec: number;
  publishedAt: Date | null;
  channel: { handle: string; creator: CreatorRow };
};

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  if (h) return `${h}h ${String(m % 60).padStart(2, "0")}m`;
  return `${m} min`;
}

function ago(d: Date | null): string {
  if (!d) return "";
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1d";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  return `${Math.floor(days / 30)}mo`;
}

export function streamTile(s: StreamRow): HomeTile {
  const c = s.channel.creator;
  return {
    id: s.id,
    title: s.title,
    href: `/watch/live/${s.id}`,
    thumb: catImage(c.category, s.id),
    creator: { name: c.name, handle: c.handle, brand: c.brand, brand2: c.brand2 },
    live: true,
    viewers: s.viewers,
  };
}

export function videoTile(v: VideoRow): HomeTile {
  const c = v.channel.creator;
  return {
    id: v.id,
    title: v.title,
    href: `/watch/${v.slug}`,
    thumb: v.thumbUrl || catImage(c.category, v.id),
    creator: { name: c.name, handle: c.handle, brand: c.brand, brand2: c.brand2 },
    live: false,
    dur: v.durationSec ? fmtDuration(v.durationSec) : null,
    ago: ago(v.publishedAt),
  };
}

export function heroFromStream(s: StreamRow): HeroData {
  const c = s.channel.creator;
  return {
    title: s.title,
    sub: `${s.category} · live now`,
    kicker: [s.category],
    href: `/watch/live/${s.id}`,
    img: catImage(c.category, `${s.id}-hero`, 1280, 520),
    viewers: s.viewers,
    creator: { name: c.name, handle: c.handle, brand: c.brand, brand2: c.brand2 },
  };
}

/**
 * Compose hero + tiles from live streams and recent videos.
 * The hero is the owner's pinned editorial stream (Admin → control center) when it's live;
 * otherwise it falls back to the algorithmic top (most-viewed) live stream.
 */
export function buildHome(
  streams: StreamRow[],
  videos: VideoRow[],
  pinnedStreamId?: string | null,
): { hero: HeroData | null; tiles: HomeTile[] } {
  const pinned = pinnedStreamId ? streams.find((s) => s.id === pinnedStreamId) : undefined;
  const heroStream = pinned ?? streams[0];
  const hero = heroStream ? heroFromStream(heroStream) : null;
  const liveTiles = streams.map(streamTile);
  const vodTiles = videos.map(videoTile);
  return { hero, tiles: [...liveTiles, ...vodTiles] };
}
