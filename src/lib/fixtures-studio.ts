// (plain demo data — safe to import from server or test contexts; no "server-only")
import { fxChannelByHandle } from "@/lib/fixtures";
import type { EarningsSummary } from "@/lib/earnings";

// ---------------------------------------------------------------------------
// demo studio data — the no-database fallback for the whole creator studio.
//
// used whenever a studio read throws (no db) OR returns empty, so every studio
// page renders populated for the demo creator with zero backend. real db always
// wins (studio.ts + queries/studio.ts try prisma first, fall back to these).
//
// the demo creator is nyx okafor (@nyxsynth, U-NYX). the base channel fixture
// (fxChannelByHandle) supplies creator/tiers/products/videos/streams; this file
// flattens everything into the SAME shapes the studio query functions return
// (prisma include trees → plain objects) plus the studio-only surfaces (kpis,
// members, earnings, payouts, analytics-by-kind). the query layer assigns these
// onto the prisma return types via `as` — same trick as queries/public.ts.
//
// money is integer CAST (100 CAST = £1.00); dates are real `Date`s.
// ---------------------------------------------------------------------------

export const DEMO_HANDLE = "@nyxsynth";

const daysAgo = (n: number): Date => new Date(Date.now() - n * 86_400_000);
const minsAgo = (n: number): Date => new Date(Date.now() - n * 60_000);

function nyx() {
  const ch = fxChannelByHandle(DEMO_HANDLE);
  if (!ch) throw new Error("fixtures-studio: demo channel @nyxsynth missing");
  return ch;
}

// ---- creator + channel (requireCreatorChannel fallback) -------------------
// shaped like the prisma Creator (+ included channel) the studio pages read:
// creator.id / userId / name / handle, channel.id / name / handle.

export function demoCreatorChannel() {
  const ch = nyx();
  const c = ch.creator;
  const creator = {
    id: c.id,
    userId: c.userId,
    name: c.name,
    handle: c.handle,
    brand: c.brand,
    brand2: c.brand2,
    category: c.category,
    followers: c.followers,
    bio: c.bio,
    takeRatePct: c.takeRatePct,
    status: "active" as const,
    createdAt: c.createdAt,
  };
  const channel = {
    id: ch.id,
    creatorId: ch.creatorId,
    handle: ch.handle,
    name: ch.name,
    bio: ch.bio,
    createdAt: ch.createdAt,
  };
  return { creator, channel };
}

// ---- earnings summary (shared by overview + earnings) ---------------------

export function demoEarningsSummary(): EarningsSummary {
  const grossCast = 1_240_000;
  const feeCast = Math.round(grossCast * 0.12);
  const netCast = grossCast - feeCast;
  const clearedCast = 980_000;
  const pendingCast = netCast - clearedCast;
  const paidCast = 612_400;
  return {
    grossCast,
    feeCast,
    netCast,
    clearedCast,
    pendingCast,
    paidCast,
    availableCast: Math.max(0, clearedCast - paidCast),
  };
}

// ---- overview (studioOverview) --------------------------------------------

export function demoOverview() {
  const ch = nyx();
  return {
    videoCount: demoContent().length,
    memberCount: 1_240,
    followerCount: ch.creator.followers,
    recent: demoRecentTransactions(),
    earnings: demoEarningsSummary(),
  };
}

// recent settled transactions (overview "recent activity" ledger).
// shaped like the prisma Transaction rows the dashboard maps.
export function demoRecentTransactions() {
  const mk = (id: string, kind: string, cast: number, mins: number) => ({
    id,
    userId: "U-fan",
    channelId: nyx().id,
    kind,
    grossFiat: null as string | null,
    cast,
    method: "balance",
    status: "settled" as const,
    flag: null as string | null,
    createdAt: minsAgo(mins),
  });
  return [
    mk("TXR-9F2A", "tip", 1_200, 12),
    mk("TXR-8C71", "membership", 750, 64),
    mk("TXR-7B40", "drop", 360, 130),
    mk("TXR-6A22", "ppv", 480, 220),
    mk("TXR-5910", "gift", 250, 300),
    mk("TXR-4801", "tip", 600, 480),
  ];
}

// ---- content (listContent) ------------------------------------------------
// base channel videos + a few studio-only states (draft, processing).
// shaped like prisma Video (+ chapters).

function vid(o: {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "processing" | "published";
  visibility: "public" | "members" | "ppv";
  durationSec: number;
  views: number;
  castEarned: number;
  captions: boolean;
  published: Date | null;
  created: Date;
}) {
  const ch = nyx();
  return {
    id: o.id,
    channelId: ch.id,
    title: o.title,
    slug: o.slug,
    description: "",
    metaDescription: null as string | null,
    thumbUrl: `https://picsum.photos/seed/${o.slug}/640/360`,
    ogImageUrl: null as string | null,
    kind: "vod" as const,
    status: o.status,
    visibility: o.visibility,
    ppvPriceCast: null as number | null,
    durationSec: o.durationSec,
    views: o.views,
    castEarned: o.castEarned,
    captions: o.captions,
    publishedAt: o.published,
    createdAt: o.created,
    chapters: [] as { id: string; videoId: string; atSec: number; label: string }[],
  };
}

export function demoContent() {
  const ch = nyx();
  const base = ch.videos.map((v) => ({
    id: v.id,
    channelId: ch.id,
    title: v.title,
    slug: v.slug,
    description: v.description,
    metaDescription: v.metaDescription,
    thumbUrl: v.thumbUrl,
    ogImageUrl: v.ogImageUrl,
    kind: v.kind,
    status: "published" as const,
    visibility: v.visibility,
    ppvPriceCast: v.ppvPriceCast,
    durationSec: v.durationSec,
    views: v.views,
    castEarned: v.castEarned,
    captions: v.captions,
    publishedAt: v.publishedAt,
    createdAt: v.createdAt,
    chapters: v.chapters,
  }));
  const extra = [
    vid({ id: "v-proc-1", title: "processing vocals like a synth", slug: "processing-vocals", status: "processing", visibility: "public", durationSec: 0, views: 0, castEarned: 0, captions: false, published: null, created: minsAgo(20) }),
    vid({ id: "v-draft-1", title: "winter set — preview cut", slug: "winter-set-preview", status: "draft", visibility: "members", durationSec: 480, views: 0, castEarned: 0, captions: false, published: null, created: daysAgo(1) }),
    vid({ id: "v-vod-1", title: "sound design 101: building a lead", slug: "sound-design-101", status: "published", visibility: "public", durationSec: 1540, views: 31_250, castEarned: 2_604, captions: true, published: daysAgo(40), created: daysAgo(40) }),
    vid({ id: "v-vod-2", title: "modular deep dive: west-coast patching", slug: "modular-deep-dive", status: "published", visibility: "members", durationSec: 3650, views: 12_040, castEarned: 1_003, captions: true, published: daysAgo(60), created: daysAgo(60) }),
  ];
  // newest first, like the prisma orderBy createdAt desc.
  return [...extra.slice(0, 2), ...base, ...extra.slice(2)];
}

export function demoVideo(id: string) {
  return demoContent().find((v) => v.id === id) ?? null;
}

// ---- streams (listStreams) ------------------------------------------------
// one live + ended broadcasts. shaped like prisma Stream.

function strm(o: {
  id: string;
  title: string;
  status: "live" | "ended";
  viewers: number;
  started: Date;
}) {
  const ch = nyx();
  return {
    id: o.id,
    channelId: ch.id,
    title: o.title,
    category: "music",
    visibility: "public" as const,
    status: o.status,
    rtmpUrl: "rtmp://ingest.metascape.tv/live",
    streamKey: "sk-demo-nyx",
    healthResolution: "1080p60" as string | null,
    healthBitrateMbps: 6.0 as number | null,
    healthState: "healthy" as string | null,
    viewers: o.viewers,
    startedAt: o.started as Date | null,
    recordingVideoId: null as string | null,
    createdAt: o.started,
  };
}

export function demoStreams() {
  return [
    strm({ id: "s-live", title: "live: late-night synth jam", status: "live", viewers: 1_840, started: minsAgo(48) }),
    strm({ id: "s-ended-1", title: "buchla patch · night session #12", status: "ended", viewers: 1_210, started: daysAgo(3) }),
    strm({ id: "s-ended-2", title: "ambient improv · 4am", status: "ended", viewers: 880, started: daysAgo(10) }),
  ];
}

// ---- products (listProducts) ----------------------------------------------

export function demoProducts() {
  const ch = nyx();
  return ch.products.map((p) => ({
    id: p.id,
    channelId: ch.id,
    kind: p.kind,
    name: p.name,
    priceCast: p.priceCast,
    edition: p.edition,
    imgUrl: p.imgUrl,
    status: "live" as const,
    sold: p.sold,
    stock: p.stock,
    createdAt: p.createdAt,
  }));
}

// ---- tiers (listTiers, includes _count.memberships) -----------------------

export function demoTiers() {
  const ch = nyx();
  const memberCounts: Record<string, number> = {
    "tier-nyx-listener": 820,
    "tier-nyx-patch": 360,
    "tier-nyx-lab": 60,
  };
  return ch.tiers.map((t) => ({
    id: t.id,
    channelId: ch.id,
    name: t.name,
    priceCast: t.priceCast,
    perks: t.perks,
    popular: t.popular,
    createdAt: t.createdAt,
    _count: { memberships: memberCounts[t.id] ?? 40 },
  }));
}

// ---- members (listMembers, includes user + tier) --------------------------

export function demoMembers() {
  const ch = nyx();
  const mk = (
    id: string,
    displayName: string,
    handle: string,
    tierId: string,
    tierName: string,
    priceCast: number,
    days: number,
  ) => ({
    id,
    userId: id,
    tierId,
    channelId: ch.id,
    status: "active" as const,
    startedAt: daysAgo(days),
    renewsAt: daysAgo(days - 30),
    priceCastLocked: priceCast,
    user: { handle, displayName, avatarUrl: null as string | null },
    tier: { name: tierName },
  });
  return [
    mk("U-arivey", "ari vey", "@arivey", "tier-nyx-lab", "sound design lab", 2_200, 210),
    mk("U-junop", "juno park", "@junop", "tier-nyx-patch", "patch archive", 750, 166),
    mk("U-remysoto", "remy soto", "@remysoto", "tier-nyx-patch", "patch archive", 750, 142),
    mk("U-kitlin", "kit lin", "@kitlin", "tier-nyx-listener", "listener", 250, 99),
    mk("U-devokoro", "dev okoro", "@devokoro", "tier-nyx-listener", "listener", 250, 80),
    mk("U-sashang", "sasha ng", "@sashang", "tier-nyx-listener", "listener", 250, 59),
  ];
}

// ---- analytics (analyticsSummary) -----------------------------------------

export function demoAnalytics() {
  const byKind: Record<string, number> = {
    tip: 482_300,
    membership: 386_900,
    drop: 214_500,
    ppv: 98_400,
    gift: 57_900,
  };
  const revenueCast = Object.values(byKind).reduce((s, v) => s + v, 0);
  const totalViews = demoContent().reduce((s, v) => s + v.views, 0);
  return { totalViews, revenueCast, byKind, txnCount: 4_820 };
}

// ---- earnings view (earningsView, summary + payouts + methods) -------------

export function demoEarningsView() {
  const summary = demoEarningsSummary();
  const payouts = [
    { id: "PO-1042", creatorId: "nyx", payoutMethodId: "pm-bank", cast: 400_000, feeCast: 0, netFiat: "£3,520.00", method: "bank transfer", status: "paid" as const, date: daysAgo(32) },
    { id: "PO-1037", creatorId: "nyx", payoutMethodId: "pm-bank", cast: 350_000, feeCast: 0, netFiat: "£3,080.00", method: "bank transfer", status: "paid" as const, date: daysAgo(62) },
    { id: "PO-1031", creatorId: "nyx", payoutMethodId: "pm-bank", cast: 280_000, feeCast: 0, netFiat: "£2,464.00", method: "bank transfer", status: "paid" as const, date: daysAgo(92) },
    { id: "PO-1024", creatorId: "nyx", payoutMethodId: "pm-bank", cast: 150_000, feeCast: 0, netFiat: "£1,320.00", method: "bank transfer", status: "held" as const, date: daysAgo(6) },
  ];
  const methods = [
    { id: "pm-bank", creatorId: "nyx", methodId: "bank", label: "bank transfer", sub: "••4291", fee: "free", speed: "1-3 days", isDefault: true, createdAt: daysAgo(200) },
    { id: "pm-paypal", creatorId: "nyx", methodId: "paypal", label: "paypal", sub: "nyx@demo.tv", fee: "1.5%", speed: "instant", isDefault: false, createdAt: daysAgo(150) },
  ];
  return { summary, payouts, methods };
}

// ---- dashboard extras (revenue series, top content, split, schedule) -------
// powers the studio dashboard sections that aren't a single query: the 12-month
// revenue bars, the revenue-by-source split, the top-content list and the
// scheduled-streams list. plain demo data; real db wins via the query layer.

export const STUDIO_MONTHS = ["jun", "jul", "aug", "sep", "oct", "nov", "dec", "jan", "feb", "mar", "apr", "may"];
export const STUDIO_EARN_SERIES = [184000, 196000, 172000, 205000, 221000, 248000, 263000, 251000, 274000, 289000, 302000, 324000];
export const STUDIO_GROSS_MONTH = 324000;
export const STUDIO_MEMBER_SERIES = [820, 905, 980, 1040, 1080, 1120, 1150, 1180, 1190, 1210, 1228, 1240];
export const STUDIO_FOLLOW_SERIES = [180000, 188000, 195000, 201000, 207000, 212000, 216000, 219000, 221000, 223000, 225000, 226800];
export const STUDIO_VIEW_SERIES = [320, 340, 360, 372, 380, 388, 392, 396, 398, 399, 400, 401];

export function demoRevenueSplit() {
  return [
    { id: "memberships", label: "memberships", cast: 142000, color: "#8b5cf6" },
    { id: "tips", label: "tips", cast: 86000, color: "#ec4899" },
    { id: "drops", label: "drops & store", cast: 54000, color: "#06b6d4" },
    { id: "ppv", label: "ppv rentals", cast: 28000, color: "#10b981" },
    { id: "gifts", label: "gifted subs", cast: 14000, color: "#f97316" },
  ];
}

export function demoTopContent() {
  const ch = nyx();
  const mk = (id: string, title: string, slug: string, views: number, cast: number, watch: string) => ({
    id, channelId: ch.id, title, slug,
    thumbUrl: `https://picsum.photos/seed/${slug}/640/360`,
    views, castEarned: cast, watch,
    status: "published" as const, visibility: "public" as const,
  });
  return [
    mk("vid-top-1", "buchla patch · night session #13", "buchla-night-13", 184320, 48200, "62k min"),
    mk("vid-top-2", "modular from scratch · part 4", "modular-scratch-4", 96400, 31600, "41k min"),
    mk("vid-top-3", "ambient improv · 4am", "ambient-improv-4am", 72100, 22800, "33k min"),
    mk("vid-top-4", "sound design lab · resonators", "sound-design-resonators", 58900, 18400, "27k min"),
  ];
}

export function demoSchedule() {
  return [
    { id: "sc1", title: "eurorack q&a · live patching", when: "tomorrow · 8:00 pm", reminders: 1840, visibility: "public" as const },
    { id: "sc2", title: "patch archive drop · vol 5", when: "fri · 6:00 pm", reminders: 920, visibility: "members" as const },
    { id: "sc3", title: "members-only deep dive", when: "sun · 7:00 pm", reminders: 410, visibility: "members" as const },
  ];
}

export interface DashboardExtras {
  months: string[];
  earnSeries: number[];
  grossMonth: number;
  memberSeries: number[];
  followSeries: number[];
  viewSeries: number[];
  revenueSplit: { id: string; label: string; cast: number; color: string }[];
  topContent: ReturnType<typeof demoTopContent>;
  schedule: ReturnType<typeof demoSchedule>;
}

export function demoDashboardExtras(): DashboardExtras {
  return {
    months: STUDIO_MONTHS,
    earnSeries: STUDIO_EARN_SERIES,
    grossMonth: STUDIO_GROSS_MONTH,
    memberSeries: STUDIO_MEMBER_SERIES,
    followSeries: STUDIO_FOLLOW_SERIES,
    viewSeries: STUDIO_VIEW_SERIES,
    revenueSplit: demoRevenueSplit(),
    topContent: demoTopContent(),
    schedule: demoSchedule(),
  };
}
