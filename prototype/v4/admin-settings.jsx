/* Admin — platform settings: fees, flags, economics, regions, roles, audit */
(() => {
const { useState } = React;
const { Icon, ADMIN, StudioCard, StudioPageHead, Pill, Seg, BrandingControl, PaymentsControl, PoliciesControl, PagesControl } = window;

const KIND_TONE = { moderation: "live", creators: "info", trust: "warn", finance: "ok", security: "warn", system: "neutral" };

const Field = ({ label, children, hint }) => (
  <div>
    <label className="st-label">{label}</label>
    {children}
    {hint && <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 5 }}>{hint}</div>}
  </div>
);

const AdminSettings = ({ toast }) => {
  const a = ADMIN;
  const [tab, setTab] = useState("economics");
  const [flags, setFlags] = useState(() => Object.fromEntries(a.FLAGS.map(f => [f.id, f.on])));
  const flip = (id) => setFlags(s => ({ ...s, [id]: !s[id] }));

  return (
    <div className="page-pad" style={{ maxWidth: 1200, margin: "0 auto" }}>
      <StudioPageHead eyebrow="platform" title="control center"
        sub="run technotainment without a developer — fees, the CAST economy, branding, payment methods, feature rollouts, policies, pages, regions, your team and the audit trail." />

      <div style={{ marginBottom: 20, overflowX: "auto" }}>
        <Seg items={[
          { id: "economics", label: "fees & CAST" },
          { id: "branding", label: "branding" },
          { id: "payments", label: "payment methods" },
          { id: "flags", label: "features" },
          { id: "policies", label: "policies" },
          { id: "pages", label: "pages & content" },
          { id: "regions", label: "regions" },
          { id: "team", label: "team & roles" },
          { id: "audit", label: "audit log" },
        ]} value={tab} onChange={setTab} />
      </div>

      {tab === "economics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="platform fee" sub="the cut technotainment takes from creator earnings">
            <div className="st-split-even">
              <Field label="standard take rate" hint="applies to all new creators">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><input className="st-input tnum" defaultValue="12" style={{ width: 90 }} /><span style={{ color: "var(--ink-3)", fontWeight: 700 }}>%</span></div>
              </Field>
              <Field label="payment processing" hint="passed through from processors">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><input className="st-input tnum" defaultValue="absorbed" style={{ width: 130 }} /></div>
              </Field>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}><button onClick={() => toast("fee schedule saved · applies to new creators")} className="btn btn-grad" style={{ padding: "11px 18px" }}>save fees</button></div>
          </StudioCard>

          <StudioCard title="CAST economy" sub="the platform credit">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
              <Field label="exchange rate"><input className="st-input" defaultValue="100 CAST = £1.00" /></Field>
              <Field label="min top-up"><input className="st-input tnum" defaultValue="100" /></Field>
              <Field label="payout hold"><input className="st-input" defaultValue="7 days" /></Field>
              <Field label="min payout"><input className="st-input" defaultValue="none" /></Field>
            </div>
            <div className="st-hint" style={{ marginTop: 14 }}>CAST is a closed-loop credit. balances are a float liability — changing the rate only affects new purchases, never issued balances.</div>
          </StudioCard>
        </div>
      )}

      {tab === "branding"  && <BrandingControl toast={toast} />}
      {tab === "payments"  && <PaymentsControl toast={toast} />}
      {tab === "policies"  && <PoliciesControl toast={toast} />}
      {tab === "pages"     && <PagesControl toast={toast} />}

      {tab === "flags" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[["live", "live features", "on now · adjust rollout any time"], ["roadmap", "roadmap — flip on when ready", "fully built & specced · turning these on needs no code change"]].map(([grp, title, sub]) => (
            <StudioCard key={grp} title={title} sub={sub} pad={false}>
              {a.FLAGS.filter(f => (f.group || "live") === grp).map((f, i) => (
                <div key={f.id} className="st-row" style={{ gridTemplateColumns: "1fr 90px 50px", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }} className="lower">{f.label}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{f.desc}</div>
                  </div>
                  <div style={{ textAlign: "center" }}><Pill tone={flags[f.id] ? "info" : "neutral"}>{flags[f.id] ? f.rollout : "off"}</Pill></div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}><span className={`tg ${flags[f.id] ? "on" : ""}`} onClick={() => flip(f.id)} style={{ cursor: "pointer" }} /></div>
                </div>
              ))}
            </StudioCard>
          ))}
        </div>
      )}

      {tab === "regions" && (
        <StudioCard title="regions & compliance" sub="where technotainment operates and the rules that apply" pad={false}>
          {[
            { r: "United Kingdom", cur: "GBP", tax: "VAT · HMRC", status: "live" },
            { r: "European Union", cur: "EUR", tax: "VAT MOSS · DAC7", status: "live" },
            { r: "United States", cur: "USD", tax: "sales tax · 1099-K", status: "live" },
            { r: "Canada", cur: "CAD", tax: "GST/HST", status: "live" },
            { r: "Australia", cur: "AUD", tax: "GST", status: "beta" },
            { r: "Brazil", cur: "BRL", tax: "—", status: "planned" },
          ].map((x, i) => (
            <div key={x.r} className="st-row" style={{ gridTemplateColumns: "1fr 90px 1fr 90px", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{x.r}</span>
              <span className="mono" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{x.cur}</span>
              <span style={{ fontSize: 12, color: "var(--ink-3)" }} className="lower">{x.tax}</span>
              <div style={{ textAlign: "right" }}><Pill tone={x.status === "live" ? "ok" : x.status === "beta" ? "info" : "neutral"}>{x.status}</Pill></div>
            </div>
          ))}
        </StudioCard>
      )}

      {tab === "team" && (
        <StudioCard title="team & roles" sub="who can access the back-office · RBAC + enforced MFA" pad={false}>
          <div className="st-row head" style={{ gridTemplateColumns: "1.4fr 160px 80px 40px" }}>
            <span>member</span><span>role</span><span style={{ textAlign: "center" }}>mfa</span><span />
          </div>
          {a.ADMIN_TEAM.map((m, i) => (
            <div key={i} className="st-row" style={{ gridTemplateColumns: "1.4fr 160px 80px 40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "var(--ink-2)" }}>{m.name.split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
                <div><div style={{ fontSize: 13.5, fontWeight: 700 }}>{m.name}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{m.email}</div></div>
              </div>
              <div><Pill tone={m.role === "owner" ? "info" : "neutral"}>{m.role}</Pill></div>
              <div style={{ textAlign: "center" }}>{m.mfa ? <Icon name="check" size={16} stroke={2.6} style={{ color: "#10b981" }} /> : <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }} className="lower">off</span>}</div>
              <button onClick={() => toast(`${m.name} · change role / remove`)} style={{ color: "var(--ink-3)" }}><Icon name="more" size={18} /></button>
            </div>
          ))}
          <div style={{ padding: 16, borderTop: "1px solid var(--hairline)" }}><button onClick={() => toast("invite · owner / trust & safety / finance / support / read-only")} className="btn btn-grad-stroke" style={{ padding: "10px 16px", fontSize: 13 }}><Icon name="plus" size={14} stroke={2.4} /> invite member</button></div>
        </StudioCard>
      )}

      {tab === "audit" && (
        <StudioCard title="audit log" sub="every privileged action, immutable" pad={false}>
          {a.AUDIT.map((e, i) => (
            <div key={i} className="st-row" style={{ gridTemplateColumns: "40px 1fr 120px 110px", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)" }}><Icon name={e.who === "system" ? "settings" : "user"} size={15} stroke={2} /></span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{e.action}</span>
              <span style={{ fontSize: 12, color: "var(--ink-3)" }} className="mono">{e.who}</span>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                <Pill tone={KIND_TONE[e.kind] || "neutral"}>{e.kind}</Pill>
                <span style={{ fontSize: 10.5, color: "var(--ink-4)" }} className="lower">{e.when}</span>
              </div>
            </div>
          ))}
        </StudioCard>
      )}
    </div>
  );
};

Object.assign(window, { AdminSettings });
})();
