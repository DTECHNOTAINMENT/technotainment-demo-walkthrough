/**
 * CAST ledger. The wallet balance is an APPEND-ONLY ledger (WalletEntry rows) and is
 * always DERIVED — never stored as a mutable number. Issued CAST is a liability we owe,
 * so the ledger must be reconcilable. See CLAUDE.md §4 and docs/DATA_MODEL.md → WalletEntry.
 *
 * The pure functions here (deriveBalance, canSpend, buildEntry) are framework- and
 * DB-agnostic so they can be unit-tested without a database (DECISIONS §3: a test for
 * every money path). `recordEntry` binds them to Prisma inside a transaction.
 */
import { assertCast, isValidCast, type Cast } from "./cast";

export type WalletEntryKind =
  | "topup"
  | "tip"
  | "membership"
  | "drop"
  | "ppv"
  | "gift"
  | "refund"
  | "payout";

export interface LedgerEntryInput {
  userId: string;
  deltaCast: Cast; // +topup/+refund, −spend/−payout
  kind: WalletEntryKind;
  ref: string; // related Transaction / Payout id
}

export interface LedgerEntry extends LedgerEntryInput {
  id: string;
  createdAt: Date;
}

/** Sum a set of ledger entries into a derived balance. */
export function deriveBalance(entries: Pick<LedgerEntry, "deltaCast">[]): Cast {
  return entries.reduce((sum, e) => {
    assertCast(e.deltaCast, "deltaCast");
    return sum + e.deltaCast;
  }, 0);
}

/** Whether a spend (negative delta) is allowed given the current balance. */
export function canSpend(currentBalance: Cast, deltaCast: Cast): boolean {
  assertCast(currentBalance, "currentBalance");
  assertCast(deltaCast, "deltaCast");
  return currentBalance + deltaCast >= 0;
}

/** Validate a ledger entry's shape and sign for its kind. Throws on violation. */
export function validateEntry(input: LedgerEntryInput): void {
  if (!input.userId) throw new Error("ledger: userId required");
  if (!input.ref) throw new Error("ledger: ref required");
  if (!isValidCast(input.deltaCast)) {
    throw new Error(`ledger: deltaCast must be integer CAST, got ${String(input.deltaCast)}`);
  }
  if (input.deltaCast === 0) throw new Error("ledger: deltaCast must be non-zero");

  const mustBePositive: WalletEntryKind[] = ["topup", "refund"];
  const mustBeNegative: WalletEntryKind[] = ["tip", "membership", "drop", "ppv", "gift", "payout"];
  if (mustBePositive.includes(input.kind) && input.deltaCast < 0) {
    throw new Error(`ledger: ${input.kind} must be a positive delta`);
  }
  if (mustBeNegative.includes(input.kind) && input.deltaCast > 0) {
    throw new Error(`ledger: ${input.kind} must be a negative delta`);
  }
}

/**
 * Append a ledger entry inside a serializable transaction, guarding against
 * overdrawing (no negative balance). Returns the new derived balance.
 *
 * Kept dependency-light: `db` is the PrismaClient (or a tx client). Imported lazily
 * by callers so the pure helpers above stay testable without Prisma.
 */
export async function recordEntry(
  db: PrismaLike,
  input: LedgerEntryInput,
): Promise<{ entry: LedgerEntry; balance: Cast }> {
  validateEntry(input);
  return db.$transaction(async (tx: PrismaLike) => {
    const existing = await tx.walletEntry.findMany({
      where: { userId: input.userId },
      select: { deltaCast: true },
    });
    const balance = deriveBalance(existing);
    if (!canSpend(balance, input.deltaCast)) {
      throw new Error("ledger: insufficient CAST balance");
    }
    const entry = (await tx.walletEntry.create({ data: input })) as LedgerEntry;
    return { entry, balance: balance + input.deltaCast };
  });
}

/** Minimal structural type for the bits of Prisma the ledger touches. */
export interface PrismaLike {
  $transaction<T>(fn: (tx: PrismaLike) => Promise<T>): Promise<T>;
  walletEntry: {
    findMany(args: unknown): Promise<{ deltaCast: number }[]>;
    create(args: { data: LedgerEntryInput }): Promise<unknown>;
  };
}
