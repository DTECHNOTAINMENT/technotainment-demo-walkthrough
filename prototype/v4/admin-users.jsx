/* Admin — Users + Creators + applications/KYC */
(() => {
const { useState } = React;
const { Icon, Avatar, formatNum, ADMIN, gbp, castToGBP,
  StatCard, StudioCard, StudioPageHead, Pill, Seg } = window;

const KYC_TONE = { verified: "ok", pending: "warn", failed: "live", "—": "neutral" };
const STATUS_TONE = { active: "ok", suspended: "live", pending: "warn", review: "warn", "payout-hold": "warn" };
const RISK_TONE = { low: "ok", medium: "warn", high: "live" };

/* ===================== USERS ===================== */
const AdminUsers = ({ toast }) => {
  const a = ADMIN;
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const rows = a.USER_ROWS.filter(u =>
    (filter === "all" || u.status === filter) &&
    (!q || u.handle.includes(q) || u.email.includes(q) || u.id.includes(q)));

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead eyebrow="operations" title="users"
        sub="every account on technotainment. search, inspect balances, manage status and KYC."
        actions={<button onClick={() => toast("export users · CSV (consent-scoped)")} className="btn btn-glass" style={{ padding: "12px 16px" }}><Icon name="download" size={14} stroke={2.4} /> export</button>} />

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <StatCard label="total users" icon="users" value={formatNum(a.PLATFORM.users)} unit="accounts" delta="+34k" deltaUp fiat="30-day net" spark={a.USERS.slice(-8)} sparkColor="#06b6d4" />
        <StatCard label="kyc verified" icon="check" value="94.2%" unit="of payers" delta="+0.6%" deltaUp fiat="214 pending" spark={[91,92,92,93,93,94,94,94]} sparkColor="#10b981" />
        <StatCard label="suspended" icon="lock" value="1,204" unit="accounts" delta="+82" deltaUp={false} fiat="fraud / abuse" spark={[1.0,1.05,1.1,1.12,1.15,1.18,1.19,1.2]} sparkColor="#ef4444" />
        <StatCard label="avg. balance" icon="cast" value="3,180" unit="CAST" delta="+4%" deltaUp fiat={gbp(castToGBP(3180))} spark={[2.8,2.9,3.0,3.0,3.1,3.1,3.15,3.18]} sparkColor="#8b5cf6" />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, margin: "18px 0 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", background: "var(--surface-2)", border: "1px solid var(--hairline)", borderRadius: 10, minWidth: 260 }}>
          <Icon name="search" size={15} stroke={2} style={{ color: "var(--ink-3)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="search handle, email or ID…" style={{ flex: 1, border: "none", outline: "none", background: "none", fontSize: 13, color: "var(--ink-1)" }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "active", "pending", "suspended"].map(f => (
            <button key={f} className={`chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)} style={{ padding: "7px 13px", fontSize: 12 }}><span className="lower">{f}</span></button>
          ))}
        </div>
      </div>

      <StudioCard pad={false}>
        <div className="st-row head" style={{ gridTemplateColumns: "1.4fr 90px 90px 110px 100px 40px" }}>
          <span>user</span><span>kyc</span><span>status</span><span style={{ textAlign: "right" }}>balance</span><span style={{ textAlign: "right" }}>spent</span><span />
        </div>
        {rows.map(u => (
          <div key={u.id} className="st-row" style={{ gridTemplateColumns: "1.4fr 90px 90px 110px 100px 40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "var(--ink-2)", flex: "0 0 36px" }}>{u.handle.slice(1, 3).toUpperCase()}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>{u.handle}{u.flag && <Pill tone="live">{u.flag}</Pill>}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{u.id} · {u.email} · {u.joined}</div>
              </div>
            </div>
            <div><Pill tone={KYC_TONE[u.kyc]}>{u.kyc}</Pill></div>
            <div><Pill tone={STATUS_TONE[u.status]}>{u.status}</Pill></div>
            <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>{formatNum(u.balance)}</div>
            <div className="tnum" style={{ textAlign: "right", fontSize: 13, color: "var(--ink-2)" }}>{formatNum(u.spent)}</div>
            <button onClick={() => toast(`${u.handle} · view · message · ${u.status === "suspended" ? "reinstate" : "suspend"}`)} style={{ color: "var(--ink-3)", display: "flex", justifyContent: "center" }}><Icon name="more" size={18} /></button>
          </div>
        ))}
      </StudioCard>
    </div>
  );
};

/* ===================== CREATORS ===================== */
const AdminCreators = ({ toast }) => {
  const a = ADMIN;
  const [tab, setTab] = useState("roster");

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead eyebrow="operations" title="creators"
        sub="the people earning on technotainment — their status, take-rate, payouts and applications."
        actions={<Seg items={[{ id: "roster", label: "roster" }, { id: "apps", label: `applications · ${a.APPLICATIONS.length}` }]} value={tab} onChange={setTab} />} />

      {tab === "roster" && (
        <>
          <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
            <StatCard label="active creators" icon="cast" value={formatNum(a.PLATFORM.creators)} unit="earning" delta="+240" deltaUp fiat="this month" spark={[8.9,9.1,9.3,9.4,9.5,9.6,9.7,9.84]} sparkColor="#8b5cf6" />
            <StatCard label="paid out · mo" icon="wallet" value="£21k" unit="to creators" delta="+9%" deltaUp fiat={`${formatNum(a.PAYOUTS[a.PAYOUTS.length-1])} CAST`} spark={a.PAYOUTS.slice(-8)} sparkColor="#10b981" />
            <StatCard label="in review" icon="eye" value="1" unit="creator" fiat="payout-hold: 1" spark={[2,1,2,1,1,1,1,1]} sparkColor="#f59e0b" />
            <StatCard label="avg. take rate" icon="trend" value="11.8%" unit="blended" fiat="2 negotiated" spark={[12,12,12,11.9,11.9,11.8,11.8,11.8]} sparkColor="#06b6d4" />
          </div>

          <StudioCard pad={false} style={{ marginTop: 16 }}>
            <div className="st-row head" style={{ gridTemplateColumns: "1.4fr 110px 90px 100px 90px 40px" }}>
              <span>creator</span><span>status</span><span style={{ textAlign: "right" }}>members</span><span style={{ textAlign: "right" }}>mrr</span><span style={{ textAlign: "right" }}>take</span><span />
            </div>
            {a.CREATOR_ROWS.map(c => (
              <div key={c.id} className="st-row" style={{ gridTemplateColumns: "1.4fr 110px 90px 100px 90px 40px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                  <Avatar creator={c.creator} size={36} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.creator.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{c.id} · {c.creator.handle}</div>
                  </div>
                </div>
                <div><Pill tone={STATUS_TONE[c.status]}>{c.status}</Pill></div>
                <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>{formatNum(c.members)}</div>
                <div className="tnum" style={{ textAlign: "right", fontSize: 13 }}>{formatNum(c.mrrCast)}</div>
                <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700, color: c.take < 12 ? "#8b5cf6" : "var(--ink-1)" }}>{c.take}%</div>
                <button onClick={() => toast(`${c.creator.name} · adjust take · payouts · suspend`)} style={{ color: "var(--ink-3)", display: "flex", justifyContent: "center" }}><Icon name="more" size={18} /></button>
              </div>
            ))}
          </StudioCard>
        </>
      )}

      {tab === "apps" && (
        <StudioCard title="creator applications" sub="review identity & risk, then approve or decline" pad={false} style={{ marginTop: 4 }}>
          {a.APPLICATIONS.map((ap, i) => (
            <div key={ap.id} className="st-row" style={{ gridTemplateColumns: "1fr 110px auto", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>{ap.handle} <Pill tone={RISK_TONE[ap.risk]}>{ap.risk} risk</Pill></div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }} className="mono">{ap.id} · {ap.cat} · {formatNum(ap.followers)} followers · {ap.when}</div>
              </div>
              <button onClick={() => toast(`${ap.handle} · KYC + content review`)} className="btn btn-glass" style={{ padding: "8px 12px", fontSize: 12 }}>review</button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => toast(`${ap.handle} · declined`)} className="btn btn-glass" style={{ padding: "8px 12px", fontSize: 12, color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}>decline</button>
                <button onClick={() => toast(`${ap.handle} · approved · channel created`, { icon: true })} className="btn btn-grad" style={{ padding: "8px 14px", fontSize: 12 }}>approve</button>
              </div>
            </div>
          ))}
        </StudioCard>
      )}
    </div>
  );
};

Object.assign(window, { AdminUsers, AdminCreators });
})();
