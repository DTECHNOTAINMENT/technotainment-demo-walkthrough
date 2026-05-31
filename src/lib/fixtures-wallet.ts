/**
 * Demo wallet data (no-DB mode). Lets the viewer money surface — wallet balance, history,
 * receipts, saved methods, library — render fully populated with zero backend. Real DB data
 * always wins; these are used only when a Prisma read throws (no DATABASE_URL / unreachable).
 */

export const DEMO_BALANCE = 12480; // @mira.k demo wallet balance (matches the seed)

export interface DemoTxn {
  id: string;
  userId: string;
  kind: "topup" | "tip" | "membership" | "drop" | "ppv" | "gift";
  cast: number; // signed
  grossFiat: string | null;
  method: string;
  status: "settled" | "pending" | "reversed";
  channelId: string | null;
  flag: null;
  createdAt: Date;
}

const now = Date.now();
const ago = (h: number) => new Date(now - h * 3600_000);

export const DEMO_HISTORY: DemoTxn[] = [
  { id: "TXR-DEMO01", userId: "U-48210", kind: "topup", cast: 5000, grossFiat: "£50.00", method: "apple-pay", status: "settled", channelId: null, flag: null, createdAt: ago(2) },
  { id: "TXR-DEMO02", userId: "U-48210", kind: "tip", cast: -250, grossFiat: null, method: "balance", status: "settled", channelId: "ch-nyx", flag: null, createdAt: ago(5) },
  { id: "TXR-DEMO03", userId: "U-48210", kind: "membership", cast: -800, grossFiat: null, method: "balance", status: "settled", channelId: "ch-nyx", flag: null, createdAt: ago(26) },
  { id: "TXR-DEMO04", userId: "U-48210", kind: "ppv", cast: -300, grossFiat: null, method: "balance", status: "settled", channelId: "ch-atlas", flag: null, createdAt: ago(30) },
  { id: "TXR-DEMO05", userId: "U-48210", kind: "drop", cast: -1200, grossFiat: null, method: "balance", status: "settled", channelId: "ch-nyx", flag: null, createdAt: ago(52) },
  { id: "TXR-DEMO06", userId: "U-48210", kind: "topup", cast: 10000, grossFiat: "£100.00", method: "visa", status: "settled", channelId: null, flag: null, createdAt: ago(72) },
  { id: "TXR-DEMO07", userId: "U-48210", kind: "tip", cast: -500, grossFiat: null, method: "balance", status: "settled", channelId: "ch-saber", flag: null, createdAt: ago(96) },
  { id: "TXR-DEMO08", userId: "U-48210", kind: "gift", cast: -100, grossFiat: null, method: "balance", status: "settled", channelId: "ch-nyx", flag: null, createdAt: ago(120) },
];

export interface DemoMethod {
  id: string;
  userId: string;
  methodId: string;
  label: string;
  group: "card" | "wallet" | "bank";
  sub: string | null;
  instant: boolean;
  needs3ds: boolean;
  regions: string | null;
  createdAt: Date;
}

export const DEMO_METHODS: DemoMethod[] = [
  { id: "pm-visa", userId: "U-48210", methodId: "visa", label: "visa •••• 4291", group: "card", sub: "expires 09/28", instant: false, needs3ds: true, regions: null, createdAt: ago(800) },
  { id: "pm-apple", userId: "U-48210", methodId: "apple-pay", label: "apple pay", group: "wallet", sub: null, instant: true, needs3ds: false, regions: null, createdAt: ago(900) },
];

export function fxHistory(limit = 50): DemoTxn[] {
  return DEMO_HISTORY.slice(0, limit);
}

export function fxReceipt(transactionId: string) {
  const t = DEMO_HISTORY.find((x) => x.id === transactionId) ?? DEMO_HISTORY[0];
  return {
    id: t.id,
    kind: t.kind,
    cast: t.cast,
    grossFiat: t.grossFiat,
    method: t.method,
    status: t.status,
    createdAt: t.createdAt,
  };
}

export function fxMethods(): DemoMethod[] {
  return DEMO_METHODS;
}
