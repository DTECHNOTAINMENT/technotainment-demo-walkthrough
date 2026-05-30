import { NextResponse } from "next/server";
import { requireCreatorChannel, StudioError } from "@/lib/studio";
import { verifyCreatorKyc } from "@/lib/earnings";
import { identity } from "@/lib/integrations";

// POST /api/studio/kyc — start identity verification (Persona mock auto-approves) → mark verified.
export async function POST() {
  try {
    const { creator } = await requireCreatorChannel();
    await identity.startVerification({ userId: creator.userId });
    await verifyCreatorKyc(creator.id); // mock auto-approves; real Persona resolves via webhook
    return NextResponse.json({ ok: true, kyc: "verified" });
  } catch (err) {
    if (err instanceof StudioError) return NextResponse.json({ error: err.message }, { status: 403 });
    throw err;
  }
}
