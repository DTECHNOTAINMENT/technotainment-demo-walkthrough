/**
 * In-memory demo dataset — the no-database fallback for the public read paths.
 *
 * WHY: a Vercel deploy with no DATABASE_URL attached (or an unreachable DB) must still
 * render a fully populated home / live / explore / channel / watch / search, so the design
 * shows. `src/lib/queries/public.ts` falls back to these when a Prisma read throws OR returns
 * empty. Real DB data ALWAYS wins when present.
 *
 * Shapes mirror the prototype (prototype/v4/data.jsx → CREATORS / LIVE / FOLLOWED_LATEST) and
 * the production seed (prisma/seed.ts), so DB-on and DB-off look identical. The exported
 * helpers return objects in the SAME shape the query functions return (Prisma `include`
 * trees flattened to plain objects). They are deliberately typed structurally and the query
 * layer assigns them to the Prisma return types via `as` — see public.ts.
 *
 * Money is integer CAST (CLAUDE.md §4). Dates are real `Date`s so `publishedAt`/`createdAt`
 * formatting (see components/home/build.ts `ago()`) works without a DB.
 */

// ---------------------------------------------------------------------------
// Light structural types — just the fields the public pages actually read.
// Kept loose so query functions can `as`-cast them onto the richer Prisma types.
// ---------------------------------------------------------------------------

export interface FxCreator {
  id: string;
  userId: string;
  name: string;
  handle: string;
  brand: string;
  brand2: string;
  category: string;
  followers: number;
  bio: string | null;
  takeRatePct: number;
  status: "active";
  createdAt: Date;
}

export interface FxChannelRef {
  handle: string;
  creator: FxCreator;
}

export interface FxStream {
  id: string;
  channelId: string;
  title: string;
  category: string;
  visibility: "public";
  status: "live";
  viewers: number;
  startedAt: Date;
  createdAt: Date;
  channel: FxChannelRef;
}

export interface FxChapter {
  id: string;
  videoId: string;
  atSec: number;
  label: string;
}

export interface FxVideo {
  id: string;
  channelId: string;
  title: string;
  slug: string;
  description: string;
  metaDescription: string | null;
  thumbUrl: string;
  ogImageUrl: string | null;
  kind: "vod" | "clip";
  status: "published";
  visibility: "public";
  ppvPriceCast: number | null;
  durationSec: number;
  views: number;
  castEarned: number;
  captions: boolean;
  publishedAt: Date;
  createdAt: Date;
  chapters: FxChapter[];
  channel: FxChannelRef;
}

export interface FxTier {
  id: string;
  channelId: string;
  name: string;
  priceCast: number;
  perks: string[];
  popular: boolean;
  createdAt: Date;
}

export interface FxProduct {
  id: string;
  channelId: string;
  kind: "drop" | "ppv" | "course" | "merch";
  name: string;
  priceCast: number;
  edition: string | null;
  imgUrl: string;
  status: "live";
  sold: number;
  stock: number | null;
  createdAt: Date;
}

/** A channel with everything getChannelByHandle's `include` tree returns. */
export interface FxChannel {
  id: string;
  creatorId: string;
  handle: string;
  name: string;
  bio: string | null;
  createdAt: Date;
  creator: FxCreator;
  tiers: FxTier[];
  products: FxProduct[];
  videos: FxVideo[];
  streams: FxStream[];
}

/** A creator with the channel/streams sub-tree listTopCreators's `include` returns. */
export interface FxCreatorWithChannel extends FxCreator {
  channel: { id: string; handle: string; name: string; streams: FxStream[] } | null;
}

// ---------------------------------------------------------------------------
// Source data — mirrors prototype/v4/data.jsx CREATORS + prisma/seed.ts.
// ---------------------------------------------------------------------------

const EPOCH = new Date("2026-01-01T00:00:00.000Z");
const daysAgo = (n: number): Date => new Date(Date.now() - n * 86_400_000);
const minsAgo = (n: number): Date => new Date(Date.now() - n * 60_000);
const pic = (seed: string): string => `https://picsum.photos/seed/${encodeURIComponent(seed)}/640/360`;
/** channel id convention from prisma/seed.ts: `ch-<creatorId>` */
const chId = (cid: string): string => `ch-${cid}`;

interface CreatorSeed {
  id: string;
  name: string;
  handle: string;
  brand: string;
  brand2: string;
  followers: number;
  category: string;
  bio: string;
}

const CREATOR_SEED: CreatorSeed[] = [
  { id: "nyx", name: "Nyx Okafor", handle: "@nyxsynth", brand: "#7c3aed", brand2: "#ec4899", followers: 226800, category: "modular synth", bio: "modular synth sessions, patch notes and late-night sound design. the audience belongs to nyx." },
  { id: "kavi", name: "Kavi Rao", handle: "@kavikitchen", brand: "#dc2626", brand2: "#f97316", followers: 412300, category: "live cooking", bio: "live cooking, on camera, every week. you pick the bird." },
  { id: "atlas", name: "Atlas FC", handle: "@atlasfc", brand: "#1e3a8a", brand2: "#3b82f6", followers: 988400, category: "lower-league football", bio: "non-league football, matchday live and away coach unfiltered." },
  { id: "joon", name: "Joon Park", handle: "@joondraws", brand: "#9333ea", brand2: "#6366f1", followers: 73800, category: "illustration", bio: "ink drawing timed to viewer prompts. inktober all year." },
  { id: "rivers", name: "Pip Rivers", handle: "@riverssings", brand: "#365314", brand2: "#84cc16", followers: 39400, category: "country folk", bio: "country folk co-writes and open chord-building rooms." },
  { id: "tola", name: "Tola Amari", handle: "@tolafixes", brand: "#0369a1", brand2: "#06b6d4", followers: 181100, category: "electronics repair", bio: "reviving vintage hi-fi on the bench, one marantz at a time." },
  { id: "ines", name: "Inés Vidal", handle: "@inesskates", brand: "#be123c", brand2: "#fb7185", followers: 596500, category: "street skate", bio: "street skate sessions across europe, frame-by-frame breakdowns." },
  { id: "marlowe", name: "Margot Marlowe", handle: "@marlowestudio", brand: "#0f766e", brand2: "#22d3ee", followers: 84200, category: "ceramics", bio: "ceramics studio — kiln openings, wedging guides and small-batch drops." },
  { id: "demo", name: "Demo Daye", handle: "@demodaye", brand: "#fb923c", brand2: "#ef4444", followers: 1240000, category: "talk show host", bio: "the morning show with bea & lin. talk, guests and chaos." },
  { id: "wren", name: "Wren Holloway", handle: "@wrenruns", brand: "#0ea5e9", brand2: "#6366f1", followers: 320900, category: "ultra running", bio: "ultra running at altitude. pre-dawn trails and long solo runs." },
  { id: "kola", name: "Kola Adebayo", handle: "@kolasounds", brand: "#be185d", brand2: "#7c3aed", followers: 705200, category: "afro-fusion dj", bio: "afro-fusion dj — rooftop sets, vinyl and vinyl only." },
  { id: "yara", name: "Yara Salam", handle: "@yarawrites", brand: "#8b5cf6", brand2: "#3b82f6", followers: 156400, category: "novelist · workshop", bio: "novelist running live writing rooms and prose workshops." },
  { id: "rhett", name: "Rhett Doyle", handle: "@rhettclimbs", brand: "#16a34a", brand2: "#facc15", followers: 244800, category: "alpine climbing", bio: "alpine climbing — base-camp q&a, rope work and kit lists." },
  { id: "minerva", name: "Minerva Cho", handle: "@minervalab", brand: "#0ea5e9", brand2: "#10b981", followers: 419300, category: "chess · open analysis", bio: "live chess and open analysis. sicilian deep dives most nights." },
  { id: "saber", name: "Saber Esports", handle: "@saberesports", brand: "#ef4444", brand2: "#7c3aed", followers: 2400000, category: "competitive esports", bio: "competitive esports — regional to invitational, every match live." },
  { id: "halcyon", name: "Halcyon Collective", handle: "@halcyon", brand: "#06b6d4", brand2: "#8b5cf6", followers: 184700, category: "ambient sessions", bio: "ambient sessions and release listening events. stems for members." },
  { id: "marisol", name: "Marisol Vega", handle: "@marisolflies", brand: "#fb7185", brand2: "#facc15", followers: 91200, category: "trapeze · circus", bio: "trapeze and circus arts — backstage rigging and public classes." },
  { id: "ozan", name: "Ozan Demir", handle: "@ozanbuilds", brand: "#f59e0b", brand2: "#dc2626", followers: 502400, category: "workshop · woodwork", bio: "workshop woodwork — live joinery and tool-sharpening nights." },
];

const CREATORS: FxCreator[] = CREATOR_SEED.map((c) => ({
  id: c.id,
  userId: `U-${c.id}`,
  name: c.name,
  handle: c.handle,
  brand: c.brand,
  brand2: c.brand2,
  category: c.category,
  followers: c.followers,
  bio: c.bio,
  takeRatePct: 12,
  status: "active",
  createdAt: EPOCH,
}));

const creatorById = (id: string): FxCreator => {
  const c = CREATORS.find((x) => x.id === id);
  if (!c) throw new Error(`fixtures: unknown creator ${id}`);
  return c;
};

const channelRef = (cid: string): FxChannelRef => {
  const creator = creatorById(cid);
  return { handle: creator.handle, creator };
};

// ---- live streams (mirrors prisma/seed.ts liveStreams) --------------------

interface StreamSeed {
  id: string;
  cid: string;
  title: string;
  category: string;
  viewers: number;
  startedMins: number;
}

const STREAM_SEED: StreamSeed[] = [
  { id: "str-atlas-1", cid: "atlas", title: "atlas fc vs northgate reserves", category: "sports", viewers: 47200, startedMins: 67 },
  { id: "str-saber-1", cid: "saber", title: "valorant — grand finals · map 3", category: "esports", viewers: 184320, startedMins: 142 },
  { id: "str-saber-2", cid: "saber", title: "rocket league — 6-man scrim", category: "esports", viewers: 22480, startedMins: 51 },
  { id: "str-demo-1", cid: "demo", title: "the morning show · with bea & lin", category: "talk", viewers: 22140, startedMins: 84 },
  { id: "str-rhett-1", cid: "rhett", title: "patagonia · day 14 base camp", category: "sports", viewers: 18230, startedMins: 210 },
  { id: "str-ines-1", cid: "ines", title: "barcelona · gothic quarter session", category: "sports", viewers: 9842, startedMins: 52 },
  { id: "str-kola-1", cid: "kola", title: "saturday rooftop · vinyl only", category: "music", viewers: 6210, startedMins: 130 },
  { id: "str-kavi-1", cid: "kavi", title: "sunday roast · you pick the bird", category: "talk", viewers: 4218, startedMins: 38 },
  { id: "str-wren-1", cid: "wren", title: "trail 17 · pre-dawn run", category: "sports", viewers: 4081, startedMins: 64 },
  { id: "str-minerva-1", cid: "minerva", title: "live chess · sicilian deep dive", category: "education", viewers: 3920, startedMins: 46 },
  { id: "str-halcyon-1", cid: "halcyon", title: "ambient · pre-rain set", category: "music", viewers: 2280, startedMins: 40 },
  { id: "str-tola-1", cid: "tola", title: "reviving a 1978 marantz 2245", category: "education", viewers: 1607, startedMins: 95 },
  { id: "str-ozan-1", cid: "ozan", title: "live joinery · cherry sideboard", category: "education", viewers: 1342, startedMins: 110 },
  { id: "str-joon-1", cid: "joon", title: "ink drawing · timed to viewer prompts", category: "talk", viewers: 1182, startedMins: 73 },
  { id: "str-nyx-1", cid: "nyx", title: "buchla patch · night session #13", category: "music", viewers: 892, startedMins: 33 },
  { id: "str-yara-1", cid: "yara", title: "writing room · members open", category: "education", viewers: 487, startedMins: 29 },
  { id: "str-marlowe-1", cid: "marlowe", title: "kiln-open · 24 piece drop tonight", category: "talk", viewers: 612, startedMins: 18 },
  { id: "str-rivers-1", cid: "rivers", title: "open chord-building room", category: "music", viewers: 318, startedMins: 21 },
];

const STREAMS: FxStream[] = STREAM_SEED.map((s) => ({
  id: s.id,
  channelId: chId(s.cid),
  title: s.title,
  category: s.category,
  visibility: "public",
  status: "live",
  viewers: s.viewers,
  startedAt: minsAgo(s.startedMins),
  createdAt: minsAgo(s.startedMins),
  channel: channelRef(s.cid),
}));

// ---- videos (mirrors prisma/seed.ts rosterVideos) -------------------------

interface VideoSeed {
  cid: string;
  title: string;
  slug: string;
  kind: "vod" | "clip";
  durationSec: number;
  views: number;
  daysAgo: number;
}

const VIDEO_SEED: VideoSeed[] = [
  { cid: "nyx", title: "patch notes for last night's #12 set", slug: "nyx-patch-notes-12", kind: "vod", durationSec: 5040, views: 18420, daysAgo: 0 },
  { cid: "nyx", title: "ambient improv · 4am", slug: "nyx-ambient-improv-4am", kind: "vod", durationSec: 3960, views: 9210, daysAgo: 21 },
  { cid: "kavi", title: "how we built tonight's menu, on camera", slug: "kavi-tonights-menu", kind: "vod", durationSec: 2520, views: 88200, daysAgo: 2 },
  { cid: "kavi", title: "knife sharpening · members hour", slug: "kavi-knife-sharpening", kind: "vod", durationSec: 1980, views: 31400, daysAgo: 9 },
  { cid: "atlas", title: "tactics breakdown · 4-2-3-1 away", slug: "atlas-tactics-4231-away", kind: "vod", durationSec: 1260, views: 142800, daysAgo: 6 },
  { cid: "atlas", title: "post-match · away coach unfiltered", slug: "atlas-post-match-unfiltered", kind: "clip", durationSec: 480, views: 64100, daysAgo: 6 },
  { cid: "marlowe", title: "wedging clay · beginner guide", slug: "marlowe-wedging-clay", kind: "vod", durationSec: 1080, views: 12200, daysAgo: 3 },
  { cid: "joon", title: "inktober · day 22 timelapse", slug: "joon-inktober-day-22", kind: "clip", durationSec: 420, views: 28800, daysAgo: 5 },
  { cid: "joon", title: "saturday 4-hour drawing · vod", slug: "joon-saturday-4h-drawing", kind: "vod", durationSec: 14400, views: 9400, daysAgo: 12 },
  { cid: "ines", title: "tre flip · frame breakdown", slug: "ines-tre-flip-breakdown", kind: "clip", durationSec: 540, views: 96200, daysAgo: 7 },
  { cid: "rivers", title: "the song we almost cut", slug: "rivers-song-we-almost-cut", kind: "vod", durationSec: 300, views: 14100, daysAgo: 8 },
  { cid: "tola", title: "diagnosing a marantz · part one", slug: "tola-diagnosing-marantz-pt1", kind: "vod", durationSec: 1920, views: 41800, daysAgo: 9 },
  { cid: "yara", title: "writing prompt · the last room", slug: "yara-writing-prompt-last-room", kind: "vod", durationSec: 720, views: 8800, daysAgo: 14 },
  { cid: "kola", title: "sunset set · cape town", slug: "kola-sunset-set-cape-town", kind: "vod", durationSec: 4320, views: 70500, daysAgo: 14 },
  { cid: "rhett", title: "alpine kit · what i actually pack", slug: "rhett-alpine-kit-pack", kind: "vod", durationSec: 960, views: 24400, daysAgo: 21 },
  { cid: "wren", title: "long run · solo at altitude", slug: "wren-long-run-altitude", kind: "vod", durationSec: 2880, views: 32000, daysAgo: 21 },
  { cid: "demo", title: "morning show · ep 184", slug: "demo-morning-show-ep-184", kind: "vod", durationSec: 3540, views: 124000, daysAgo: 1 },
  { cid: "saber", title: "rocket league · 6-man scrim", slug: "saber-rocket-league-scrim", kind: "vod", durationSec: 6600, views: 224000, daysAgo: 2 },
  { cid: "minerva", title: "sicilian · 30-position memo walkthrough", slug: "minerva-sicilian-memo", kind: "vod", durationSec: 2400, views: 41900, daysAgo: 4 },
  { cid: "halcyon", title: "glass tide · stems walkthrough", slug: "halcyon-glass-tide-stems", kind: "vod", durationSec: 1500, views: 18400, daysAgo: 10 },
  { cid: "ozan", title: "live build · cherry sideboard · part one", slug: "ozan-cherry-sideboard-pt1", kind: "vod", durationSec: 5400, views: 50200, daysAgo: 11 },
  { cid: "marisol", title: "aerial silks · public class recap", slug: "marisol-aerial-silks-recap", kind: "vod", durationSec: 1320, views: 9100, daysAgo: 16 },
];

const chaptersFor = (slug: string, durationSec: number, kind: "vod" | "clip"): FxChapter[] => {
  if (kind === "clip" || durationSec < 600) return [];
  const third = Math.floor(durationSec / 3);
  return [
    { id: `ch-${slug}-0`, videoId: slug, atSec: 0, label: "intro" },
    { id: `ch-${slug}-1`, videoId: slug, atSec: third, label: "the main bit" },
    { id: `ch-${slug}-2`, videoId: slug, atSec: third * 2, label: "wrap-up" },
  ];
};

const VIDEOS: FxVideo[] = VIDEO_SEED.map((v, i) => ({
  id: `rv-${i + 1}`,
  channelId: chId(v.cid),
  title: v.title,
  slug: v.slug,
  description: `${v.title} — from ${creatorById(v.cid).name}.`,
  metaDescription: `${v.title} on Metascape.`,
  thumbUrl: pic(v.slug),
  ogImageUrl: `https://og.technotainment.fm/v/${v.slug}.png`,
  kind: v.kind,
  status: "published",
  visibility: "public",
  ppvPriceCast: null,
  durationSec: v.durationSec,
  views: v.views,
  castEarned: Math.round(v.views / 12),
  captions: true,
  publishedAt: daysAgo(v.daysAgo),
  createdAt: daysAgo(v.daysAgo),
  chapters: chaptersFor(v.slug, v.durationSec, v.kind),
  channel: channelRef(v.cid),
}));

// ---- tiers + products (mirrors prisma/seed.ts) ----------------------------

const TIERS: FxTier[] = [
  { id: "tier-nyx-listener", channelId: chId("nyx"), name: "listener", priceCast: 250, perks: ["live chat colour", "members-only set notes", "early stream alerts"], popular: false, createdAt: EPOCH },
  { id: "tier-nyx-patch", channelId: chId("nyx"), name: "patch archive", priceCast: 750, perks: ["everything in listener", "downloadable patch sheets", "monthly modular q&a", "10% off drops"], popular: true, createdAt: EPOCH },
  { id: "tier-nyx-lab", channelId: chId("nyx"), name: "sound design lab", priceCast: 2200, perks: ["everything in patch archive", "stems for every set", "1:1 office hour / quarter", "credit on releases"], popular: false, createdAt: EPOCH },
  { id: "tier-atlas-away", channelId: chId("atlas"), name: "away pass", priceCast: 750, perks: ["every away match live", "post-match coach feed", "tactics breakdowns"], popular: true, createdAt: EPOCH },
  { id: "tier-marlowe-insider", channelId: chId("marlowe"), name: "studio insider", priceCast: 900, perks: ["first dibs on kiln drops", "members-only process streams", "10% off the store"], popular: true, createdAt: EPOCH },
  { id: "tier-halcyon-stems", channelId: chId("halcyon"), name: "stems access", priceCast: 1200, perks: ["stems for every release", "release listening events", "credit on records"], popular: false, createdAt: EPOCH },
];

const PRODUCTS: FxProduct[] = [
  { id: "n1", channelId: chId("nyx"), kind: "drop", name: "field recordings · vol 4", priceCast: 120, edition: "98 / 200", imgUrl: pic("nyx-store-1"), status: "live", sold: 102, stock: 98, createdAt: EPOCH },
  { id: "n2", channelId: chId("nyx"), kind: "course", name: "intro to modular routing", priceCast: 480, edition: "self-paced", imgUrl: pic("nyx-store-2"), status: "live", sold: 410, stock: null, createdAt: EPOCH },
  { id: "n5", channelId: chId("nyx"), kind: "drop", name: "buchla session · 192k flac", priceCast: 360, edition: "tier 2+", imgUrl: pic("nyx-store-5"), status: "live", sold: 64, stock: null, createdAt: EPOCH },
  { id: "p-marlowe-bowl", channelId: chId("marlowe"), kind: "drop", name: "small bowl · kiln drop 048", priceCast: 180, edition: "62 / 150", imgUrl: pic("ceramic-bowl"), status: "live", sold: 88, stock: 62, createdAt: EPOCH },
  { id: "p-kavi-apron", channelId: chId("kavi"), kind: "merch", name: "kavi's house apron", priceCast: 240, edition: "ships worldwide", imgUrl: pic("chef-apron"), status: "live", sold: 1820, stock: null, createdAt: EPOCH },
  { id: "p-joon-ink", channelId: chId("joon"), kind: "drop", name: "ink drawing · sat 4-hour", priceCast: 320, edition: "1 of 1", imgUrl: pic("ink-sketch-large"), status: "live", sold: 1, stock: 0, createdAt: EPOCH },
  { id: "p-ozan-build", channelId: chId("ozan"), kind: "course", name: "live build · cherry sideboard", priceCast: 1240, edition: "vod + sheets", imgUrl: pic("woodworking-tools"), status: "live", sold: 340, stock: null, createdAt: EPOCH },
  { id: "p-demo-pass", channelId: chId("demo"), kind: "ppv", name: "live show · annual pass", priceCast: 2400, edition: "12 months", imgUrl: pic("microphone-on-air"), status: "live", sold: 5200, stock: null, createdAt: EPOCH },
];

// ---------------------------------------------------------------------------
// Typed helpers — return data in the SAME shape the query functions return.
// All are pure reads over the constants above; safe to call repeatedly.
// ---------------------------------------------------------------------------

/** Live streams, viewers-desc — matches listLiveStreams(). */
export function fxLiveStreams(): FxStream[] {
  return [...STREAMS].sort((a, b) => b.viewers - a.viewers);
}

/** Recent published public VODs, newest first — matches listRecentVideos(take). */
export function fxRecentVideos(take = 18): FxVideo[] {
  return VIDEOS.filter((v) => v.kind === "vod")
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, take);
}

/** Top creators (with channel + live streams) — matches listTopCreators(take). */
export function fxTopCreators(take = 12): FxCreatorWithChannel[] {
  return [...CREATORS]
    .sort((a, b) => b.followers - a.followers)
    .slice(0, take)
    .map((c) => ({
      ...c,
      channel: {
        id: chId(c.id),
        handle: c.handle,
        name: c.name,
        streams: STREAMS.filter((s) => s.channelId === chId(c.id)).slice(0, 1),
      },
    }));
}

/** Resolve the leading-@ tolerant handle to a creator, if any. */
function findCreatorByHandle(handle: string): FxCreator | undefined {
  const norm = handle.startsWith("@") ? handle : `@${handle}`;
  return CREATORS.find((c) => c.handle === norm);
}

/** Full channel (creator + tiers + products + videos + live streams) — matches getChannelByHandle(). */
export function fxChannelByHandle(handle: string): FxChannel | null {
  const creator = findCreatorByHandle(handle);
  if (!creator) return null;
  const id = chId(creator.id);
  return {
    id,
    creatorId: creator.id,
    handle: creator.handle,
    name: creator.name,
    bio: creator.bio,
    createdAt: creator.createdAt,
    creator,
    tiers: TIERS.filter((t) => t.channelId === id).sort((a, b) => a.priceCast - b.priceCast),
    products: PRODUCTS.filter((p) => p.channelId === id),
    videos: VIDEOS.filter((v) => v.channelId === id)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, 24),
    streams: STREAMS.filter((s) => s.channelId === id).slice(0, 1),
  };
}

/**
 * Video by slug (with chapters + channel.creator) — matches getVideoBySlug().
 * Tolerant fallback: if the slug is unknown, return the first VOD so /watch still renders.
 */
export function fxVideoBySlug(slug: string): FxVideo | null {
  return VIDEOS.find((v) => v.slug === slug) ?? VIDEOS.find((v) => v.kind === "vod") ?? null;
}

/**
 * Clip by slug — matches getClipBySlug(). Falls back to the first clip so /clip renders.
 */
export function fxClipBySlug(slug: string): FxVideo | null {
  const exact = VIDEOS.find((v) => v.slug === slug && v.kind === "clip");
  if (exact) return exact;
  return VIDEOS.find((v) => v.kind === "clip") ?? null;
}

/**
 * Explore videos by category (case-insensitive substring over creator.category) —
 * matches listExplore(category). Falls back to all videos when nothing matches.
 */
export function fxExplore(category: string): FxVideo[] {
  const needle = category.trim().toLowerCase();
  const matched =
    !needle || needle === "all"
      ? VIDEOS
      : VIDEOS.filter((v) => v.channel.creator.category.toLowerCase().includes(needle));
  const list = matched.length ? matched : VIDEOS;
  return [...list].sort((a, b) => b.views - a.views).slice(0, 48);
}

/** Search channels + videos by query — matches searchPublic(q). */
export function fxSearch(q: string): { channels: FxChannel[]; videos: FxVideo[] } {
  const needle = q.trim().toLowerCase();
  if (!needle) return { channels: [], videos: [] };
  const channels = CREATORS.filter(
    (c) => c.name.toLowerCase().includes(needle) || c.handle.toLowerCase().includes(needle)
  )
    .map((c) => fxChannelByHandle(c.handle))
    .filter((c): c is FxChannel => c !== null)
    .slice(0, 12);
  const videos = VIDEOS.filter((v) => v.title.toLowerCase().includes(needle)).slice(0, 24);
  return { channels, videos };
}

// ---- sitemap sources ------------------------------------------------------

export function fxSitemapChannels(): { handle: string; createdAt: Date }[] {
  return CREATORS.map((c) => ({ handle: c.handle, createdAt: c.createdAt }));
}

export function fxSitemapVideos(): { slug: string; publishedAt: Date; createdAt: Date }[] {
  return VIDEOS.filter((v) => v.kind === "vod").map((v) => ({ slug: v.slug, publishedAt: v.publishedAt, createdAt: v.createdAt }));
}

export function fxSitemapClips(): { slug: string; publishedAt: Date; createdAt: Date }[] {
  return VIDEOS.filter((v) => v.kind === "clip").map((v) => ({ slug: v.slug, publishedAt: v.publishedAt, createdAt: v.createdAt }));
}

export function fxSitemapCategories(): string[] {
  return Array.from(new Set(CREATORS.map((c) => c.category)));
}
