/**
 * Money service integration tests — the Phase 2 DoD money paths (DECISIONS §3: a test for
 * every CAST path). These hit a real Postgres, so they're gated on DATABASE_URL and skipped
 * when absent (CI provides a postgres service; see .github/workflows/ci.yml).
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const hasDb = !!process.env.DATABASE_URL;
const d = hasDb ? describe : describe.skip;

d("money service (integration)", () => {
  let prisma: typeof import("@/lib/db").prisma;
  let money: typeof import("@/lib/money");
  const userId = `U-TEST-${Date.now()}`;

  beforeAll(async () => {
    prisma = (await import("@/lib/db")).prisma;
    money = await import("@/lib/money");
    await prisma.user.create({
      data: { id: userId, handle: `@test-${Date.now()}`, email: `${userId}@test.dev`, displayName: "Test", role: "member" },
    });
  });

  afterAll(async () => {
    await prisma.walletEntry.deleteMany({ where: { userId } });
    await prisma.transaction.deleteMany({ where: { userId } });
    await prisma.membership.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  });

  it("starts at zero balance", async () => {
    expect(await money.balanceOf(userId)).toBe(0);
  });

  it("tops up with an express method (no 3DS) and credits the ledger", async () => {
    const r = await money.topUp({ userId, methodId: "apple-pay", cast: 5000 });
    expect(r.needs3ds).toBe(false);
    expect(r.status).toBe("settled");
    expect(await money.balanceOf(userId)).toBe(5000);
  });

  it("tops up with a card (3DS) — pending until confirmed, then settles", async () => {
    const r = await money.topUp({ userId, methodId: "visa", cast: 5000 });
    expect(r.needs3ds).toBe(true);
    expect(await money.balanceOf(userId)).toBe(5000); // not credited yet
    const c = await money.confirmTopup({ userId, transactionId: r.transactionId, code: "123456" });
    expect(c.status).toBe("settled");
    expect(await money.balanceOf(userId)).toBe(10000);
  });

  it("settleTopup is idempotent (replayed webhook never double-credits)", async () => {
    const r = await money.topUp({ userId, methodId: "google-pay", cast: 1000 });
    expect(await money.balanceOf(userId)).toBe(11000);
    await money.settleTopup(r.transactionId); // replay
    await money.settleTopup(r.transactionId); // replay again
    expect(await money.balanceOf(userId)).toBe(11000);
  });

  it("spends CAST on a tip and records a signed ledger entry", async () => {
    const before = await money.balanceOf(userId);
    const r = await money.spend({ userId, kind: "tip", cast: 1200 });
    expect(r.balance).toBe(before - 1200);
    expect(await money.balanceOf(userId)).toBe(before - 1200);
    const txn = await prisma.transaction.findUnique({ where: { id: r.transactionId } });
    expect(txn?.cast).toBe(-1200);
    expect(txn?.method).toBe("balance");
  });

  it("blocks an overdraw", async () => {
    await expect(money.spend({ userId, kind: "tip", cast: 9_999_999 })).rejects.toThrow(/insufficient/);
  });

  it("rejects non-integer / non-positive amounts", async () => {
    await expect(money.spend({ userId, kind: "tip", cast: 10.5 })).rejects.toThrow();
    await expect(money.spend({ userId, kind: "tip", cast: -5 })).rejects.toThrow();
  });

  it("buys a membership and locks the price", async () => {
    // seed a channel+tier owned by the seeded Nyx creator if present; else skip the membership row check
    const tier = await prisma.tier.findFirst();
    if (!tier) return;
    const before = await money.balanceOf(userId);
    if (before < tier.priceCast) await money.topUp({ userId, methodId: "apple-pay", cast: tier.priceCast });
    const r = await money.spend({ userId, kind: "membership", cast: tier.priceCast, channelId: tier.channelId, tierId: tier.id });
    expect(r).toBeTruthy();
    const m = await prisma.membership.findFirst({ where: { userId, tierId: tier.id } });
    expect(m?.priceCastLocked).toBe(tier.priceCast);
    expect(m?.status).toBe("active");
  });
});
