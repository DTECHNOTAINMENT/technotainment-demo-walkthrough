/**
 * Creator Studio service — channel onboarding, content/upload, and go-live. Media goes
 * through the VideoProvider adapter (Mux mock in dev). Onboarding mints a FRESH empty
 * channel for the signed-in user (not the seeded Nyx demo) per HANDOFF.md §9.
 */
import { prisma } from "@/lib/db";
import { video } from "@/lib/integrations";
import { getCurrentSession } from "@/lib/session";
import { economy } from "@/lib/config";
import { demoCreatorChannel } from "@/lib/fixtures-studio";
import { catImage } from "@/lib/img";

export class StudioError extends Error {}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64) || "untitled";
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  for (let i = 2; await prisma.video.findUnique({ where: { slug }, select: { id: true } }); i++) {
    slug = `${base}-${i}`;
  }
  return slug;
}

/** The creator + channel owned by the signed-in user. Throws if not a creator. */
export async function requireCreatorChannel() {
  const session = await getCurrentSession();
  if (!session) throw new StudioError("not signed in");

  // try the real db first. on throw (no db / unreachable) fall back to the demo
  // creator fixture so the whole studio works with zero backend. real db wins
  // when present. a genuine non-creator session still gets StudioError, so a
  // brand-new member is still routed to onboarding.
  try {
    const creator = await prisma.creator.findUnique({
      where: { userId: session.userId },
      include: { channel: true },
    });
    if (!creator?.channel) throw new StudioError("no creator channel");
    return { session, creator, channel: creator.channel };
  } catch (e) {
    if (e instanceof StudioError) throw e; // db reachable but not a creator
    // no db — only creator-role sessions get the demo studio (nyx). a genuine
    // non-creator session still gets StudioError, so onboarding still shows.
    if (session.role !== "creator") throw new StudioError("no creator channel");
    const demo = demoCreatorChannel();
    type Creator = NonNullable<Awaited<ReturnType<typeof prisma.creator.findUnique>>>;
    type Channel = NonNullable<Awaited<ReturnType<typeof prisma.channel.findUnique>>>;
    return {
      session,
      creator: demo.creator as unknown as Creator,
      channel: demo.channel as unknown as Channel,
    };
  }
}

/** Mint a creator + channel + first tier + payout method for the signed-in user. */
export async function onboard(input: {
  userId: string;
  name: string;
  handle: string; // without leading @ is fine; we normalise
  category: string;
  bio?: string;
  brand?: string;
  brand2?: string;
  firstTier: { name: string; priceCast: number; perks: string[] };
  payoutMethod: { methodId: string; label: string };
}) {
  const handle = input.handle.startsWith("@") ? input.handle : `@${slugify(input.handle)}`;
  // Random suffix avoids primary-key collisions when two handles slugify alike (URLs use @handle).
  const rand = crypto.randomUUID().slice(0, 8);
  const creatorId = `cr-${slugify(input.handle)}-${rand}`;
  const channelId = `ch-${slugify(input.handle)}-${rand}`;

  try {
    const existing = await prisma.creator.findUnique({ where: { handle } });
    if (existing) throw new StudioError("handle taken");
    return await onboardDb(input, handle, creatorId, channelId, rand);
  } catch (err) {
    if (err instanceof StudioError) throw err;
    // No-DB demo: simulate the minted channel so onboarding completes and routes to /studio.
    return { creatorId, channelId };
  }
}

async function onboardDb(
  input: Parameters<typeof onboard>[0],
  handle: string,
  creatorId: string,
  channelId: string,
  rand: string,
) {
  return prisma.$transaction(async (tx) => {
    const creator = await tx.creator.create({
      data: {
        id: creatorId,
        userId: input.userId,
        name: input.name,
        handle,
        brand: input.brand ?? "#7c3aed",
        brand2: input.brand2 ?? "#ec4899",
        category: input.category,
        bio: input.bio,
        takeRatePct: Math.round(economy.platformTakeRate * 100),
        status: "active",
      },
    });
    const channel = await tx.channel.create({
      data: { id: channelId, creatorId: creator.id, handle, name: input.name, bio: input.bio },
    });
    await tx.tier.create({
      data: {
        id: `tier-${rand}-1`,
        channelId: channel.id,
        name: input.firstTier.name,
        priceCast: input.firstTier.priceCast,
        perks: input.firstTier.perks,
      },
    });
    await tx.payoutMethod.create({
      data: {
        creatorId: creator.id,
        methodId: input.payoutMethod.methodId,
        label: input.payoutMethod.label,
        isDefault: true,
      },
    });
    await tx.user.update({ where: { id: input.userId }, data: { role: "creator" } });
    return { creatorId: creator.id, channelId: channel.id };
  });
}

// ---- Content / upload ----

export async function createVideoUpload(input: { channelId: string; title: string }) {
  const upload = await video.createUpload({ channelId: input.channelId });
  const base = slugify(input.title);
  try {
    const slug = await uniqueSlug(base);
    const created = await prisma.video.create({
      data: {
        id: upload.assetId,
        channelId: input.channelId,
        title: input.title,
        slug,
        thumbUrl: catImage(null, slug),
        status: "processing",
        visibility: "public",
      },
    });
    return { videoId: created.id, slug, uploadUrl: upload.uploadUrl };
  } catch {
    // No-DB demo: simulate the created draft so the upload flow completes.
    return { videoId: upload.assetId, slug: `${base}-${Date.now().toString(36).slice(-4)}`, uploadUrl: upload.uploadUrl };
  }
}

export async function updateVideo(
  videoId: string,
  channelId: string,
  data: {
    title?: string;
    description?: string;
    metaDescription?: string;
    slug?: string;
    visibility?: "public" | "members" | "ppv";
    ppvPriceCast?: number | null;
    captions?: boolean;
    publish?: boolean;
  },
) {
  try {
    const owned = await prisma.video.findFirst({ where: { id: videoId, channelId }, select: { id: true } });
    if (!owned) throw new StudioError("video not found");
    return await prisma.video.update({
      where: { id: videoId },
      data: {
        title: data.title,
        description: data.description,
        metaDescription: data.metaDescription,
        slug: data.slug ? await uniqueSlug(slugify(data.slug)) : undefined,
        visibility: data.visibility,
        ppvPriceCast: data.ppvPriceCast,
        captions: data.captions,
        ...(data.publish ? { status: "published", publishedAt: new Date() } : {}),
      },
    });
  } catch (err) {
    if (err instanceof StudioError) throw err;
    // No-DB demo: echo the edit back so the editor's save completes.
    return { id: videoId, slug: data.slug ? slugify(data.slug) : undefined, status: data.publish ? "published" : "draft" };
  }
}

// ---- Go live ----

export async function startStream(input: { channelId: string; title: string; category: string }) {
  const live = await video.createLiveStream({ channelId: input.channelId });
  const id = `st-${Date.now().toString(36)}`;
  try {
    const stream = await prisma.stream.create({
      data: {
        id,
        channelId: input.channelId,
        title: input.title,
        category: input.category,
        status: "live",
        rtmpUrl: live.rtmpUrl,
        streamKey: live.streamKey,
        healthResolution: "1080p60",
        healthBitrateMbps: 6.0,
        healthState: "healthy",
        startedAt: new Date(),
      },
    });
    return { streamId: stream.id, streamKey: stream.streamKey, rtmpUrl: stream.rtmpUrl };
  } catch {
    // No-DB demo: the encoder details still come from the (mock) provider.
    return { streamId: id, streamKey: live.streamKey, rtmpUrl: live.rtmpUrl };
  }
}

export async function stopStream(streamId: string, channelId: string) {
  const ended = await video.endLiveStream(streamId);
  try {
    const stream = await prisma.stream.findFirst({ where: { id: streamId, channelId } });
    if (!stream) throw new StudioError("stream not found");
    const slug = await uniqueSlug(slugify(`${stream.title}-replay`));
    const vod = await prisma.video.create({
      data: {
        id: ended.recordingAssetId,
        channelId,
        title: `${stream.title} (replay)`,
        slug,
        thumbUrl: catImage(stream.category, slug),
        status: "published",
        visibility: "public",
        publishedAt: new Date(),
      },
    });
    await prisma.stream.update({ where: { id: streamId }, data: { status: "ended", recordingVideoId: vod.id } });
    return { recordingVideoId: vod.id, slug };
  } catch (err) {
    if (err instanceof StudioError) throw err;
    // No-DB demo: simulate the recording → VOD result.
    return { recordingVideoId: ended.recordingAssetId, slug: `replay-${Date.now().toString(36).slice(-4)}` };
  }
}

export async function rotateStreamKey(streamId: string, channelId: string) {
  const live = await video.createLiveStream({ channelId });
  try {
    const stream = await prisma.stream.findFirst({ where: { id: streamId, channelId } });
    if (!stream) throw new StudioError("stream not found");
    await prisma.stream.update({ where: { id: streamId }, data: { streamKey: live.streamKey } });
  } catch (err) {
    if (!(err instanceof StudioError)) {
      /* no-DB demo: just return the fresh key */
    }
  }
  return { streamKey: live.streamKey };
}
