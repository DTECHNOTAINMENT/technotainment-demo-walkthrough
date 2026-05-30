/* Admin — Finance: transactions, refunds, chargebacks, payout runs */
(() => {
const { useState } = React;
const { Icon, formatNum, ADMIN, gbp, gbpShort, castToGBP, PayBrand,
  StatCard, StudioCard, StudioPageHead, Pill, Seg, Bars, AreaSpark } = window;

const TXN_TONE = { settled: "ok", pending: "warn", reversed: "live" };

const AdminFinance = ({ toast }) => {
  const a = ADMIN, p = a.PLATFORM;
  const [tab, setTab] = useState("transactions");

  return (
    <div className="page-pad" style={{ maxWidth: 1450, margin: "0 auto" }}>
      <StudioPageHead eyebrow="operations" title="finance"
        sub="the money ledger — top-ups in, payouts out, refunds, chargebacks and reconciliation."
        actions={<>
          <Seg items={[{ id: "transactions", label: "transactions" }, { id: "payouts", label: "payout runs" }]} value={tab} onChange={setTab} />
          <button onClick={() => toast("reconciliation export · CSV + Stripe Sigma")} className="btn btn-glass" style={{ padding: "10px 14px" }}><Icon name="download" size={14} stroke={2.4} /></button>
        </>} />

      <div className="kpi-grid">
        <StatCard label="processed · mo" icon="cast" value={gbpShort(castToGBP(p.gmvMonth))} unit="volume" delta="+9.9%" deltaUp fiat={`${formatNum(p.gmvMonth)} CAST`} spark={a.GMV.slice(-8)} sparkColor="#8b5cf6" />
        <StatCard label="net revenue" icon="trend" value={gbpShort(castToGBP(p.revenueMonth))} unit="take" delta="+9.9%" deltaUp fiat="after processor fees" spark={a.REVENUE.slice(-8)} sparkColor="#10b981" />
        <StatCard label="refunds" icon="arrowR" value="0.8%" unit="of volume" delta="−0.1%" deltaUp fiat="£3.9k this month" spark={[1.1,1.0,0.95,0.9,0.88,0.85,0.82,0.8]} sparkColor="#f59e0b" />
        <StatCard label="chargebacks" icon="flag" value="0.11%" unit="dispute rate" delta="below 0.65%" deltaUp fiat="12 open" spark={[0.18,0.16,0.15,0.14,0.13,0.12,0.11,0.11]} sparkColor="#ef4444" />
      </div>

      {tab === "transactions" && (
        <>
          <StudioCard title="processed volume · 12 months" sub="all top-ups & on-platform spend" style={{ marginTop: 16 }}>
            <Bars data={a.GMV} labels={a.months} h={170} color="var(--brand-gradient)" fmt={(v) => formatNum(v) + " CAST"} />
          </StudioCard>

          <StudioCard title="recent transactions" sub="live ledger · all methods" pad={false} style={{ marginTop: 16 }}>
            <div className="st-row head" style={{ gridTemplateColumns: "130px 1fr 110px 110px 100px 90px" }}>
              <span>id</span><span>user · type</span><span>method</span><span style={{ textAlign: "right" }}>gross</span><span style={{ textAlign: "right" }}>CAST</span><span style={{ textAlign: "right" }}>status</span>
            </div>
            {a.TXNS.map(t => (
              <div key={t.id} className="st-row" style={{ gridTemplateColumns: "130px 1fr 110px 110px 100px 90px" }}>
                <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{t.id}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.user} <span style={{ color: "var(--ink-3)", fontWeight: 500 }} className="lower">· {t.kind}</span></div>
                  {t.flag && <div style={{ fontSize: 10.5, color: "#ef4444", fontWeight: 700 }} className="lower">⚠ {t.flag}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}><PayBrand id={t.method === "balance" ? "default" : t.method} size={22} /></div>
                <div className="mono" style={{ textAlign: "right", fontSize: 12.5, color: "var(--ink-2)" }}>{t.gross}</div>
                <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700, color: t.cast > 0 ? "#10b981" : "var(--ink-1)" }}>{t.cast > 0 ? "+" : ""}{formatNum(t.cast)}</div>
                <div style={{ textAlign: "right" }}><Pill tone={TXN_TONE[t.status]}>{t.status}</Pill></div>
              </div>
            ))}
            <div style={{ padding: 16, textAlign: "center", borderTop: "1px solid var(--hairline)" }}>
              <button onClick={() => toast("loading ledger…")} className="btn btn-glass" style={{ padding: "8px 14px", fontSize: 12 }}>open full ledger</button>
            </div>
          </StudioCard>
        </>
      )}

      {tab === "payouts" && (
        <>
          <div className="card" style={{ background: "var(--surface)", overflow: "hidden", marginTop: 16 }}>
            <div className="brand-hairline" />
            <div style={{ padding: 20, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>next payout run</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
                  <span className="brand-grad-text tnum stat-num" style={{ fontSize: 36 }}>{formatNum(p.pendingPayouts)}</span>
                  <span style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 700 }} className="lower">CAST · {gbp(castToGBP(p.pendingPayouts))}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }} className="mono">8,420 creators · scheduled 1 jun 2026</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => toast("payout run held")} className="btn btn-glass" style={{ padding: "12px 16px" }}>hold run</button>
                <button onClick={() => toast("approving payout run · 8,420 creators", { icon: true })} className="btn btn-grad" style={{ padding: "12px 18px" }}><Icon name="check" size={15} stroke={2.4} /> approve run</button>
              </div>
            </div>
          </div>

          <StudioCard title="payout history" sub="monthly batches to creators" pad={false} style={{ marginTop: 16 }}>
            <div className="st-row head" style={{ gridTemplateColumns: "130px 130px 1fr 130px 100px" }}>
              <span>run</span><span>date</span><span>creators</span><span style={{ textAlign: "right" }}>CAST</span><span style={{ textAlign: "right" }}>status</span>
            </div>
            {a.PAYOUT_RUNS.map(r => (
              <div key={r.id} className="st-row" style={{ gridTemplateColumns: "130px 130px 1fr 130px 100px" }}>
                <span className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{r.id}</span>
                <span style={{ fontSize: 12.5 }} className="lower">{r.date}</span>
                <span className="tnum" style={{ fontSize: 12.5 }}>{formatNum(r.creators)} creators · {r.method}</span>
                <span className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>{formatNum(r.cast)}</span>
                <div style={{ textAlign: "right" }}><Pill tone={r.status === "paid" ? "ok" : "warn"}>{r.status}</Pill></div>
              </div>
            ))}
          </StudioCard>

          <StudioCard title="payouts · 12 months" sub="paid to creators" style={{ marginTop: 16 }}>
            <AreaSpark data={a.PAYOUTS} h={150} stroke="#10b981" fill="rgba(16,185,129,0.18)" />
          </StudioCard>
        </>
      )}
    </div>
  );
};

Object.assign(window, { AdminFinance });
})();
