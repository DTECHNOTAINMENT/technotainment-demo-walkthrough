/**
 * Prisma seed — Technotainment (Metascape) Phase 0.
 *
 * Seeds a coherent slice mirroring the prototype fixtures (data.jsx,
 * studio-shared.jsx, admin-shared.jsx, payments.jsx) at the prototype's density:
 *   - viewer/admin users + a full creator roster (~17 creators incl. Nyx),
 *     each with a User owner, a Creator, and a public Channel
 *   - Nyx Okafor: 3 tiers + 6 videos + 1 live stream + scheduled streams + products
 *   - ~16 live streams + ~24 published VODs spread across the roster (dense home/explore)
 *   - Follows: @mira.k follows 18 channels (sidebar "following · 18")
 *   - Wallet ledger (append-only) whose sum IS the user's balance — no stored balance
 *   - Transactions, reports, connector registry, feature flags, a payout run, audit
 *
 * Idempotent: wraps a deleteMany-then-create inside a single transaction. Runs via
 *   tsx prisma/seed.ts   (configured in package.json "prisma.seed").
 *
 * Money is integer CAST (100 CAST = £1.00).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NOW = new Date("2026-05-30T12:00:00Z");
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000);
const minsAgo = (m: number) => new Date(NOW.getTime() - m * 60_000);

async function main() {
  await prisma.$transaction(
    async (tx) => {
      // ---- wipe (children first) so the seed is idempotent --------------
      await tx.chapter.deleteMany();
      await tx.walletEntry.deleteMany();
      await tx.transaction.deleteMany();
      await tx.membership.deleteMany();
      await tx.scheduledStream.deleteMany();
      await tx.follow.deleteMany();
      await tx.video.deleteMany();
      await tx.stream.deleteMany();
      await tx.product.deleteMany();
      await tx.tier.deleteMany();
      await tx.payout.deleteMany();
      await tx.payoutMethod.deleteMany();
      await tx.consentGrant.deleteMany();
      await tx.channel.deleteMany();
      await tx.creator.deleteMany();
      await tx.paymentMethod.deleteMany();
      await tx.user.deleteMany();
      await tx.payoutRun.deleteMany();
      await tx.report.deleteMany();
      await tx.connector.deleteMany();
      await tx.apiKey.deleteMany();
      await tx.webhook.deleteMany();
      await tx.featureFlag.deleteMany();
      await tx.auditEvent.deleteMany();
      await tx.adminUser.deleteMany();

      // ================================================================
      // USERS — from ADMIN.USER_ROWS (+ Nyx as creator owner)
      // ================================================================
      await tx.user.createMany({
        data: [
          {
            id: "U-NYX",
            handle: "@nyxsynth",
            email: "nyx@technotainment.fm",
            displayName: "Nyx Okafor",
            role: "creator",
            kyc: "verified",
            status: "active",
            lifetimeSpentCast: 0,
            createdAt: daysAgo(420),
          },
          {
            id: "U-48210",
            handle: "@mira.k",
            email: "mira@hey.com",
            displayName: "Mira K",
            role: "member",
            kyc: "verified",
            status: "active",
            lifetimeSpentCast: 184200,
            createdAt: daysAgo(240),
          },
          {
            id: "U-48199",
            handle: "@oren.s",
            email: "oren@proton.me",
            displayName: "Oren S",
            role: "member",
            kyc: "verified",
            status: "active",
            lifetimeSpentCast: 42100,
            createdAt: daysAgo(150),
          },
          {
            id: "U-48155",
            handle: "@theo.w",
            email: "theo@gmail.com",
            displayName: "Theo W",
            role: "member",
            kyc: "verified",
            status: "active",
            lifetimeSpentCast: 98200,
            createdAt: daysAgo(365),
          },
          {
            id: "U-48122",
            handle: "@nia.p",
            email: "nia@me.com",
            displayName: "Nia P",
            role: "member",
            kyc: "verified",
            status: "active",
            lifetimeSpentCast: 22400,
            createdAt: daysAgo(90),
          },
          {
            id: "U-48051",
            handle: "@quinn.l",
            email: "q@duck.com",
            displayName: "Quinn L",
            role: "member",
            kyc: "pending",
            status: "pending",
            lifetimeSpentCast: 980,
            createdAt: daysAgo(30),
          },
          {
            id: "U-48140",
            handle: "@spamzz",
            email: "x9@temp.io",
            displayName: "spamzz",
            role: "member",
            kyc: "failed",
            status: "suspended",
            lifetimeSpentCast: 0,
            flags: ["fraud signals"],
            createdAt: daysAgo(2),
          },
        ],
      });

      // ================================================================
      // CREATOR ROSTER — the rest of the prototype's CREATORS (data.jsx).
      // Each creator gets a User owner, a Creator, and a public Channel so
      // home / explore / sidebar look as dense as the prototype.
      // (Nyx is created individually below to keep her existing data.)
      // ================================================================
      type Roster = {
        id: string;
        name: string;
        handle: string;
        email: string;
        brand: string;
        brand2: string;
        category: string;
        followers: number;
        bio: string;
      };
      const roster: Roster[] = [
        { id: "kavi", name: "Kavi Rao", handle: "@kavikitchen", email: "kavi@technotainment.fm", brand: "#dc2626", brand2: "#f97316", category: "live cooking", followers: 412300, bio: "live cooking, michelin technique, unfiltered kitchen." },
        { id: "atlas", name: "Atlas FC", handle: "@atlasfc", email: "atlas@technotainment.fm", brand: "#1e3a8a", brand2: "#3b82f6", category: "lower-league football", followers: 988400, bio: "every matchday live · non-league football, one home." },
        { id: "joon", name: "Joon Park", handle: "@joondraws", email: "joon@technotainment.fm", brand: "#9333ea", brand2: "#6366f1", category: "illustration", followers: 73800, bio: "ink and illustration, timed to your prompts." },
        { id: "rivers", name: "Pip Rivers", handle: "@riverssings", email: "pip@technotainment.fm", brand: "#365314", brand2: "#84cc16", category: "country folk", followers: 39400, bio: "country folk, co-writes and open chord rooms." },
        { id: "tola", name: "Tola Amari", handle: "@tolafixes", email: "tola@technotainment.fm", brand: "#0369a1", brand2: "#06b6d4", category: "electronics repair", followers: 181100, bio: "reviving vintage hi-fi on camera, one capacitor at a time." },
        { id: "ines", name: "Inés Vidal", handle: "@inesskates", email: "ines@technotainment.fm", brand: "#be123c", brand2: "#fb7185", category: "street skate", followers: 596500, bio: "street skating across europe, frame-by-frame breakdowns." },
        { id: "marlowe", name: "Margot Marlowe", handle: "@marlowestudio", email: "margot@technotainment.fm", brand: "#0f766e", brand2: "#22d3ee", category: "ceramics", followers: 84200, bio: "wheel-thrown ceramics, live kiln-opening drops." },
        { id: "demo", name: "Demo Daye", handle: "@demodaye", email: "demo@technotainment.fm", brand: "#fb923c", brand2: "#ef4444", category: "talk show host", followers: 1240000, bio: "the morning show · daily live talk with guests." },
        { id: "wren", name: "Wren Holloway", handle: "@wrenruns", email: "wren@technotainment.fm", brand: "#0ea5e9", brand2: "#6366f1", category: "ultra running", followers: 320900, bio: "ultra running, trail logs and pre-dawn runs." },
        { id: "kola", name: "Kola Adebayo", handle: "@kolasounds", email: "kola@technotainment.fm", brand: "#be185d", brand2: "#7c3aed", category: "afro-fusion dj", followers: 705200, bio: "afro-fusion vinyl sets, rooftops and late nights." },
        { id: "yara", name: "Yara Salam", handle: "@yarawrites", email: "yara@technotainment.fm", brand: "#8b5cf6", brand2: "#3b82f6", category: "novelist · workshop", followers: 156400, bio: "novelist · live writing rooms and prose workshops." },
        { id: "rhett", name: "Rhett Doyle", handle: "@rhettclimbs", email: "rhett@technotainment.fm", brand: "#16a34a", brand2: "#facc15", category: "alpine climbing", followers: 244800, bio: "alpine climbing, expedition logs and gear talk." },
        { id: "minerva", name: "Minerva Cho", handle: "@minervalab", email: "minerva@technotainment.fm", brand: "#0ea5e9", brand2: "#10b981", category: "chess · open analysis", followers: 419300, bio: "live chess and open analysis, openings to endgames." },
        { id: "saber", name: "Saber Esports", handle: "@saberesports", email: "saber@technotainment.fm", brand: "#ef4444", brand2: "#7c3aed", category: "competitive esports", followers: 2400000, bio: "competitive esports · regional to invitational, every map." },
        { id: "halcyon", name: "Halcyon Collective", handle: "@halcyon", email: "halcyon@technotainment.fm", brand: "#06b6d4", brand2: "#8b5cf6", category: "ambient sessions", followers: 184700, bio: "ambient live sessions and release listening events." },
        { id: "marisol", name: "Marisol Vega", handle: "@marisolflies", email: "marisol@technotainment.fm", brand: "#fb7185", brand2: "#facc15", category: "trapeze · circus", followers: 91200, bio: "trapeze and circus arts, backstage and public classes." },
        { id: "ozan", name: "Ozan Demir", handle: "@ozanbuilds", email: "ozan@technotainment.fm", brand: "#f59e0b", brand2: "#dc2626", category: "workshop · woodwork", followers: 502400, bio: "live joinery and woodwork, build-alongs with cut sheets." },
      ];

      await tx.user.createMany({
        data: roster.map((r, i) => ({
          id: `U-CR-${r.id}`,
          handle: r.handle,
          email: r.email,
          displayName: r.name,
          role: "creator" as const,
          kyc: "verified" as const,
          status: "active" as const,
          lifetimeSpentCast: 0,
          createdAt: daysAgo(300 - i * 7),
        })),
      });

      await tx.creator.createMany({
        data: roster.map((r, i) => ({
          id: r.id,
          userId: `U-CR-${r.id}`,
          name: r.name,
          handle: r.handle,
          brand: r.brand,
          brand2: r.brand2,
          category: r.category,
          followers: r.followers,
          bio: r.bio,
          takeRatePct: 12,
          status: "active" as const,
          createdAt: daysAgo(300 - i * 7),
        })),
      });

      await tx.channel.createMany({
        data: roster.map((r, i) => ({
          id: `ch-${r.id}`,
          creatorId: r.id,
          handle: r.handle,
          name: r.name,
          bio: r.bio,
          createdAt: daysAgo(300 - i * 7),
        })),
      });

      // ================================================================
      // CREATOR + CHANNEL — Nyx Okafor
      // ================================================================
      await tx.creator.create({
        data: {
          id: "nyx",
          userId: "U-NYX",
          name: "Nyx Okafor",
          handle: "@nyxsynth",
          brand: "#7c3aed",
          brand2: "#ec4899",
          category: "modular synth",
          followers: 226800,
          bio: "modular synth live sessions, patch sheets, and stems.",
          takeRatePct: 12,
          status: "active",
          createdAt: daysAgo(420),
        },
      });

      await tx.channel.create({
        data: {
          id: "ch-nyx",
          creatorId: "nyx",
          handle: "@nyxsynth",
          name: "Nyx Okafor",
          bio: "modular synth live sessions, patch sheets, and stems.",
          createdAt: daysAgo(420),
        },
      });

      // ---- TIERS — NYX_TIERS / STUDIO.TIERS --------------------------
      await tx.tier.createMany({
        data: [
          {
            id: "tier-listener",
            channelId: "ch-nyx",
            name: "listener",
            priceCast: 250,
            perks: ["live chat colour", "members-only set notes", "early stream alerts"],
            popular: false,
          },
          {
            id: "tier-patch",
            channelId: "ch-nyx",
            name: "patch archive",
            priceCast: 750,
            perks: [
              "everything in listener",
              "downloadable patch sheets",
              "monthly modular q&a",
              "10% off drops",
            ],
            popular: true,
          },
          {
            id: "tier-lab",
            channelId: "ch-nyx",
            name: "sound design lab",
            priceCast: 2200,
            perks: [
              "everything in patch archive",
              "stems for every set",
              "1:1 office hour / quarter",
              "credit on releases",
            ],
            popular: false,
          },
        ],
      });

      // ---- VIDEOS — STUDIO.CONTENT -----------------------------------
      const videos = [
        {
          id: "v1",
          title: "night session #13 · full set",
          slug: "night-session-13",
          status: "published" as const,
          visibility: "public" as const,
          ppvPriceCast: null,
          durationSec: 7380,
          views: 41820,
          castEarned: 8420,
          publishedAt: minsAgo(720),
        },
        {
          id: "v2",
          title: "patch breakdown · the bass thing",
          slug: "patch-breakdown-the-bass-thing",
          status: "published" as const,
          visibility: "members" as const,
          ppvPriceCast: null,
          durationSec: 1680,
          views: 12410,
          castEarned: 3110,
          publishedAt: daysAgo(3),
        },
        {
          id: "v3",
          title: "solstice live · recording",
          slug: "solstice-live-recording",
          status: "published" as const,
          visibility: "ppv" as const,
          ppvPriceCast: 60,
          durationSec: 6480,
          views: 8830,
          castEarned: 14800,
          publishedAt: daysAgo(7),
        },
        {
          id: "v4",
          title: "coffee patch · sunday slow",
          slug: "coffee-patch-sunday-slow",
          status: "published" as const,
          visibility: "public" as const,
          ppvPriceCast: null,
          durationSec: 3120,
          views: 22140,
          castEarned: 2240,
          publishedAt: daysAgo(14),
        },
        {
          id: "v5",
          title: "buchla deep dive · tape loops & feedback",
          slug: "buchla-deep-dive-tape-loops-feedback",
          status: "processing" as const,
          visibility: "public" as const,
          ppvPriceCast: null,
          durationSec: 4320,
          views: 0,
          castEarned: 0,
          publishedAt: null,
        },
        {
          id: "v6",
          title: "studio tour · 2026 rig walkthrough",
          slug: "studio-tour-2026-rig-walkthrough",
          status: "draft" as const,
          visibility: "public" as const,
          ppvPriceCast: null,
          durationSec: 720,
          views: 0,
          castEarned: 0,
          publishedAt: null,
        },
      ];
      for (const v of videos) {
        await tx.video.create({
          data: {
            id: v.id,
            channelId: "ch-nyx",
            title: v.title,
            slug: v.slug,
            description: "modular synth session by Nyx Okafor.",
            metaDescription: `${v.title} — live modular synth from Nyx Okafor.`,
            thumbUrl: `https://picsum.photos/seed/nyx-${v.id}/640/360`,
            ogImageUrl: `https://og.technotainment.fm/v/${v.slug}.png`,
            kind: "vod",
            status: v.status,
            visibility: v.visibility,
            ppvPriceCast: v.ppvPriceCast,
            durationSec: v.durationSec,
            views: v.views,
            castEarned: v.castEarned,
            captions: true,
            publishedAt: v.publishedAt,
          },
        });
      }

      // ---- CHAPTERS on the flagship VOD ------------------------------
      await tx.chapter.createMany({
        data: [
          { videoId: "v1", atSec: 0, label: "intro / patch overview" },
          { videoId: "v1", atSec: 540, label: "the bass thing" },
          { videoId: "v1", atSec: 2400, label: "ambient bridge" },
          { videoId: "v1", atSec: 5100, label: "closer + q&a" },
        ],
      });

      // ---- STREAM (live) — GoLiveScreen / LIVE_PAGE ------------------
      await tx.stream.create({
        data: {
          id: "str-nyx-1",
          channelId: "ch-nyx",
          title: "buchla patch · night session #13",
          category: "modular synth",
          visibility: "public",
          status: "live",
          rtmpUrl: "rtmp://ingest.technotainment.fm/live",
          streamKey: "sk_live_nyx_8f2a9c41",
          healthResolution: "1080p60",
          healthBitrateMbps: 6.2,
          healthState: "healthy",
          viewers: 892,
          startedAt: minsAgo(74),
        },
      });

      // ---- SCHEDULED STREAMS — STUDIO.SCHEDULE -----------------------
      await tx.scheduledStream.createMany({
        data: [
          {
            id: "sch1",
            channelId: "ch-nyx",
            title: "night session #14",
            whenLabel: "today · 21:00",
            category: "modular synth",
            visibility: "public",
            reminders: 4820,
          },
          {
            id: "sch2",
            channelId: "ch-nyx",
            title: "members q&a · patch routing",
            whenLabel: "tomorrow · 19:00",
            category: "talk",
            visibility: "members",
            reminders: 612,
          },
          {
            id: "sch3",
            channelId: "ch-nyx",
            title: "release listening · 'glass tide'",
            whenLabel: "mon · 21:00",
            category: "music",
            visibility: "ppv",
            reminders: 1340,
          },
        ],
      });

      // ---- PRODUCTS — NYX_STORE / STUDIO.PRODUCTS --------------------
      await tx.product.createMany({
        data: [
          {
            id: "n1",
            channelId: "ch-nyx",
            kind: "drop",
            name: "field recordings · vol 4",
            priceCast: 120,
            edition: "98 / 200",
            imgUrl: "https://picsum.photos/seed/nyx-store-1/640/360",
            status: "live",
            sold: 412,
            stock: null,
          },
          {
            id: "n3",
            channelId: "ch-nyx",
            kind: "ppv",
            name: "summer solstice live · vod",
            priceCast: 60,
            edition: "rentable",
            imgUrl: "https://picsum.photos/seed/nyx-store-3/640/360",
            status: "live",
            sold: 1240,
            stock: null,
          },
          {
            id: "n4",
            channelId: "ch-nyx",
            kind: "merch",
            name: "patch-sheet riso poster",
            priceCast: 240,
            edition: "ships worldwide",
            imgUrl: "https://picsum.photos/seed/nyx-store-4/640/360",
            status: "live",
            sold: 240,
            stock: 38,
          },
        ],
      });

      // ================================================================
      // LIVE STREAMS — LIVE (data.jsx). Spread across the roster so the
      // home "live now" grid is dense. All status=live, public.
      // ================================================================
      const liveStreams: {
        id: string;
        cid: string;
        title: string;
        category: string;
        viewers: number;
        startedMins: number;
      }[] = [
        { id: "str-atlas-1", cid: "atlas", title: "atlas fc vs northgate reserves", category: "sports", viewers: 47200, startedMins: 67 },
        { id: "str-saber-1", cid: "saber", title: "valorant — grand finals · map 3", category: "esports", viewers: 184320, startedMins: 142 },
        { id: "str-kavi-1", cid: "kavi", title: "sunday roast · you pick the bird", category: "talk", viewers: 4218, startedMins: 38 },
        { id: "str-rivers-1", cid: "rivers", title: "open chord-building room", category: "music", viewers: 318, startedMins: 21 },
        { id: "str-tola-1", cid: "tola", title: "reviving a 1978 marantz 2245", category: "education", viewers: 1607, startedMins: 95 },
        { id: "str-ines-1", cid: "ines", title: "barcelona · gothic quarter session", category: "sports", viewers: 9842, startedMins: 52 },
        { id: "str-demo-1", cid: "demo", title: "the morning show · with bea & lin", category: "talk", viewers: 22140, startedMins: 84 },
        { id: "str-kola-1", cid: "kola", title: "saturday rooftop · vinyl only", category: "music", viewers: 6210, startedMins: 130 },
        { id: "str-minerva-1", cid: "minerva", title: "live chess · sicilian deep dive", category: "education", viewers: 3920, startedMins: 46 },
        { id: "str-rhett-1", cid: "rhett", title: "patagonia · day 14 base camp", category: "sports", viewers: 18230, startedMins: 210 },
        { id: "str-joon-1", cid: "joon", title: "ink drawing · timed to viewer prompts", category: "talk", viewers: 1182, startedMins: 73 },
        { id: "str-marlowe-1", cid: "marlowe", title: "kiln-open · 24 piece drop tonight", category: "talk", viewers: 612, startedMins: 18 },
        { id: "str-wren-1", cid: "wren", title: "trail 17 · pre-dawn run", category: "sports", viewers: 4081, startedMins: 64 },
        { id: "str-halcyon-1", cid: "halcyon", title: "ambient · pre-rain set", category: "music", viewers: 2280, startedMins: 40 },
        { id: "str-ozan-1", cid: "ozan", title: "live joinery · cherry sideboard", category: "education", viewers: 1342, startedMins: 110 },
        { id: "str-yara-1", cid: "yara", title: "writing room · members open", category: "education", viewers: 487, startedMins: 29 },
      ];
      await tx.stream.createMany({
        data: liveStreams.map((s) => ({
          id: s.id,
          channelId: `ch-${s.cid}`,
          title: s.title,
          category: s.category,
          visibility: "public" as const,
          status: "live" as const,
          rtmpUrl: "rtmp://ingest.technotainment.fm/live",
          streamKey: `sk_live_${s.cid}_${s.id.slice(-4)}`,
          healthResolution: "1080p60",
          healthBitrateMbps: 6.0,
          healthState: "healthy" as const,
          viewers: s.viewers,
          startedAt: minsAgo(s.startedMins),
        })),
      });

      // ================================================================
      // VODS — published public videos across channels (FOLLOWED_LATEST,
      // NYX_LIBRARY-style). Gives explore / channel pages real content.
      // ================================================================
      const rosterVideos: {
        cid: string;
        title: string;
        slug: string;
        kind: "vod" | "clip";
        durationSec: number;
        views: number;
        daysAgo: number;
      }[] = [
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
      await tx.video.createMany({
        data: rosterVideos.map((v, i) => ({
          id: `rv-${i + 1}`,
          channelId: `ch-${v.cid}`,
          title: v.title,
          slug: v.slug,
          description: `${v.title} — from ${v.cid}.`,
          metaDescription: `${v.title} on Metascape.`,
          thumbUrl: `https://picsum.photos/seed/${v.slug}/640/360`,
          ogImageUrl: `https://og.technotainment.fm/v/${v.slug}.png`,
          kind: v.kind,
          status: "published" as const,
          visibility: "public" as const,
          ppvPriceCast: null,
          durationSec: v.durationSec,
          views: v.views,
          castEarned: Math.round(v.views / 12),
          captions: true,
          publishedAt: daysAgo(v.daysAgo),
        })),
      });

      // ================================================================
      // EXTRA TIERS + PRODUCTS — so a few other channels aren't empty.
      // ================================================================
      await tx.tier.createMany({
        data: [
          { id: "tier-atlas-away", channelId: "ch-atlas", name: "away pass", priceCast: 750, perks: ["every away match live", "post-match coach feed", "tactics breakdowns"], popular: true },
          { id: "tier-marlowe-insider", channelId: "ch-marlowe", name: "studio insider", priceCast: 900, perks: ["first dibs on kiln drops", "members-only process streams", "10% off the store"], popular: true },
          { id: "tier-halcyon-stems", channelId: "ch-halcyon", name: "stems access", priceCast: 1200, perks: ["stems for every release", "release listening events", "credit on records"], popular: false },
        ],
      });
      await tx.product.createMany({
        data: [
          { id: "p-marlowe-bowl", channelId: "ch-marlowe", kind: "drop", name: "small bowl · kiln drop 048", priceCast: 180, edition: "62 / 150", imgUrl: "https://picsum.photos/seed/ceramic-bowl/640/360", status: "live", sold: 88, stock: 62 },
          { id: "p-kavi-apron", channelId: "ch-kavi", kind: "merch", name: "kavi's house apron", priceCast: 240, edition: "ships worldwide", imgUrl: "https://picsum.photos/seed/chef-apron/640/360", status: "live", sold: 1820, stock: null },
          { id: "p-joon-ink", channelId: "ch-joon", kind: "drop", name: "ink drawing · sat 4-hour", priceCast: 320, edition: "1 of 1", imgUrl: "https://picsum.photos/seed/ink-sketch-large/640/360", status: "live", sold: 1, stock: 0 },
          { id: "p-ozan-build", channelId: "ch-ozan", kind: "course", name: "live build · cherry sideboard", priceCast: 1240, edition: "vod + sheets", imgUrl: "https://picsum.photos/seed/woodworking-tools/640/360", status: "live", sold: 340, stock: null },
          { id: "p-demo-pass", channelId: "ch-demo", kind: "ppv", name: "live show · annual pass", priceCast: 2400, edition: "12 months", imgUrl: "https://picsum.photos/seed/microphone-on-air/640/360", status: "live", sold: 5200, stock: null },
        ],
      });

      // ================================================================
      // FOLLOWS — @mira.k (U-48210) follows 18 channels so the sidebar
      // shows "following · 18". Spread a few follows from other users too.
      // ================================================================
      const miraFollows = [
        "nyx", "kavi", "atlas", "joon", "rivers", "tola", "ines", "marlowe",
        "demo", "wren", "kola", "yara", "rhett", "minerva", "saber", "halcyon",
        "marisol", "ozan",
      ];
      await tx.follow.createMany({
        data: miraFollows.map((cid) => ({
          userId: "U-48210",
          channelId: `ch-${cid}`,
          createdAt: daysAgo(120),
        })),
      });
      await tx.follow.createMany({
        data: [
          { userId: "U-48199", channelId: "ch-nyx", createdAt: daysAgo(150) },
          { userId: "U-48199", channelId: "ch-atlas", createdAt: daysAgo(100) },
          { userId: "U-48199", channelId: "ch-kavi", createdAt: daysAgo(60) },
          { userId: "U-48155", channelId: "ch-nyx", createdAt: daysAgo(360) },
          { userId: "U-48155", channelId: "ch-saber", createdAt: daysAgo(200) },
          { userId: "U-48122", channelId: "ch-nyx", createdAt: daysAgo(90) },
          { userId: "U-48122", channelId: "ch-ines", createdAt: daysAgo(45) },
        ],
      });

      // ================================================================
      // MEMBERSHIPS — viewers subscribed to Nyx tiers
      // ================================================================
      await tx.membership.createMany({
        data: [
          {
            id: "mem-mira",
            userId: "U-48210",
            tierId: "tier-lab",
            channelId: "ch-nyx",
            status: "active",
            startedAt: daysAgo(240),
            renewsAt: daysAgo(-5),
            priceCastLocked: 2200,
          },
          {
            id: "mem-theo",
            userId: "U-48155",
            tierId: "tier-patch",
            channelId: "ch-nyx",
            status: "active",
            startedAt: daysAgo(365),
            renewsAt: daysAgo(-5),
            priceCastLocked: 750,
          },
          {
            id: "mem-oren",
            userId: "U-48199",
            tierId: "tier-patch",
            channelId: "ch-nyx",
            status: "active",
            startedAt: daysAgo(150),
            renewsAt: daysAgo(-5),
            priceCastLocked: 750,
          },
          {
            id: "mem-nia",
            userId: "U-48122",
            tierId: "tier-listener",
            channelId: "ch-nyx",
            status: "active",
            startedAt: daysAgo(90),
            renewsAt: daysAgo(-5),
            priceCastLocked: 250,
          },
        ],
      });

      // ================================================================
      // PAYMENT METHODS — saved cards/wallets for @mira.k (TOPUP_METHODS)
      // ================================================================
      await tx.paymentMethod.createMany({
        data: [
          {
            id: "pm-mira-visa",
            userId: "U-48210",
            methodId: "visa",
            label: "Visa ··4291",
            group: "card",
            sub: "expires 09/28 · default",
            needs3ds: true,
          },
          {
            id: "pm-mira-applepay",
            userId: "U-48210",
            methodId: "apple-pay",
            label: "Apple Pay",
            group: "express",
            sub: "Touch ID / Face ID",
            instant: true,
            regions: "global",
          },
        ],
      });

      // ================================================================
      // WALLET LEDGER (append-only) — sum of deltaCast IS the balance.
      // @mira.k: +5000 topup, then spends → balance 12480 to match prototype.
      //   12480 = 5000 + 12480 - 5000 ... we build it from real entries:
      //   topup 17500, spends -5020 → 12480. Each row references a Transaction id.
      // ================================================================
      await tx.walletEntry.createMany({
        data: [
          // top-ups (money in)
          { id: "we-1", userId: "U-48210", deltaCast: 5000, kind: "topup", ref: "TXR-9F2A", createdAt: daysAgo(5) },
          { id: "we-2", userId: "U-48210", deltaCast: 5000, kind: "topup", ref: "TXR-TOP2", createdAt: daysAgo(12) },
          { id: "we-3", userId: "U-48210", deltaCast: 7500, kind: "topup", ref: "TXR-TOP3", createdAt: daysAgo(20) },
          // spends (money out)
          { id: "we-4", userId: "U-48210", deltaCast: -25, kind: "tip", ref: "TXR-T01", createdAt: minsAgo(620) },
          { id: "we-5", userId: "U-48210", deltaCast: -120, kind: "drop", ref: "TXR-9F25", createdAt: minsAgo(540) },
          { id: "we-6", userId: "U-48210", deltaCast: -50, kind: "tip", ref: "TXR-T02", createdAt: minsAgo(480) },
          { id: "we-7", userId: "U-48210", deltaCast: -750, kind: "membership", ref: "TXR-M01", createdAt: daysAgo(1) },
          { id: "we-8", userId: "U-48210", deltaCast: -180, kind: "drop", ref: "TXR-D01", createdAt: daysAgo(1) },
          { id: "we-9", userId: "U-48210", deltaCast: -200, kind: "ppv", ref: "TXR-P01", createdAt: daysAgo(2) },
          { id: "we-10", userId: "U-48210", deltaCast: -2200, kind: "membership", ref: "TXR-M02", createdAt: daysAgo(3) },
          { id: "we-11", userId: "U-48210", deltaCast: -300, kind: "ppv", ref: "TXR-P02", createdAt: daysAgo(4) },
          { id: "we-12", userId: "U-48210", deltaCast: -195, kind: "gift", ref: "TXR-G01", createdAt: daysAgo(4) },
          // → sum = 17500 - 4020 = 13480 ... adjust to 12480 with one more spend
          { id: "we-13", userId: "U-48210", deltaCast: -1000, kind: "tip", ref: "TXR-T03", createdAt: daysAgo(2) },
          // other users (small ledgers)
          { id: "we-oren-1", userId: "U-48199", deltaCast: 1000, kind: "topup", ref: "TXR-OREN1", createdAt: daysAgo(8) },
          { id: "we-oren-2", userId: "U-48199", deltaCast: -250, kind: "tip", ref: "TXR-9F28", createdAt: minsAgo(6) },
          { id: "we-oren-3", userId: "U-48199", deltaCast: -430, kind: "membership", ref: "TXR-OREN3", createdAt: daysAgo(3) },
          { id: "we-nia-1", userId: "U-48122", deltaCast: 2000, kind: "topup", ref: "TXR-NIA1", createdAt: daysAgo(10) },
          { id: "we-nia-2", userId: "U-48122", deltaCast: -120, kind: "drop", ref: "TXR-9F25B", createdAt: minsAgo(11) },
          { id: "we-nia-3", userId: "U-48122", deltaCast: -40, kind: "tip", ref: "TXR-NIA3", createdAt: daysAgo(1) },
          { id: "we-theo-1", userId: "U-48155", deltaCast: 12000, kind: "topup", ref: "TXR-THEO1", createdAt: daysAgo(15) },
          { id: "we-theo-2", userId: "U-48155", deltaCast: -2900, kind: "gift", ref: "TXR-THEO2", createdAt: daysAgo(2) },
        ],
      });
      // @mira.k balance check: 17500 - 5020 = 12480 ✓ (matches WALLET.balance)

      // ================================================================
      // TRANSACTIONS — ADMIN.TXNS (grossFiat is display String, topups only)
      // ================================================================
      await tx.transaction.createMany({
        data: [
          {
            id: "TXR-9F2A",
            userId: "U-48210",
            channelId: null,
            kind: "topup",
            grossFiat: "£42.00",
            cast: 4200,
            method: "apple-pay",
            status: "settled",
            createdAt: minsAgo(2),
          },
          {
            id: "TXR-9F28",
            userId: "U-48199",
            channelId: "ch-nyx",
            kind: "tip",
            grossFiat: null,
            cast: -250,
            method: "balance",
            status: "settled",
            createdAt: minsAgo(6),
          },
          {
            id: "TXR-9F25",
            userId: "U-48122",
            channelId: "ch-nyx",
            kind: "drop",
            grossFiat: null,
            cast: -120,
            method: "balance",
            status: "settled",
            createdAt: minsAgo(11),
          },
          {
            id: "TXR-9F1F",
            userId: "U-48155",
            channelId: null,
            kind: "topup",
            grossFiat: "$25.00",
            cast: 2000,
            method: "google-pay",
            status: "settled",
            createdAt: minsAgo(18),
          },
          {
            id: "TXR-9F1A",
            userId: "U-48051",
            channelId: null,
            kind: "topup",
            grossFiat: "£10.00",
            cast: 1000,
            method: "paypal",
            status: "pending",
            createdAt: minsAgo(22),
          },
          {
            id: "TXR-9F05",
            userId: "U-48140",
            channelId: null,
            kind: "topup",
            grossFiat: "£80.00",
            cast: 8000,
            method: "visa",
            status: "reversed",
            flag: "chargeback",
            createdAt: minsAgo(44),
          },
          {
            id: "TXR-9EF8",
            userId: "U-48155",
            channelId: null,
            kind: "topup",
            grossFiat: "£20.00",
            cast: 2000,
            method: "venmo",
            status: "settled",
            createdAt: minsAgo(60),
          },
        ],
      });

      // ================================================================
      // CONSENT GRANTS — profile.jsx (per-creator scopes)
      // ================================================================
      await tx.consentGrant.create({
        data: {
          userId: "U-48210",
          creatorId: "nyx",
          watchHistory: true,
          chatMessages: true,
          tipsPurchases: true,
          marketingEmail: false,
        },
      });

      // ================================================================
      // PAYOUT METHODS + PAYOUTS + PAYOUT RUNS
      // ================================================================
      await tx.payoutMethod.create({
        data: {
          id: "pom-nyx-bank",
          creatorId: "nyx",
          methodId: "bank",
          label: "Barclays ··6643",
          sub: "GBP · faster payments",
          fee: "free",
          speed: "1–2 days",
          isDefault: true,
        },
      });

      await tx.payout.createMany({
        data: [
          { id: "PO-2041", creatorId: "nyx", payoutMethodId: "pom-nyx-bank", cast: 188600, feeCast: 0, netFiat: "£1,886.00", method: "Barclays ··6643", status: "paid", date: daysAgo(29) },
          { id: "PO-1990", creatorId: "nyx", payoutMethodId: "pom-nyx-bank", cast: 172400, feeCast: 0, netFiat: "£1,724.00", method: "Barclays ··6643", status: "paid", date: daysAgo(59) },
          { id: "PO-1944", creatorId: "nyx", payoutMethodId: "pom-nyx-bank", cast: 164900, feeCast: 0, netFiat: "£1,649.00", method: "Barclays ··6643", status: "paid", date: daysAgo(90) },
        ],
      });

      await tx.payoutRun.createMany({
        data: [
          { id: "RUN-2041", date: daysAgo(29), creatorCount: 8420, cast: 2410000, method: "mixed", status: "scheduled" },
          { id: "RUN-2009", date: daysAgo(59), creatorCount: 8120, cast: 2210000, method: "mixed", status: "paid" },
          { id: "RUN-1977", date: daysAgo(90), creatorCount: 7840, cast: 2040000, method: "mixed", status: "paid" },
        ],
      });

      // ================================================================
      // REPORTS — ADMIN.REPORTS (moderation queue)
      // ================================================================
      await tx.report.createMany({
        data: [
          { id: "R-9921", targetType: "stream", targetId: "@grid.runner", reason: "harassment in chat", reportCount: 14, severity: "high", status: "open", createdAt: minsAgo(8) },
          { id: "R-9918", targetType: "product", targetId: "field recordings · vol 4", reason: "copyright claim", reportCount: 3, severity: "medium", status: "open", createdAt: minsAgo(41) },
          { id: "R-9911", targetType: "user", targetId: "@x_promo_x", reason: "spam / scam links", reportCount: 28, severity: "high", status: "open", createdAt: minsAgo(60) },
          { id: "R-9904", targetType: "vod", targetId: "night session #13", reason: "music licensing", reportCount: 1, severity: "low", status: "investigating", createdAt: minsAgo(180) },
        ],
      });

      // ================================================================
      // CONNECTOR REGISTRY — ADMIN.CONNECTORS
      // ================================================================
      const connectors: {
        id: string;
        name: string;
        cat: string;
        status: "live" | "beta" | "off";
        desc: string;
        events: string | null;
      }[] = [
        { id: "stripe", name: "Stripe", cat: "payments", status: "live", desc: "card processing, 3-D Secure, radar fraud", events: "1.2M / mo" },
        { id: "adyen", name: "Adyen", cat: "payments", status: "live", desc: "global acquiring + local methods", events: "840k / mo" },
        { id: "paypal", name: "PayPal / Venmo", cat: "payments", status: "live", desc: "wallet + Venmo (US)", events: "210k / mo" },
        { id: "applepay", name: "Apple Pay", cat: "payments", status: "live", desc: "merchant tokenization", events: null },
        { id: "googlepay", name: "Google Pay", cat: "payments", status: "live", desc: "merchant tokenization", events: null },
        { id: "circle", name: "Circle (USDC)", cat: "payments", status: "beta", desc: "stablecoin top-ups & payouts", events: "12k / mo" },
        { id: "persona", name: "Persona", cat: "identity", status: "live", desc: "KYC / KYB, age & ID verification", events: "9.8k / mo" },
        { id: "sift", name: "Sift", cat: "risk", status: "live", desc: "fraud & chargeback scoring", events: "1.1M / mo" },
        { id: "mux", name: "Mux", cat: "media", status: "live", desc: "live ingest, transcode, VOD", events: "live" },
        { id: "cloudflare", name: "Cloudflare", cat: "media", status: "live", desc: "CDN, stream edge, WAF", events: null },
        { id: "twilio", name: "Twilio", cat: "comms", status: "live", desc: "SMS OTP & alerts", events: "320k / mo" },
        { id: "sendgrid", name: "SendGrid", cat: "comms", status: "live", desc: "transactional email", events: "2.4M / mo" },
        { id: "avalara", name: "Avalara", cat: "tax", status: "live", desc: "VAT / sales-tax & 1099/DAC7", events: null },
        { id: "segment", name: "Segment", cat: "data", status: "live", desc: "product analytics pipeline", events: null },
        { id: "openai", name: "AI Moderation", cat: "trust", status: "beta", desc: "auto-flag chat, images, audio", events: "live" },
        { id: "datadog", name: "Datadog", cat: "infra", status: "live", desc: "APM, logs, alerting", events: null },
        { id: "gsc", name: "Google Search Console", cat: "growth", status: "live", desc: "index coverage, search queries & sitemaps", events: null },
        { id: "bing", name: "Bing Webmaster", cat: "growth", status: "live", desc: "Bing index + IndexNow instant submit", events: null },
        { id: "ahrefs", name: "Ahrefs", cat: "growth", status: "beta", desc: "rank tracking, keywords & backlinks", events: "weekly" },
        { id: "branch", name: "Branch", cat: "growth", status: "live", desc: "deep links & app indexing (universal links)", events: "180k / mo" },
        { id: "sanity", name: "Sanity CMS", cat: "growth", status: "live", desc: "marketing site & blog · programmatic SEO", events: null },
        { id: "ogimage", name: "OG Image Service", cat: "growth", status: "live", desc: "dynamic share cards per video & creator", events: "live" },
      ];
      await tx.connector.createMany({ data: connectors });

      // ================================================================
      // API KEYS — ADMIN.API_KEYS
      // ================================================================
      await tx.apiKey.createMany({
        data: [
          { id: "pk_live", label: "Publishable key", scope: "client", value: "pk_live_51Nx···a8F2", secret: false, lastUsed: "live" },
          { id: "sk_live", label: "Secret key", scope: "server", value: "sk_live_····················", secret: true, lastUsed: "live" },
          { id: "whsec", label: "Webhook signing", scope: "server", value: "whsec_····················", secret: true, lastUsed: "2m ago" },
          { id: "pk_test", label: "Test key", scope: "client", value: "pk_test_51Nx···Q19z", secret: false, lastUsed: "1d ago" },
        ],
      });

      // ================================================================
      // WEBHOOKS — ADMIN.WEBHOOKS
      // ================================================================
      await tx.webhook.createMany({
        data: [
          { url: "https://api.technotainment.fm/hooks/payments", events: "payment.*", status: "healthy", delivered: "99.9%" },
          { url: "https://api.technotainment.fm/hooks/payouts", events: "payout.*", status: "healthy", delivered: "100%" },
          { url: "https://api.technotainment.fm/hooks/moderation", events: "report.* · strike.*", status: "degraded", delivered: "97.2%" },
        ],
      });

      // ================================================================
      // FEATURE FLAGS — ADMIN.FLAGS
      // ================================================================
      await tx.featureFlag.createMany({
        data: [
          { id: "small-rooms", label: "small rooms (metacast)", on: true, rollout: "100%", desc: "co-watch rooms with shared CAST pot", group: "live" },
          { id: "usdc", label: "USDC top-up & payout", on: true, rollout: "100%", desc: "stablecoin rails", group: "live" },
          { id: "ai-mod", label: "AI auto-moderation", on: true, rollout: "60%", desc: "auto-flag risky chat / media", group: "live" },
          { id: "gift-subs", label: "gifted subscriptions", on: true, rollout: "100%", desc: "buy subs for other viewers", group: "live" },
          { id: "instant-pay", label: "instant payouts", on: false, rollout: "0%", desc: "to debit card, 1.5% fee", group: "live" },
          { id: "creator-tax", label: "DAC7 tax reporting", on: true, rollout: "EU", desc: "auto file creator earnings", group: "live" },
          { id: "courses", label: "courses & lessons", on: false, rollout: "0%", desc: "multi-lesson paid courses in the store", group: "roadmap" },
          { id: "native-apps", label: "native mobile apps", on: false, rollout: "0%", desc: "iOS / Android apps + in-app purchase", group: "roadmap" },
          { id: "bnpl", label: "buy-now-pay-later", on: false, rollout: "0%", desc: "Klarna pay-in-3 at top-up", group: "roadmap" },
          { id: "region-us", label: "launch United States", on: false, rollout: "0%", desc: "open US sign-ups, USD, 1099-K", group: "roadmap" },
          { id: "referrals", label: "referral / affiliate", on: false, rollout: "0%", desc: "reward fans for inviting friends", group: "roadmap" },
          { id: "blog-cms", label: "marketing blog & CMS", on: false, rollout: "0%", desc: "programmatic-SEO content site", group: "roadmap" },
        ],
      });

      // ================================================================
      // AUDIT LOG — ADMIN.AUDIT (append-only)
      // ================================================================
      await tx.auditEvent.createMany({
        data: [
          { who: "you", action: "suspended user @spamzz", kind: "moderation", when: minsAgo(12) },
          { who: "sam.field", action: "approved creator @lumen.fields", kind: "creators", when: minsAgo(60) },
          { who: "system", action: "auto-flagged R-9911 (28 reports)", kind: "trust", when: minsAgo(60) },
          { who: "ada.lin", action: "set @gridrunner take-rate to 10%", kind: "finance", when: minsAgo(180) },
          { who: "you", action: "rotated webhook signing secret", kind: "security", when: minsAgo(300) },
          { who: "system", action: "payout RUN-2009 paid · 8,120 creators", kind: "finance", when: daysAgo(1) },
        ],
      });

      // ================================================================
      // ADMIN TEAM — ADMIN.ADMIN_TEAM (RBAC)
      // ================================================================
      await tx.adminUser.createMany({
        data: [
          { name: "You (Owner)", email: "ops@technotainment.fm", role: "owner", mfa: true },
          { name: "Sam Field", email: "sam@technotainment.fm", role: "trust_safety", mfa: true },
          { name: "Ada Lin", email: "ada@technotainment.fm", role: "finance", mfa: true },
          { name: "Ravi Okonkwo", email: "ravi@technotainment.fm", role: "support", mfa: false },
        ],
      });
    },
    { timeout: 30_000 },
  );

  // ---- report derived balance for sanity (not stored) ----------------
  const entries = await prisma.walletEntry.findMany({ where: { userId: "U-48210" } });
  const balance = entries.reduce((a, e) => a + e.deltaCast, 0);
  console.log(`Seed complete. @mira.k derived castBalance = ${balance} CAST (expect 12480).`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
