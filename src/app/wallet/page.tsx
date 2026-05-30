// Wallet — /wallet. Server-rendered, signed-in only. Shows the CAST balance,
// saved payment methods, and the full transaction ledger (each row links to a receipt).
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { balanceOf, listHistory } from "@/lib/money";
import { prisma } from "@/lib/db";
import { formatCast, formatFiat } from "@/lib/cast";

export const metadata: Metadata = {
  title: "wallet",
  robots: { index: false, follow: false },
};

const KIND_LABEL: Record<string, string> = {
  topup: "top-up",
  tip: "tip",
  membership: "membership",
  drop: "drop",
  ppv: "ppv",
  gift: "gift",
};

const STATUS_COLOR: Record<string, string> = {
  settled: "#10b981",
  pending: "var(--ink-3)",
  reversed: "var(--bg-red)",
};

function dateLine(d: Date): string {
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function WalletPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in");

  const [balance, history, methods] = await Promise.all([
    balanceOf(session.userId),
    listHistory(session.userId),
    prisma.paymentMethod.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 96px" }}>
      {/* balance hero */}
      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
        <div className="brand-hairline" />
        <div
          style={{
            padding: "32px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <div
              className="lower"
              style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
            >
              your CAST balance
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 12 }}>
              <span className="cast-glyph" style={{ width: 32, height: 32, fontSize: 16 }}>
                c
              </span>
              <span className="tnum brand-grad-text stat-num" style={{ fontSize: "clamp(48px, 8vw, 80px)" }}>
                {formatCast(balance)}
              </span>
              <span style={{ fontSize: 18, color: "var(--ink-3)", fontWeight: 700 }}>CAST</span>
            </div>
            <div className="mono lower" style={{ marginTop: 8, fontSize: 12, color: "var(--ink-3)" }}>
              {formatFiat(balance)} · 1:100 (£0.01 = 1 CAST)
            </div>
          </div>
          <Link href="/wallet/topup" className="btn btn-grad lower" style={{ padding: "14px 22px", fontSize: 14 }}>
            top up
          </Link>
        </div>
      </div>

      <div
        style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr" }}
      >
        {/* saved payment methods */}
        <section className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div className="lower" style={{ fontWeight: 800, fontSize: 16 }}>
              payment methods
            </div>
            <span className="tnum" style={{ fontSize: 12, color: "var(--ink-3)" }}>
              {methods.length} saved
            </span>
          </div>
          {methods.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {methods.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    border: "1px solid var(--hairline)",
                    borderRadius: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lower" style={{ fontSize: 13, fontWeight: 700 }}>
                      {m.label}
                    </div>
                    {m.sub && (
                      <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                        {m.sub}
                      </div>
                    )}
                  </div>
                  {m.instant && (
                    <span
                      className="lower"
                      style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        color: "#10b981",
                        padding: "3px 7px",
                        borderRadius: 999,
                        background: "rgba(16,185,129,0.12)",
                      }}
                    >
                      instant
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="lower" style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>
              no saved methods yet · you can add one at top-up.
            </p>
          )}
        </section>

        {/* transaction history */}
        <section className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hairline)" }}>
            <div className="lower" style={{ fontWeight: 800, fontSize: 16 }}>
              history
            </div>
            <div className="lower" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
              every line item is inspectable · ledger-first.
            </div>
          </div>
          {history.length ? (
            <div>
              {history.map((tx) => {
                const positive = tx.cast > 0;
                return (
                  <Link
                    key={tx.id}
                    href={`/receipt/${tx.id}`}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      padding: "14px 20px",
                      borderTop: "1px solid var(--hairline)",
                      textDecoration: "none",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lower" style={{ fontSize: 14, fontWeight: 700 }}>
                        {KIND_LABEL[tx.kind] ?? tx.kind}
                      </div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                        {dateLine(tx.createdAt)} · {tx.method}
                        {tx.kind === "topup" && tx.grossFiat ? ` · ${tx.grossFiat}` : ""}
                      </div>
                    </div>
                    <span
                      className="lower tnum"
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: 999,
                        color: STATUS_COLOR[tx.status] ?? "var(--ink-3)",
                        background: "var(--surface-2)",
                      }}
                    >
                      {tx.status}
                    </span>
                    <span
                      className="tnum"
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        minWidth: 96,
                        textAlign: "right",
                        color: positive ? "#10b981" : "var(--ink-1)",
                      }}
                    >
                      {positive ? "+" : "−"}
                      {formatCast(Math.abs(tx.cast))} CAST
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <p className="lower" style={{ fontSize: 14, color: "var(--ink-3)", margin: "0 0 14px" }}>
                no transactions yet.
              </p>
              <Link href="/wallet/topup" className="btn btn-grad lower" style={{ padding: "10px 18px" }}>
                top up to get started
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
