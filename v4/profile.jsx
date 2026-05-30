/* v2 Profile & Consent */
(() => {
const { useState } = React;
const { Icon, Avatar, CastGlyph, formatNum, FOLLOWED, MEMBERSHIPS } = window;

const CONSENT_KEYS = [
  { id: "watch_history",   label: "watch history",   desc: "what you watched, when, for how long" },
  { id: "chat_messages",   label: "chat messages",   desc: "your messages in their live rooms" },
  { id: "tips_purchases",  label: "tips & purchases",desc: "what you spent CAST on (required for receipts)", required: true },
  { id: "marketing_email", label: "marketing email", desc: "creator can email you about drops, shows, courses" },
  { id: "shared_metacast", label: "shared metacast", desc: "creator sees you inside metacasts that host them" },
];

const ProfileScreen = ({ onOpenMicroCast, onOpenWallet, toast, setRoute, memberships, onCancelSub, onSignOut, onOpenStudio, isCreator, onOpenAdmin }) => {
  const me = { name: "Alex Maren", handle: "@alex.m", brand: "#0a0a0a", brand2: "#3a3a3a" };
  const MS = memberships || MEMBERSHIPS;
  const [tab, setTab] = useState("consent");
  const [creatorConsent, setCreatorConsent] = useState(() => {
    const map = {};
    FOLLOWED.forEach(c => {
      map[c.id] = { watch_history: true, chat_messages: true, tips_purchases: true, marketing_email: false, shared_metacast: false };
    });
    return map;
  });
  const [openCreator, setOpenCreator] = useState(FOLLOWED[0].id);

  const flip = (cid, k) => setCreatorConsent(prev => ({ ...prev, [cid]: { ...prev[cid], [k]: !prev[cid][k] } }));

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: "16px 16px 96px" }}>
      {/* Header card */}
      <div className="card" style={{ padding: 24, background: "var(--surface)", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ padding: 3, borderRadius: "50%", background: "var(--brand-gradient)", animation: "ringHue 8s linear infinite" }}>
          <span style={{ display: "block", padding: 3, borderRadius: "50%", background: "var(--surface)" }}>
            <Avatar creator={me} size={80} />
          </span>
        </span>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.01em" }}>{me.name}</h1>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }} className="lower">{me.handle} · joined sep 2024 · viewer</div>
          <div style={{ marginTop: 10, display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div><span className="tnum stat-num" style={{ fontSize: 18 }}>{FOLLOWED.length}</span> <span style={{ fontSize: 12, color: "var(--ink-3)" }} className="lower">following</span></div>
            <div><span className="tnum stat-num" style={{ fontSize: 18 }}>{MS.length}</span> <span style={{ fontSize: 12, color: "var(--ink-3)" }} className="lower">active memberships</span></div>
            <div><span className="tnum stat-num brand-grad-text" style={{ fontSize: 18 }}>12,480</span> <span style={{ fontSize: 12, color: "var(--ink-3)" }} className="lower">CAST</span></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => onOpenStudio?.()} className="btn btn-grad" style={{ padding: "10px 16px" }}><Icon name="cast" size={14} stroke={2.2} /> {isCreator ? "creator studio" : "become a creator"}</button>
          <button onClick={onOpenWallet} className="btn btn-glass" style={{ padding: "10px 16px" }}><Icon name="wallet" size={14} /> open wallet</button>
          <button onClick={() => toast("share profile · link copied")} className="btn btn-grad-stroke" style={{ padding: "10px 16px" }}><Icon name="share" size={14} /> share</button>
          <button onClick={() => { if (confirm("sign out?")) onSignOut?.(); }} className="btn btn-glass" style={{ padding: "10px 16px" }}><Icon name="lock" size={14} /> sign out</button>
          <button onClick={() => onOpenAdmin?.()} className="btn btn-glass" title="company back-office" style={{ padding: "10px 16px", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}><Icon name="settings" size={14} stroke={2.2} /> operations</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginTop: 22, borderBottom: "1px solid var(--hairline)", display: "flex", gap: 24, overflowX: "auto", scrollbarWidth: "none" }}>
        {[
          { id: "consent", label: "consent" },
          { id: "memberships", label: "memberships" },
          { id: "following", label: "following" },
          { id: "account", label: "account" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`nav-link ${tab === t.id ? "active" : ""}`} style={{ paddingBottom: 14 }}>{t.label}</button>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        {tab === "consent" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ padding: 18, background: "var(--surface)" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--brand-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flex: "0 0 38px" }}>
                  <Icon name="lock" size={18} stroke={2.4} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }} className="lower">your audience belongs to your creators.</div>
                  <p style={{ margin: "6px 0 0", color: "var(--ink-2)", fontSize: 13, lineHeight: 1.6 }}>
                    metascape doesn't keep a profile of you for its own purposes. each creator you follow gets only what you allow — separately. when you turn something off, the creator's copy is deleted within 7 days.
                  </p>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: "var(--surface)" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontWeight: 800, fontSize: 15 }} className="lower">per-creator consent · {FOLLOWED.length} creators</div>
                <span style={{ fontSize: 11, color: "var(--ink-3)" }}>tap a row to expand</span>
              </div>
              {FOLLOWED.map((c) => (
                <div key={c.id} style={{ borderTop: "1px solid var(--hairline)" }}>
                  <button onClick={() => setOpenCreator(openCreator === c.id ? null : c.id)} style={{ width: "100%", padding: "14px 18px", display: "flex", gap: 12, alignItems: "center", textAlign: "left" }}>
                    <Avatar creator={c} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{c.handle}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{Object.values(creatorConsent[c.id] || {}).filter(Boolean).length} of {CONSENT_KEYS.length} permissions on · {c.category}</div>
                    </div>
                    <Icon name="chevD" size={16} stroke={2.2} style={{ color: "var(--ink-3)", transform: openCreator === c.id ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.18s ease" }} />
                  </button>
                  {openCreator === c.id && (
                    <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                      {CONSENT_KEYS.map(k => (
                        <div key={k.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 14px", background: "var(--surface-2)", borderRadius: 10 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>
                              {k.label}
                              {k.required && <span style={{ fontSize: 9, color: "var(--ink-4)", fontFamily: "var(--font-mono)", marginLeft: 8, padding: "2px 6px", border: "1px solid var(--hairline)", borderRadius: 4, textTransform: "uppercase" }}>required</span>}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{k.desc}</div>
                          </div>
                          <span className={`tg ${creatorConsent[c.id]?.[k.id] ? "on" : ""}`}
                            onClick={() => !k.required && flip(c.id, k.id)}
                            style={{ opacity: k.required ? 0.6 : 1, cursor: k.required ? "not-allowed" : "pointer" }} />
                        </div>
                      ))}
                      <button onClick={() => toast(`withdrew all from ${c.handle} · deletion queued`)} style={{ alignSelf: "flex-start", fontSize: 12, color: "#ef4444", padding: "8px 12px", fontWeight: 600 }}>
                        withdraw all & request deletion
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "memberships" && (
          <div className="card" style={{ background: "var(--surface)" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ fontWeight: 800, fontSize: 15 }} className="lower">active memberships · {MS.length}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>renewing in CAST. cancel any in one click.</div>
            </div>
            {MS.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
                <span style={{ padding: 2, borderRadius: "50%", background: `linear-gradient(135deg, ${m.creator.brand}, ${m.creator.brand2})` }}>
                  <Avatar creator={m.creator} size={44} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <button onClick={() => onOpenMicroCast(m.creator)} style={{ fontSize: 14, fontWeight: 700, textAlign: "left", display: "block" }}>{m.creator.handle}</button>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{m.tier} · since {m.since}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <span className="tnum brand-grad-text" style={{ fontWeight: 800, fontSize: 16 }}>{formatNum(m.cast)} CAST/mo</span>
                  <button onClick={() => onCancelSub ? onCancelSub(m) : toast(`cancel · ${m.creator.handle}`)} style={{ fontSize: 11, color: "var(--ink-3)", textDecoration: "underline", marginTop: 2 }}>cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "following" && (
          <div className="card" style={{ background: "var(--surface)" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ fontWeight: 800, fontSize: 15 }} className="lower">following · {FOLLOWED.length}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>free. no charge. unfollow any time.</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
              {FOLLOWED.map((c, i) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderTop: "1px solid var(--hairline)" }}>
                  <span style={{ padding: 2, borderRadius: "50%", background: `linear-gradient(135deg, ${c.brand}, ${c.brand2})` }}>
                    <Avatar creator={c} size={38} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <button onClick={() => onOpenMicroCast(c)} style={{ fontSize: 13, fontWeight: 700, display: "block", textAlign: "left" }}>{c.handle}</button>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">{c.category}</div>
                  </div>
                  <button onClick={() => toast(`unfollowed ${c.handle}`)} className="btn btn-glass" style={{ padding: "6px 10px", fontSize: 11 }}>following</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "account" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ padding: 18, background: "var(--surface)" }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }} className="lower">account</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["display name", "Alex Maren"],
                  ["handle", "@alex.m"],
                  ["email", "alex.m@example.fm"],
                  ["timezone", "europe/london"],
                  ["jurisdiction", "uk · england & wales"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--hairline)", borderRadius: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--ink-3)" }} className="mono">{k}</div>
                      <div style={{ fontSize: 13, marginTop: 2 }}>{v}</div>
                    </div>
                    <button onClick={() => toast(`edit ${k}`)} style={{ fontSize: 12, color: "var(--ink-3)" }}>edit</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 18, background: "var(--surface)" }}>
              <div style={{ fontWeight: 800, fontSize: 15 }} className="lower">data & deletion</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4, marginBottom: 12 }}>everything we hold on you, in plain language. exportable.</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => toast("preparing your data archive — we'll email a link")} className="btn btn-glass"><Icon name="download" size={14} stroke={2.4} /> export my data</button>
                <button onClick={() => toast("account deletion requires email confirmation · sent")} className="btn btn-glass" style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}>delete account</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { ProfileScreen });
})();
