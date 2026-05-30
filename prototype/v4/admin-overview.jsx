/* Admin — platform overview */
(() => {
const { Icon, formatNum, ADMIN, gbp, gbpShort, castToGBP,
  StatCard, StudioCard, StudioPageHead, Pill, Bars, AreaSpark, SegBar } = window;

const AdminOverview = ({ setRoute, toast }) => {
  const a = ADMIN, p = a.PLATFORM;
  return (
    <div className="page-pad" style={{ maxWidth: 1500, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="technotainment · operations"
        title="platform overview"
        sub="everything moving across technotainment right now — money, people, content and system health."
        actions={<>
          <span className="onair" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>all systems · {p.uptime}%</span>
          <button onClick={() => toast("exporting platform report…")} className="btn btn-glass" style={{ padding: "12px 16px" }}><Icon name="download" size={14} stroke={2.4} /> report</button>
        </>} />

      <div className="kpi-grid">
        <StatCard label="gmv · this month" icon="cast" value={gbpShort(castToGBP(p.gmvMonth))} unit="processed" delta="+9.9%" deltaUp fiat={`${formatNum(p.gmvMonth)} CAST`} spark={a.GMV.slice(-8)} sparkColor="#8b5cf6" />
        <StatCard label="platform revenue" icon="trend" value={gbpShort(castToGBP(p.revenueMonth))} unit="net take" delta="+9.9%" deltaUp fiat="12% blended rate" spark={a.REVENUE.slice(-8)} sparkColor="#10b981" />
        <StatCard label="users" icon="users" value={formatNum(p.users)} unit="total" delta="+34k" deltaUp fiat={`${formatNum(p.creators)} creators`} spark={a.USERS.slice(-8)} sparkColor="#06b6d4" />
        <StatCard label="live now" icon="flame" value={formatNum(p.liveNow)} unit="streams" delta="peak 1.6k" deltaUp fiat="3.4k avg concurrent" spark={[0.9,1.0,1.1,1.0,1.2,1.25,1.2,1.28]} sparkColor="#ef4444" />
      </div>

      <div className="st-split" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard
            title="gross merchandise value · 12 months"
            sub="all CAST flowing through the platform"
            action={<button onClick={() => setRoute("finance")} className="btn btn-glass" style={{ padding: "8px 12px", fontSize: 12 }}>finance <Icon name="arrowR" size={13} stroke={2.2} /></button>}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
              <span className="tnum brand-grad-text stat-num" style={{ fontSize: 38 }}>{gbpShort(castToGBP(p.gmvMonth))}</span>
              <span style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 700 }} className="lower">may 2026</span>
              <span style={{ color: "#10b981", fontSize: 13, fontWeight: 800, marginLeft: "auto" }} className="tnum">▲ 9.9% MoM</span>
            </div>
            <Bars data={a.GMV} labels={a.months} h={180} fmt={(v) => formatNum(v) + " CAST"} />
          </StudioCard>

          {/* attention queues */}
          <div className="st-split-even">
            <StudioCard title="needs attention" pad={false}>
              {[
                { label: "open reports", n: p.flaggedOpen, tone: "high", route: "moderation", icon: "flag" },
                { label: "creator applications", n: a.APPLICATIONS.length, tone: "info", route: "creators", icon: "sparkle" },
                { label: "open disputes", n: p.disputesOpen, tone: "warn", route: "finance", icon: "wallet" },
                { label: "kyc pending", n: 214, tone: "neutral", route: "users", icon: "user" },
              ].map((q, i) => (
                <button key={q.label} onClick={() => setRoute(q.route)} className="st-row" style={{ gridTemplateColumns: "34px 1fr auto", width: "100%", textAlign: "left", borderTop: i ? "1px solid var(--hairline)" : "none", cursor: "pointer" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink-2)" }}><Icon name={q.icon} size={16} stroke={2} /></span>
                  <span style={{ fontSize: 13, fontWeight: 600 }} className="lower">{q.label}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><span className="tnum" style={{ fontWeight: 800, fontSize: 15 }}>{formatNum(q.n)}</span><Icon name="chevR" size={15} stroke={2.2} style={{ color: "var(--ink-4)" }} /></span>
                </button>
              ))}
            </StudioCard>

            <StudioCard title="payment mix" sub="inbound · this month">
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {a.PAY_MIX.map(m => (
                  <div key={m.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 12.5, color: "var(--ink-2)" }} className="lower">{m.label}</span><span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{m.pct}%</span></div>
                    <div className="meter"><span style={{ width: `${m.pct * 2.6}%`, background: "var(--brand-gradient)" }} /></div>
                  </div>
                ))}
              </div>
            </StudioCard>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* CAST economics */}
          <div className="card" style={{ background: "var(--surface)", overflow: "hidden" }}>
            <div className="brand-hairline" />
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>CAST in circulation</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                <span className="tnum brand-grad-text stat-num" style={{ fontSize: 38 }}>{formatNum(p.castInCirculation)}</span>
                <span style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 700 }} className="lower">CAST</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }} className="mono">float liability ≈ {gbp(castToGBP(p.castInCirculation))}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
                <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-4)" }}>pending payouts</div>
                  <div className="tnum stat-num" style={{ fontSize: 20, marginTop: 4 }}>{formatNum(p.pendingPayouts)}</div>
                </div>
                <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-4)" }}>fx rate</div>
                  <div className="tnum stat-num" style={{ fontSize: 20, marginTop: 4 }}>100:£1</div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue lines */}
          <StudioCard title="revenue by line" sub="may 2026">
            <SegBar segments={a.REV_LINES} total={a.REV_LINES.reduce((s, r) => s + r.cast, 0)} />
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
              {a.REV_LINES.map(r => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="legdot" style={{ background: r.color }} />
                  <span style={{ flex: 1, fontSize: 12.5, color: "var(--ink-2)" }} className="lower">{r.label}</span>
                  <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700 }}>{gbpShort(castToGBP(r.cast))}</span>
                </div>
              ))}
            </div>
          </StudioCard>

          {/* Recent admin activity */}
          <StudioCard title="audit log" sub="recent operator actions"
            action={<button onClick={() => setRoute("settings")} className="btn btn-glass" style={{ padding: "7px 11px", fontSize: 12 }}>all</button>}
            pad={false}>
            <div style={{ padding: "8px 8px 12px" }}>
              {a.AUDIT.slice(0, 5).map((e, i) => (
                <div key={i} className="act-row">
                  <span className="act-ico" style={{ background: e.who === "system" ? "var(--surface-3)" : "var(--brand-gradient)", color: e.who === "system" ? "var(--ink-2)" : "white" }}><Icon name={e.who === "system" ? "settings" : "user"} size={15} stroke={2} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{e.action}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{e.who} · {e.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </StudioCard>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { AdminOverview });
})();
