/**
 * /admin/finance — the money ledger. KPI cards, a payout-run hero, the transactions ledger
 * (with a refund button on any settled spend → AxRefund), and the payout-run history with
 * held payouts (AxPayoutRun clears every held payout to paid). Server component reads the DB;
 * the buttons are client components that re-read on success. Spec: prototype/v4/admin-finance.jsx.
 */
import { listTransactions, listPayoutRuns, heldPayouts } from "@/lib/queries/admin";
import { formatCast } from "@/lib/cast";
import { StatCard, StudioCard, StudioPageHead, Pill, gbpShort, type PillTone } from "@/components/studio-ui";
import { AxRefund } from "@/components/admin-x/AxRefund";
import { AxPayoutRun } from "@/components/admin-x/AxPayoutRun";

export const dynamic = "force-dynamic";

const TXN_TONE: Record<string, PillTone> = { settled: "ok", pending: "warn", reversed: "live" };
const RUN_TONE: Record<string, PillTone> = { paid: "ok", scheduled: "info", held: "warn" };

const GMV_SPARK = [2.78, 3.14, 3.42, 3.71, 4.08].map((v) => Math.round(v * 1e6));

export default async function AdminFinancePage() {
  const [txns, runs, held] = await Promise.all([listTransactions(), listPayoutRuns(), heldPayouts()]);

  const heldCast = held.reduce((s, p) => s + p.cast, 0);
  const topupCast = txns
    .filter((t) => t.kind === "topup" && t.status === "settled")
    .reduce((s, t) => s + t.cast, 0);
  const spendCast = txns
    .filter((t) => t.kind !== "topup" && t.status === "settled")
    .reduce((s, t) => s + Math.abs(t.cast), 0);
  const reversedCount = txns.filter((t) => t.status === "reversed").length;
  const revenueCast = Math.round((topupCast + spendCast) * 0.12);

  const TXN_COLS = "120px 1fr 110px 100px 100px 90px";
  const RUN_COLS = "1fr 100px 90px";

  return (
    <div className="page-pad" style={{ maxWidth: 1450, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="operations"
        title="finance"
        sub="the money ledger — top-ups in, on-platform spend out, refunds, chargebacks and the monthly payout runs to creators."
      />

      <div className="kpi-grid">
        <StatCard
          label="top-ups · settled"
          icon="cast"
          value={gbpShort(topupCast)}
          unit="volume"
          delta="+9.9%"
          deltaUp
          fiat={`${formatCast(topupCast)} CAST`}
          spark={GMV_SPARK}
          sparkColor="#8b5cf6"
        />
        <StatCard
          label="net revenue"
          icon="trend"
          value={gbpShort(revenueCast)}
          unit="take"
          delta="+9.9%"
          deltaUp
          fiat="after processor fees"
          spark={GMV_SPARK.map((v) => Math.round(v * 0.12))}
          sparkColor="#10b981"
        />
        <StatCard
          label="on-platform spend"
          icon="wallet"
          value={gbpShort(spendCast)}
          unit="settled"
          fiat={`${formatCast(spendCast)} CAST`}
          spark={[1.1, 1.0, 0.95, 0.9, 0.88, 0.85, 0.82, 0.8]}
          sparkColor="#f59e0b"
        />
        <StatCard
          label="reversed"
          icon="flame"
          value={String(reversedCount)}
          unit="txns"
          delta="refunds + cb"
          deltaUp={false}
          fiat="disputes & chargebacks"
          spark={[0.18, 0.16, 0.15, 0.14, 0.13, 0.12, 0.11, 0.11]}
          sparkColor="#ef4444"
        />
      </div>

      {/* payout run hero */}
      <div className="card" style={{ background: "var(--surface)", overflow: "hidden", marginTop: 16 }}>
        <div className="brand-hairline" />
        <div
          style={{
            padding: 20,
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              className="lower"
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--ink-3)",
              }}
            >
              next payout run
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
              <span className="brand-grad-text tnum stat-num" style={{ fontSize: 36 }}>
                {formatCast(heldCast)}
              </span>
              <span className="lower" style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 700 }}>
                CAST · {gbpShort(heldCast)}
              </span>
            </div>
            <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>
              {held.length} creators held · clears on the next batch
            </div>
          </div>
          <AxPayoutRun heldCount={held.length} holdRunId={runs.find((r) => r.status === "scheduled")?.id} />
        </div>
      </div>

      <div className="st-split" style={{ marginTop: 16 }}>
        {/* transactions ledger */}
        <StudioCard title="recent transactions" sub="live ledger · refund any settled spend" pad={false}>
          {txns.length === 0 ? (
            <div className="lower" style={{ padding: "28px 18px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
              no transactions yet.
            </div>
          ) : (
            <>
              <div className="st-row head" style={{ gridTemplateColumns: TXN_COLS }}>
                <span>id</span>
                <span>user · type</span>
                <span>method</span>
                <span style={{ textAlign: "right" }}>gross</span>
                <span style={{ textAlign: "right" }}>CAST</span>
                <span style={{ textAlign: "right" }}>status</span>
              </div>
              {txns.map((t) => {
                const refundable = t.status === "settled" && t.kind !== "topup";
                return (
                  <div key={t.id} className="st-row" style={{ gridTemplateColumns: TXN_COLS }}>
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
                    <span className="lower" style={{ fontSize: 12, color: "var(--ink-2)" }}>
                      {t.method}
                    </span>
                    <span className="mono" style={{ textAlign: "right", fontSize: 12.5, color: "var(--ink-2)" }}>
                      {t.grossFiat ?? "—"}
                    </span>
                    <span
                      className="tnum"
                      style={{
                        textAlign: "right",
                        fontSize: 13,
                        fontWeight: 700,
                        color: t.cast > 0 ? "#10b981" : "var(--ink-1)",
                      }}
                    >
                      {t.cast > 0 ? "+" : ""}
                      {formatCast(t.cast)}
                    </span>
                    <span style={{ textAlign: "right" }}>
                      {refundable ? (
                        <AxRefund txnId={t.id} />
                      ) : (
                        <Pill tone={TXN_TONE[t.status] ?? "neutral"}>{t.status}</Pill>
                      )}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </StudioCard>

        {/* payout history */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="payout runs" sub="monthly batches to creators" pad={false}>
            {runs.length === 0 ? (
              <div className="lower" style={{ padding: "28px 18px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
                no payout runs yet.
              </div>
            ) : (
              <>
                <div className="st-row head" style={{ gridTemplateColumns: RUN_COLS }}>
                  <span>run · date</span>
                  <span style={{ textAlign: "right" }}>CAST</span>
                  <span style={{ textAlign: "right" }}>status</span>
                </div>
                {runs.map((r) => (
                  <div key={r.id} className="st-row" style={{ gridTemplateColumns: RUN_COLS }}>
                    <div style={{ minWidth: 0 }}>
                      <div className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>
                        {r.id}
                      </div>
                      <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                        {new Date(r.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {r.creatorCount.toLocaleString("en-GB")} creators
                      </div>
                    </div>
                    <span className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>
                      {formatCast(r.cast)}
                    </span>
                    <span style={{ textAlign: "right" }}>
                      <Pill tone={RUN_TONE[r.status] ?? "neutral"}>{r.status}</Pill>
                    </span>
                  </div>
                ))}
              </>
            )}
            {held.length > 0 && (
              <div style={{ padding: "14px 18px", borderTop: "1px solid var(--hairline)" }}>
                <div
                  className="lower"
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--ink-4)",
                    marginBottom: 8,
                  }}
                >
                  held payouts ({held.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {held.map((p) => (
                    <div
                      key={p.id}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
                    >
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
          </StudioCard>
        </div>
      </div>
    </div>
  );
}
