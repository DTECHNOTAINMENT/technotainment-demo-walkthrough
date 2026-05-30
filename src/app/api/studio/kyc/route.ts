import { NextResponse } from "next/server";
import { requireCreatorChannel, StudioError } from "@/lib/studio";
import { verifyCreatorKyc } from "@/lib/earnings";
import { identity } from "@/lib/integrations";
import { rateLimit } from "@/lib/ratelimit";

// POST /api/studio/kyc — start identity verification (Persona mock auto-approves) → mark verified.
export async function POST() {
  try {
    const { creator } = await requireCreatorChannel();
    const rl = await rateLimit(`kyc:${creator.id}`, 5, 60);
    if (!rl.ok) return NextResponse.json({ error: "too many requests" }, { status: 429 });
    await identity.startVerification({ userId: creator.userId });
    await verifyCreatorKyc(creator.id); // mock auto-approves; real Persona resolves via webhook
    return NextResponse.json({ ok: true, kyc: "verified" });
  } catch (err) {
    if (err instanceof StudioError) return NextResponse.json({ error: err.message }, { status: 403 });
    throw err;
  }
}
