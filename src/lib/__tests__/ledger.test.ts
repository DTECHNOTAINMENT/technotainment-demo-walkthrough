import { describe, it, expect } from "vitest";
import {
  deriveBalance,
  canSpend,
  validateEntry,
  recordEntry,
  type PrismaLike,
  type LedgerEntryInput,
} from "../ledger";

describe("CAST ledger (pure)", () => {
  it("derives balance as the sum of deltas", () => {
    expect(deriveBalance([{ deltaCast: 5000 }, { deltaCast: -1200 }, { deltaCast: -800 }])).toBe(3000);
    expect(deriveBalance([])).toBe(0);
  });

  it("rejects non-integer deltas when deriving", () => {
    expect(() => deriveBalance([{ deltaCast: 10.5 }])).toThrow();
  });

  it("guards spends against the current balance", () => {
    expect(canSpend(1000, -1000)).toBe(true);
    expect(canSpend(1000, -1001)).toBe(false);
    expect(canSpend(0, 5000)).toBe(true); // top-up
  });

  it("validates sign per entry kind", () => {
    expect(() => validateEntry({ userId: "U1", deltaCast: 5000, kind: "topup", ref: "T1" })).not.toThrow();
    expect(() => validateEntry({ userId: "U1", deltaCast: -50, kind: "tip", ref: "T1" })).not.toThrow();
    expect(() => validateEntry({ userId: "U1", deltaCast: -5000, kind: "topup", ref: "T1" })).toThrow();
    expect(() => validateEntry({ userId: "U1", deltaCast: 50, kind: "tip", ref: "T1" })).toThrow();
    expect(() => validateEntry({ userId: "U1", deltaCast: 0, kind: "tip", ref: "T1" })).toThrow();
    expect(() => validateEntry({ userId: "", deltaCast: -50, kind: "tip", ref: "T1" })).toThrow();
  });
});

/** In-memory Prisma stand-in to exercise recordEntry's transaction + overdraw guard. */
function fakeDb(seed: { deltaCast: number }[] = []): PrismaLike {
  const rows = [...seed];
  const db: PrismaLike = {
    async $transaction(fn) {
      return fn(db);
    },
    walletEntry: {
      async findMany() {
        return rows.map((r) => ({ deltaCast: r.deltaCast }));
      },
      async create({ data }: { data: LedgerEntryInput }) {
        rows.push({ deltaCast: data.deltaCast });
        return { id: "WE-" + rows.length, createdAt: new Date(), ...data };
      },
    },
  };
  return db;
}

describe("CAST ledger (recordEntry)", () => {
  it("appends a top-up and returns the new balance", async () => {
    const db = fakeDb();
    const { balance } = await recordEntry(db, { userId: "U1", deltaCast: 5000, kind: "topup", ref: "TXR-1" });
    expect(balance).toBe(5000);
  });

  it("allows a spend within balance and blocks an overdraw", async () => {
    const db = fakeDb([{ deltaCast: 1000 }]);
    const ok = await recordEntry(db, { userId: "U1", deltaCast: -800, kind: "tip", ref: "TXR-2" });
    expect(ok.balance).toBe(200);
    await expect(
      recordEntry(db, { userId: "U1", deltaCast: -500, kind: "tip", ref: "TXR-3" }),
    ).rejects.toThrow(/insufficient/);
  });
});
