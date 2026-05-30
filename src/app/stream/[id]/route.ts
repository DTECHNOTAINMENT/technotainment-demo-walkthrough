/**
 * Legacy 301 redirect: `/stream/:id -> /watch/:slug` (docs/ROUTES.md "Legacy redirects").
 * If the stream has a recording VOD, redirect to that watch page; otherwise fall back to
 * the owning channel `/c/:handle`, then to `/`.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canonical } from "@/lib/seo/meta";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const stream = await prisma.stream.findUnique({
      where: { id: params.id },
      include: { channel: true },
    });

    if (stream?.recordingVideoId) {
      const video = await prisma.video.findUnique({
        where: { id: stream.recordingVideoId },
        select: { slug: true },
      });
      if (video) {
        return NextResponse.redirect(canonical(`/watch/${video.slug}`), 301);
      }
    }

    if (stream?.channel) {
      return NextResponse.redirect(canonical(`/c/${stream.channel.handle}`), 301);
    }

    return NextResponse.redirect(canonical("/"), 301);
  } catch {
    return NextResponse.redirect(canonical("/"), 301);
  }
}
