/* v3 receipt page — reachable from wallet ledger */
(() => {
const { Icon, CastGlyph, Avatar, formatNum } = window;

const ReceiptScreen = ({ receipt, onBack, toast }) => {
  if (!receipt) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink-3)" }}>receipt not found</div>
        <button onClick={onBack} className="btn btn-glass" style={{ marginTop: 16, padding: "10px 16px" }}>back to wallet</button>
      </div>
    );
  }

  const d = new Date(receipt.date || Date.now());
  const dateStr = d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  const timeStr = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 16px 96px" }}>
      <button onClick={onBack} className="btn btn-glass" style={{ padding: "8px 14px", fontSize: 12, marginBottom: 14 }}>
        <Icon name="chevL" size={14} stroke={2.4} /> back to wallet
      </button>

      <div className="card" style={{ background: "var(--surface)", padding: 0, overflow: "hidden" }}>
        <div className="brand-hairline" />
        <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>receipt</div>
              <div className="mono" style={{ fontSize: 13, marginTop: 4, color: "var(--ink-2)" }}>{receipt.no}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{dateStr}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{timeStr}</div>
            </div>
          </div>

          {/* Big amount */}
          <div style={{ padding: "20px 0", borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }} className="lower">{receipt.title}</div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 10 }}>
              <CastGlyph size={26} />
              <span className={`tnum brand-grad-text stat-num`} style={{ fontSize: 56 }}>{receipt.kind === "topup" ? "+" : "−"}{formatNum(Math.abs(receipt.amount || 0) || receipt.cast || (receipt.lines?.[0]?.cast) || 0)}</span>
              <span style={{ fontSize: 16, color: "var(--ink-3)", fontWeight: 700 }}>CAST</span>
            </div>
            {receipt.creator && (
              <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 8px", borderRadius: 999, background: "var(--surface-2)" }}>
                <Avatar creator={receipt.creator} size={20} />
                <span style={{ fontSize: 12, fontWeight: 700 }} className="lower">{receipt.creator.handle}</span>
              </div>
            )}
          </div>

          {/* Line items */}
          {receipt.lines?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>line items</div>
              {receipt.lines.map((l, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--surface-2)", borderRadius: 10, fontSize: 13 }}>
                  <span>{l.label}</span>
                  <span className={l.mono ? "mono" : "tnum"} style={{ fontWeight: 700 }}>{l.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Meta */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <Meta k="payment method" v={receipt.payment || "—"} />
            <Meta k="ledger id" v={receipt.no} mono />
            <Meta k="kind" v={receipt.kind} />
            {receipt.total && <Meta k="total" v={receipt.total} mono />}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => toast(`receipt ${receipt.no} · pdf downloading`)} className="btn btn-glass" style={{ padding: "10px 14px" }}>
              <Icon name="download" size={14} stroke={2.4} /> download pdf
            </button>
            <button onClick={() => toast(`shared receipt link · copied`)} className="btn btn-glass" style={{ padding: "10px 14px" }}>
              <Icon name="share" size={14} stroke={2.4} /> share
            </button>
            <button onClick={() => toast(`refund request submitted · we'll review within 3 business days`)} className="btn btn-glass" style={{ padding: "10px 14px", marginLeft: "auto", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}>
              request refund
            </button>
          </div>

          <div style={{ fontSize: 10, color: "var(--ink-4)", textAlign: "center", paddingTop: 6 }} className="mono">
            CAST is a closed-loop platform credit issued by technotainment ltd. company no. 14882309 · uk.
          </div>
        </div>
      </div>
    </div>
  );
};

const Meta = ({ k, v, mono }) => (
  <div style={{ padding: "10px 14px", border: "1px solid var(--hairline)", borderRadius: 10 }}>
    <div style={{ fontSize: 10, color: "var(--ink-3)" }} className="mono">{k}</div>
    <div style={{ fontSize: 13, marginTop: 2, fontWeight: 600 }} className={mono ? "mono" : ""}>{v}</div>
  </div>
);

Object.assign(window, { ReceiptScreen });
})();
