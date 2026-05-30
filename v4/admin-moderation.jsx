/* Admin — Trust & Safety / moderation */
(() => {
const { useState } = React;
const { Icon, formatNum, ADMIN, StatCard, StudioCard, StudioPageHead, Pill, Seg } = window;

const SEV_TONE = { high: "live", medium: "warn", low: "neutral" };
const TYPE_ICON = { stream: "flame", product: "bag", user: "user", vod: "film", clip: "play" };

const AdminModeration = ({ toast }) => {
  const a = ADMIN;
  const [tab, setTab] = useState("queue");
  const [sev, setSev] = useState("all");
  const reports = a.REPORTS.filter(r => sev === "all" || r.severity === sev);

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead eyebrow="trust & safety" title="moderation"
        sub="reports, live-stream monitoring and enforcement — keep the platform safe and compliant."
        actions={<Seg items={[{ id: "queue", label: "report queue" }, { id: "live", label: "live monitor" }]} value={tab} onChange={setTab} />} />

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <StatCard label="open reports" icon="flag" value={a.PLATFORM.flaggedOpen} unit="to review" delta="+8 today" deltaUp={false} fiat="14 high severity" spark={[28,31,29,34,32,36,35,37]} sparkColor="#ef4444" />
        <StatCard label="auto-flagged" icon="settings" value="312" unit="last 24h" delta="AI mod" deltaUp fiat="86% precision" spark={[210,240,260,280,290,300,308,312]} sparkColor="#8b5cf6" />
        <StatCard label="actions taken" icon="check" value="1,840" unit="this month" delta="+12%" deltaUp fiat="strikes + removals" spark={[1.4,1.5,1.6,1.65,1.7,1.78,1.8,1.84]} sparkColor="#10b981" />
        <StatCard label="median response" icon="clock" value="8m" unit="to high sev" delta="−2m" deltaUp fiat="SLA: 15m" spark={[12,11,10,10,9,9,8,8]} sparkColor="#06b6d4" />
      </div>

      {tab === "queue" && (
        <>
          <div style={{ display: "flex", gap: 6, margin: "18px 0 14px" }}>
            {["all", "high", "medium", "low"].map(f => (
              <button key={f} className={`chip ${sev === f ? "active" : ""}`} onClick={() => setSev(f)} style={{ padding: "7px 13px", fontSize: 12 }}><span className="lower">{f === "all" ? "all severities" : f}</span></button>
            ))}
          </div>
          <StudioCard pad={false}>
            <div className="st-row head" style={{ gridTemplateColumns: "40px 1.5fr 110px 80px 90px auto" }}>
              <span /><span>target · reason</span><span>severity</span><span style={{ textAlign: "right" }}>reports</span><span>status</span><span style={{ textAlign: "right" }}>action</span>
            </div>
            {reports.map(r => (
              <div key={r.id} className="st-row" style={{ gridTemplateColumns: "40px 1.5fr 110px 80px 90px auto" }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)" }}><Icon name={TYPE_ICON[r.type] || "flag"} size={15} stroke={2} /></span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.target}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{r.id} · {r.reason} · {r.when}</div>
                </div>
                <div><Pill tone={SEV_TONE[r.severity]}>{r.severity}</Pill></div>
                <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 800 }}>{r.reports}</div>
                <div><Pill tone={r.status === "open" ? "warn" : "info"}>{r.status}</Pill></div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button onClick={() => toast(`${r.id} · dismissed`)} className="btn btn-glass" style={{ padding: "6px 10px", fontSize: 11.5 }}>dismiss</button>
                  <button onClick={() => toast(`${r.target} · strike issued`, { icon: true })} className="btn btn-glass" style={{ padding: "6px 10px", fontSize: 11.5, color: "#f59e0b", borderColor: "rgba(245,158,11,0.3)" }}>strike</button>
                  <button onClick={() => toast(`${r.target} · removed`)} className="btn btn-grad" style={{ padding: "6px 12px", fontSize: 11.5 }}>action</button>
                </div>
              </div>
            ))}
          </StudioCard>
        </>
      )}

      {tab === "live" && (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", marginTop: 18 }}>
          {ADMIN.CREATOR_ROWS.slice(0, 6).map((c, i) => (
            <div key={c.id} className="card" style={{ background: "var(--surface)", overflow: "hidden" }}>
              <div className="stream-preview" style={{ aspectRatio: "16/9", borderRadius: 0 }}>
                <div className="bars">{Array.from({ length: 9 }).map((_, j) => <span key={j} style={{ animationDelay: `${j * 0.1}s`, height: `${20 + (j % 4) * 16}%` }} />)}</div>
                <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
                  <span className="onair" style={{ padding: "4px 9px 4px 8px", fontSize: 10 }}>live</span>
                  {i === 2 && <Pill tone="live">flagged</Pill>}
                </div>
                <span style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.6)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800, backdropFilter: "blur(4px)" }} className="tnum">{formatNum(c.members * 4)} watching</span>
              </div>
              <div style={{ padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.creator.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">{c.creator.category}</div>
                </div>
                <button onClick={() => toast(`${c.creator.name} · join / cut stream`)} className="btn btn-glass" style={{ padding: "7px 10px", fontSize: 11.5 }}>watch</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { AdminModeration });
})();
