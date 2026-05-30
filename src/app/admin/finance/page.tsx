/**
 * /admin/finance — the money ledger. Two halves:
 *  1. transactions: every top-up in and on-platform spend out, with a refund button on any
 *     settled spend (AxRefund → finance/refund).
 *  2. payout runs: scheduled batches + held payouts; "run payout batch" clears every held
 *     payout to paid (AxPayoutRun → payout-run-approve), plus hold.
 * Server component reads the DB; the buttons are client components that re-read on success.
 */
import { listTransactions, listPayoutRuns, heldPayouts } from "@/lib/queries/admin";
import { formatCast, formatFiat } from "@/lib/cast";
import { AxPageHead, AxCard, AxStat, AxRow, AxPill, AxEmpty, type Tone, AX_PAGE } from "@/components/admin-x/AxPrimitives";
import { AxRefund } from "@/components/admin-x/AxRefund";
import { AxPayoutRun } from "@/components/admin-x/AxPayoutRun";

export const dynamic = "force-dynamic";

const TXN_TONE: Record<string, Tone> = { settled: "ok", pending: "warn", reversed: "live" };
const RUN_TONE: Record<string, Tone> = { paid: "ok", scheduled: "info", held: "warn" };

export default async function AdminFinancePage() {
  const [txns, runs, held] = await Promise.all([listTransactions(), listPayoutRuns(), heldPayouts()]);

  const heldCast = held.reduce((s, p) => s + p.cast, 0);
  const topupCast = txns.filter((t) => t.kind === "topup" && t.status === "settled").reduce((s, t) => s + t.cast, 0);
  const spendCast = txns.filter((t) => t.kind !== "topup" && t.status === "settled").reduce((s, t) => s + Math.abs(t.cast), 0);
  const reversedCount = txns.filter((t) => t.status === "reversed").length;

  return (
    <div style={AX_PAGE}>
      <AxPageHead
        eyebrow="operations"
        title="finance"
        sub="the money ledger — top-ups in, on-platform spend out, refunds, chargebacks and the monthly payout runs to creators."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginBottom: 16 }}>
        <AxStat label="top-ups · settled" value={formatCast(topupCast)} unit="CAST" sub={formatFiat(topupCast)} grad />
        <AxStat label="on-platform spend" value={formatCast(spendCast)} unit="CAST" sub={formatFiat(spendCast)} />
        <AxStat label="held payouts" value={formatCast(heldCast)} unit="CAST" sub={`${held.length} creators · ${formatFiat(heldCast)}`} />
        <AxStat label="reversed" value={String(reversedCount)} unit="txns" sub="refunds & chargebacks" />
      </div>

      {/* payout run hero */}
      <AxCard pad style={{ marginBottom: 16 }}>
        <div className="brand-hairline" style={{ margin: "-18px -18px 16px" }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div
              className="lower"
              style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}
            >
              next payout run
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
              <span className="brand-grad-text tnum stat-num" style={{ fontSize: 36, fontWeight: 800 }}>
                {formatCast(heldCast)}
              </span>
              <span className="lower" style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 700 }}>
                CAST · {formatFiat(heldCast)}
              </span>
            </div>
            <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>
              {held.length} creators held · clears on the next batch
            </div>
          </div>
          <AxPayoutRun heldCount={held.length} holdRunId={runs.find((r) => r.status === "scheduled")?.id} />
        </div>
      </AxCard>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(300px,1fr)", gap: 16, alignItems: "start" }}>
        {/* transactions ledger */}
        <AxCard title="recent transactions" sub="live ledger · all methods · refund any settled spend" pad={false}>
          {txns.length === 0 ? (
            <AxEmpty title="no transactions yet" hint="top-ups and on-platform spend land here as they settle." />
          ) : (
            <>
              <AxRow cols="120px 1fr 96px 92px 92px 86px" head first>
                <span>id</span>
                <span>user · type</span>
                <span>method</span>
                <span style={{ textAlign: "right" }}>gross</span>
                <span style={{ textAlign: "right" }}>cast</span>
                <span style={{ textAlign: "right" }}>status</span>
              </AxRow>
              {txns.map((t) => {
                const isSpend = t.kind !== "topup";
                const refundable = t.status === "settled" && isSpend;
                return (
                  <AxRow key={t.id} cols="120px 1fr 96px 92px 92px 86px">
                    <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>
                      {t.id}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        <span className="mono">{t.userId}</span>{" "}
                        <span className="lower" style={{ color: "var(--ink-3)", fontWeight: 500 }}>
                          · {t.kind}
                        </span>
                      </div>
                      {t.flag && (
                        <div className="lower" style={{ fontSize: 10.5, color: "#ef4444", fontWeight: 700 }}>
                          ⚠ {t.flag}
                        </div>
                      )}
                    </div>
                    <span className="lower" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                      {t.method}
                    </span>
                    <span className="mono" style={{ textAlign: "right", fontSize: 12, color: "var(--ink-3)" }}>
                      {t.grossFiat ?? "—"}
                    </span>
                    <span
                      className="tnum"
                      style={{ textAlign: "right", fontSize: 13, fontWeight: 700, color: t.cast > 0 ? "#10b981" : "var(--ink-1)" }}
                    >
                      {t.cast > 0 ? "+" : ""}
                      {formatCast(t.cast)}
                    </span>
                    <span style={{ textAlign: "right" }}>
                      {refundable ? (
                        <AxRefund txnId={t.id} />
                      ) : (
                        <AxPill tone={TXN_TONE[t.status] ?? "neutral"}>{t.status}</AxPill>
                      )}
                    </span>
                  </AxRow>
                );
              })}
            </>
          )}
        </AxCard>

        {/* payout history */}
        <AxCard title="payout runs" sub="monthly batches to creators" pad={false}>
          {runs.length === 0 ? (
            <AxEmpty title="no payout runs yet" hint="run a batch to pay out held creator earnings." />
          ) : (
            <>
              <AxRow cols="1fr 92px 84px" head first>
                <span>run · date</span>
                <span style={{ textAlign: "right" }}>cast</span>
                <span style={{ textAlign: "right" }}>status</span>
              </AxRow>
              {runs.map((r) => (
                <AxRow key={r.id} cols="1fr 92px 84px">
                  <div style={{ minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>
                      {r.id}
                    </div>
                    <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      {new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                      {r.creatorCount.toLocaleString("en-GB")} creators
                    </div>
                  </div>
                  <span className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>
                    {formatCast(r.cast)}
                  </span>
                  <span style={{ textAlign: "right" }}>
                    <AxPill tone={RUN_TONE[r.status] ?? "neutral"}>{r.status}</AxPill>
                  </span>
                </AxRow>
              ))}
            </>
          )}
          {held.length > 0 && (
            <div style={{ padding: "14px 18px", borderTop: "1px solid var(--hairline)" }}>
              <div
                className="lower"
                style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 8 }}
              >
                held payouts ({held.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {held.map((p) => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <span style={{ minWidth: 0, fontSize: 12.5 }}>
                      <span style={{ fontWeight: 600 }}>{p.creator?.name ?? p.creatorId}</span>{" "}
                      <span className="mono" style={{ color: "var(--ink-3)" }}>
                        {p.creator?.handle ?? ""}
                      </span>
                    </span>
                    <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700 }}>
                      {formatCast(p.cast)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AxCard>
      </div>
    </div>
  );
}
