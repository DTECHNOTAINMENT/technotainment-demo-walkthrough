/* Creator Studio — onboarding / apply-to-create flow.
   Rendered full-screen from app.jsx when a viewer chooses to become a creator. */
(() => {
const { useState } = React;
const { Icon, CastGlyph, formatNum, gbp, castToGBP, PAYOUT_METHODS, PayBrand } = window;

const STEPS = ["start", "channel", "membership", "payout", "review"];

const VALUE_PROPS = [
  { icon: "flame",  title: "go live in minutes",   desc: "stream from your encoder or the browser — your followers get pinged the moment you start." },
  { icon: "heart",  title: "memberships & tips",   desc: "recurring CAST income from members, one-off tips, gifted subs. you set the tiers." },
  { icon: "bag",    title: "sell drops & ppv",     desc: "merch, courses, pay-per-view recordings — fulfilled by technotainment, paid in CAST." },
  { icon: "lock",   title: "you keep your audience", desc: "your members are yours. if you ever leave, the relationship leaves with you." },
];

const PERK_SUGGESTIONS = ["members-only chat", "early stream alerts", "downloadable extras", "monthly q&a", "10% off drops", "your name in credits"];

const OnboardingFlow = ({ user, onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: user?.name || "Alex Maren",
    handle: (user?.handle || "@alex.m"),
    category: "modular synth",
    bio: "",
    tierName: "supporter",
    tierPrice: 250,
    perks: ["members-only chat", "early stream alerts"],
    country: "United Kingdom",
    payout: null,
    agree: false,
  });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const togglePerk = (p) => setData(d => ({ ...d, perks: d.perks.includes(p) ? d.perks.filter(x => x !== p) : [...d.perks, p] }));

  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const back = () => step === 0 ? onCancel?.() : setStep(s => s - 1);

  const canNext =
    step === 1 ? data.name.trim() && data.handle.trim() :
    step === 2 ? data.tierName.trim() && data.tierPrice > 0 :
    step === 3 ? !!data.payout :
    step === 4 ? data.agree : true;

  return (
    <div className="studio-scope" style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: "1px solid var(--hairline)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={(window.__resources && window.__resources.butterfly) || "assets/butterfly-t.png"} alt="" className="logo-blend" style={{ height: 24, width: "auto" }} />
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.03em", color: "var(--ink-1)" }} className="lower">technotainment</span>
          <span className="studio-badge">become a creator</span>
        </div>
        <button onClick={onCancel} className="theme-toggle" style={{ background: "var(--surface-2)", borderImage: "none", border: "1px solid var(--hairline)" }} aria-label="close"><Icon name="close" size={15} /></button>
      </div>

      {/* Progress */}
      <div style={{ maxWidth: 620, width: "100%", margin: "0 auto", padding: "22px 20px 0" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= step ? "var(--brand-gradient)" : "var(--surface-2)", transition: "background 0.3s ease" }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>step {step + 1} of {STEPS.length} · {STEPS[step]}</div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "24px 20px 40px", overflowY: "auto" }}>
        <div style={{ maxWidth: 620, width: "100%" }}>

          {step === 0 && (
            <div>
              <h1 style={{ fontSize: "clamp(30px,5vw,42px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05, margin: "8px 0 10px", color: "var(--ink-1)" }} className="lower">turn your channel on.</h1>
              <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.6, maxWidth: 520 }}>
                you already watch, tip and collect on metascape. creating is the same world, flipped around — go live, build a membership, and get paid in CAST you can withdraw to your bank.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12, margin: "26px 0" }}>
                {VALUE_PROPS.map(v => (
                  <div key={v.title} className="card" style={{ padding: 16, background: "var(--surface)", display: "flex", gap: 12 }}>
                    <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--brand-gradient)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", flex: "0 0 38px" }}><Icon name={v.icon} size={18} stroke={2.2} /></span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800 }} className="lower">{v.title}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3, lineHeight: 1.5 }}>{v.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="st-hint">technotainment takes a flat 12% of creator earnings — no monthly fee, no payout minimum, no per-transaction surcharge.</div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.01em", margin: "4px 0 6px", color: "var(--ink-1)" }} className="lower">your channel</h2>
              <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginBottom: 22 }}>this is what viewers see across metascape and any metacast that hosts you.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div><label className="st-label">channel name</label><input className="st-input" value={data.name} onChange={(e) => set("name", e.target.value)} /></div>
                <div><label className="st-label">handle</label><input className="st-input" value={data.handle} onChange={(e) => set("handle", e.target.value.startsWith("@") ? e.target.value : "@" + e.target.value)} /></div>
                <div>
                  <label className="st-label">what do you make?</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["modular synth", "live cooking", "gaming", "talk show", "music", "education", "sport", "art"].map(cat => (
                      <button key={cat} className={`chip ${data.category === cat ? "active" : ""}`} onClick={() => set("category", cat)} style={{ padding: "8px 14px" }}><span className="lower">{cat}</span></button>
                    ))}
                  </div>
                </div>
                <div><label className="st-label">short bio <span style={{ color: "var(--ink-4)", fontWeight: 500, textTransform: "none" }}>· optional</span></label><textarea className="st-input" rows={3} value={data.bio} onChange={(e) => set("bio", e.target.value)} placeholder="tell people what your channel is about…" style={{ resize: "vertical" }} /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.01em", margin: "4px 0 6px", color: "var(--ink-1)" }} className="lower">your first membership</h2>
              <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginBottom: 22 }}>start with one tier — you can add more, change pricing and perks any time in the studio.</p>
              <div className="tier-edit popular" style={{ marginBottom: 18 }}>
                <div style={{ padding: 18 }}>
                  <div className="st-split-even" style={{ gap: 14 }}>
                    <div><label className="st-label">tier name</label><input className="st-input" value={data.tierName} onChange={(e) => set("tierName", e.target.value)} /></div>
                    <div>
                      <label className="st-label">price · CAST / mo</label>
                      <input className="st-input tnum" type="number" value={data.tierPrice} onChange={(e) => set("tierPrice", Math.max(0, +e.target.value))} />
                      <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 5 }} className="mono">{gbp(castToGBP(data.tierPrice))}/mo · you keep {gbp(castToGBP(Math.round(data.tierPrice * 0.88)))}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <label className="st-label">perks · pick what's included</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {PERK_SUGGESTIONS.map(p => (
                        <button key={p} className={`chip ${data.perks.includes(p) ? "active" : ""}`} onClick={() => togglePerk(p)} style={{ padding: "8px 13px", fontSize: 12.5 }}>
                          {data.perks.includes(p) && <Icon name="check" size={13} stroke={2.6} />}<span className="lower">{p}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="st-hint">tips, drops and pay-per-view don't need a tier — they work the moment your channel is live.</div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.01em", margin: "4px 0 6px", color: "var(--ink-1)" }} className="lower">get paid</h2>
              <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginBottom: 22 }}>CAST you earn converts to your local currency and pays out to your account. 100 CAST = £1.00.</p>
              <div style={{ marginBottom: 16 }}>
                <label className="st-label">country / region</label>
                <select className="st-input" value={data.country} onChange={(e) => set("country", e.target.value)}>
                  {["United Kingdom", "Germany", "United States", "France", "Spain", "rest of world"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <label className="st-label">payout method</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {PAYOUT_METHODS.map(m => (
                  <button key={m.id} onClick={() => set("payout", m)} className="card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, background: data.payout?.id === m.id ? "var(--surface-2)" : "var(--surface)", borderColor: data.payout?.id === m.id ? "var(--hairline-2)" : "var(--hairline)", textAlign: "left", boxShadow: "none" }}>
                    <PayBrand id={m.id} size={30} />
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 700 }} className="lower">{m.label}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{m.sub} · {m.fee} · {m.speed}</div></div>
                    <span className={`tg ${data.payout?.id === m.id ? "on" : ""}`} style={{ pointerEvents: "none" }} />
                  </button>
                ))}
              </div>
              <div className="st-hint" style={{ marginTop: 16 }}>this is a demo — no real account is connected. you can manage payout details later in <strong>studio → settings → payout</strong>.</div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.01em", margin: "4px 0 6px", color: "var(--ink-1)" }} className="lower">ready to launch</h2>
              <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginBottom: 22 }}>review your channel, then open your studio.</p>
              <div className="card" style={{ background: "var(--surface)", overflow: "hidden", marginBottom: 16 }}>
                <div className="brand-hairline" />
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    ["channel", `${data.name} · ${data.handle}`],
                    ["category", data.category],
                    ["first tier", `${data.tierName} · ${formatNum(data.tierPrice)} CAST/mo`],
                    ["perks", data.perks.join(" · ") || "—"],
                    ["payout", data.payout ? `${data.payout.label} · ${data.country}` : "—"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 13 }}>
                      <span style={{ color: "var(--ink-3)" }} className="lower">{k}</span>
                      <span style={{ fontWeight: 700, textAlign: "right" }} className="lower">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", padding: "4px 2px" }}>
                <span className={`tg ${data.agree ? "on" : ""}`} onClick={() => set("agree", !data.agree)} style={{ flex: "0 0 36px", marginTop: 2 }} />
                <span style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}>i agree to the technotainment <span style={{ textDecoration: "underline" }}>creator terms</span> and confirm i can publish the content i upload. earnings are subject to a flat 12% platform fee.</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div style={{ borderTop: "1px solid var(--hairline)", padding: "14px 20px", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: 620, width: "100%", display: "flex", justifyContent: "space-between", gap: 12 }}>
          <button onClick={back} className="btn btn-glass" style={{ padding: "12px 18px" }}>{step === 0 ? "not now" : "back"}</button>
          {step < STEPS.length - 1
            ? <button onClick={next} disabled={!canNext} className="btn btn-grad" style={{ padding: "12px 24px", opacity: canNext ? 1 : 0.5 }}>{step === 0 ? "get started" : "continue"} <Icon name="arrowR" size={15} stroke={2.2} /></button>
            : <button onClick={() => onComplete?.(data)} disabled={!canNext} className="btn btn-grad" style={{ padding: "12px 24px", opacity: canNext ? 1 : 0.5 }}><Icon name="cast" size={15} stroke={2.2} /> open my studio</button>}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { OnboardingFlow });
})();
