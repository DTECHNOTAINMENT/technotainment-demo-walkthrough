/* Creator Studio — Earnings & Payouts (creator wallet) */
(() => {
const { useState } = React;
const { Icon, CastGlyph, Modal, formatNum, STUDIO, gbp, gbpShort, castToGBP,
  StudioCard, StudioPageHead, Pill, Bars, SegBar, PAYOUT_METHODS, PayBrand, MethodRow } = window;

/* ---- Manage payout methods ---- */
const PayoutMethodsModal = ({ open, onClose, selected, onSelect, toast }) => (
  <Modal open={open} onClose={onClose} title="payout methods" width={460}>
    <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--ink-3)" }}>choose where your CAST cashes out to. you can keep several and switch any time.</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {PAYOUT_METHODS.map(m => (
        <MethodRow key={m.id} m={m} selected={selected === m.id} onSelect={onSelect}
          right={<span style={{ fontSize: 10, fontWeight: 700, color: m.fee === "free" ? "#10b981" : "var(--ink-3)" }} className="lower">{m.fee} · {m.speed}</span>} />
      ))}
    </div>
    <button onClick={() => { onClose(); toast("payout method updated"); }} className="btn btn-grad" style={{ width: "100%", padding: 13, marginTop: 16 }}>save default</button>
  </Modal>
);

/* ---- Withdraw flow ---- */
const WithdrawModal = ({ open, onClose, available, method, toast }) => {
  const [amt, setAmt] = useState(available);
  const fee = Math.round(amt * 0.012); // payout processing 1.2%
  const net = amt - fee;
  return (
    <Modal open={open} onClose={onClose} title="withdraw CAST" width={460}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ textAlign: "center", padding: "6px 0" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>available</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "center", marginTop: 8 }}>
            <CastGlyph size={22} />
            <span className="tnum brand-grad-text stat-num" style={{ fontSize: 40 }}>{formatNum(available)}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="mono">{gbp(castToGBP(available))}</div>
        </div>

        <div>
          <label className="st-label">amount to withdraw</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input className="st-input" type="number" value={amt} max={available} onChange={(e) => setAmt(Math.min(available, Math.max(0, +e.target.value)))} style={{ flex: 1 }} />
            <button onClick={() => setAmt(available)} className="btn btn-glass" style={{ padding: "11px 14px", fontSize: 12 }}>max</button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 14, background: "var(--surface-2)", borderRadius: 12, fontSize: 12.5 }}>
          {[["withdrawing", `${formatNum(amt)} CAST`], ["processing fee · 1.2%", `−${formatNum(fee)} CAST`], ["fx rate", "100 CAST = £1.00"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-3)" }} className="lower">{k}</span><span className="tnum" style={{ fontWeight: 600 }}>{v}</span></div>
          ))}
          <div style={{ height: 1, background: "var(--hairline)", margin: "4px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}><span className="lower">you receive</span><span className="brand-grad-text tnum" style={{ fontSize: 16 }}>{gbp(castToGBP(net))}</span></div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", border: "1px solid var(--hairline)", borderRadius: 12 }}>
          <div style={{ width: 40, height: 28, borderRadius: 6, background: method.brand }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{method.label}</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-3)" }} className="mono">{method.sub} · arrives in 1–2 days</div>
          </div>
          <Pill tone="ok">default</Pill>
        </div>

        <button onClick={() => { onClose(); toast(`${gbp(castToGBP(net))} on its way to ${method.label}`, { icon: true }); }} className="btn btn-grad" style={{ padding: "13px" }} disabled={amt <= 0}>
          withdraw {gbp(castToGBP(net))}
        </button>
      </div>
    </Modal>
  );
};

const EarningsScreen = ({ toast }) => {
  const s = STUDIO;
  const [wd, setWd] = useState(false);
  const [pmOpen, setPmOpen] = useState(false);
  const [payMethod, setPayMethod] = useState("bank");
  const netMonth = Math.round(s.GROSS_MONTH * (1 - s.PLATFORM_RATE));
  const fee = s.GROSS_MONTH - netMonth;

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="earnings"
        sub="your CAST balance, payouts to your bank, and a plain-language breakdown of every fee."
        actions={<button onClick={() => toast("may 2026 earnings statement · downloading")} className="btn btn-glass" style={{ padding: "12px 16px" }}><Icon name="download" size={14} stroke={2.4} /> statement</button>} />

      {/* Balance hero */}
      <div className="card" style={{ overflow: "hidden", background: "var(--surface)" }}>
        <div className="brand-hairline" />
        <div style={{ padding: "30px 28px", display: "grid", gap: 26, gridTemplateColumns: "1fr", alignItems: "end" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24, alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}>available to withdraw</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 12 }}>
                <CastGlyph size={34} />
                <span className="tnum brand-grad-text stat-num" style={{ fontSize: "clamp(52px,8vw,86px)" }}>{formatNum(s.PAYOUT.availableCast)}</span>
                <span style={{ fontSize: 17, color: "var(--ink-3)", fontWeight: 700 }}>CAST</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: "var(--ink-3)" }} className="mono">
                = {gbp(castToGBP(s.PAYOUT.availableCast))} · {formatNum(s.PAYOUT.pendingCast)} CAST clearing (7-day hold)
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => setWd(true)} className="btn btn-grad" style={{ padding: "14px 22px", fontSize: 14 }}><Icon name="wallet" size={15} stroke={2.2} /> withdraw</button>
              <button onClick={() => toast("payout settings · schedule & methods")} className="btn btn-grad-stroke" style={{ padding: "14px 18px", fontSize: 14 }}><Icon name="settings" size={15} stroke={2.2} /> auto-payout</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
            {[
              { l: "this month · gross", v: formatNum(s.GROSS_MONTH), sub: gbp(castToGBP(s.GROSS_MONTH)) },
              { l: "this month · net", v: formatNum(netMonth), sub: gbp(castToGBP(netMonth)), grad: true },
              { l: "next auto-payout", v: s.PAYOUT.nextDate, sub: "every 1st" },
              { l: "lifetime earned", v: formatNum(s.PAYOUT.lifetimeCast), sub: gbp(castToGBP(s.PAYOUT.lifetimeCast)) },
            ].map((k, i) => (
              <div key={i} style={{ padding: 16, background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--hairline)" }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>{k.l}</div>
                <div className={`tnum stat-num ${k.grad ? "brand-grad-text" : ""}`} style={{ fontSize: 24, marginTop: 6 }}>{k.v}</div>
                <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 2 }} className="mono">{k.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="st-split" style={{ marginTop: 16 }}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="payout history" sub="bank transfers to your linked account" pad={false}>
            <div className="st-row head" style={{ gridTemplateColumns: "1fr 120px 120px 90px" }}>
              <span>reference · date</span><span style={{ textAlign: "right" }}>CAST</span><span style={{ textAlign: "right" }}>GBP</span><span style={{ textAlign: "right" }}>status</span>
            </div>
            {s.PAYOUT_HISTORY.map(p => (
              <div key={p.id} className="st-row" style={{ gridTemplateColumns: "1fr 120px 120px 90px" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }} className="mono">{p.id}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">{p.date} · {p.method}</div>
                </div>
                <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>{formatNum(p.cast)}</div>
                <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 800 }}>{gbp(castToGBP(p.cast))}</div>
                <div style={{ textAlign: "right" }}><Pill tone="ok">{p.status}</Pill></div>
              </div>
            ))}
            <div style={{ padding: 16, textAlign: "center", borderTop: "1px solid var(--hairline)" }}>
              <button onClick={() => toast("loading older payouts…")} className="btn btn-glass" style={{ padding: "8px 14px", fontSize: 12 }}>show all payouts</button>
            </div>
          </StudioCard>

          <StudioCard title="net payout · last 12 months" sub="after platform & processing fees">
            <Bars data={s.EARN_SERIES.map(v => Math.round(v * 0.868))} labels={s.MONTHS} h={170} color="var(--brand-gradient)" fmt={(v) => formatNum(v) + " CAST"} />
          </StudioCard>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Fee breakdown */}
          <StudioCard title="fees · this month" sub="every deduction, itemized">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["gross earnings", formatNum(s.GROSS_MONTH), "var(--ink-1)"],
                ["technotainment fee · 12%", "−" + formatNum(fee), "#ef4444"],
                ["payment processing", "included", "var(--ink-3)"],
                ["chargebacks / refunds", "0", "var(--ink-3)"],
              ].map(([k, v, c]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--ink-3)" }} className="lower">{k}</span>
                  <span className="tnum" style={{ fontWeight: 700, color: c }}>{v}</span>
                </div>
              ))}
              <div style={{ height: 1, background: "var(--hairline)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 800 }} className="lower">net to you</span>
                <span className="brand-grad-text tnum" style={{ fontSize: 18, fontWeight: 800 }}>{formatNum(netMonth)} CAST</span>
              </div>
              <div className="st-hint">technotainment's flat 12% covers hosting, payments and chargebacks. no per-transaction surcharges, no payout minimum.</div>
            </div>
          </StudioCard>

          {/* Payout method */}
          <StudioCard
            title="payout method"
            action={<button onClick={() => setPmOpen(true)} className="btn btn-glass" style={{ padding: "7px 11px", fontSize: 12 }}><Icon name="settings" size={13} stroke={2.2} /> manage</button>}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid var(--hairline)", borderRadius: 12 }}>
              <div style={{ width: 46, height: 30, borderRadius: 6, background: s.PAYOUT.method.brand }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{s.PAYOUT.method.label}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{s.PAYOUT.method.sub}</div>
              </div>
              <Pill tone="ok">default</Pill>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 12.5 }}>
              <span style={{ color: "var(--ink-3)" }} className="lower">tax form · UK self-assessment</span>
              <button onClick={() => toast("tax documents · 2025/26")} style={{ color: "var(--ink-2)", fontWeight: 700, textDecoration: "underline" }}>view</button>
            </div>
          </StudioCard>

          {/* Statements */}
          <StudioCard title="statements" sub="monthly · line-itemized PDF">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["may 2026 · current", "april 2026", "march 2026", "february 2026"].map(m => (
                <button key={m} onClick={() => toast(`${m} · downloading`)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: "1px solid var(--hairline)", borderRadius: 10 }}>
                  <span style={{ fontSize: 13 }}>{m}</span>
                  <Icon name="download" size={14} stroke={2} style={{ color: "var(--ink-3)" }} />
                </button>
              ))}
            </div>
          </StudioCard>
        </div>
      </div>

      <WithdrawModal open={wd} onClose={() => setWd(false)} available={s.PAYOUT.availableCast} method={s.PAYOUT.method} toast={toast} />
      <PayoutMethodsModal open={pmOpen} onClose={() => setPmOpen(false)} selected={payMethod} onSelect={setPayMethod} toast={toast} />
    </div>
  );
};

Object.assign(window, { EarningsScreen });
})();
