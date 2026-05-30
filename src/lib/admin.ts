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
import type { Session } from "@/lib/integrations";

export class AdminError extends Error {}

/** Require a staff session (set by /api/admin/signin). In prod this also asserts SSO + MFA. */
export async function requireStaff(): Promise<Session> {
  const session = await getCurrentSession();
  if (!session || session.role !== "staff") throw new AdminError("staff only");
  return session;
}

// ---------------- Users ----------------

export async function suspendUser(who: string, id: string) {
  await prisma.user.update({ where: { id }, data: { status: "suspended" } });
  await writeAudit({ who, action: `suspended user ${id}`, kind: "users" });
}
export async function reinstateUser(who: string, id: string) {
  await prisma.user.update({ where: { id }, data: { status: "active" } });
  await writeAudit({ who, action: `reinstated user ${id}`, kind: "users" });
}
export async function setUserKyc(who: string, id: string, kyc: "none" | "pending" | "verified" | "failed") {
  await prisma.user.update({ where: { id }, data: { kyc } });
  await writeAudit({ who, action: `set kyc=${kyc} on ${id}`, kind: "users" });
}

// ---------------- Creators / applications ----------------

export async function approveApplication(who: string, creatorId: string) {
  await prisma.creator.update({ where: { id: creatorId }, data: { status: "active" } });
  await writeAudit({ who, action: `approved creator ${creatorId}`, kind: "creators" });
}
export async function declineApplication(who: string, creatorId: string) {
  await prisma.creator.update({ where: { id: creatorId }, data: { status: "suspended" } });
  await writeAudit({ who, action: `declined creator ${creatorId}`, kind: "creators" });
}
export async function setTakeRate(who: string, creatorId: string, pct: number) {
  if (pct < 0 || pct > 100) throw new AdminError("take rate must be 0–100");
  await prisma.creator.update({ where: { id: creatorId }, data: { takeRatePct: Math.round(pct) } });
  await writeAudit({ who, action: `set take-rate=${pct}% on ${creatorId}`, kind: "creators" });
}
export async function setPayoutHold(who: string, creatorId: string, hold: boolean) {
  await prisma.creator.update({ where: { id: creatorId }, data: { status: hold ? "payout_hold" : "active" } });
  await writeAudit({ who, action: `${hold ? "held" : "released"} payouts for ${creatorId}`, kind: "creators" });
}

// ---------------- Moderation ----------------

export type ReportAction = "investigate" | "strike" | "remove" | "dismiss";

export async function actionReport(who: string, reportId: string, action: ReportAction) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new AdminError("report not found");

  const statusMap: Record<ReportAction, "investigating" | "actioned" | "dismissed"> = {
    investigate: "investigating",
    strike: "actioned",
    remove: "actioned",
    dismiss: "dismissed",
  };
  await prisma.report.update({ where: { id: reportId }, data: { status: statusMap[action] } });

  // A strike on a user target suspends them (simplified 3-strike model — DECISIONS §2).
  if (action === "strike" && report.targetType === "user") {
    await prisma.user
      .update({ where: { handle: report.targetId }, data: { status: "suspended" } })
      .catch(() => prisma.user.update({ where: { id: report.targetId }, data: { status: "suspended" } }).catch(() => {}));
  }
  await writeAudit({ who, action: `${action} on report ${reportId}`, kind: "moderation" });
}

// ---------------- Finance ----------------

/** Refund a settled spend: returns CAST to the fan via a refund ledger entry; marks the txn reversed. */
export async function refundTransaction(who: string, txnId: string) {
  return prisma.$transaction(async (tx) => {
    const txn = await tx.transaction.findUnique({ where: { id: txnId } });
    if (!txn) throw new AdminError("transaction not found");
    if (txn.status === "reversed") throw new AdminError("already reversed");

    // Reverse the ledger effect: a spend (negative cast) is refunded as +abs; a topup is clawed back.
    const refundDelta = -txn.cast; // negate original effect
    await tx.walletEntry.create({
      data: { userId: txn.userId, deltaCast: refundDelta, kind: "refund", ref: txnId },
    });
    await tx.transaction.update({ where: { id: txnId }, data: { status: "reversed" } });
    await writeAudit({ who, action: `refunded ${txnId} (${formatFiat(Math.abs(txn.cast))})`, kind: "finance" });
    return { refunded: true, deltaCast: refundDelta };
  });
}

/** Approve a payout run: clear all currently-held payouts to paid. */
export async function approvePayoutRun(who: string, runId: string) {
  const held = await prisma.payout.findMany({ where: { status: "held" }, select: { id: true, cast: true } });
  for (const p of held) await clearPayout(p.id);
  const totalCast = held.reduce((s, p) => s + p.cast, 0);
  await prisma.payoutRun.upsert({
    where: { id: runId },
    create: { id: runId, date: new Date(), creatorCount: held.length, cast: totalCast, status: "paid", method: "mixed" },
    update: { status: "paid", creatorCount: held.length, cast: totalCast },
  });
  await writeAudit({ who, action: `approved payout run ${runId} (${held.length} payouts)`, kind: "finance" });
  return { cleared: held.length, totalCast };
}
export async function holdPayoutRun(who: string, runId: string) {
  await prisma.payoutRun.update({ where: { id: runId }, data: { status: "held" } });
  await writeAudit({ who, action: `held payout run ${runId}`, kind: "finance" });
}

// ---------------- Connectors / flags / settings ----------------

export async function toggleConnector(who: string, id: string, status: "live" | "beta" | "off") {
  await prisma.connector.update({ where: { id }, data: { status } });
  await writeAudit({ who, action: `connector ${id} → ${status}`, kind: "config" });
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
  await prisma.setting.upsert({
    where: { key: `connector:${id}` },
    create: { key: `connector:${id}`, valueJson: { enabled, credentials } },
    update: { valueJson: { enabled, credentials } },
  });
  // Reflect in the Connector row so the registry view shows live/off without a key read.
  await prisma.connector.update({ where: { id }, data: { status: enabled ? "live" : "off" } }).catch(() => {});
  await writeAudit({
    who,
    action: `configured connector ${id} (${enabled ? "enabled" : "saved"}, ${Object.keys(credentials).length} keys)`,
    kind: "config",
  });
  return { enabled, keyCount: Object.keys(credentials).length };
}
export async function toggleFlag(who: string, id: string, on: boolean) {
  await prisma.featureFlag.update({ where: { id }, data: { on } });
  await writeAudit({ who, action: `flag ${id} → ${on ? "on" : "off"}`, kind: "config" });
}

export async function getSetting<T = unknown>(key: string, fallback: T): Promise<T> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row ? (row.valueJson as T) : fallback;
}
export async function setSetting(who: string, key: string, value: unknown) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, valueJson: value as object },
    update: { valueJson: value as object },
  });
  await writeAudit({ who, action: `updated setting ${key}`, kind: "config" });
}
