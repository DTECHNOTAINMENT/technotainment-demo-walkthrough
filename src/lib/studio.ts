/**
 * Creator Studio service — channel onboarding, content/upload, and go-live. Media goes
 * through the VideoProvider adapter (Mux mock in dev). Onboarding mints a FRESH empty
 * channel for the signed-in user (not the seeded Nyx demo) per HANDOFF.md §9.
 */
import { prisma } from "@/lib/db";
import { video } from "@/lib/integrations";
import { getCurrentSession } from "@/lib/session";
import { economy } from "@/lib/config";

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
  const creator = await prisma.creator.findUnique({
    where: { userId: session.userId },
    include: { channel: true },
  });
  if (!creator?.channel) throw new StudioError("no creator channel");
  return { session, creator, channel: creator.channel };
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
  const existing = await prisma.creator.findUnique({ where: { handle } });
  if (existing) throw new StudioError("handle taken");

  const creatorId = `cr-${slugify(input.handle)}`;
  const channelId = `ch-${slugify(input.handle)}`;

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
        id: `tier-${slugify(input.handle)}-1`,
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
  const slug = await uniqueSlug(slugify(input.title));
  const created = await prisma.video.create({
    data: {
      id: upload.assetId,
      channelId: input.channelId,
      title: input.title,
      slug,
      thumbUrl: `https://picsum.photos/seed/${slug}/640/360`,
      status: "processing",
      visibility: "public",
    },
  });
  return { videoId: created.id, slug, uploadUrl: upload.uploadUrl };
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
  const owned = await prisma.video.findFirst({ where: { id: videoId, channelId }, select: { id: true } });
  if (!owned) throw new StudioError("video not found");
  return prisma.video.update({
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
}

// ---- Go live ----

export async function startStream(input: { channelId: string; title: string; category: string }) {
  const live = await video.createLiveStream({ channelId: input.channelId });
  const id = `st-${Date.now().toString(36)}`;
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
}

export async function stopStream(streamId: string, channelId: string) {
  const stream = await prisma.stream.findFirst({ where: { id: streamId, channelId } });
  if (!stream) throw new StudioError("stream not found");
  const ended = await video.endLiveStream(streamId);

  // Recording → VOD.
  const slug = await uniqueSlug(slugify(`${stream.title}-replay`));
  const vod = await prisma.video.create({
    data: {
      id: ended.recordingAssetId,
      channelId,
      title: `${stream.title} (replay)`,
      slug,
      thumbUrl: `https://picsum.photos/seed/${slug}/640/360`,
      status: "published",
      visibility: "public",
      publishedAt: new Date(),
    },
  });
  await prisma.stream.update({
    where: { id: streamId },
    data: { status: "ended", recordingVideoId: vod.id },
  });
  return { recordingVideoId: vod.id, slug };
}

export async function rotateStreamKey(streamId: string, channelId: string) {
  const stream = await prisma.stream.findFirst({ where: { id: streamId, channelId } });
  if (!stream) throw new StudioError("stream not found");
  const live = await video.createLiveStream({ channelId });
  await prisma.stream.update({ where: { id: streamId }, data: { streamKey: live.streamKey } });
  return { streamKey: live.streamKey };
}
