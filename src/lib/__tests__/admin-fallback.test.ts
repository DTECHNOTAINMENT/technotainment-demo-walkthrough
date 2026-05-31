import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the whole prisma client surface the admin read queries + services touch.
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { count: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    creator: { count: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    report: { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    transaction: { aggregate: vi.fn(), findMany: vi.fn() },
    payout: { aggregate: vi.fn(), findMany: vi.fn() },
    payoutRun: { findMany: vi.fn(), upsert: vi.fn(), update: vi.fn() },
    stream: { count: vi.fn() },
    connector: { findMany: vi.fn(), update: vi.fn() },
    apiKey: { findMany: vi.fn() },
    webhook: { findMany: vi.fn() },
    featureFlag: { findMany: vi.fn(), update: vi.fn() },
    auditEvent: { findMany: vi.fn(), create: vi.fn() },
    adminUser: { findMany: vi.fn() },
    setting: { findUnique: vi.fn(), upsert: vi.fn() },
    walletEntry: { findFirst: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}));
vi.mock("@/lib/audit", () => ({ writeAudit: vi.fn() }));
vi.mock("@/lib/earnings", () => ({ clearPayout: vi.fn() }));

import * as q from "@/lib/queries/admin";
import * as admin from "@/lib/admin";
import { prisma } from "@/lib/db";

const noDb = () => new Error("no db");

describe("admin read queries fall back to fixtures (demo mode, no db)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("adminOverview returns populated KPIs when prisma throws", async () => {
    (prisma.user.count as any).mockRejectedValue(noDb());
    const out = await q.adminOverview();
    expect(out.userCount).toBeGreaterThan(0);
    expect(out.creatorCount).toBeGreaterThan(0);
  });

  it("listUsers / listCreators / listApplications populate on throw", async () => {
    (prisma.user.findMany as any).mockRejectedValue(noDb());
    (prisma.creator.findMany as any).mockRejectedValue(noDb());
    expect((await q.listUsers()).length).toBeGreaterThan(0);
    expect((await q.listCreators()).length).toBeGreaterThan(0);
    const apps = await q.listApplications();
    expect(apps.length).toBeGreaterThan(0);
    expect(apps.every((a: any) => a.status === "review")).toBe(true);
  });

  it("lists populate on empty result too", async () => {
    (prisma.report.findMany as any).mockResolvedValue([]);
    (prisma.transaction.findMany as any).mockResolvedValue([]);
    (prisma.connector.findMany as any).mockResolvedValue([]);
    (prisma.featureFlag.findMany as any).mockResolvedValue([]);
    expect((await q.listReports()).length).toBeGreaterThan(0);
    expect((await q.listTransactions()).length).toBeGreaterThan(0);
    expect((await q.listConnectors()).length).toBeGreaterThan(0);
    expect((await q.listFlags()).length).toBeGreaterThan(0);
  });

  it("finance + connectors + audit + team populate on throw", async () => {
    (prisma.payoutRun.findMany as any).mockRejectedValue(noDb());
    (prisma.payout.findMany as any).mockRejectedValue(noDb());
    (prisma.apiKey.findMany as any).mockRejectedValue(noDb());
    (prisma.webhook.findMany as any).mockRejectedValue(noDb());
    (prisma.auditEvent.findMany as any).mockRejectedValue(noDb());
    (prisma.adminUser.findMany as any).mockRejectedValue(noDb());
    expect((await q.listPayoutRuns()).length).toBeGreaterThan(0);
    expect((await q.heldPayouts()).length).toBeGreaterThan(0);
    expect((await q.listApiKeys()).length).toBeGreaterThan(0);
    expect((await q.listWebhooks()).length).toBeGreaterThan(0);
    expect((await q.listAudit()).length).toBeGreaterThan(0);
    expect((await q.listTeam()).length).toBeGreaterThan(0);
  });

  it("real db wins: a non-empty prisma result is returned unchanged", async () => {
    (prisma.user.findMany as any).mockResolvedValue([{ id: "REAL", handle: "real", status: "active", kyc: "none" }]);
    const out = await q.listUsers();
    expect(out).toHaveLength(1);
    expect((out[0] as any).id).toBe("REAL");
  });
});

describe("admin services simulate success with no db", () => {
  beforeEach(() => vi.clearAllMocks());

  it("approveApplication resolves (simulated) when prisma throws", async () => {
    (prisma.creator.update as any).mockRejectedValue(noDb());
    await expect(admin.approveApplication("staff@x.com", "C-juno")).resolves.toBeUndefined();
  });

  it("actionReport strike resolves (simulated) using fixture report when prisma throws", async () => {
    (prisma.report.findUnique as any).mockRejectedValue(noDb());
    (prisma.report.update as any).mockRejectedValue(noDb());
    (prisma.user.update as any).mockRejectedValue(noDb());
    await expect(admin.actionReport("staff@x.com", "R-1", "strike")).resolves.toBeUndefined();
  });

  it("toggleFlag / toggleConnector / setSetting resolve (simulated) when prisma throws", async () => {
    (prisma.featureFlag.update as any).mockRejectedValue(noDb());
    (prisma.connector.update as any).mockRejectedValue(noDb());
    (prisma.setting.upsert as any).mockRejectedValue(noDb());
    await expect(admin.toggleFlag("staff@x.com", "FL-cowatch", true)).resolves.toBeUndefined();
    await expect(admin.toggleConnector("staff@x.com", "stripe", "live")).resolves.toBeUndefined();
    await expect(admin.setSetting("staff@x.com", "branding.appName", "Demo")).resolves.toBeUndefined();
  });

  it("refundTransaction returns simulated refund for a fixture spend when prisma throws", async () => {
    (prisma.$transaction as any).mockRejectedValue(noDb());
    const out = await admin.refundTransaction("staff@x.com", "TXN-2002"); // -800 spend
    expect(out.refunded).toBe(true);
    expect(out.deltaCast).toBe(800);
  });

  it("refundTransaction still rejects a top-up even with no db (validation survives)", async () => {
    (prisma.$transaction as any).mockRejectedValue(noDb());
    await expect(admin.refundTransaction("staff@x.com", "TXN-2001")).rejects.toThrow();
  });

  it("approvePayoutRun returns simulated cleared count when prisma throws", async () => {
    (prisma.payout.findMany as any).mockRejectedValue(noDb());
    const out = await admin.approvePayoutRun("staff@x.com", "PR-demo");
    expect(out.cleared).toBeGreaterThan(0);
    expect(out.totalCast).toBeGreaterThan(0);
  });
});
