/**
 * Admin / Operations read queries (staff-scoped). Server-only. KPIs and lists for the
 * admin console (docs/ROUTES.md Admin section).
 *
 * NO-DATABASE FALLBACK: every read is resilient — on a Prisma error (no DATABASE_URL / DB
 * unreachable) OR empty result it falls back to the demo dataset in `@/lib/fixtures-admin`, so
 * the whole console renders populated with zero backend. Real DB data always wins when present.
 */
import { prisma } from "@/lib/db";
import * as fx from "@/lib/fixtures-admin";

async function safe<T>(run: () => Promise<T>, fallback: () => T, emptyCheck?: (v: T) => boolean): Promise<T> {
  try {
    const v = await run();
    if (emptyCheck && emptyCheck(v)) return fallback();
    return v;
  } catch {
    return fallback();
  }
}

const isEmptyArr = (v: unknown) => Array.isArray(v) && v.length === 0;

export async function adminOverview() {
  return safe(
    async () => {
      const [userCount, creatorCount, openReports, gmv, pendingPayouts, liveStreams] = await Promise.all([
        prisma.user.count(),
        prisma.creator.count({ where: { status: "active" } }),
        prisma.report.count({ where: { status: "open" } }),
        prisma.transaction.aggregate({ where: { kind: "topup", status: "settled" }, _sum: { cast: true } }),
        prisma.payout.aggregate({ where: { status: "held" }, _sum: { cast: true } }),
        prisma.stream.count({ where: { status: "live" } }),
      ]);
      if (userCount === 0) throw new Error("empty");
      return { userCount, creatorCount, openReports, gmvCast: gmv._sum.cast ?? 0, pendingPayoutCast: pendingPayouts._sum.cast ?? 0, liveStreams };
    },
    () => fx.DEMO_OVERVIEW(),
  );
}

export async function listUsers(limit = 100) {
  return safe(
    () => prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: limit }),
    () => fx.DEMO_USERS_ADMIN as unknown as Awaited<ReturnType<typeof listUsersDb>>,
    isEmptyArr,
  );
}
function listUsersDb() {
  return prisma.user.findMany();
}

export async function listCreators() {
  return safe(
    () =>
      prisma.creator.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { handle: true, kyc: true, status: true } }, channel: { select: { handle: true } } },
      }),
    () => fx.DEMO_CREATORS_ADMIN as unknown as Awaited<ReturnType<typeof listCreatorsDb>>,
    isEmptyArr,
  );
}
function listCreatorsDb() {
  return prisma.creator.findMany({
    include: { user: { select: { handle: true, kyc: true, status: true } }, channel: { select: { handle: true } } },
  });
}

/** Pending creator applications (status = review). */
export async function listApplications() {
  return safe(
    () => prisma.creator.findMany({ where: { status: "review" }, include: { user: true } }),
    () => fx.DEMO_APPLICATIONS as unknown as Awaited<ReturnType<typeof listApplicationsDb>>,
  );
}
function listApplicationsDb() {
  return prisma.creator.findMany({ where: { status: "review" }, include: { user: true } });
}

export async function listReports(status?: "open" | "investigating" | "actioned" | "dismissed") {
  return safe(
    () => prisma.report.findMany({ where: status ? { status } : {}, orderBy: [{ severity: "desc" }, { createdAt: "desc" }] }),
    () => fx.DEMO_REPORTS as unknown as Awaited<ReturnType<typeof listReportsDb>>,
    isEmptyArr,
  );
}
function listReportsDb() {
  return prisma.report.findMany({});
}

export async function listTransactions(limit = 100) {
  return safe(
    () => prisma.transaction.findMany({ orderBy: { createdAt: "desc" }, take: limit }),
    () => fx.DEMO_ADMIN_TRANSACTIONS as unknown as Awaited<ReturnType<typeof listTransactionsDb>>,
    isEmptyArr,
  );
}
function listTransactionsDb() {
  return prisma.transaction.findMany();
}

export async function listPayoutRuns() {
  return safe(
    () => prisma.payoutRun.findMany({ orderBy: { date: "desc" } }),
    () => fx.DEMO_PAYOUT_RUNS as unknown as Awaited<ReturnType<typeof listPayoutRunsDb>>,
    isEmptyArr,
  );
}
function listPayoutRunsDb() {
  return prisma.payoutRun.findMany();
}

export async function heldPayouts() {
  return safe(
    () => prisma.payout.findMany({ where: { status: "held" }, include: { creator: { select: { name: true, handle: true } } } }),
    () => fx.DEMO_HELD_PAYOUTS as unknown as Awaited<ReturnType<typeof heldPayoutsDb>>,
  );
}
function heldPayoutsDb() {
  return prisma.payout.findMany({ where: { status: "held" }, include: { creator: { select: { name: true, handle: true } } } });
}

export async function listConnectors() {
  return safe(
    () => prisma.connector.findMany({ orderBy: { cat: "asc" } }),
    () => fx.DEMO_CONNECTORS as unknown as Awaited<ReturnType<typeof listConnectorsDb>>,
    isEmptyArr,
  );
}
function listConnectorsDb() {
  return prisma.connector.findMany();
}

export async function listApiKeys() {
  return safe(
    () => prisma.apiKey.findMany(),
    () => fx.DEMO_API_KEYS as unknown as Awaited<ReturnType<typeof prisma.apiKey.findMany>>,
    isEmptyArr,
  );
}

export async function listWebhooks() {
  return safe(
    () => prisma.webhook.findMany(),
    () => fx.DEMO_WEBHOOKS as unknown as Awaited<ReturnType<typeof prisma.webhook.findMany>>,
    isEmptyArr,
  );
}

export async function listFlags() {
  return safe(
    () => prisma.featureFlag.findMany({ orderBy: { group: "asc" } }),
    () => fx.DEMO_FLAGS as unknown as Awaited<ReturnType<typeof listFlagsDb>>,
    isEmptyArr,
  );
}
function listFlagsDb() {
  return prisma.featureFlag.findMany();
}

export async function listAudit(limit = 100) {
  return safe(
    () => prisma.auditEvent.findMany({ orderBy: { when: "desc" }, take: limit }),
    () => fx.DEMO_AUDIT as unknown as Awaited<ReturnType<typeof listAuditDb>>,
    isEmptyArr,
  );
}
function listAuditDb() {
  return prisma.auditEvent.findMany();
}

export async function listTeam() {
  return safe(
    () => prisma.adminUser.findMany({ orderBy: { role: "asc" } }),
    () => fx.DEMO_TEAM as unknown as Awaited<ReturnType<typeof listTeamDb>>,
    isEmptyArr,
  );
}
function listTeamDb() {
  return prisma.adminUser.findMany();
}
