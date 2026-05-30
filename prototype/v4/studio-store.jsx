/* Creator Studio — Store / Drops manager */
(() => {
const { useState } = React;
const { Icon, CastGlyph, Modal, formatNum, STUDIO, gbp, castToGBP,
  StatCard, StudioCard, StudioPageHead, Pill, Seg } = window;

const KIND_META = {
  drop:   { label: "drop",   icon: "bag",  tone: "info" },
  course: { label: "course", icon: "bookmark", tone: "ok" },
  ppv:    { label: "ppv",    icon: "film", tone: "warn" },
  merch:  { label: "merch",  icon: "gift", tone: "neutral" },
};

/* ---- Create product ---- */
const NewProductModal = ({ open, onClose, toast }) => {
  const [kind, setKind] = useState("drop");
  const [form, setForm] = useState({ name: "", price: 180, edition: "", limited: false, qty: 150 });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal open={open} onClose={onClose} title="new product" width={520}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className="st-label">type</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {Object.entries(KIND_META).map(([k, m]) => (
              <button key={k} onClick={() => setKind(k)} className="card" style={{ padding: "14px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: kind === k ? "var(--surface-2)" : "var(--surface)", borderColor: kind === k ? "var(--hairline-2)" : "var(--hairline)", boxShadow: "none" }}>
                <Icon name={m.icon} size={20} stroke={2} style={{ color: kind === k ? "var(--ink-1)" : "var(--ink-3)" }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: kind === k ? "var(--ink-1)" : "var(--ink-3)" }} className="lower">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="st-label">name</label>
          <input className="st-input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={kind === "merch" ? "patch-sheet riso poster" : kind === "course" ? "intro to modular routing" : "field recordings · vol 5"} />
        </div>
        <div className="st-split-even">
          <div>
            <label className="st-label">price · CAST</label>
            <input className="st-input tnum" type="number" value={form.price} onChange={(e) => set("price", +e.target.value)} />
            <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 5 }} className="mono">{gbp(castToGBP(form.price))}</div>
          </div>
          <div>
            <label className="st-label">{kind === "ppv" ? "access window" : kind === "merch" ? "stock qty" : "edition"}</label>
            <input className="st-input" value={kind === "ppv" ? "48h rental" : form.edition} onChange={(e) => set("edition", e.target.value)} placeholder={kind === "ppv" ? "48h rental" : kind === "merch" ? "150" : "limited / open"} />
          </div>
        </div>
        <div className="dropzone" style={{ padding: 28 }} onClick={() => toast("attach file / artwork")}>
          <Icon name="download" size={22} stroke={2} style={{ transform: "rotate(180deg)", color: "var(--ink-3)" }} />
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 8 }} className="lower">attach the file or cover art</div>
        </div>
        <button onClick={() => { onClose(); toast(`${form.name || "product"} · published to store`, { icon: true }); }} className="btn btn-grad" style={{ padding: "13px" }} disabled={!form.name}>publish to store</button>
      </div>
    </Modal>
  );
};

const StoreScreen = ({ toast }) => {
  const s = STUDIO;
  const [np, setNp] = useState(false);
  const [filter, setFilter] = useState("all");
  const list = s.PRODUCTS.filter(p => filter === "all" ? true : p.kind === filter);
  const revenue = s.PRODUCTS.reduce((a, p) => a + p.sold * p.price, 0);
  const unitsSold = s.PRODUCTS.reduce((a, p) => a + p.sold, 0);

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="store"
        sub="drops, pay-per-view, courses and merch — sold in CAST, fulfilled by technotainment."
        actions={<button onClick={() => setNp(true)} className="btn btn-grad" style={{ padding: "12px 18px" }}><Icon name="plus" size={15} stroke={2.6} /> new product</button>} />

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <StatCard label="store revenue · 30d" icon="cast" value={formatNum(revenue)} unit="CAST" delta="+12%" deltaUp fiat={gbp(castToGBP(revenue))} spark={[18, 21, 19, 24, 28, 31, 29, 34]} />
        <StatCard label="units sold" icon="bag" value={formatNum(unitsSold)} unit="all time" delta="+186" deltaUp fiat="across 8 products" spark={[120, 140, 160, 155, 190, 210, 230, 248]} sparkColor="#06b6d4" />
        <StatCard label="live products" icon="check" value={s.PRODUCTS.filter(p => p.status === "live").length} unit="published" fiat="1 draft" spark={[5, 6, 6, 7, 7, 7, 7, 7]} sparkColor="#10b981" />
        <StatCard label="best seller" icon="trend" value="field rec." unit="vol 4" delta="1.2k sold" deltaUp fiat="120 CAST each" spark={[8, 9, 11, 10, 12, 13, 12, 14]} sparkColor="#ec4899" />
      </div>

      <div style={{ display: "flex", gap: 6, margin: "18px 0 16px", flexWrap: "wrap" }}>
        {["all", "drop", "course", "ppv", "merch"].map(f => (
          <button key={f} className={`chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)} style={{ padding: "7px 14px", fontSize: 12.5 }}><span className="lower">{f === "all" ? "all products" : KIND_META[f].label}</span></button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
        {list.map(p => {
          const m = KIND_META[p.kind];
          return (
            <div key={p.id} className="card" style={{ background: "var(--surface)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="thumb" style={{ backgroundImage: `url(${p.img})`, aspectRatio: "16/10", borderRadius: 0 }}>
                <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
                  <Pill tone={m.tone}>{m.label}</Pill>
                  {p.status === "draft" && <Pill tone="neutral">draft</Pill>}
                </div>
              </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }} className="mono">{p.edition}{p.stock != null ? ` · ${p.stock} in stock` : ""}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="tnum" style={{ fontSize: 16, fontWeight: 800 }}><CastGlyph size={14} /> {formatNum(p.price)}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-3)" }} className="lower"><span className="tnum">{formatNum(p.sold)}</span> sold</span>
                </div>
                <div className="meter"><span style={{ width: `${Math.min(100, (p.sold / 1240) * 100)}%`, background: "var(--brand-gradient)" }} /></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => toast(`${p.name} · edit`)} className="btn btn-glass" style={{ flex: 1, padding: "8px", fontSize: 12 }}>edit</button>
                  <button onClick={() => toast(`${p.name} · ${formatNum(p.sold * p.price)} CAST earned`)} className="btn btn-glass" style={{ padding: "8px 11px", fontSize: 12 }}><Icon name="trend" size={13} stroke={2.2} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <NewProductModal open={np} onClose={() => setNp(false)} toast={toast} />
    </div>
  );
};

Object.assign(window, { StoreScreen });
})();
