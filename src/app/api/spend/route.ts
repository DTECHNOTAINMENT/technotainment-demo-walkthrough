import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { spend, MoneyError, type SpendKind } from "@/lib/money";
import { rateLimit } from "@/lib/ratelimit";

// POST /api/spend  { kind, cast, channelId?, tierId?, productId? }
// kind ∈ tip | membership | drop | ppv | gift. Spends CAST from the wallet -> ledger + receipt.
export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    kind?: SpendKind;
    cast?: number;
    channelId?: string;
    tierId?: string;
    productId?: string;
  };
  const kinds: SpendKind[] = ["tip", "membership", "drop", "ppv", "gift"];
  if (!body.kind || !kinds.includes(body.kind) || typeof body.cast !== "number") {
    return NextResponse.json({ error: "valid kind and cast required" }, { status: 400 });
  }

  // Guard money endpoints against abuse / double-submit: 20 spends / minute per user.
  const rl = await rateLimit(`spend:${session.userId}`, 20, 60);
  if (!rl.ok) return NextResponse.json({ error: "too many requests, slow down" }, { status: 429 });

  try {
    const result = await spend({
      userId: session.userId,
      kind: body.kind,
      cast: body.cast,
      channelId: body.channelId,
      tierId: body.tierId,
      productId: body.productId,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof MoneyError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
