/* Creator Studio — Dashboard (overview) */
(() => {
const { Icon, Avatar, CastGlyph, formatNum, STUDIO, gbp, gbpShort, castToGBP,
  StatCard, StudioCard, StudioPageHead, Pill, AreaSpark, Bars, SegBar } = window;

const ACT_STYLE = {
  tip:  { color: "#ec4899", icon: "tip"  },
  sub:  { color: "#8b5cf6", icon: "heart" },
  gift: { color: "#f97316", icon: "gift" },
  drop: { color: "#06b6d4", icon: "bag"  },
  ppv:  { color: "#10b981", icon: "film" },
};
const ACT_LABEL = { tip: "tip", sub: "new member", gift: "gifted subs", drop: "drop sale", ppv: "ppv rental" };

const DashboardScreen = ({ setStudioRoute, onGoLive, onUpload, onOpenVideo, live, toast }) => {
  const s = STUDIO;
  const netMonth = Math.round(s.GROSS_MONTH * (1 - s.PLATFORM_RATE));

  return (
    <div className="page-pad" style={{ maxWidth: 1500, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title={`good evening, ${s.me.name.split(" ")[0].toLowerCase()}`}
        sub={live ? "you're live right now — night session #13 is running." : "you're offline. last stream ended 12 hours ago."}
        actions={<>
          <button onClick={onGoLive} className={live ? "btn btn-glass" : "btn btn-grad"} style={{ padding: "12px 18px" }}>
            <Icon name="flame" size={15} stroke={2.4} /> {live ? "manage live" : "go live"}
          </button>
          <button onClick={onUpload} className="btn btn-grad-stroke" style={{ padding: "12px 18px" }}>
            <Icon name="plus" size={15} stroke={2.6} /> upload
          </button>
        </>}
      />

      {/* KPI row */}
      <div className="kpi-grid">
        <StatCard label="this month" icon="cast"
          value={formatNum(s.GROSS_MONTH)} unit="CAST gross" delta="+7.4%" deltaUp
          fiat={`net ${gbp(castToGBP(netMonth))} after 12% fee`}
          spark={s.EARN_SERIES.slice(-8)} sparkColor="#8b5cf6" />
        <StatCard label="members" icon="heart"
          value={formatNum(s.TOTAL_MEMBERS)} unit="active" delta="+134" deltaUp
          fiat={`${formatNum(s.MRR_CAST)} CAST mrr`}
          spark={s.MEMBER_SERIES.slice(-8)} sparkColor="#ec4899" />
        <StatCard label="followers" icon="users"
          value={formatNum(s.me.followers)} unit="total" delta="+2.1k" deltaUp
          fiat="1,820 new this month"
          spark={s.FOLLOW_SERIES.slice(-8)} sparkColor="#06b6d4" />
        <StatCard label="watch time" icon="clock"
          value="401k" unit="min · 30d" delta="+9.2%" deltaUp
          fiat="avg 28 min / session"
          spark={s.VIEW_SERIES.slice(-8)} sparkColor="#10b981" />
      </div>

      {/* Main split */}
      <div className="st-split" style={{ marginTop: 16 }}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Revenue chart */}
          <StudioCard
            title="revenue · last 12 months"
            sub="CAST gross, before platform fee"
            action={<button onClick={() => setStudioRoute("analytics")} className="btn btn-glass" style={{ padding: "8px 12px", fontSize: 12 }}>full analytics <Icon name="arrowR" size={13} stroke={2.2} /></button>}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
              <span className="tnum brand-grad-text stat-num" style={{ fontSize: 40 }}>{formatNum(s.GROSS_MONTH)}</span>
              <span style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 700 }} className="lower">CAST · may 2026</span>
              <span style={{ color: "#10b981", fontSize: 13, fontWeight: 800, marginLeft: "auto" }} className="tnum">▲ 7.4% vs apr</span>
            </div>
            <Bars data={s.EARN_SERIES} labels={s.MONTHS} h={190} fmt={(v) => formatNum(v) + " CAST"} />
          </StudioCard>

          {/* Top content */}
          <StudioCard
            title="top content · 30 days"
            action={<button onClick={() => setStudioRoute("content")} className="btn btn-glass" style={{ padding: "8px 12px", fontSize: 12 }}>library <Icon name="arrowR" size={13} stroke={2.2} /></button>}
            pad={false}>
            {s.CONTENT.filter(c => c.status === "published").slice(0, 4).map((c, i) => (
              <div key={c.id} className="st-row" onClick={() => onOpenVideo?.(c)} style={{ gridTemplateColumns: "20px 92px 1fr auto", borderTop: i ? "1px solid var(--hairline)" : "none", cursor: "pointer" }}>
                <span className="mono" style={{ color: "var(--ink-4)", fontSize: 13, fontWeight: 800 }}>{i + 1}</span>
                <div className="thumb" style={{ backgroundImage: `url(${c.thumb})`, aspectRatio: "16/9", borderRadius: 8 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }} className="mono">{formatNum(c.views)} views · {c.watch}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="tnum" style={{ fontSize: 14, fontWeight: 800 }}>{formatNum(c.cast)}</div>
                  <div style={{ fontSize: 10, color: "var(--ink-4)" }} className="lower">CAST earned</div>
                </div>
              </div>
            ))}
          </StudioCard>
        </div>

        {/* RIGHT rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Payout snapshot */}
          <div className="card" style={{ background: "var(--surface)", overflow: "hidden" }}>
            <div className="brand-hairline" />
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>available to pay out</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 10 }}>
                <CastGlyph size={26} />
                <span className="tnum brand-grad-text stat-num" style={{ fontSize: 44 }}>{formatNum(s.PAYOUT.availableCast)}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }} className="mono">= {gbp(castToGBP(s.PAYOUT.availableCast))} · {formatNum(s.PAYOUT.pendingCast)} CAST clearing</div>
              <button onClick={() => setStudioRoute("earnings")} className="btn btn-grad" style={{ width: "100%", marginTop: 14, padding: "12px" }}>
                <Icon name="wallet" size={15} stroke={2.2} /> withdraw to {s.PAYOUT.method.label}
              </button>
              <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 8, textAlign: "center" }} className="lower">auto-payout scheduled {s.PAYOUT.nextDate}</div>
            </div>
          </div>

          {/* Revenue split */}
          <StudioCard title="where it came from" sub="may 2026 · by source">
            <SegBar segments={s.REVENUE_SPLIT} total={s.GROSS_MONTH} />
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
              {s.REVENUE_SPLIT.map(r => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="legdot" style={{ background: r.color }} />
                  <span style={{ flex: 1, fontSize: 12.5, color: "var(--ink-2)" }} className="lower">{r.label}</span>
                  <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700 }}>{formatNum(r.cast)}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)", width: 34, textAlign: "right" }}>{Math.round((r.cast / s.GROSS_MONTH) * 100)}%</span>
                </div>
              ))}
            </div>
          </StudioCard>

          {/* Live activity */}
          <StudioCard
            title="recent activity"
            sub="money in, newest first"
            action={<Pill tone="ok">live</Pill>}
            pad={false}>
            <div style={{ padding: "8px 8px 12px", maxHeight: 320, overflowY: "auto" }}>
              {s.ACTIVITY.map((a, i) => {
                const st = ACT_STYLE[a.kind];
                return (
                  <div key={i} className="act-row">
                    <span className="act-ico" style={{ background: st.color }}><Icon name={st.icon} size={16} stroke={2.2} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{a.who} <span style={{ color: "var(--ink-3)", fontWeight: 500 }} className="lower">· {ACT_LABEL[a.kind]}</span></div>
                      {a.note && <div style={{ fontSize: 11, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.note}</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="tnum" style={{ fontSize: 13, fontWeight: 800, color: "#10b981" }}>+{formatNum(a.cast)}</div>
                      <div style={{ fontSize: 10, color: "var(--ink-4)" }}>{a.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </StudioCard>

          {/* Upcoming schedule */}
          <StudioCard
            title="scheduled"
            action={<button onClick={() => setStudioRoute("content")} className="btn btn-glass" style={{ padding: "7px 11px", fontSize: 12 }}>edit</button>}
            pad={false}>
            {s.SCHEDULE.map((sc, i) => (
              <div key={sc.id} className="st-row" style={{ gridTemplateColumns: "1fr auto", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sc.title}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }} className="mono">{sc.when} · {formatNum(sc.reminders)} reminders set</div>
                </div>
                <Pill tone={sc.visibility === "public" ? "neutral" : sc.visibility === "members" ? "info" : "warn"}>{sc.visibility}</Pill>
              </div>
            ))}
          </StudioCard>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { DashboardScreen });
})();
