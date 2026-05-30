/**
 * Money service — the only place CAST moves. Every mutation writes BOTH a Transaction
 * (the business event) and a WalletEntry (the append-only ledger), atomically, with an
 * overdraw guard. Balance is always derived from the ledger (CLAUDE.md §4, docs/DATA_MODEL.md).
 * Payments go through the PaymentProvider adapter (mock in dev, Stripe in prod) — never an SDK.
 */
import { prisma } from "@/lib/db";
import { payments, type PaymentMethodId } from "@/lib/integrations";
import { assertCast, formatFiat, type Cast } from "@/lib/cast";
import { deriveBalance, canSpend, type WalletEntryKind } from "@/lib/ledger";
import { getFees } from "@/lib/settings";

export type SpendKind = "tip" | "membership" | "drop" | "ppv" | "gift";

export class MoneyError extends Error {}

// Sanity cap on any single CAST movement (£1,000,000) — defence-in-depth against bad input.
const MAX_CAST = 100_000_000;

function genTxnId(): string {
  return `TXR-${crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
}

export async function balanceOf(userId: string): Promise<Cast> {
  const rows = await prisma.walletEntry.findMany({ where: { userId }, select: { deltaCast: true } });
  return deriveBalance(rows);
}

// ---------------- Top-up (money in) ----------------

export interface TopupResult {
  transactionId: string;
  needs3ds: boolean;
  status: "pending" | "settled";
  clientSecret?: string;
  balance?: Cast;
}

export async function topUp(input: {
  userId: string;
  methodId: PaymentMethodId;
  cast: Cast;
}): Promise<TopupResult> {
  assertCast(input.cast, "topup cast");
  const fees = await getFees();
  if (input.cast < fees.minTopUpCast) {
    throw new MoneyError(`minimum top-up is ${fees.minTopUpCast} CAST`);
  }
  if (input.cast > MAX_CAST) throw new MoneyError("amount exceeds the maximum");

  // Our own unique transaction id is the single key (the provider intent id is internal to
  // the adapter; the real Stripe adapter maps provider-intent ↔ our txn in Phase 6).
  const transactionId = genTxnId();
  const intent = await payments.createTopupIntent(input);
  await prisma.transaction.create({
    data: {
      id: transactionId,
      userId: input.userId,
      kind: "topup",
      cast: input.cast,
      method: input.methodId,
      grossFiat: formatFiat(input.cast),
      status: intent.needs3ds ? "pending" : "settled",
    },
  });

  if (intent.needs3ds) {
    return { transactionId, needs3ds: true, status: "pending", clientSecret: intent.clientSecret };
  }
  const balance = await settleTopup(transactionId);
  return { transactionId, needs3ds: false, status: "settled", balance };
}

/** Complete a card top-up's 3DS challenge, then settle. Verifies the caller owns the txn. */
export async function confirmTopup(input: { userId: string; transactionId: string; code?: string }): Promise<TopupResult> {
  const txn = await prisma.transaction.findUnique({ where: { id: input.transactionId }, select: { userId: true, kind: true } });
  if (!txn || txn.kind !== "topup") throw new MoneyError("unknown top-up");
  if (txn.userId !== input.userId) throw new MoneyError("not your transaction");

  const res = await payments.confirm3ds({ transactionId: input.transactionId, challengeCode: input.code });
  if (res.status !== "settled") {
    await prisma.transaction.update({ where: { id: input.transactionId }, data: { status: "reversed" } });
    return { transactionId: input.transactionId, needs3ds: true, status: "pending" };
  }
  const balance = await settleTopup(input.transactionId);
  return { transactionId: input.transactionId, needs3ds: false, status: "settled", balance };
}

/**
 * Credit a settled top-up to the ledger. IDEMPOTENT — a replayed webhook or double
 * confirm never double-credits (guarded by an existing ledger entry for this ref).
 */
export async function settleTopup(transactionId: string): Promise<Cast> {
  return prisma.$transaction(async (tx) => {
    const txn = await tx.transaction.findUnique({ where: { id: transactionId } });
    if (!txn || txn.kind !== "topup") throw new MoneyError("unknown top-up");

    const already = await tx.walletEntry.findFirst({ where: { ref: transactionId, kind: "topup" } });
    const rows = await tx.walletEntry.findMany({ where: { userId: txn.userId }, select: { deltaCast: true } });
    if (already) return deriveBalance(rows); // idempotent no-op

    await tx.transaction.update({ where: { id: transactionId }, data: { status: "settled" } });
    await tx.walletEntry.create({
      data: { userId: txn.userId, deltaCast: txn.cast, kind: "topup", ref: transactionId },
    });
    return deriveBalance(rows) + txn.cast;
  });
}

// ---------------- Spend (money out of wallet) ----------------

export interface SpendResult {
  transactionId: string;
  balance: Cast;
}

export async function spend(input: {
  userId: string;
  kind: SpendKind;
  cast: Cast;
  channelId?: string;
  tierId?: string;
  productId?: string;
}): Promise<SpendResult> {
  assertCast(input.cast, "spend cast");
  if (input.cast <= 0) throw new MoneyError("spend amount must be positive");
  if (input.cast > MAX_CAST) throw new MoneyError("amount exceeds the maximum");
  const txnId = genTxnId();
  const delta = -input.cast;

  // Validate referenced resources exist + are consistent (avoid P2025 500s / orphan rows).
  if (input.channelId) {
    const ch = await prisma.channel.findUnique({ where: { id: input.channelId }, select: { id: true } });
    if (!ch) throw new MoneyError("channel not found");
  }
  if (input.kind === "membership") {
    if (!input.tierId || !input.channelId) throw new MoneyError("membership needs a tier + channel");
    const tier = await prisma.tier.findFirst({ where: { id: input.tierId, channelId: input.channelId }, select: { id: true } });
    if (!tier) throw new MoneyError("tier not found for this channel");
  }
  if (input.productId) {
    const prod = await prisma.product.findFirst({ where: { id: input.productId, channelId: input.channelId }, select: { id: true } });
    if (!prod) throw new MoneyError("product not found for this channel");
  }

  return prisma.$transaction(async (tx) => {
    const rows = await tx.walletEntry.findMany({ where: { userId: input.userId }, select: { deltaCast: true } });
    const balance = deriveBalance(rows);
    if (!canSpend(balance, delta)) throw new MoneyError("insufficient CAST balance");

    await tx.transaction.create({
      data: {
        id: txnId,
        userId: input.userId,
        channelId: input.channelId,
        kind: input.kind,
        cast: delta,
        method: "balance",
        status: "settled",
      },
    });
    await tx.walletEntry.create({
      data: { userId: input.userId, deltaCast: delta, kind: input.kind as WalletEntryKind, ref: txnId },
    });

    // Membership: lock the price for this member (DECISIONS §2 — never affected by later changes).
    if (input.kind === "membership" && input.tierId && input.channelId) {
      const renewsAt = new Date();
      renewsAt.setMonth(renewsAt.getMonth() + 1);
      await tx.membership.create({
        data: {
          userId: input.userId,
          tierId: input.tierId,
          channelId: input.channelId,
          priceCastLocked: input.cast,
          status: "active",
          renewsAt,
        },
      });
    }
    if (input.productId) {
      await tx.product.update({ where: { id: input.productId }, data: { sold: { increment: 1 } } });
    }
    // Track lifetime spend (denormalized counter, DATA_MODEL.md).
    await tx.user.update({ where: { id: input.userId }, data: { lifetimeSpentCast: { increment: input.cast } } });

    return { transactionId: txnId, balance: balance + delta };
  });
}

// ---------------- Receipts ----------------

export async function getReceipt(transactionId: string, userId: string) {
  const txn = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!txn || txn.userId !== userId) return null;
  return {
    id: txn.id,
    kind: txn.kind,
    cast: txn.cast,
    grossFiat: txn.grossFiat,
    method: txn.method,
    status: txn.status,
    createdAt: txn.createdAt,
  };
}

export async function listHistory(userId: string, limit = 50) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
