import { NextResponse } from "next/server";
import { getCurrentSession, SESSION_COOKIE, serializeSession } from "@/lib/session";
import { onboard, StudioError } from "@/lib/studio";

// POST /api/studio/onboard — mint a fresh channel + first tier + payout method for the user.
export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Parameters<typeof onboard>[0];
  try {
    const result = await onboard({ ...body, userId: session.userId });
    // Reflect the new creator role in the session cookie.
    const res = NextResponse.json({ ok: true, ...result });
    res.cookies.set(SESSION_COOKIE, serializeSession({ ...session, role: "creator" }), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    if (err instanceof StudioError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
