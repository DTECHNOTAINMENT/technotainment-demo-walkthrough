/* Admin — Connectors / Integrations: providers, API keys, webhooks */
(() => {
const { useState } = React;
const { Icon, formatNum, ADMIN, PayBrand, StudioCard, StudioPageHead, Pill, Seg } = window;

const CAT_ICON = { payments: "wallet", identity: "user", risk: "flag", media: "film", comms: "send", tax: "trend", data: "grid", trust: "check", infra: "settings" };
const STATUS_TONE = { live: "ok", beta: "info", off: "neutral" };

const AdminConnectors = ({ toast }) => {
  const a = ADMIN;
  const [tab, setTab] = useState("integrations");
  const [cat, setCat] = useState("all");
  const [reveal, setReveal] = useState({});
  const [states, setStates] = useState(() => Object.fromEntries(a.CONNECTORS.map(c => [c.id, c.status])));

  const list = a.CONNECTORS.filter(c => cat === "all" || c.cat === cat);
  const toggle = (id) => setStates(s => ({ ...s, [id]: s[id] === "off" ? "live" : "off" }));

  const copy = (text, label) => { navigator.clipboard?.writeText(text); toast(`${label} copied`); };

  return (
    <div className="page-pad" style={{ maxWidth: 1450, margin: "0 auto" }}>
      <StudioPageHead eyebrow="platform" title="connectors"
        sub="the third-party services technotainment runs on — payments, identity, media, comms and your API surface."
        actions={<Seg items={[{ id: "integrations", label: "integrations" }, { id: "api", label: "api & webhooks" }]} value={tab} onChange={setTab} />} />

      {tab === "integrations" && (
        <>
          <div style={{ display: "flex", gap: 6, margin: "4px 0 16px", flexWrap: "wrap" }}>
            <button className={`chip ${cat === "all" ? "active" : ""}`} onClick={() => setCat("all")} style={{ padding: "7px 13px", fontSize: 12 }}><span className="lower">all</span></button>
            {a.CONNECTOR_CATS.map(c => (
              <button key={c} className={`chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)} style={{ padding: "7px 13px", fontSize: 12 }}><span className="lower">{c}</span></button>
            ))}
          </div>

          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
            {list.map(c => {
              const st = states[c.id];
              const isPay = c.cat === "payments";
              return (
                <div key={c.id} className="card" style={{ background: "var(--surface)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    {isPay
                      ? <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 40px" }}><Icon name="wallet" size={19} stroke={2} style={{ color: "var(--ink-2)" }} /></span>
                      : <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 40px", color: "var(--ink-2)" }}><Icon name={CAT_ICON[c.cat] || "grid"} size={19} stroke={2} /></span>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{c.name}</div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-4)" }}>{c.cat}</div>
                    </div>
                    <Pill tone={STATUS_TONE[st]}>{st}</Pill>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5, flex: 1 }}>{c.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "var(--ink-4)" }} className="mono">{c.events}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button onClick={() => toast(`${c.name} · configure keys & options`)} style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>configure</button>
                      <span className={`tg ${st !== "off" ? "on" : ""}`} onClick={() => toggle(c.id)} style={{ cursor: "pointer" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "api" && (
        <div className="st-split" style={{ marginTop: 4 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StudioCard title="API keys" sub="server keys are shown once — rotate if exposed"
              action={<button onClick={() => toast("new key generated · copy now")} className="btn btn-grad-stroke" style={{ padding: "8px 12px", fontSize: 12 }}><Icon name="plus" size={13} stroke={2.4} /> new key</button>}
              pad={false}>
              {a.API_KEYS.map((k, i) => (
                <div key={k.id} className="st-row" style={{ gridTemplateColumns: "1fr auto", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>{k.label} <Pill tone={k.scope === "server" ? "warn" : "info"}>{k.scope}</Pill></div>
                    <div className="copy-field" style={{ marginTop: 6, maxWidth: 320 }}>
                      <span className="val">{k.secret && !reveal[k.id] ? "••••••••••••••••••••" : k.value}</span>
                      {k.secret && <button onClick={() => setReveal(r => ({ ...r, [k.id]: !r[k.id] }))} style={{ color: "var(--ink-2)" }}><Icon name="eye" size={14} /></button>}
                      <button onClick={() => copy(k.value, k.label)} style={{ color: "var(--ink-2)" }}><Icon name="share" size={14} /></button>
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 4 }} className="mono">created {k.created} · last used {k.lastUsed}</div>
                  </div>
                  <button onClick={() => toast(`${k.label} · rotate / revoke`)} style={{ color: "var(--ink-3)" }}><Icon name="more" size={18} /></button>
                </div>
              ))}
            </StudioCard>

            <div className="st-hint">all API access is scoped by role and logged in the audit trail. secret keys never appear in logs or webhooks. use restricted keys for partners.</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StudioCard title="webhooks" sub="event delivery endpoints"
              action={<button onClick={() => toast("add endpoint")} className="btn btn-glass" style={{ padding: "7px 11px", fontSize: 12 }}><Icon name="plus" size={13} stroke={2.4} /> add</button>}
              pad={false}>
              {a.WEBHOOKS.map((w, i) => (
                <div key={i} className="st-row" style={{ gridTemplateColumns: "1fr auto", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.url}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }} className="mono">{w.events} · {w.delivered} delivered</div>
                  </div>
                  <Pill tone={w.status === "healthy" ? "ok" : "warn"}>{w.status}</Pill>
                </div>
              ))}
            </StudioCard>

            <StudioCard title="environment" sub="api base & docs">
              <div className="copy-field" style={{ marginBottom: 10 }}>
                <span className="val">https://api.technotainment.fm/v1</span>
                <button onClick={() => copy("https://api.technotainment.fm/v1", "base url")} style={{ color: "var(--ink-2)" }}><Icon name="share" size={14} /></button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => toast("opening API reference")} className="btn btn-glass" style={{ flex: 1, padding: "10px", fontSize: 12.5 }}><Icon name="film" size={13} stroke={2} /> API docs</button>
                <button onClick={() => toast("opening status page")} className="btn btn-glass" style={{ flex: 1, padding: "10px", fontSize: 12.5 }}><Icon name="trend" size={13} stroke={2} /> status</button>
              </div>
            </StudioCard>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { AdminConnectors });
})();
