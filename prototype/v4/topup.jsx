/* v3 Top-Up Flow — multi-step modal (select → method → summary → processing → verify → success) */
(() => {
const { useState, useEffect } = React;
const { Icon, CastGlyph, Modal, formatNum, RECEIPT_DEFAULTS, TOPUP_METHODS, TOPUP_GROUPS, MethodRow, PayBrand } = window;

const methodById = (id) => TOPUP_METHODS.find(m => m.id === id) || TOPUP_METHODS[0];
const methodLabel = (id) => (TOPUP_METHODS.find(m => m.id === id) || {}).label || "card";

const STEPS = ["select", "method", "summary", "processing", "verify", "success"];

const TopUpFlow = ({ open, onClose, wallet, suggested, onComplete, onViewReceipt }) => {
  const [step, setStep] = useState("select");
  const [amount, setAmount] = useState(suggested || 1000);
  const [custom, setCustom] = useState("");
  const [pm, setPM] = useState("visa-4291");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [receiptNo, setReceiptNo] = useState(null);

  const value = custom ? Math.max(100, parseInt(custom, 10) || 0) : amount;
  const fiat = `£${(value / 100).toFixed(2)}`;

  // Reset when re-opened
  useEffect(() => {
    if (open) {
      setStep("select");
      setAmount(suggested || 1000);
      setCustom("");
      setPM("visa-4291");
      setCode(["", "", "", "", "", ""]);
      setError("");
      setReceiptNo(null);
    }
  }, [open, suggested]);

  // Auto-advance processing — cards need 3-D Secure, express/bank settle straight through
  useEffect(() => {
    if (step !== "processing") return;
    const m = methodById(pm);
    const t = setTimeout(() => { if (m.needs3ds) setStep("verify"); else finalize(); }, 1200);
    return () => clearTimeout(t);
  }, [step]);

  if (!open) return null;

  const goBack = () => {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[Math.max(0, i - 1)]);
  };

  // Build receipt + commit (shared by express path and 3-D Secure path)
  const finalize = () => {
    const rno = "TXR-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setReceiptNo(rno);
    onComplete({
      amount: value, fiat, pm,
      receipt: {
        no: rno,
        date: new Date().toISOString(),
        kind: "topup",
        title: `top-up · ${formatNum(value)} CAST`,
        payment: methodLabel(pm).toLowerCase(),
        lines: [
          { label: `CAST pack · ${formatNum(value)}`, value: fiat },
          { label: "rate", value: "1:100 (£0.01 = 1 CAST)" },
          { label: "fee", value: "£0.00" },
        ],
        total: fiat,
      }
    });
    setStep("success");
  };

  const submitCode = () => {
    if (code.join("").length < 6) { setError("enter the 6-digit code"); return; }
    setError("");
    finalize();
  };

  const setDigit = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...code];
    next[i] = v.slice(-1);
    setCode(next);
    if (v && i < 5) document.getElementById("code-" + (i + 1))?.focus();
  };

  return (
    <Modal open={open} onClose={onClose} title={titleFor(step)}>
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
        {STEPS.map((s, i) => {
          const active = STEPS.indexOf(step) >= i;
          return <span key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: active ? "var(--brand-gradient)" : "var(--surface-3)" }} />;
        })}
      </div>

      {step === "select" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>
            CAST is a closed-loop platform credit. balances do not earn interest and never expire.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {wallet.packs.map(p => (
              <button key={p.amount} onClick={() => { setAmount(p.amount); setCustom(""); }} style={{
                padding: "16px 14px", textAlign: "left", borderRadius: 12, position: "relative",
                background: !custom && amount === p.amount ? "var(--ink-1)" : "var(--surface-2)",
                color:      !custom && amount === p.amount ? "var(--bg)"  : "var(--ink-1)",
                border: "1px solid var(--hairline)"
              }}>
                {p.badge && <span style={{ position: "absolute", top: 8, right: 10, fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 999, background: "var(--brand-gradient)", color: "white", letterSpacing: "0.06em", textTransform: "uppercase" }}>{p.badge}</span>}
                <div className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>{formatNum(p.amount)}</div>
                <div style={{ fontSize: 11, marginTop: 2, opacity: 0.7 }} className="lower">CAST · {p.fiat}</div>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1px solid var(--hairline)", borderRadius: 10, background: "var(--surface-2)" }}>
            <CastGlyph size={20} />
            <input type="number" value={custom} onChange={e => setCustom(e.target.value)} placeholder="custom amount (min 100)" style={{ flex: 1, border: "none", outline: "none", background: "none", fontSize: 14 }} className="mono" />
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>CAST</span>
          </div>
          <button onClick={() => setStep("method")} className="btn btn-grad" style={{ padding: "14px", fontSize: 15 }}>
            continue · {formatNum(value)} CAST
          </button>
        </div>
      )}

      {step === "method" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>charged in your local currency. one-time, never stored on-device.</p>
          {TOPUP_GROUPS.map(g => {
            const items = TOPUP_METHODS.filter(m => m.group === g.id);
            if (!items.length) return null;
            return (
              <div key={g.id}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-4)", margin: "2px 0 8px" }}>{g.label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.map(m => (
                    <MethodRow key={m.id} m={m} selected={pm === m.id}
                      onSelect={(id) => { if (m.add) return; setPM(id); }}
                      right={m.instant ? <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#10b981", padding: "3px 7px", borderRadius: 999, background: "rgba(16,185,129,0.12)" }}>instant</span> : (m.add ? <Icon name="chevR" size={16} stroke={2.2} style={{ color: "var(--ink-3)" }} /> : undefined)} />
                  ))}
                </div>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={goBack} className="btn btn-glass" style={{ flex: 1, padding: "14px" }}>back</button>
            <button onClick={() => setStep("summary")} className="btn btn-grad" style={{ flex: 2, padding: "14px", fontSize: 15 }}>review order</button>
          </div>
        </div>
      )}

      {step === "summary" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ padding: 16, borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--hairline)", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--ink-3)" }}>pack</span>
              <span className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>{formatNum(value)} CAST</span>
            </div>
            <div style={{ height: 1, background: "var(--hairline)" }} />
            <Line label="charge" value={fiat} />
            <Line label="rate" value="1:100 (£0.01 = 1 CAST)" mono />
            <Line label="fee" value="£0.00" mono />
            <div style={{ height: 1, background: "var(--hairline)" }} />
            <Line label="total" value={fiat} bold />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--ink-3)" }}>
            <span>paying with</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><PayBrand id={pm} size={22} /><span style={{ color: "var(--ink-1)", fontWeight: 700 }}>{methodLabel(pm)}</span></span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={goBack} className="btn btn-glass" style={{ flex: 1, padding: "14px" }}>back</button>
            <button onClick={() => setStep("processing")} className="btn btn-grad" style={{ flex: 2, padding: "14px", fontSize: 15 }}>pay {fiat}</button>
          </div>
          <span style={{ fontSize: 10, color: "var(--ink-4)", textAlign: "center" }} className="mono">strmit handles the fee · you see receipts in CAST and {fiat}</span>
        </div>
      )}

      {step === "processing" && (
        <div style={{ padding: "30px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative", width: 64, height: 64 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg, var(--bg-cyan), var(--bg-blue), var(--bg-violet), var(--bg-magenta), var(--bg-red), var(--bg-orange), var(--bg-cyan))", animation: "spinRing 1s linear infinite" }} />
            <div style={{ position: "absolute", inset: 6, borderRadius: "50%", background: "var(--surface)" }} />
            <CastGlyph size={28} style={{ position: "absolute", inset: 18 }} />
          </div>
          <style>{`@keyframes spinRing { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontWeight: 700 }}>{methodById(pm).instant ? "confirming with " + methodLabel(pm) + "…" : "contacting your bank…"}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="mono">authorising {fiat} via {methodLabel(pm).toLowerCase()}</div>
        </div>
      )}

      {step === "verify" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>your bank sent a code to <strong style={{ color: "var(--ink-1)" }}>··291</strong>. enter the 6 digits to authorise.</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {code.map((d, i) => (
              <input key={i} id={"code-" + i} value={d} onChange={e => setDigit(i, e.target.value)} inputMode="numeric" maxLength={1}
                style={{ width: 44, height: 56, textAlign: "center", fontSize: 24, fontWeight: 800, fontFamily: "var(--font-mono)", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--hairline)", color: "var(--ink-1)", outline: "none" }} />
            ))}
          </div>
          {error && <div style={{ fontSize: 12, color: "#ef4444", textAlign: "center" }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setCode(["1","2","3","4","5","6"]); setTimeout(submitCode, 50); }} className="btn btn-glass" style={{ flex: 1, padding: "14px" }}>auto-fill (demo)</button>
            <button onClick={submitCode} className="btn btn-grad" style={{ flex: 2, padding: "14px", fontSize: 15 }}>verify · pay {fiat}</button>
          </div>
          <button style={{ fontSize: 12, color: "var(--ink-3)", textDecoration: "underline", alignSelf: "center" }}>resend code</button>
        </div>
      )}

      {step === "success" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ padding: 24, borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--hairline)", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--brand-gradient)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <Icon name="check" size={28} stroke={3} />
            </div>
            <div style={{ marginTop: 14, fontSize: 16, fontWeight: 800 }} className="lower">topped up · added to wallet</div>
            <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-3)" }}>
              <span className="brand-grad-text tnum" style={{ fontWeight: 800, fontSize: 22 }}>+{formatNum(value)}</span> CAST
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: "var(--ink-3)" }} className="mono">receipt · {receiptNo}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { onViewReceipt(receiptNo); onClose(); }} className="btn btn-glass" style={{ flex: 1, padding: "14px" }}>view receipt</button>
            <button onClick={onClose} className="btn btn-grad" style={{ flex: 2, padding: "14px", fontSize: 15 }}>done</button>
          </div>
        </div>
      )}
    </Modal>
  );
};

const Line = ({ label, value, mono, bold }) => (
  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
    <span style={{ color: "var(--ink-3)" }}>{label}</span>
    <span className={mono ? "mono" : "tnum"} style={{ fontWeight: bold ? 800 : 600, color: "var(--ink-1)" }}>{value}</span>
  </div>
);

const titleFor = (s) => ({
  select: "top up CAST",
  method: "payment method",
  summary: "review order",
  processing: "processing…",
  verify: "bank verification",
  success: "topped up",
}[s] || "top up");

Object.assign(window, { TopUpFlow });
})();
