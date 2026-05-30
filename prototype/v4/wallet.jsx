/* v2 CAST Wallet — premium fintech feel, brand-gradient numeral, Spotify-style history */
(() => {
const { useState } = React;
const { Icon, Avatar, CastGlyph, Modal, formatNum, HISTORY, RENEWALS, TOPUP_METHODS, TOPUP_GROUPS, PayBrand, MethodRow } = window;

const SAVED_METHODS = [
  { id: "visa-4291", label: "Visa ··4291",       sub: "expires 09/28 · default", isDefault: true },
  { id: "mc-8830",   label: "Mastercard ··8830", sub: "expires 04/27" },
  { id: "apple-pay", label: "Apple Pay",          sub: "linked to this device" },
  { id: "paypal",    label: "PayPal",             sub: "alex.m@example.fm" },
];

const AddMethodModal = ({ open, onClose, toast }) => {
  const [pick, setPick] = React.useState(null);
  React.useEffect(() => { if (open) setPick(null); }, [open]);
  return (
    <Modal open={open} onClose={onClose} title="add a payment method" width={460}>
      <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--ink-3)" }}>link a wallet, card or bank account. used for top-ups and renewals.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 360, overflowY: "auto" }}>
        {TOPUP_GROUPS.map(g => {
          const items = TOPUP_METHODS.filter(m => m.group === g.id && !m.add);
          if (!items.length) return null;
          return (
            <div key={g.id}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-4)", margin: "2px 0 8px" }}>{g.label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map(m => <MethodRow key={m.id} m={m} selected={pick === m.id} onSelect={setPick} />)}
              </div>
            </div>
          );
        })}
      </div>
      <button disabled={!pick} onClick={() => { onClose(); toast("method added · verify to set as default", { icon: true }); }} className="btn btn-grad" style={{ width: "100%", padding: 13, marginTop: 16, opacity: pick ? 1 : 0.5 }}>add method</button>
    </Modal>
  );
};

const kindLabel = { tip: "tip", subscription: "subscription", drop: "drop", topup: "top-up", ppv: "ppv rental", competition: "competition entry" };

const WalletScreen = ({ wallet, onTopUp, toast, receipts, onOpenReceipt }) => {
  const [filter, setFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const filtered = HISTORY.map(d => ({ ...d, rows: filter === "all" ? d.rows : d.rows.filter(r => r.kind === filter) })).filter(d => d.rows.length);

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: "16px 16px 96px" }}>
      {/* Balance hero */}
      <div className="card" style={{ padding: 0, overflow: "hidden", background: "var(--surface)" }}>
        <div className="brand-hairline" />
        <div style={{ padding: "32px 28px 28px", display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}>your CAST balance</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 12 }}>
                <CastGlyph size={36} />
                <span className="tnum brand-grad-text stat-num" style={{ fontSize: "clamp(56px, 9vw, 96px)" }}>{formatNum(wallet.balance).replace("K","")}</span>
                <span style={{ fontSize: 18, color: "var(--ink-3)", fontWeight: 700 }}>CAST</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-3)" }} className="mono">
                {formatNum(wallet.pending)} CAST committed to upcoming renewals this week
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={(e) => onTopUp(e.currentTarget)} className="btn btn-grad" style={{ padding: "14px 22px", fontSize: 14 }}>
                <Icon name="plus" size={14} stroke={2.6} /> top up CAST
              </button>
              <button onClick={() => toast("send CAST as a gift — coming soon")} className="btn btn-grad-stroke" style={{ padding: "14px 18px", fontSize: 14 }}>
                <Icon name="gift" size={14} stroke={2.4} /> gift
              </button>
            </div>
          </div>

          {/* Quick top-up packs */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 10 }}>quick top-up</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
              {wallet.packs.map(p => (
                <button key={p.amount} onClick={(e) => onTopUp(e.currentTarget, p.amount)} style={{ padding: "14px 12px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--hairline)", textAlign: "left", position: "relative", transition: "all 0.15s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.borderColor = "var(--hairline-2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.borderColor = "var(--hairline)"; }}>
                  {p.badge && <span style={{ position: "absolute", top: 10, right: 10, fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: "var(--brand-gradient)", color: "white", letterSpacing: "0.06em", textTransform: "uppercase" }}>{p.badge}</span>}
                  <div className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>{formatNum(p.amount)}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }} className="lower">CAST · {p.fiat}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Two-up: history + sidebar */}
      <div className="wallet-grid" style={{ display: "grid", gap: 16, marginTop: 16 }}>
        <style>{`
          .wallet-grid { grid-template-columns: 1fr; }
          @media (min-width: 1024px) { .wallet-grid { grid-template-columns: 1.4fr 1fr; } }
        `}</style>

        {/* Spend history */}
        <div className="card" style={{ background: "var(--surface)" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }} className="lower">spend history</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>every line item is inspectable. ledger-first.</div>
            </div>
            <button onClick={() => toast("may 2026 statement · download started")} className="btn btn-glass" style={{ padding: "8px 12px", fontSize: 12 }}>
              <Icon name="download" size={14} stroke={2.4} /> statement
            </button>
          </div>
          <div style={{ display: "flex", gap: 6, padding: "12px 18px", borderBottom: "1px solid var(--hairline)", overflowX: "auto", scrollbarWidth: "none" }}>
            {["all","tip","subscription","drop","ppv","competition","topup"].map(f => (
              <button key={f} className={`chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)} style={{ padding: "6px 12px", fontSize: 12 }}>
                <span className="lower">{f === "all" ? "all" : kindLabel[f]}</span>
              </button>
            ))}
          </div>
          {filtered.map((day, di) => (
            <div key={di}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 18px 8px", borderTop: di ? "1px solid var(--hairline)" : "none" }}>
                <span style={{ fontSize: 13, fontWeight: 800 }} className="lower">{day.day}</span>
                <span className="mono tnum" style={{ fontSize: 12, color: day.rows.reduce((a, r) => a + r.amount, 0) > 0 ? "#10b981" : "var(--ink-3)", fontWeight: 700 }}>
                  {day.rows.reduce((a, r) => a + r.amount, 0) > 0 ? "+" : ""}{formatNum(day.rows.reduce((a, r) => a + r.amount, 0))} CAST
                </span>
              </div>
              {day.rows.map((r, ri) => (
                <button key={ri} onClick={() => {
                  // Find a matching receipt by title+amount
                  const match = receipts?.find(rx => rx.title?.includes(r.title.split("·")[0].trim()) && rx.amount === r.amount);
                  if (match) onOpenReceipt(match.no);
                  else toast(`receipt · ${r.title} · ${r.amount} CAST`);
                }} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 18px", transition: "background 0.15s ease", width: "100%", textAlign: "left", borderTop: "1px solid transparent" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", flex: "0 0 40px" }}>
                    {r.creator
                      ? <Avatar creator={r.creator} size={40} />
                      : <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--brand-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><Icon name="plus" size={20} stroke={2.4} /></div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{r.time} · {kindLabel[r.kind]}{r.payment ? ` · ${r.payment}` : ""}{r.creator ? ` · ${r.creator.handle}` : ""}</div>
                  </div>
                  <div className="tnum" style={{ fontWeight: 800, fontSize: 14, color: r.amount > 0 ? "#10b981" : "var(--ink-1)" }}>
                    {r.amount > 0 ? "+" : ""}{formatNum(r.amount)} CAST
                  </div>
                  <Icon name="chevR" size={14} stroke={2} style={{ color: "var(--ink-4)" }} />
                </button>
              ))}
            </div>
          ))}
          <div style={{ padding: 18, textAlign: "center", borderTop: "1px solid var(--hairline)" }}>
            <button onClick={() => toast("loading 24 older days …")} className="btn btn-glass" style={{ padding: "8px 14px", fontSize: 12 }}>show 24 older days</button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Upcoming renewals */}
          <div className="card" style={{ background: "var(--surface)" }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ fontWeight: 800, fontSize: 16 }} className="lower">upcoming renewals</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>scheduled CAST commitments</div>
            </div>
            {RENEWALS.map((u, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 18px", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
                <Avatar creator={u.creator} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{u.creator.handle}</div>
                  <div style={{ fontSize: 10, color: "var(--ink-3)" }} className="mono">{u.tier} · {u.when}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <span className="tnum" style={{ fontWeight: 800, fontSize: 13 }}>{formatNum(u.amount)} CAST</span>
                  <button onClick={() => toast(`cancel · ${u.creator.handle}`)} style={{ fontSize: 10, color: "var(--ink-3)", textDecoration: "underline", marginTop: 2 }}>cancel</button>
                </div>
              </div>
            ))}
          </div>

          {/* Payment methods */}
          <div className="card" style={{ padding: 18, background: "var(--surface)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }} className="lower">payment methods</div>
              <span style={{ fontSize: 11, color: "var(--ink-3)" }} className="tnum">{SAVED_METHODS.length} saved</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SAVED_METHODS.map((pm, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid var(--hairline)", borderRadius: 12 }}>
                  <PayBrand id={pm.id} size={30} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>{pm.label}{pm.isDefault && <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#10b981", padding: "2px 6px", borderRadius: 999, background: "rgba(16,185,129,0.12)" }}>default</span>}</div>
                    <div style={{ fontSize: 10, color: "var(--ink-3)" }} className="mono">{pm.sub}</div>
                  </div>
                  <button onClick={() => toast(`${pm.label} · set default / remove`)} style={{ fontSize: 11, color: "var(--ink-3)" }}><Icon name="more" size={16} /></button>
                </div>
              ))}
              <button onClick={() => setAddOpen(true)} className="btn btn-glass" style={{ padding: "10px 14px", fontSize: 13 }}>
                <Icon name="plus" size={14} stroke={2.4} /> add method
              </button>
            </div>
          </div>

          {/* Statements */}
          <div className="card" style={{ padding: 18, background: "var(--surface)" }}>
            <div style={{ fontWeight: 800, fontSize: 16 }} className="lower">statements</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2, marginBottom: 12 }}>plain-language, line-itemized PDFs</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["may 2026 · current","april 2026","march 2026","february 2026","january 2026"].map((s, i) => (
                <button key={i} onClick={() => toast(`${s} · downloading`)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: "1px solid var(--hairline)", borderRadius: 10 }}>
                  <span style={{ fontSize: 13 }}>{s}</span>
                  <Icon name="download" size={14} stroke={2} style={{ color: "var(--ink-3)" }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AddMethodModal open={addOpen} onClose={() => setAddOpen(false)} toast={toast} />
    </div>
  );
};

Object.assign(window, { WalletScreen });
})();
