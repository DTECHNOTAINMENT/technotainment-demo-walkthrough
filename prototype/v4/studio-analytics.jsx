/* Creator Studio — Analytics */
(() => {
const { useState } = React;
const { Icon, formatNum, STUDIO, gbp, castToGBP, gbpShort,
  StatCard, StudioCard, StudioPageHead, Seg, AreaSpark, Bars, SegBar } = window;

const AnalyticsScreen = ({ toast }) => {
  const s = STUDIO;
  const [range, setRange] = useState("12m");
  const slice = range === "30d" ? -1 : range === "3m" ? -3 : range === "6m" ? -6 : -12;
  const earn = s.EARN_SERIES.slice(slice);
  const views = s.VIEW_SERIES.slice(slice);
  const months = s.MONTHS.slice(slice);

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="analytics"
        sub="revenue, reach and retention. everything you need to decide what to make next."
        actions={<>
          <Seg items={[{ id: "30d", label: "30d" }, { id: "3m", label: "3m" }, { id: "6m", label: "6m" }, { id: "12m", label: "12m" }]} value={range} onChange={setRange} />
          <button onClick={() => toast("analytics export · CSV")} className="btn btn-glass" style={{ padding: "10px 14px" }}><Icon name="download" size={14} stroke={2.4} /></button>
        </>} />

      <div className="kpi-grid">
        <StatCard label="revenue" icon="cast" value={formatNum(earn.reduce((a, v) => a + v, 0))} unit="CAST" delta="+7.4%" deltaUp fiat={gbpShort(castToGBP(earn.reduce((a, v) => a + v, 0)))} spark={earn} />
        <StatCard label="minutes watched" icon="eye" value={formatNum(views.reduce((a, v) => a + v, 0))} unit="min" delta="+9.2%" deltaUp fiat="avg 28 min / view" spark={views} sparkColor="#06b6d4" />
        <StatCard label="unique viewers" icon="users" value="184k" unit="reach" delta="+5.1%" deltaUp fiat="68% returning" spark={[120, 132, 145, 151, 160, 168, 176, 184]} sparkColor="#10b981" />
        <StatCard label="avg. concurrent" icon="flame" value="3.4k" unit="live" delta="+11%" deltaUp fiat="peak 8.9k" spark={[2.1, 2.4, 2.6, 2.9, 3.0, 3.2, 3.3, 3.4]} sparkColor="#ef4444" />
      </div>

      {/* Revenue + views charts */}
      <div className="st-split-even" style={{ marginTop: 16 }}>
        <StudioCard title="revenue" sub="CAST gross by month">
          <Bars data={earn} labels={months} h={190} color="var(--brand-gradient)" fmt={(v) => formatNum(v) + " CAST"} />
        </StudioCard>
        <StudioCard title="minutes watched" sub="all surfaces">
          <AreaSpark data={views} h={190} stroke="#06b6d4" fill="rgba(6,182,212,0.2)" />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {months.filter((_, i) => i % Math.ceil(months.length / 6) === 0).map(m => <span key={m} className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>{m}</span>)}
          </div>
        </StudioCard>
      </div>

      <div className="st-split" style={{ marginTop: 16 }}>
        {/* LEFT — top content + retention */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="top performing content" sub="by CAST earned · 30 days" pad={false}>
            <div className="st-row head" style={{ gridTemplateColumns: "1fr 90px 90px 110px" }}>
              <span>title</span><span style={{ textAlign: "right" }}>views</span><span style={{ textAlign: "right" }}>avg %</span><span style={{ textAlign: "right" }}>CAST</span>
            </div>
            {s.CONTENT.filter(c => c.status === "published").map((c, i) => (
              <div key={c.id} className="st-row" style={{ gridTemplateColumns: "1fr 90px 90px 110px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span className="mono" style={{ color: "var(--ink-4)", fontSize: 12, fontWeight: 800, width: 14 }}>{i + 1}</span>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
                </div>
                <div className="tnum" style={{ textAlign: "right", fontSize: 12.5 }}>{formatNum(c.views)}</div>
                <div className="tnum" style={{ textAlign: "right", fontSize: 12.5, color: "var(--ink-3)" }}>{[68, 54, 72, 41][i] || 50}%</div>
                <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 800 }}>{formatNum(c.cast)}</div>
              </div>
            ))}
          </StudioCard>

          <StudioCard title="audience retention" sub="avg. % watched across last stream">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120, marginBottom: 8 }}>
              {[100, 96, 92, 88, 85, 83, 80, 78, 76, 74, 71, 69, 67, 70, 66, 63, 61, 58, 55, 52].map((v, i) => (
                <div key={i} style={{ flex: 1, height: `${v}%`, background: i === 12 ? "var(--brand-gradient)" : "var(--surface-3)", borderRadius: "3px 3px 0 0" }} title={`${v}%`} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--ink-4)" }} className="mono"><span>0:00</span><span>spike at 1:02 · the bass drop</span><span>2:03</span></div>
          </StudioCard>
        </div>

        {/* RIGHT — sources + revenue split + demographics */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="revenue by source" sub="this month">
            <SegBar segments={s.REVENUE_SPLIT} total={s.GROSS_MONTH} />
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
              {s.REVENUE_SPLIT.map(r => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="legdot" style={{ background: r.color }} />
                  <span style={{ flex: 1, fontSize: 12.5, color: "var(--ink-2)" }} className="lower">{r.label}</span>
                  <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700 }}>{formatNum(r.cast)}</span>
                </div>
              ))}
            </div>
          </StudioCard>

          <StudioCard title="traffic sources">
            {[["microcast page", 46], ["live + notifications", 28], ["small rooms metacast", 14], ["search & explore", 8], ["external links", 4]].map(([k, v]) => (
              <div key={k} style={{ marginBottom: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><span style={{ fontSize: 12.5, color: "var(--ink-2)" }} className="lower">{k}</span><span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{v}%</span></div>
                <div className="meter"><span style={{ width: `${v}%`, background: "var(--brand-gradient)" }} /></div>
              </div>
            ))}
          </StudioCard>

          <StudioCard title="top regions">
            {[["united kingdom", 38], ["germany", 19], ["united states", 14], ["france", 9], ["rest of world", 20]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--hairline)" }}>
                <span style={{ fontSize: 12.5, color: "var(--ink-2)" }} className="lower">{k}</span>
                <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700 }}>{v}%</span>
              </div>
            ))}
          </StudioCard>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { AnalyticsScreen });
})();
