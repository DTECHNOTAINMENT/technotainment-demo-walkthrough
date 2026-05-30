import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { topUp, confirmTopup, MoneyError } from "@/lib/money";
import type { PaymentMethodId } from "@/lib/integrations";

// POST /api/wallet/topup        { methodId, cast }            -> begin top-up (3DS for cards)
// POST /api/wallet/topup        { confirm: txnId, code }      -> complete a 3DS challenge
export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    methodId?: PaymentMethodId;
    cast?: number;
    confirm?: string;
    code?: string;
  };

  try {
    if (body.confirm) {
      const result = await confirmTopup({ transactionId: body.confirm, code: body.code });
      return NextResponse.json(result);
    }
    if (!body.methodId || typeof body.cast !== "number") {
      return NextResponse.json({ error: "methodId and cast required" }, { status: 400 });
    }
    const result = await topUp({ userId: session.userId, methodId: body.methodId, cast: body.cast });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof MoneyError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
