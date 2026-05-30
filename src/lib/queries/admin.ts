/**
 * Admin / Operations read queries (staff-scoped). Server-only. KPIs and lists for the
 * admin console (docs/ROUTES.md Admin section).
 */
import { prisma } from "@/lib/db";

export async function adminOverview() {
  const [userCount, creatorCount, openReports, gmv, pendingPayouts, liveStreams] = await Promise.all([
    prisma.user.count(),
    prisma.creator.count({ where: { status: "active" } }),
    prisma.report.count({ where: { status: "open" } }),
    prisma.transaction.aggregate({ where: { kind: "topup", status: "settled" }, _sum: { cast: true } }),
    prisma.payout.aggregate({ where: { status: "held" }, _sum: { cast: true } }),
    prisma.stream.count({ where: { status: "live" } }),
  ]);
  return {
    userCount,
    creatorCount,
    openReports,
    gmvCast: gmv._sum.cast ?? 0,
    pendingPayoutCast: pendingPayouts._sum.cast ?? 0,
    liveStreams,
  };
}

export async function listUsers(limit = 100) {
  return prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}

export async function listCreators() {
  return prisma.creator.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { handle: true, kyc: true, status: true } }, channel: { select: { handle: true } } },
  });
}

/** Pending creator applications (status = review). */
export async function listApplications() {
  return prisma.creator.findMany({ where: { status: "review" }, include: { user: true } });
}

export async function listReports(status?: "open" | "investigating" | "actioned" | "dismissed") {
  return prisma.report.findMany({ where: status ? { status } : {}, orderBy: [{ severity: "desc" }, { createdAt: "desc" }] });
}

export async function listTransactions(limit = 100) {
  return prisma.transaction.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}

export async function listPayoutRuns() {
  return prisma.payoutRun.findMany({ orderBy: { date: "desc" } });
}
export async function heldPayouts() {
  return prisma.payout.findMany({ where: { status: "held" }, include: { creator: { select: { name: true, handle: true } } } });
}

export async function listConnectors() {
  return prisma.connector.findMany({ orderBy: { cat: "asc" } });
}
export async function listApiKeys() {
  return prisma.apiKey.findMany();
}
export async function listWebhooks() {
  return prisma.webhook.findMany();
}
export async function listFlags() {
  return prisma.featureFlag.findMany({ orderBy: { group: "asc" } });
}
export async function listAudit(limit = 100) {
  return prisma.auditEvent.findMany({ orderBy: { when: "desc" }, take: limit });
}
export async function listTeam() {
  return prisma.adminUser.findMany({ orderBy: { role: "asc" } });
}
