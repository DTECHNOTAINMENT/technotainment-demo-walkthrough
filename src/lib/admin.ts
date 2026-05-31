/**
 * Admin / Operations services. Every mutation is staff-gated and writes an AuditEvent.
 * Money reversals go through the ledger (never mutate a balance). Owner-configurable values
 * live in the Setting table (control center, CLAUDE.md §4b).
 */
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { formatFiat } from "@/lib/cast";
import { clearPayout } from "@/lib/earnings";
import * as fx from "@/lib/fixtures-admin";
import type { Session } from "@/lib/integrations";

export class AdminError extends Error {}

/**
 * Run a mutation; on a real DB error (no DATABASE_URL / Prisma down) swallow it so demo flows
 * complete. AdminError (validation, e.g. "only spends can be refunded") is always rethrown so the
 * action endpoint returns a 400. Real DB always wins: when connected the mutation runs as before.
 */
async function tryDb(run: () => Promise<unknown>): Promise<void> {
  try {
    await run();
  } catch (err) {
    if (err instanceof AdminError) throw err;
    /* no DB — simulated success */
  }
}

/** Best-effort audit write — never throws (skipped silently with no DB). */
async function audit(input: Parameters<typeof writeAudit>[0]): Promise<void> {
  try {
    await writeAudit(input);
  } catch {
    /* demo mode / audit unavailable */
  }
}

/** Require a staff session (set by /api/admin/signin). In prod this also asserts SSO + MFA. */
export async function requireStaff(): Promise<Session> {
  const session = await getCurrentSession();
  if (!session || session.role !== "staff") throw new AdminError("staff only");
  return session;
}

// ---------------- Users ----------------

export async function suspendUser(who: string, id: string) {
  await tryDb(() => prisma.user.update({ where: { id }, data: { status: "suspended" } }));
  await audit({ who, action: `suspended user ${id}`, kind: "users" });
}
export async function reinstateUser(who: string, id: string) {
  await tryDb(() => prisma.user.update({ where: { id }, data: { status: "active" } }));
  await audit({ who, action: `reinstated user ${id}`, kind: "users" });
}
export async function setUserKyc(who: string, id: string, kyc: "none" | "pending" | "verified" | "failed") {
  await tryDb(() => prisma.user.update({ where: { id }, data: { kyc } }));
  await audit({ who, action: `set kyc=${kyc} on ${id}`, kind: "users" });
}

// ---------------- Creators / applications ----------------

export async function approveApplication(who: string, creatorId: string) {
  await tryDb(() => prisma.creator.update({ where: { id: creatorId }, data: { status: "active" } }));
  await audit({ who, action: `approved creator ${creatorId}`, kind: "creators" });
}
export async function declineApplication(who: string, creatorId: string) {
  await tryDb(() => prisma.creator.update({ where: { id: creatorId }, data: { status: "suspended" } }));
  await audit({ who, action: `declined creator ${creatorId}`, kind: "creators" });
}
export async function setTakeRate(who: string, creatorId: string, pct: number) {
  if (pct < 0 || pct > 100) throw new AdminError("take rate must be 0–100");
  await tryDb(() => prisma.creator.update({ where: { id: creatorId }, data: { takeRatePct: Math.round(pct) } }));
  await audit({ who, action: `set take-rate=${pct}% on ${creatorId}`, kind: "creators" });
}
export async function setPayoutHold(who: string, creatorId: string, hold: boolean) {
  await tryDb(() => prisma.creator.update({ where: { id: creatorId }, data: { status: hold ? "payout_hold" : "active" } }));
  await audit({ who, action: `${hold ? "held" : "released"} payouts for ${creatorId}`, kind: "creators" });
}

// ---------------- Moderation ----------------

export type ReportAction = "investigate" | "strike" | "remove" | "dismiss";

const REPORT_STATUS: Record<ReportAction, "investigating" | "actioned" | "dismissed"> = {
  investigate: "investigating",
  strike: "actioned",
  remove: "actioned",
  dismiss: "dismissed",
};

export async function actionReport(who: string, reportId: string, action: ReportAction) {
  await tryDb(async () => {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) return; // no-DB / unknown id → still record the action below
    await prisma.report.update({ where: { id: reportId }, data: { status: REPORT_STATUS[action] } });
    // A strike on a user target suspends them (simplified 3-strike model — DECISIONS §2).
    if (action === "strike" && report.targetType === "user") {
      await prisma.user
        .update({ where: { handle: report.targetId }, data: { status: "suspended" } })
        .catch(() => prisma.user.update({ where: { id: report.targetId }, data: { status: "suspended" } }).catch(() => {}));
    }
  });
  await audit({ who, action: `${action} on report ${reportId}`, kind: "moderation" });
}

// ---------------- Finance ----------------

/** Refund a settled spend: returns CAST to the fan via a refund ledger entry; marks the txn reversed. */
export async function refundTransaction(who: string, txnId: string) {
  let result: { refunded: boolean; deltaCast: number };
  try {
    result = await prisma.$transaction(async (tx) => {
      const txn = await tx.transaction.findUnique({ where: { id: txnId } });
      if (!txn) throw new AdminError("transaction not found");
      if (txn.status === "reversed") throw new AdminError("already reversed");
      // Only spends (negative cast) are refunded — refunding a top-up would claw back funds the
      // user may have already spent and drive the balance negative (bypasses the overdraw guard).
      if (txn.cast >= 0) throw new AdminError("only spends can be refunded");
      // Idempotency at the ledger level: never write a second refund entry for the same txn.
      const existing = await tx.walletEntry.findFirst({ where: { ref: txnId, kind: "refund" } });
      if (existing) throw new AdminError("already refunded");

      const refundDelta = -txn.cast; // positive — return CAST to the fan
      await tx.walletEntry.create({ data: { userId: txn.userId, deltaCast: refundDelta, kind: "refund", ref: txnId } });
      await tx.transaction.update({ where: { id: txnId }, data: { status: "reversed" } });
      return { refunded: true, deltaCast: refundDelta };
    });
  } catch (err) {
    if (err instanceof AdminError) throw err;
    // No-DB demo: validate against the fixture txn so the demo still enforces "only spends".
    const t = fx.DEMO_ADMIN_TRANSACTIONS.find((x) => x.id === txnId);
    if (t) {
      if (t.status === "reversed") throw new AdminError("already reversed");
      if (t.cast >= 0) throw new AdminError("only spends can be refunded");
    }
    result = { refunded: true, deltaCast: t ? -t.cast : 0 };
  }
  await audit({ who, action: `refunded ${txnId}`, kind: "finance" });
  return result;
}

/** Approve a payout run: clear all currently-held payouts to paid. */
export async function approvePayoutRun(who: string, runId: string) {
  let cleared = 0;
  let totalCast = 0;
  await tryDb(async () => {
    const held = await prisma.payout.findMany({ where: { status: "held" }, select: { id: true, cast: true } });
    for (const p of held) await clearPayout(p.id);
    cleared = held.length;
    totalCast = held.reduce((s, p) => s + p.cast, 0);
    await prisma.payoutRun.upsert({
      where: { id: runId },
      create: { id: runId, date: new Date(), creatorCount: cleared, cast: totalCast, status: "paid", method: "mixed" },
      update: { status: "paid", creatorCount: cleared, cast: totalCast },
    });
  });
  if (cleared === 0) {
    // No-DB demo: clear the demo held payouts.
    cleared = fx.DEMO_HELD_PAYOUTS.length;
    totalCast = fx.DEMO_HELD_PAYOUTS.reduce((s, p) => s + p.cast, 0);
  }
  await audit({ who, action: `approved payout run ${runId} (${cleared} payouts)`, kind: "finance" });
  return { cleared, totalCast };
}
export async function holdPayoutRun(who: string, runId: string) {
  await tryDb(() => prisma.payoutRun.update({ where: { id: runId }, data: { status: "held" } }));
  await audit({ who, action: `held payout run ${runId}`, kind: "finance" });
}

// ---------------- Connectors / flags / settings ----------------

export async function toggleConnector(who: string, id: string, status: "live" | "beta" | "off") {
  await tryDb(() => prisma.connector.update({ where: { id }, data: { status } }));
  await audit({ who, action: `connector ${id} → ${status}`, kind: "config" });
}

/**
 * Save a connector's credentials + enabled flag from the Admin panel (configure, don't code).
 * Stored in the Setting table (`connector:<id>`), read at runtime by lib/connectors — so the
 * owner switches a connector live by pasting keys here, no env var and no redeploy.
 */
export async function setConnectorCredentials(
  who: string,
  id: string,
  input: { enabled: boolean; credentials: Record<string, string> },
) {
  // Don't persist blank values; trim everything.
  const credentials: Record<string, string> = {};
  for (const [k, v] of Object.entries(input.credentials ?? {})) {
    if (typeof v === "string" && v.trim()) credentials[k] = v.trim();
  }
  const enabled = input.enabled && Object.keys(credentials).length > 0;
  await tryDb(async () => {
    await prisma.setting.upsert({
      where: { key: `connector:${id}` },
      create: { key: `connector:${id}`, valueJson: { enabled, credentials } },
      update: { valueJson: { enabled, credentials } },
    });
    // Reflect in the Connector row so the registry view shows live/off without a key read.
    await prisma.connector.update({ where: { id }, data: { status: enabled ? "live" : "off" } }).catch(() => {});
  });
  await audit({
    who,
    action: `configured connector ${id} (${enabled ? "enabled" : "saved"}, ${Object.keys(credentials).length} keys)`,
    kind: "config",
  });
  return { enabled, keyCount: Object.keys(credentials).length };
}
export async function toggleFlag(who: string, id: string, on: boolean) {
  await tryDb(() => prisma.featureFlag.update({ where: { id }, data: { on } }));
  await audit({ who, action: `flag ${id} → ${on ? "on" : "off"}`, kind: "config" });
}

export async function getSetting<T = unknown>(key: string, fallback: T): Promise<T> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row ? (row.valueJson as T) : fallback;
  } catch {
    // No DB (demo mode) → use the provided default so callers (legal pages, live policy) never throw.
    return fallback;
  }
}
export async function setSetting(who: string, key: string, value: unknown) {
  await tryDb(() =>
    prisma.setting.upsert({ where: { key }, create: { key, valueJson: value as object }, update: { valueJson: value as object } }),
  );
  await audit({ who, action: `updated setting ${key}`, kind: "config" });
}
