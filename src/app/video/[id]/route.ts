/**
 * Legacy 301 redirect: `/video/:id -> /watch/:slug` (docs/ROUTES.md "Legacy redirects").
 * Preserves link equity from old numeric/id-based video URLs.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canonical } from "@/lib/seo/meta";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      select: { slug: true },
    });
    if (video) {
      return NextResponse.redirect(canonical(`/watch/${video.slug}`), 301);
    }
    return NextResponse.redirect(canonical("/"), 301);
  } catch {
    return NextResponse.redirect(canonical("/"), 301);
  }
}
