/* Creator Studio — Audience + Memberships (tier manager) */
(() => {
const { useState } = React;
const { Icon, Avatar, CastGlyph, formatNum, STUDIO, gbp, castToGBP,
  StatCard, StudioCard, StudioPageHead, Pill, Seg, AreaSpark, Bars, SegBar } = window;

/* ====================== AUDIENCE ====================== */
const TIER_DOT = { "listener": "#06b6d4", "patch archive": "#8b5cf6", "sound design lab": "#ec4899" };

const AudienceScreen = ({ toast }) => {
  const s = STUDIO;
  const [roster, setRoster] = useState("top");
  const list = [...s.MEMBER_ROSTER].sort((a, b) => roster === "top" ? b.cast - a.cast : 0);

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="audience"
        sub="who's watching, who's paying, and how your community is growing — within the consent each person granted you."
        actions={<button onClick={() => toast("export audience CSV · respects consent")} className="btn btn-glass" style={{ padding: "12px 16px" }}><Icon name="download" size={14} stroke={2.4} /> export</button>} />

      <div className="kpi-grid">
        <StatCard label="followers" icon="users" value={formatNum(s.me.followers)} unit="total" delta="+1.8k" deltaUp fiat="30-day growth" spark={s.FOLLOW_SERIES.slice(-8)} sparkColor="#06b6d4" />
        <StatCard label="members" icon="heart" value={formatNum(s.TOTAL_MEMBERS)} unit="paying" delta="+134" deltaUp fiat="4.1% conversion" spark={s.MEMBER_SERIES.slice(-8)} sparkColor="#ec4899" />
        <StatCard label="mrr" icon="cast" value={formatNum(s.MRR_CAST)} unit="CAST/mo" delta="+6.2%" deltaUp fiat={gbp(castToGBP(s.MRR_CAST)) + " / mo"} spark={s.MEMBER_SERIES.slice(-8)} sparkColor="#8b5cf6" />
        <StatCard label="churn" icon="trend" value="2.3%" unit="monthly" delta="−0.4%" deltaUp={false} fiat="74 cancellations" spark={[3.1, 2.9, 3.0, 2.7, 2.6, 2.5, 2.4, 2.3]} sparkColor="#10b981" />
      </div>

      <div className="st-split" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="member growth · 12 months" sub="net paying members">
            <AreaSpark data={s.MEMBER_SERIES} h={200} stroke="#ec4899" fill="rgba(236,72,153,0.2)" />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {s.MONTHS.filter((_, i) => i % 2 === 0).map(m => <span key={m} className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>{m}</span>)}
            </div>
          </StudioCard>

          <StudioCard
            title="members"
            sub={`${formatNum(s.TOTAL_MEMBERS)} paying · top supporters first`}
            action={<Seg items={[{ id: "top", label: "top" }, { id: "recent", label: "recent" }]} value={roster} onChange={setRoster} />}
            pad={false}>
            <div className="st-row head" style={{ gridTemplateColumns: "1fr 150px 80px 110px" }}>
              <span>member</span><span>tier</span><span style={{ textAlign: "right" }}>since</span><span style={{ textAlign: "right" }}>lifetime</span>
            </div>
            {list.map((m, i) => (
              <div key={i} className="st-row" style={{ gridTemplateColumns: "1fr 150px 80px 110px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "var(--ink-2)" }}>{m.handle.slice(1, 3).toUpperCase()}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{m.handle}{m.top && <span style={{ marginLeft: 6 }}><Icon name="sparkle" size={12} style={{ color: "#f59e0b", verticalAlign: -1 }} /></span>}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--ink-2)" }} className="lower"><span className="legdot" style={{ background: TIER_DOT[m.tier], borderRadius: "50%" }} /> {m.tier}</div>
                <div style={{ textAlign: "right", fontSize: 12, color: "var(--ink-3)" }} className="lower">{m.since}</div>
                <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 800 }}>{formatNum(m.cast)}</div>
              </div>
            ))}
          </StudioCard>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="members by tier">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {s.TIERS.map(t => (
                <div key={t.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }} className="lower">{t.name}</span>
                    <span className="tnum" style={{ fontSize: 13, fontWeight: 800 }}>{formatNum(t.members)}</span>
                  </div>
                  <div className="meter"><span style={{ width: `${(t.members / s.TOTAL_MEMBERS) * 100}%`, background: t.color }} /></div>
                </div>
              ))}
            </div>
          </StudioCard>

          <StudioCard title="where they watch" sub="top surfaces · 30 days">
            {[["microcast page", 46], ["live stream", 31], ["small rooms metacast", 14], ["search & explore", 9]].map(([k, v]) => (
              <div key={k} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><span style={{ fontSize: 12.5, color: "var(--ink-2)" }} className="lower">{k}</span><span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{v}%</span></div>
                <div className="meter"><span style={{ width: `${v}%`, background: "var(--brand-gradient)" }} /></div>
              </div>
            ))}
          </StudioCard>

          <div className="st-hint">audience data here is aggregated and consent-scoped. you only ever see what each viewer allowed in their privacy settings — and their copy is deleted within 7 days of withdrawal.</div>
        </div>
      </div>
    </div>
  );
};

/* ====================== MEMBERSHIPS / TIERS ====================== */
const MembershipsScreen = ({ toast }) => {
  const s = STUDIO;
  const [tiers, setTiers] = useState(s.TIERS);
  const setPrice = (id, cast) => setTiers(ts => ts.map(t => t.id === id ? { ...t, cast: Math.max(0, cast) } : t));

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="memberships"
        sub="design your tiers, set monthly CAST pricing, and decide what each tier unlocks."
        actions={<button onClick={() => toast("new tier · drag to reorder")} className="btn btn-grad" style={{ padding: "12px 18px" }}><Icon name="plus" size={15} stroke={2.6} /> new tier</button>} />

      {/* MRR strip */}
      <div className="card" style={{ background: "var(--surface)", padding: 18, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>monthly recurring revenue</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
            <span className="brand-grad-text tnum stat-num" style={{ fontSize: 34 }}>{formatNum(s.MRR_CAST)}</span>
            <span style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 700 }} className="lower">CAST / mo · {gbp(castToGBP(s.MRR_CAST))}</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <SegBar segments={tiers.map(t => ({ id: t.id, color: t.color, cast: t.members * t.cast, label: t.name }))} total={tiers.reduce((a, t) => a + t.members * t.cast, 0)} />
          <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
            {tiers.map(t => <span key={t.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--ink-3)" }} className="lower"><span className="legdot" style={{ background: t.color }} /> {t.name}</span>)}
          </div>
        </div>
      </div>

      {/* Tier editors */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
        {tiers.map(t => (
          <div key={t.id} className={`tier-edit ${t.popular ? "popular" : ""}`}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15 }} className="lower"><span className="legdot" style={{ background: t.color, borderRadius: "50%", width: 11, height: 11 }} /> {t.name}</span>
                {t.popular && <Pill tone="info">most popular</Pill>}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
                <CastGlyph size={18} />
                <input className="st-input tnum" type="number" value={t.cast} onChange={(e) => setPrice(t.id, +e.target.value)} style={{ width: 110, fontSize: 22, fontWeight: 800, padding: "6px 10px" }} />
                <span style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 700 }} className="lower">CAST/mo</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 6 }} className="mono">{gbp(castToGBP(t.cast))}/mo · {formatNum(t.members)} members · {formatNum(t.members * t.cast)} CAST mrr</div>
            </div>
            <div style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 10 }}>perks</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {t.perks.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12.5, color: "var(--ink-2)" }}>
                    <Icon name="check" size={14} stroke={2.6} style={{ color: t.color, flex: "0 0 14px", marginTop: 2 }} /> <span>{p}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => toast(`${t.name} · add perk`)} style={{ marginTop: 12, fontSize: 12, color: "var(--ink-3)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="plus" size={13} stroke={2.4} /> add perk</button>
            </div>
            <div style={{ padding: "12px 18px", borderTop: "1px solid var(--hairline)", display: "flex", gap: 8 }}>
              <button onClick={() => toast(`${t.name} · edit`)} className="btn btn-glass" style={{ flex: 1, padding: "9px", fontSize: 12 }}>edit</button>
              <button onClick={() => toast(`${t.name} · saved`)} className="btn btn-grad-stroke" style={{ flex: 1, padding: "9px", fontSize: 12 }}>save</button>
            </div>
          </div>
        ))}
      </div>

      <div className="st-hint" style={{ marginTop: 16 }}>changing a price never affects existing members — current subscribers keep their rate until they cancel. new pricing applies to new joins only.</div>
    </div>
  );
};

Object.assign(window, { AudienceScreen, MembershipsScreen });
})();
