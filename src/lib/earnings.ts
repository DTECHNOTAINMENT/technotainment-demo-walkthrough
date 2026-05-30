/**
 * Creator earnings + payouts. Earnings are DERIVED from settled transactions on the
 * creator's channel (gross → net via the platform fee), with a 7-day clearing hold
 * (DECISIONS §2). Payouts draw down the cleared, available balance and require KYC before
 * the first one. Payout orchestration goes through the PayoutProvider (Stripe Connect mock).
 */
import { prisma } from "@/lib/db";
import { payouts, type PayoutMethodId } from "@/lib/integrations";
import { feeSplit, formatFiat, assertCast, type Cast } from "@/lib/cast";
import { getFees } from "@/lib/settings";

export class PayoutError extends Error {}

/** CAST kinds that count as creator revenue. */
const REVENUE_KINDS = ["tip", "membership", "ppv", "drop", "gift"] as const;

export interface EarningsSummary {
  grossCast: Cast;
  feeCast: Cast;
  netCast: Cast;
  clearedCast: Cast; // net, older than the hold window → withdrawable
  pendingCast: Cast; // net, still inside the 7-day hold
  paidCast: Cast; // already paid out or in-flight
  availableCast: Cast; // clearedCast − paidCast (≥ 0)
}

export async function creatorEarnings(creatorId: string): Promise<EarningsSummary> {
  const creator = await prisma.creator.findUnique({
    where: { id: creatorId },
    include: { channel: true },
  });
  if (!creator?.channel) throw new PayoutError("creator has no channel");

  const takeRate = creator.takeRatePct / 100;
  const fees = await getFees();
  const holdCutoff = new Date(Date.now() - fees.payoutHoldDays * 24 * 60 * 60 * 1000);

  const txns = await prisma.transaction.findMany({
    where: { channelId: creator.channel.id, status: "settled", kind: { in: [...REVENUE_KINDS] } },
    select: { cast: true, createdAt: true },
  });

  let grossCast = 0;
  let feeCast = 0;
  let clearedNet = 0;
  let pendingNet = 0;
  for (const t of txns) {
    const gross = Math.abs(t.cast); // fan-side spends are negative
    const { feeCast: fee, netCast: net } = feeSplit(gross, takeRate);
    grossCast += gross;
    feeCast += fee;
    if (t.createdAt < holdCutoff) clearedNet += net;
    else pendingNet += net;
  }
  const netCast = grossCast - feeCast;

  const priorPayouts = await prisma.payout.aggregate({
    where: { creatorId, status: { in: ["paid", "held", "pending"] } },
    _sum: { cast: true },
  });
  const paidCast = priorPayouts._sum.cast ?? 0;
  const availableCast = Math.max(0, clearedNet - paidCast);

  return { grossCast, feeCast, netCast, clearedCast: clearedNet, pendingCast: pendingNet, paidCast, availableCast };
}

function genPayoutId(): string {
  return `PO-${crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}

/** Request a withdrawal of available CAST. KYC must be verified first (before first payout). */
export async function requestPayout(input: {
  creatorId: string;
  cast: Cast;
  payoutMethodId?: string;
}): Promise<{ payoutId: string; status: "held" | "pending" | "paid"; netFiat: string }> {
  assertCast(input.cast, "payout cast");
  if (input.cast <= 0) throw new PayoutError("payout amount must be positive");
  const fees = await getFees();
  if (input.cast < fees.minPayoutCast) throw new PayoutError("below minimum payout");

  const creator = await prisma.creator.findUnique({
    where: { id: input.creatorId },
    include: { user: true, payoutMethods: true },
  });
  if (!creator) throw new PayoutError("unknown creator");
  if (creator.user.kyc !== "verified") throw new PayoutError("KYC required before first payout");

  const earnings = await creatorEarnings(input.creatorId);
  if (input.cast > earnings.availableCast) throw new PayoutError("amount exceeds available balance");

  const method =
    creator.payoutMethods.find((m) => m.id === input.payoutMethodId) ??
    creator.payoutMethods.find((m) => m.isDefault) ??
    creator.payoutMethods[0];
  if (!method) throw new PayoutError("no payout method on file");

  // PayoutProvider (Stripe Connect mock) — returns a provider ref; mock clears after a tick.
  await payouts.createPayout({
    creatorId: input.creatorId,
    cast: input.cast,
    method: method.methodId as PayoutMethodId,
  });

  const payoutId = genPayoutId();
  await prisma.payout.create({
    data: {
      id: payoutId,
      creatorId: input.creatorId,
      payoutMethodId: method.id,
      cast: input.cast,
      feeCast: 0,
      netFiat: formatFiat(input.cast),
      method: method.label,
      status: "held", // 7-day clearing hold; an admin payout run / scheduler clears it
    },
  });
  return { payoutId, status: "held", netFiat: formatFiat(input.cast) };
}

/** Clear a held payout to paid (simulates the 7-day clear / monthly run completing). */
export async function clearPayout(payoutId: string): Promise<void> {
  await prisma.payout.update({ where: { id: payoutId }, data: { status: "paid" } });
}

/** Mark a creator's KYC verified via the IdentityProvider (mock auto-approves). */
export async function verifyCreatorKyc(creatorId: string): Promise<void> {
  const creator = await prisma.creator.findUnique({ where: { id: creatorId }, select: { userId: true } });
  if (!creator) throw new PayoutError("unknown creator");
  await prisma.user.update({ where: { id: creator.userId }, data: { kyc: "verified" } });
}
