import { NextResponse } from "next/server";
import { requireCreatorChannel, StudioError } from "@/lib/studio";
import { requestPayout, PayoutError } from "@/lib/earnings";

// POST /api/studio/withdraw { cast, payoutMethodId? } — request a payout of available CAST.
export async function POST(req: Request) {
  try {
    const { creator } = await requireCreatorChannel();
    const { cast, payoutMethodId } = (await req.json().catch(() => ({}))) as {
      cast?: number;
      payoutMethodId?: string;
    };
    if (typeof cast !== "number") return NextResponse.json({ error: "cast required" }, { status: 400 });
    const result = await requestPayout({ creatorId: creator.id, cast, payoutMethodId });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof PayoutError) return NextResponse.json({ error: err.message }, { status: 400 });
    if (err instanceof StudioError) return NextResponse.json({ error: err.message }, { status: 403 });
    throw err;
  }
}
