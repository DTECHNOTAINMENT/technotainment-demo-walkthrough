/* Creator Studio — Monetization control center.
   One place where a creator chooses WHICH revenue streams are active and configures each.
   The detailed builders (tiers, store) live on their own screens; this is the master switchboard. */
(() => {
const { useState } = React;
const { Icon, CastGlyph, formatNum, STUDIO, gbp, castToGBP,
  StudioCard, StudioPageHead, Pill, SegBar } = window;

const Toggle = ({ on, onClick }) => <span className={`tg ${on ? "on" : ""}`} onClick={onClick} style={{ cursor: "pointer", flex: "0 0 36px" }} />;

/* A monetization stream card: master on/off + inline config + deep link to its builder */
const StreamCard = ({ icon, color, title, sub, on, onToggle, revenue, share, children, manage, onManage }) => (
  <div className="card" style={{ background: "var(--surface)", overflow: "hidden", opacity: on ? 1 : 0.72 }}>
    <div style={{ padding: 18, display: "flex", alignItems: "flex-start", gap: 14 }}>
      <span style={{ width: 44, height: 44, borderRadius: 12, background: on ? color : "var(--surface-3)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", flex: "0 0 44px", transition: "background 0.2s ease" }}><Icon name={icon} size={20} stroke={2.2} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 15.5 }} className="lower">{title}</span>
          {on ? <Pill tone="ok">on</Pill> : <Pill tone="neutral">off</Pill>}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>{sub}</div>
        {revenue != null && on && (
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 7 }} className="mono">
            <span className="tnum" style={{ color: "var(--ink-1)", fontWeight: 700 }}>{formatNum(revenue)}</span> CAST this month{share != null ? ` · ${share}% of revenue` : ""}
          </div>
        )}
      </div>
      <Toggle on={on} onClick={onToggle} />
    </div>
    {on && (children || manage) && (
      <div style={{ borderTop: "1px solid var(--hairline)", padding: "14px 18px" }}>
        {children}
        {manage && (
          <button onClick={onManage} className="btn btn-glass" style={{ marginTop: children ? 12 : 0, padding: "9px 13px", fontSize: 12.5 }}>
            {manage} <Icon name="arrowR" size={13} stroke={2.2} />
          </button>
        )}
      </div>
    )}
  </div>
);

const Chip = ({ children, onRemove }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 11px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--hairline)", fontSize: 12.5, fontWeight: 700 }} className="tnum">
    {children}{onRemove && <button onClick={onRemove} style={{ color: "var(--ink-4)", display: "inline-flex" }}><Icon name="close" size={11} /></button>}
  </span>
);

const MonetizationScreen = ({ setStudioRoute, toast }) => {
  const s = STUDIO;
  const rev = Object.fromEntries(s.REVENUE_SPLIT.map(r => [r.id, r.cast]));
  const pct = (c) => Math.round((c / s.GROSS_MONTH) * 100);

  const [on, setOn] = useState({ memberships: true, tips: true, ppv: true, store: true, gifts: true, goals: false });
  const flip = (k) => setOn(o => ({ ...o, [k]: !o[k] }));

  const [tipAmts, setTipAmts] = useState([50, 100, 250, 500]);
  const [minTip, setMinTip] = useState(20);
  const [tipOn, setTipOn] = useState({ live: true, videos: true, profile: true });
  const [ppv, setPpv] = useState({ price: 60, window: 48 });
  const [goal, setGoal] = useState({ kind: "members", target: 3500, current: s.TOTAL_MEMBERS });

  const activeCount = Object.values(on).filter(Boolean).length;
  const flipTipOn = (k) => setTipOn(t => ({ ...t, [k]: !t[k] }));

  return (
    <div className="page-pad" style={{ maxWidth: 1300, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="monetization"
        sub="choose how you earn. turn each revenue stream on or off, and set how it works for your audience."
        actions={<button onClick={() => setStudioRoute("earnings")} className="btn btn-glass" style={{ padding: "12px 16px" }}><Icon name="wallet" size={14} stroke={2.2} /> earnings</button>} />

      {/* Summary strip */}
      <div className="card" style={{ background: "var(--surface)", padding: 18, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>active revenue streams</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
            <span className="brand-grad-text tnum stat-num" style={{ fontSize: 32 }}>{activeCount}</span>
            <span style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 700 }} className="lower">of 6 turned on</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <SegBar segments={s.REVENUE_SPLIT} total={s.GROSS_MONTH} />
          <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
            {s.REVENUE_SPLIT.map(r => <span key={r.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--ink-3)" }} className="lower"><span className="legdot" style={{ background: r.color }} /> {r.label} · {pct(r.cast)}%</span>)}
          </div>
        </div>
      </div>

      {/* Stream switchboard */}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill,minmax(360px,1fr))" }}>

        {/* Memberships */}
        <StreamCard icon="heart" color="#8b5cf6" title="memberships" sub="recurring monthly support in exchange for perks"
          on={on.memberships} onToggle={() => flip("memberships")} revenue={rev.subs} share={pct(rev.subs)}
          manage="manage tiers & perks" onManage={() => setStudioRoute("memberships")}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {s.TIERS.map(t => <Chip key={t.id}>{t.name} · {formatNum(t.cast)}</Chip>)}
          </div>
        </StreamCard>

        {/* Tips */}
        <StreamCard icon="tip" color="#ec4899" title="tips" sub="one-off support, any time"
          on={on.tips} onToggle={() => flip("tips")} revenue={rev.tips} share={pct(rev.tips)}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>suggested amounts (CAST)</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {tipAmts.map((a, i) => <Chip key={i} onRemove={tipAmts.length > 1 ? () => setTipAmts(tipAmts.filter((_, j) => j !== i)) : undefined}>{a}</Chip>)}
            <button onClick={() => setTipAmts([...tipAmts, 1000])} className="chip" style={{ padding: "6px 11px", fontSize: 12.5 }}><Icon name="plus" size={12} stroke={2.4} /> add</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
            <span style={{ fontSize: 12.5, color: "var(--ink-3)" }} className="lower">minimum tip</span>
            <input className="st-input tnum" type="number" value={minTip} onChange={(e) => setMinTip(+e.target.value)} style={{ width: 90, padding: "8px 10px" }} />
            <span style={{ fontSize: 11, color: "var(--ink-4)" }} className="mono">{gbp(castToGBP(minTip))}</span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-3)", margin: "14px 0 8px" }}>allow tips on</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[["live", "live streams"], ["videos", "videos & clips"], ["profile", "your channel page"]].map(([k, label]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                <span style={{ flex: 1, fontSize: 12.5 }} className="lower">{label}</span>
                <Toggle on={tipOn[k]} onClick={() => flipTipOn(k)} />
              </div>
            ))}
          </div>
        </StreamCard>

        {/* Pay-per-view */}
        <StreamCard icon="film" color="#f97316" title="pay-per-view" sub="sell tickets to streams or rent recordings"
          on={on.ppv} onToggle={() => flip("ppv")} revenue={rev.ppv} share={pct(rev.ppv)}>
          <div className="st-split-even" style={{ gap: 12 }}>
            <div>
              <label className="st-label">default price</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CastGlyph size={15} />
                <input className="st-input tnum" type="number" value={ppv.price} onChange={(e) => setPpv(p => ({ ...p, price: +e.target.value }))} style={{ padding: "8px 10px" }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 4 }} className="mono">{gbp(castToGBP(ppv.price))}</div>
            </div>
            <div>
              <label className="st-label">rental window</label>
              <select className="st-input" value={ppv.window} onChange={(e) => setPpv(p => ({ ...p, window: +e.target.value }))} style={{ padding: "9px 10px" }}>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
                <option value={72}>72 hours</option>
                <option value={0}>buy to keep</option>
              </select>
            </div>
          </div>
          <div className="st-hint" style={{ marginTop: 12 }}>set per video in the <strong>content</strong> editor, or per stream when you go live.</div>
        </StreamCard>

        {/* Store / drops */}
        <StreamCard icon="bag" color="#06b6d4" title="store · drops, courses & merch" sub="sell digital downloads, courses and physical goods"
          on={on.store} onToggle={() => flip("store")} revenue={rev.drops + rev.courses} share={pct(rev.drops + rev.courses)}
          manage="open store" onManage={() => setStudioRoute("store")}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["drops", "ppv vod", "courses", "merch"].map(k => <Chip key={k}>{k}</Chip>)}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 10 }} className="mono">{s.PRODUCTS.filter(p => p.status === "live").length} products live · {formatNum(s.PRODUCTS.reduce((a, p) => a + p.sold, 0))} sold all-time</div>
        </StreamCard>

        {/* Gifted subs */}
        <StreamCard icon="gift" color="#10b981" title="gifted subscriptions" sub="let viewers buy memberships for others"
          on={on.gifts} onToggle={() => flip("gifts")}>
          <div className="st-hint">a great growth driver during live streams — gifted members often stay. counts toward your membership revenue.</div>
        </StreamCard>

        {/* Goals */}
        <StreamCard icon="trend" color="#a855f7" title="goals" sub="show a live progress bar to rally support"
          on={on.goals} onToggle={() => flip("goals")}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <select className="st-input" value={goal.kind} onChange={(e) => setGoal(g => ({ ...g, kind: e.target.value }))} style={{ padding: "9px 10px", flex: 1 }}>
              <option value="members">members goal</option>
              <option value="tips">monthly tips goal</option>
              <option value="subs">new subs this stream</option>
            </select>
            <input className="st-input tnum" type="number" value={goal.target} onChange={(e) => setGoal(g => ({ ...g, target: +e.target.value }))} style={{ width: 110, padding: "9px 10px" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 5 }}>
            <span style={{ color: "var(--ink-3)" }} className="lower">{goal.kind === "members" ? "members" : "progress"}</span>
            <span className="tnum" style={{ fontWeight: 700 }}>{formatNum(goal.current)} / {formatNum(goal.target)}</span>
          </div>
          <div className="meter"><span style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%`, background: "var(--brand-gradient)" }} /></div>
        </StreamCard>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
        <button onClick={() => toast("monetization settings saved")} className="btn btn-grad" style={{ padding: "12px 22px" }}>save changes</button>
      </div>

      <div className="st-hint" style={{ marginTop: 16 }}>technotainment takes a flat {Math.round(s.PLATFORM_RATE * 100)}% across every stream — no per-method surcharge. turning a stream off hides it from your audience immediately; existing members or rentals are never interrupted.</div>
    </div>
  );
};

Object.assign(window, { MonetizationScreen });
})();
