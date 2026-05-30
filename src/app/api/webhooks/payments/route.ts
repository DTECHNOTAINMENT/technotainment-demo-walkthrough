import { NextResponse } from "next/server";
import { settleTopup } from "@/lib/money";
import { captureError } from "@/lib/observability";

/**
 * Payments webhook (Stripe `payment.*` in prod; the mock simulates these locally).
 * MUST be idempotent — settleTopup is a no-op if the ledger already has the credit, so a
 * replayed event never double-credits. Signature verification is added with the real
 * Stripe adapter (STRIPE_WEBHOOK_SECRET); in dev the mock posts unsigned events.
 */
export async function POST(req: Request) {
  // When a webhook secret is configured, require it. (Real Stripe uses an HMAC `stripe-signature`
  // header verified with the SDK — wired with the real adapter. The shared-secret header here is the
  // minimum bar so the endpoint isn't world-writable once it's reachable.) In dev/mock it's open.
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: { type?: string; data?: { transactionId?: string } };
  try {
    event = (await req.json()) as typeof event;
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment.settled":
      case "payment_intent.succeeded": {
        const txnId = event.data?.transactionId;
        if (txnId) await settleTopup(txnId); // idempotent
        return NextResponse.json({ received: true });
      }
      default:
        return NextResponse.json({ received: true, ignored: event.type ?? "unknown" });
    }
  } catch (err) {
    captureError(err, { webhook: "payments", type: event.type });
    return NextResponse.json({ error: "handler error" }, { status: 500 });
  }
}
