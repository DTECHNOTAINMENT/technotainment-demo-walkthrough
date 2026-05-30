/* Admin — owner control-center panels (no-code config surfaces).
   These render inside the Settings screen's tabs. The whole point: the owner configures
   the platform here instead of asking a developer to change code. */
(() => {
const { useState } = React;
const { Icon, ADMIN, StudioCard, Pill, PayBrand } = window;

const Toggle = ({ on, onClick }) => <span className={`tg ${on ? "on" : ""}`} onClick={onClick} style={{ cursor: "pointer", flex: "0 0 36px" }} />;
const Field = ({ label, children, hint }) => (
  <div>
    <label className="st-label">{label}</label>
    {children}
    {hint && <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 5 }}>{hint}</div>}
  </div>
);
const Row = ({ label, desc, children }) => (
  <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "13px 0", borderBottom: "1px solid var(--hairline)" }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
      {desc && <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{desc}</div>}
    </div>
    {children}
  </div>
);

/* ---------------- BRANDING ---------------- */
const BrandingControl = ({ toast }) => {
  const b = ADMIN.BRANDING;
  const [theme, setTheme] = useState(b.defaultTheme);
  const [brand, setBrand] = useState(b.brandColor);
  const swatches = ["#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f97316", "#ef4444", "#3b82f6"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <StudioCard title="identity" sub="names shown across the whole product">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          <Field label="app name"><input className="st-input" defaultValue={b.appName} /></Field>
          <Field label="company"><input className="st-input" defaultValue={b.company} /></Field>
          <Field label="currency name"><input className="st-input" defaultValue={b.currencyName} /></Field>
          <Field label="support email"><input className="st-input" defaultValue={b.supportEmail} /></Field>
        </div>
        <Field label="tagline"><input className="st-input" defaultValue={b.tagline} /></Field>
      </StudioCard>

      <StudioCard title="logo & colours">
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div>
            <label className="st-label">logo</label>
            <div className="dropzone" style={{ width: 200, padding: 22 }} onClick={() => toast("upload logo · svg or png")}>
              <Icon name="download" size={22} stroke={2} style={{ transform: "rotate(180deg)", color: "var(--ink-3)" }} />
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8 }} className="lower">upload logo</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="st-label">brand colour</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {swatches.map(c => (
                <button key={c} onClick={() => setBrand(c)} style={{ width: 34, height: 34, borderRadius: 9, background: c, border: brand === c ? "2px solid var(--ink-1)" : "1px solid var(--hairline)", outline: brand === c ? "2px solid " + c : "none", outlineOffset: 1 }} title={c} />
              ))}
            </div>
            <label className="st-label" style={{ marginTop: 16 }}>default theme</label>
            <div style={{ display: "inline-flex", gap: 2, padding: 3, background: "var(--surface-2)", borderRadius: 10, border: "1px solid var(--hairline)" }}>
              {["dark", "light", "system"].map(t => (
                <button key={t} onClick={() => setTheme(t)} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, background: theme === t ? "var(--surface)" : "transparent", color: theme === t ? "var(--ink-1)" : "var(--ink-3)" }} className="lower">{t}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}><button onClick={() => toast("branding saved · applied platform-wide")} className="btn btn-grad" style={{ padding: "11px 18px" }}>save branding</button></div>
      </StudioCard>
      <div className="st-hint">these values feed the design tokens and metadata everywhere — fans, creators and search engines all see them. no code change needed.</div>
    </div>
  );
};

/* ---------------- PAYMENT METHODS ---------------- */
const PaymentsControl = ({ toast }) => {
  const [topup, setTopup] = useState(ADMIN.PAY_TOGGLES.topup);
  const [payout, setPayout] = useState(ADMIN.PAY_TOGGLES.payout);
  const flip = (setter) => (id) => setter(list => list.map(m => m.id === id ? { ...m, on: !m.on } : m));
  const MethodList = ({ list, onFlip }) => (
    <div>
      {list.map((m, i) => (
        <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
          <PayBrand id={m.id === "sepa" ? "sepa" : m.id} size={28} />
          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{m.label}</span>
          <Pill tone={m.on ? "ok" : "neutral"}>{m.on ? "live" : "off"}</Pill>
          <Toggle on={m.on} onClick={() => onFlip(m.id)} />
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <StudioCard title="top-up methods" sub="which ways fans can buy CAST — toggle any on or off platform-wide">
        <MethodList list={topup} onFlip={flip(setTopup)} />
      </StudioCard>
      <StudioCard title="payout methods" sub="which ways creators can cash out">
        <MethodList list={payout} onFlip={flip(setPayout)} />
      </StudioCard>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><button onClick={() => toast("payment methods saved")} className="btn btn-grad" style={{ padding: "11px 18px" }}>save methods</button></div>
      <div className="st-hint">turning a method off hides it everywhere immediately. each one still needs its provider connected under <strong>connectors</strong> before it can go live for real.</div>
    </div>
  );
};

/* ---------------- POLICIES ---------------- */
const PoliciesControl = ({ toast }) => {
  const p = ADMIN.POLICIES;
  const [terms, setTerms] = useState(p.blockedTerms);
  const [hold, setHold] = useState(p.autoHoldHighRisk);
  const [memChat, setMemChat] = useState(p.membersOnlyChatDefault);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <StudioCard title="age & access">
        <div className="st-split-even">
          <Field label="minimum age to watch" hint="collected at signup"><input className="st-input tnum" defaultValue={p.minAgeWatch} /></Field>
          <Field label="minimum age to earn / spend"><input className="st-input tnum" defaultValue={p.minAgeEarn} /></Field>
        </div>
      </StudioCard>

      <StudioCard title="enforcement">
        <div className="st-split-even">
          <Field label="strikes before ban"><input className="st-input tnum" defaultValue={p.strikes} /></Field>
          <Field label="escalation"><input className="st-input" defaultValue={p.strikeAction} /></Field>
        </div>
        <Row label="auto-hold high-risk content" desc="AI holds risky uploads/messages for human review">
          <Toggle on={hold} onClick={() => setHold(!hold)} />
        </Row>
        <Row label="members-only chat by default" desc="new creators start with members-only live chat">
          <Toggle on={memChat} onClick={() => setMemChat(!memChat)} />
        </Row>
      </StudioCard>

      <StudioCard title="blocked terms" sub="messages containing these are auto-hidden in chat">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {terms.map(t => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--hairline)", fontSize: 12.5 }} className="lower">{t}<button onClick={() => setTerms(terms.filter(x => x !== t))} style={{ color: "var(--ink-4)" }}><Icon name="close" size={12} /></button></span>
          ))}
          <button onClick={() => toast("add blocked term")} className="chip" style={{ padding: "6px 12px", fontSize: 12.5 }}><Icon name="plus" size={13} stroke={2.4} /> add</button>
        </div>
      </StudioCard>

      <StudioCard title="community guidelines" sub="shown to users · the rules everyone agrees to">
        <textarea className="st-input" rows={4} defaultValue={p.guidelines} style={{ resize: "vertical" }} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}><button onClick={() => toast("policies saved · applied platform-wide")} className="btn btn-grad" style={{ padding: "11px 18px" }}>save policies</button></div>
      </StudioCard>
    </div>
  );
};

/* ---------------- PAGES (CMS-lite) + CATEGORIES + ANNOUNCEMENT ---------------- */
const PagesControl = ({ toast }) => {
  const [cats, setCats] = useState(ADMIN.CATEGORIES_CFG);
  const [banner, setBanner] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <StudioCard title="pages" sub="legal, help and marketing content — edit without a developer"
        action={<button onClick={() => toast("new page")} className="btn btn-glass" style={{ padding: "7px 11px", fontSize: 12 }}><Icon name="plus" size={13} stroke={2.4} /> new page</button>}
        pad={false}>
        <div className="st-row head" style={{ gridTemplateColumns: "1fr 1fr 90px 90px 40px" }}>
          <span>page</span><span>path</span><span>status</span><span>updated</span><span />
        </div>
        {ADMIN.PAGES.map((pg, i) => (
          <div key={pg.id} className="st-row" style={{ gridTemplateColumns: "1fr 1fr 90px 90px 40px" }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{pg.title}</span>
            <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{pg.path}</span>
            <div><Pill tone={pg.status === "published" ? "ok" : "neutral"}>{pg.status}</Pill></div>
            <span style={{ fontSize: 11.5, color: "var(--ink-4)" }} className="lower">{pg.updated}</span>
            <button onClick={() => toast(`${pg.title} · edit content`)} style={{ color: "var(--ink-3)" }}><Icon name="more" size={18} /></button>
          </div>
        ))}
      </StudioCard>

      <StudioCard title="categories" sub="the browse categories fans filter by">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {cats.map(c => (
            <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--hairline)", fontSize: 12.5 }} className="lower">{c}<button onClick={() => setCats(cats.filter(x => x !== c))} style={{ color: "var(--ink-4)" }}><Icon name="close" size={12} /></button></span>
          ))}
          <button onClick={() => toast("add category")} className="chip" style={{ padding: "6px 12px", fontSize: 12.5 }}><Icon name="plus" size={13} stroke={2.4} /> add</button>
        </div>
      </StudioCard>

      <StudioCard title="system announcement" sub="show a banner to everyone — maintenance, launches, notices">
        <Row label="show announcement banner" desc="appears at the top of the app for all users">
          <Toggle on={banner} onClick={() => setBanner(!banner)} />
        </Row>
        {banner && <div style={{ marginTop: 12 }}><input className="st-input" placeholder="e.g. scheduled maintenance sunday 02:00–03:00 UTC" /></div>}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}><button onClick={() => toast("saved")} className="btn btn-grad" style={{ padding: "11px 18px" }}>save</button></div>
      </StudioCard>
    </div>
  );
};

Object.assign(window, { BrandingControl, PaymentsControl, PoliciesControl, PagesControl });
})();
