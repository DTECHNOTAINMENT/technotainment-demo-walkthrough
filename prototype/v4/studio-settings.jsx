/* Creator Studio — Settings */
(() => {
const { useState } = React;
const { Icon, Avatar, formatNum, STUDIO, StudioCard, StudioPageHead, Pill, Seg } = window;

const Toggle = ({ on, onClick }) => <span className={`tg ${on ? "on" : ""}`} onClick={onClick} style={{ cursor: "pointer", flex: "0 0 36px" }} />;

const Row = ({ label, desc, children }) => (
  <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--hairline)" }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
      {desc && <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{desc}</div>}
    </div>
    {children}
  </div>
);

const SettingsScreen = ({ toast }) => {
  const s = STUDIO;
  const [tab, setTab] = useState("channel");
  const [tg, setTg] = useState({ slow: true, membersChat: false, automod: true, alerts: true, raids: true, dropPings: true, subGoals: true });
  const flip = (k) => setTg(t => ({ ...t, [k]: !t[k] }));

  return (
    <div className="page-pad" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <StudioPageHead eyebrow="creator studio" title="settings"
        sub="your channel identity, payout details, moderation rules and team access." />

      <div style={{ marginBottom: 22 }}>
        <Seg items={[
          { id: "channel", label: "channel" },
          { id: "payout", label: "payout & tax" },
          { id: "moderation", label: "moderation" },
          { id: "team", label: "team" },
        ]} value={tab} onChange={setTab} />
      </div>

      {tab === "channel" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="brand">
            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ padding: 3, borderRadius: "50%", background: `linear-gradient(135deg,${s.me.brand},${s.me.brand2})` }}><Avatar creator={s.me} size={72} /></span>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{s.me.name}</div>
                <div style={{ fontSize: 13, color: "var(--ink-3)" }} className="lower">{s.me.handle} · {s.me.category}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <button onClick={() => toast("upload avatar")} className="btn btn-glass" style={{ padding: "8px 13px", fontSize: 12 }}>change avatar</button>
                  <button onClick={() => toast("upload banner")} className="btn btn-glass" style={{ padding: "8px 13px", fontSize: 12 }}>change banner</button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[s.me.brand, s.me.brand2].map(c => <span key={c} style={{ width: 36, height: 36, borderRadius: 9, background: c, border: "1px solid var(--hairline)" }} title={c} />)}
              </div>
            </div>
          </StudioCard>

          <StudioCard title="channel details">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label className="st-label">display name</label><input className="st-input" defaultValue={s.me.name} /></div>
              <div><label className="st-label">handle</label><input className="st-input" defaultValue={s.me.handle} /></div>
              <div><label className="st-label">category</label><input className="st-input" defaultValue={s.me.category} /></div>
              <div><label className="st-label">bio</label><textarea className="st-input" rows={3} defaultValue="modular synth sessions, patch sheets and late-night experiments. berlin." style={{ resize: "vertical" }} /></div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}><button onClick={() => toast("channel saved")} className="btn btn-grad" style={{ padding: "11px 20px" }}>save changes</button></div>
            </div>
          </StudioCard>

          <StudioCard title="notifications to followers">
            <Row label="go-live alerts" desc="notify followers the moment you start a stream"><Toggle on={tg.alerts} onClick={() => flip("alerts")} /></Row>
            <Row label="drop announcements" desc="push when you launch a new store product"><Toggle on={tg.dropPings} onClick={() => flip("dropPings")} /></Row>
            <Row label="sub-goal celebrations" desc="show a milestone overlay when you hit a target"><Toggle on={tg.subGoals} onClick={() => flip("subGoals")} /></Row>
          </StudioCard>
        </div>
      )}

      {tab === "payout" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="payout schedule">
            <Seg items={[{ id: "auto", label: "auto · monthly" }, { id: "manual", label: "manual" }]} value="auto" onChange={() => toast("payout schedule")} />
            <div className="st-hint" style={{ marginTop: 14 }}>auto-payout sends your available balance to <strong>{s.PAYOUT.method.label}</strong> on the 1st of each month. minimum balance: none.</div>
          </StudioCard>
          <StudioCard title="bank account">
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid var(--hairline)", borderRadius: 12 }}>
              <div style={{ width: 46, height: 30, borderRadius: 6, background: s.PAYOUT.method.brand }} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 700 }}>{s.PAYOUT.method.label}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{s.PAYOUT.method.sub}</div></div>
              <Pill tone="ok">verified</Pill>
            </div>
            <button onClick={() => toast("add payout method")} className="btn btn-glass" style={{ marginTop: 12, padding: "10px 14px", fontSize: 13 }}><Icon name="plus" size={14} stroke={2.4} /> add method</button>
          </StudioCard>
          <StudioCard title="tax & legal">
            {[["legal entity", "Nyx Okafor (sole trader)"], ["jurisdiction", "United Kingdom · England & Wales"], ["VAT", "not registered"], ["tax form", "UK self-assessment · 2025/26"]].map(([k, v]) => (
              <Row key={k} label={v} desc={k}><button onClick={() => toast(`edit ${k}`)} style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 700 }}>edit</button></Row>
            ))}
            <div style={{ marginTop: 14 }}><button onClick={() => toast("download 2025/26 tax summary")} className="btn btn-glass" style={{ padding: "10px 14px", fontSize: 13 }}><Icon name="download" size={14} stroke={2.4} /> download tax summary</button></div>
          </StudioCard>
        </div>
      )}

      {tab === "moderation" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="chat rules">
            <Row label="slow mode" desc="one message every 5 seconds per viewer"><Toggle on={tg.slow} onClick={() => flip("slow")} /></Row>
            <Row label="members-only chat" desc="only paying members can post during streams"><Toggle on={tg.membersChat} onClick={() => flip("membersChat")} /></Row>
            <Row label="auto-moderation" desc="hold risky messages for review automatically"><Toggle on={tg.automod} onClick={() => flip("automod")} /></Row>
            <Row label="allow raids" desc="let other creators send their viewers your way"><Toggle on={tg.raids} onClick={() => flip("raids")} /></Row>
          </StudioCard>
          <StudioCard title="blocked terms" sub="messages containing these are hidden">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["spam", "scam links", "slurs", "self-promo"].map(t => (
                <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--hairline)", fontSize: 12.5 }} className="lower">{t}<button onClick={() => toast(`removed ${t}`)} style={{ color: "var(--ink-4)" }}><Icon name="close" size={12} /></button></span>
              ))}
              <button onClick={() => toast("add blocked term")} className="chip" style={{ padding: "6px 12px", fontSize: 12.5 }}><Icon name="plus" size={13} stroke={2.4} /> add</button>
            </div>
          </StudioCard>
        </div>
      )}

      {tab === "team" && (
        <StudioCard title="team & roles" sub="invite people to help run your channel" pad={false}>
          {[
            { name: "Nyx Okafor", role: "owner", handle: "@nyxsynth" },
            { name: "Sam Field", role: "moderator", handle: "@samf" },
            { name: "Ada Lin", role: "editor", handle: "@ada.edits" },
          ].map((p, i) => (
            <div key={i} className="st-row" style={{ gridTemplateColumns: "1fr 120px 70px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "var(--ink-2)" }}>{p.name.split(" ").map(w => w[0]).join("")}</div>
                <div><div style={{ fontSize: 13.5, fontWeight: 700 }}>{p.name}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">{p.handle}</div></div>
              </div>
              <div><Pill tone={p.role === "owner" ? "info" : "neutral"}>{p.role}</Pill></div>
              <div style={{ textAlign: "right" }}>{p.role !== "owner" && <button onClick={() => toast(`${p.name} · manage`)} style={{ color: "var(--ink-3)" }}><Icon name="more" size={18} /></button>}</div>
            </div>
          ))}
          <div style={{ padding: 16, borderTop: "1px solid var(--hairline)" }}><button onClick={() => toast("invite teammate · moderator / editor / analyst")} className="btn btn-grad-stroke" style={{ padding: "10px 16px", fontSize: 13 }}><Icon name="plus" size={14} stroke={2.4} /> invite teammate</button></div>
        </StudioCard>
      )}
    </div>
  );
};

Object.assign(window, { SettingsScreen });
})();
