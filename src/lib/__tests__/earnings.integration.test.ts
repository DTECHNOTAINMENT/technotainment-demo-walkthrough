/**
 * Earnings + payout integration tests (Phase 3 money-out path; DECISIONS §3). Gated on
 * DATABASE_URL. Builds an isolated creator+channel, simulates cleared revenue, and exercises
 * the KYC gate + payout request + clear.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const hasDb = !!process.env.DATABASE_URL;
const d = hasDb ? describe : describe.skip;

d("earnings + payouts (integration)", () => {
  let prisma: typeof import("@/lib/db").prisma;
  let earnings: typeof import("@/lib/earnings");
  const sfx = Date.now();
  const userId = `U-CR-${sfx}`;
  const creatorId = `cr-test-${sfx}`;
  const channelId = `ch-test-${sfx}`;

  beforeAll(async () => {
    prisma = (await import("@/lib/db")).prisma;
    earnings = await import("@/lib/earnings");
    await prisma.user.create({
      data: { id: userId, handle: `@cr-${sfx}`, email: `${userId}@t.dev`, displayName: "Creator", role: "creator", kyc: "none" },
    });
    await prisma.creator.create({
      data: { id: creatorId, userId, name: "Test Creator", handle: `@cr-${sfx}`, brand: "#7c3aed", brand2: "#ec4899", category: "test", takeRatePct: 12 },
    });
    await prisma.channel.create({ data: { id: channelId, creatorId, handle: `@cr-${sfx}`, name: "Test" } });
    await prisma.payoutMethod.create({ data: { creatorId, methodId: "bank", label: "bank", isDefault: true } });
    // A cleared revenue transaction (8 days ago) of 10,000 gross CAST → net 8,800 after 12%.
    const old = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    await prisma.transaction.create({
      data: { id: `TXR-CR-${sfx}`, userId, channelId, kind: "tip", cast: -10000, method: "balance", status: "settled", createdAt: old },
    });
  });

  afterAll(async () => {
    await prisma.payout.deleteMany({ where: { creatorId } });
    await prisma.payoutMethod.deleteMany({ where: { creatorId } });
    await prisma.transaction.deleteMany({ where: { channelId } });
    await prisma.channel.delete({ where: { id: channelId } }).catch(() => {});
    await prisma.creator.delete({ where: { id: creatorId } }).catch(() => {});
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  });

  it("derives net earnings with the 12% fee and 7-day hold", async () => {
    const e = await earnings.creatorEarnings(creatorId);
    expect(e.grossCast).toBe(10000);
    expect(e.feeCast).toBe(1200);
    expect(e.netCast).toBe(8800);
    expect(e.clearedCast).toBe(8800); // 8 days old → cleared
    expect(e.availableCast).toBe(8800);
  });

  it("blocks a payout until KYC is verified", async () => {
    await expect(earnings.requestPayout({ creatorId, cast: 5000 })).rejects.toThrow(/KYC/);
  });

  it("allows a payout after KYC, and clears it", async () => {
    await earnings.verifyCreatorKyc(creatorId);
    const r = await earnings.requestPayout({ creatorId, cast: 5000 });
    expect(r.status).toBe("held");
    // available is reduced by the in-flight payout
    const after = await earnings.creatorEarnings(creatorId);
    expect(after.availableCast).toBe(3800);
    await earnings.clearPayout(r.payoutId);
    const paid = await prisma.payout.findUnique({ where: { id: r.payoutId } });
    expect(paid?.status).toBe("paid");
  });

  it("rejects a payout above the available balance", async () => {
    await expect(earnings.requestPayout({ creatorId, cast: 999999 })).rejects.toThrow(/exceeds/);
  });
});
