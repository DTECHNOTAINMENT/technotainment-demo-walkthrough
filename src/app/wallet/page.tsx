// Wallet — /wallet. Server-rendered, signed-in only. Shows the CAST balance, saved
// payment methods, and the full transaction ledger (each row links to a receipt).
// Presentation rebuilt to match prototype/v4/wallet.jsx (balance hero + quick packs,
// day-grouped spend history with filter chips, payment-methods + statements sidebar).
// Data wiring (balanceOf, listHistory, session, paymentMethod query) is unchanged.
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { balanceOf, listHistory } from "@/lib/money";
import { prisma } from "@/lib/db";
import { formatCast } from "@/lib/cast";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "wallet",
  robots: { index: false, follow: false },
};

const KIND_LABEL: Record<string, string> = {
  topup: "top-up",
  tip: "tip",
  membership: "membership",
  drop: "drop",
  ppv: "ppv rental",
  gift: "gift",
};

const FILTERS = ["all", "tip", "membership", "drop", "ppv", "topup"] as const;

const STATUS_COLOR: Record<string, string> = {
  settled: "#10b981",
  pending: "var(--ink-3)",
  reversed: "var(--bg-red)",
};

function dayKey(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" });
}

function timeOf(d: Date): string {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default async function WalletPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in");

  const [balance, history, methods] = await Promise.all([
    balanceOf(session.userId),
    listHistory(session.userId),
    prisma.paymentMethod.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "asc" } }),
  ]);

  // group history by day for the spend-history look
  const groups: { day: string; rows: typeof history }[] = [];
  for (const tx of history) {
    const key = dayKey(tx.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.day === key) last.rows.push(tx);
    else groups.push({ day: key, rows: [tx] });
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px 96px" }}>
      {/* balance hero */}
      <div className="card" style={{ padding: 0, overflow: "hidden", background: "var(--surface)" }}>
        <div className="brand-hairline" />
        <div style={{ padding: "32px 28px 28px", display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div className="lower" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                your CAST balance
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 12 }}>
                <span className="cast-glyph" style={{ width: 36, height: 36, fontSize: 18 }}>c</span>
                <span className="tnum brand-grad-text stat-num" style={{ fontSize: "clamp(56px, 9vw, 96px)" }}>{formatCast(balance)}</span>
                <span style={{ fontSize: 18, color: "var(--ink-3)", fontWeight: 700 }}>CAST</span>
              </div>
              <div className="mono" style={{ marginTop: 8, fontSize: 12, color: "var(--ink-3)" }}>
                1:100 (£0.01 = 1 CAST) · balances never expire
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link href="/wallet/topup" className="btn btn-grad" style={{ padding: "14px 22px", fontSize: 14 }}>
                <Icon name="plus" size={14} stroke={2.6} /> top up CAST
              </Link>
              <span className="btn btn-grad-stroke" style={{ padding: "14px 18px", fontSize: 14, opacity: 0.6 }}>
                <Icon name="gift" size={14} stroke={2.4} /> gift
              </span>
            </div>
          </div>

          {/* quick top-up packs */}
          <div>
            <div className="lower" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 10 }}>
              quick top-up
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
              {[
                { amount: 500, badge: "" },
                { amount: 1000, badge: "popular" },
                { amount: 2500, badge: "" },
                { amount: 5000, badge: "best value" },
              ].map((p) => (
                <Link
                  key={p.amount}
                  href="/wallet/topup"
                  style={{ padding: "14px 12px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--hairline)", textAlign: "left", position: "relative", textDecoration: "none" }}
                >
                  {p.badge && (
                    <span
                      className="lower"
                      style={{ position: "absolute", top: 10, right: 10, fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: "var(--brand-gradient)", color: "white", letterSpacing: "0.06em", textTransform: "uppercase" }}
                    >
                      {p.badge}
                    </span>
                  )}
                  <div className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>{formatCast(p.amount)}</div>
                  <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>CAST · £{(p.amount / 100).toFixed(2)}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* two-up grid */}
      <style>{`@media (min-width: 1024px) { .wallet-grid { grid-template-columns: 1.4fr 1fr !important; } }`}</style>
      <div className="wallet-grid" style={{ display: "grid", gap: 16, marginTop: 16, gridTemplateColumns: "1fr" }}>
        {/* spend history */}
        <div className="card" style={{ background: "var(--surface)", padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
            <div className="lower" style={{ fontWeight: 800, fontSize: 16 }}>spend history</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>every line item is inspectable. ledger-first.</div>
          </div>
          <div style={{ display: "flex", gap: 6, padding: "12px 18px", borderBottom: "1px solid var(--hairline)", overflowX: "auto", scrollbarWidth: "none" }}>
            {FILTERS.map((f, i) => (
              <span key={f} className={`chip ${i === 0 ? "active" : ""}`} style={{ padding: "6px 12px", fontSize: 12 }}>
                <span className="lower">{f === "all" ? "all" : KIND_LABEL[f] ?? f}</span>
              </span>
            ))}
          </div>
          {groups.length ? (
            groups.map((g, di) => {
              const dayTotal = g.rows.reduce((a, r) => a + r.cast, 0);
              return (
                <div key={di}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 18px 8px", borderTop: di ? "1px solid var(--hairline)" : "none" }}>
                    <span className="lower" style={{ fontSize: 13, fontWeight: 800 }}>{g.day}</span>
                    <span className="mono tnum" style={{ fontSize: 12, color: dayTotal > 0 ? "#10b981" : "var(--ink-3)", fontWeight: 700 }}>
                      {dayTotal > 0 ? "+" : ""}{formatCast(dayTotal)} CAST
                    </span>
                  </div>
                  {g.rows.map((tx) => {
                    const positive = tx.cast > 0;
                    return (
                      <Link
                        key={tx.id}
                        href={`/receipt/${tx.id}`}
                        style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 18px", width: "100%", textAlign: "left", textDecoration: "none", borderTop: "1px solid transparent" }}
                      >
                        <div
                          style={{ width: 40, height: 40, borderRadius: "50%", flex: "0 0 40px", background: "var(--brand-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}
                        >
                          <Icon name={tx.kind === "topup" ? "plus" : tx.kind === "tip" ? "tip" : tx.kind === "drop" ? "bag" : "cast"} size={18} stroke={2.4} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="lower" style={{ fontSize: 13, fontWeight: 600 }}>{KIND_LABEL[tx.kind] ?? tx.kind}</div>
                          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                            {timeOf(tx.createdAt)} · {tx.method}
                            {tx.kind === "topup" && tx.grossFiat ? ` · ${tx.grossFiat}` : ""}
                          </div>
                        </div>
                        <span
                          className="lower tnum"
                          style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", padding: "3px 8px", borderRadius: 999, color: STATUS_COLOR[tx.status] ?? "var(--ink-3)", background: "var(--surface-2)" }}
                        >
                          {tx.status}
                        </span>
                        <div className="tnum" style={{ fontWeight: 800, fontSize: 14, color: positive ? "#10b981" : "var(--ink-1)" }}>
                          {positive ? "+" : "−"}{formatCast(Math.abs(tx.cast))} CAST
                        </div>
                        <Icon name="chevR" size={14} stroke={2} style={{ color: "var(--ink-4)" }} />
                      </Link>
                    );
                  })}
                </div>
              );
            })
          ) : (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <p className="lower" style={{ fontSize: 14, color: "var(--ink-3)", margin: "0 0 14px" }}>no transactions yet.</p>
              <Link href="/wallet/topup" className="btn btn-grad lower" style={{ padding: "10px 18px" }}>top up to get started</Link>
            </div>
          )}
        </div>

        {/* sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* payment methods */}
          <div className="card" style={{ padding: 18, background: "var(--surface)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div className="lower" style={{ fontWeight: 800, fontSize: 16 }}>payment methods</div>
              <span className="tnum" style={{ fontSize: 11, color: "var(--ink-3)" }}>{methods.length} saved</span>
            </div>
            {methods.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {methods.map((m) => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid var(--hairline)", borderRadius: 12 }}>
                    <div style={{ width: 30, height: 22, borderRadius: 5, background: "var(--surface-3)", flex: "0 0 30px" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lower" style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
                      {m.sub && <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{m.sub}</div>}
                    </div>
                    {m.instant && (
                      <span
                        className="lower"
                        style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", color: "#10b981", padding: "2px 6px", borderRadius: 999, background: "rgba(16,185,129,0.12)" }}
                      >
                        instant
                      </span>
                    )}
                  </div>
                ))}
                <Link href="/wallet/topup" className="btn btn-glass lower" style={{ padding: "10px 14px", fontSize: 13 }}>
                  <Icon name="plus" size={14} stroke={2.4} /> add method
                </Link>
              </div>
            ) : (
              <p className="lower" style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>no saved methods yet · you can add one at top-up.</p>
            )}
          </div>

          {/* statements */}
          <div className="card" style={{ padding: 18, background: "var(--surface)" }}>
            <div className="lower" style={{ fontWeight: 800, fontSize: 16 }}>statements</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2, marginBottom: 12 }}>plain-language, line-itemized PDFs</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["may 2026 · current", "april 2026", "march 2026", "february 2026"].map((s) => (
                <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: "1px solid var(--hairline)", borderRadius: 10 }}>
                  <span style={{ fontSize: 13 }}>{s}</span>
                  <Icon name="arrowR" size={14} stroke={2} style={{ color: "var(--ink-3)" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
