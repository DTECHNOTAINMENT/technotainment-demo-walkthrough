/* Admin — SEO & Growth */
(() => {
const { useState } = React;
const { Icon, formatNum, ADMIN, StatCard, StudioCard, StudioPageHead, Pill, Seg, Bars, AreaSpark } = window;

const TYPE_TONE = { channel: "info", video: "ok", category: "warn", clip: "info", index: "neutral" };

const AdminGrowth = ({ toast }) => {
  const a = ADMIN, g = a.GROWTH;
  const [tab, setTab] = useState("search");

  return (
    <div className="page-pad" style={{ maxWidth: 1450, margin: "0 auto" }}>
      <StudioPageHead eyebrow="growth" title="seo & discovery"
        sub="how technotainment shows up in search and social — index health, rankings and the technical SEO surface."
        actions={<>
          <Seg items={[{ id: "search", label: "search" }, { id: "index", label: "index & sitemaps" }, { id: "tech", label: "technical" }]} value={tab} onChange={setTab} />
          <button onClick={() => toast("opening Google Search Console")} className="btn btn-glass" style={{ padding: "10px 14px" }}><Icon name="trend" size={14} stroke={2.4} /></button>
        </>} />

      <div className="kpi-grid">
        <StatCard label="organic clicks · mo" icon="trend" value={formatNum(g.clicks[g.clicks.length-1])} unit="from search" delta="+13.5%" deltaUp fiat={`${g.organicShare}% of new signups`} spark={g.clicks.slice(-8)} sparkColor="#10b981" />
        <StatCard label="impressions" icon="eye" value={formatNum(g.impressions[g.impressions.length-1])} unit="in search" delta="+13%" deltaUp fiat={`${g.ctr}% CTR`} spark={g.impressions.slice(-8)} sparkColor="#06b6d4" />
        <StatCard label="avg. position" icon="grid" value={g.position} unit="ranking" delta="−1.2" deltaUp fiat="lower is better" spark={[11,10.5,10,9.6,9.2,8.9,8.6,8.4]} sparkColor="#8b5cf6" />
        <StatCard label="indexed pages" icon="check" value={formatNum(g.indexed)} unit="of " delta="96%" deltaUp fiat={`${formatNum(g.submitted)} submitted`} spark={[160,165,170,174,178,180,182,184]} sparkColor="#f59e0b" />
      </div>

      {tab === "search" && (
        <div className="st-split" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StudioCard title="organic clicks · 12 months" sub="visits from search engines">
              <Bars data={g.clicks} labels={a.months} h={180} color="var(--brand-gradient)" fmt={(v) => formatNum(v)} />
            </StudioCard>

            <StudioCard title="top search queries" sub="what people search to find you" pad={false}>
              <div className="st-row head" style={{ gridTemplateColumns: "1fr 90px 90px 70px" }}>
                <span>query</span><span style={{ textAlign: "right" }}>clicks</span><span style={{ textAlign: "right" }}>impr.</span><span style={{ textAlign: "right" }}>pos.</span>
              </div>
              {g.topQueries.map((q, i) => (
                <div key={i} className="st-row" style={{ gridTemplateColumns: "1fr 90px 90px 70px" }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{q.q}</span>
                  <span className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>{formatNum(q.clicks)}</span>
                  <span className="tnum" style={{ textAlign: "right", fontSize: 12.5, color: "var(--ink-3)" }}>{formatNum(q.impr)}</span>
                  <span className="tnum" style={{ textAlign: "right", fontSize: 12.5, fontWeight: 700, color: q.pos <= 3 ? "#10b981" : "var(--ink-2)" }}>{q.pos}</span>
                </div>
              ))}
            </StudioCard>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StudioCard title="top landing pages" sub="entry points from search" pad={false}>
              {g.topPages.map((p, i) => (
                <div key={i} className="st-row" style={{ gridTemplateColumns: "1fr auto", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.url}</div>
                    <div style={{ marginTop: 3 }}><Pill tone={TYPE_TONE[p.type]}>{p.type}</Pill></div>
                  </div>
                  <span className="tnum" style={{ fontSize: 13, fontWeight: 700 }}>{formatNum(p.clicks)}</span>
                </div>
              ))}
            </StudioCard>

            <StudioCard title="quick wins" sub="auto-detected opportunities">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { t: "412 videos missing meta descriptions", a: "fix in bulk" },
                  { t: "\"ambient music live\" ranks #6.8 — add captions", a: "boost" },
                  { t: "38k clips lack social cards", a: "generate" },
                ].map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", border: "1px solid var(--hairline)", borderRadius: 10 }}>
                    <Icon name="sparkle" size={15} stroke={2} style={{ color: "#f59e0b", flex: "0 0 15px" }} />
                    <span style={{ flex: 1, fontSize: 12, color: "var(--ink-2)" }}>{w.t}</span>
                    <button onClick={() => toast(w.a + " · queued")} style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-2)", whiteSpace: "nowrap" }} className="lower">{w.a}</button>
                  </div>
                ))}
              </div>
            </StudioCard>
          </div>
        </div>
      )}

      {tab === "index" && (
        <div className="st-split" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StudioCard title="sitemaps" sub="auto-generated · pinged to search engines on publish"
              action={<button onClick={() => toast("resubmitting sitemaps to Google & Bing")} className="btn btn-glass" style={{ padding: "8px 12px", fontSize: 12 }}><Icon name="arrowR" size={13} stroke={2.2} /> resubmit</button>}
              pad={false}>
              <div className="st-row head" style={{ gridTemplateColumns: "1fr 100px 90px 90px" }}>
                <span>sitemap</span><span style={{ textAlign: "right" }}>urls</span><span style={{ textAlign: "right" }}>indexed</span><span style={{ textAlign: "right" }}>status</span>
              </div>
              {g.sitemaps.map((s, i) => (
                <div key={i} className="st-row" style={{ gridTemplateColumns: "1fr 100px 90px 90px" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)" }}>{s.name}</span>
                  <span className="tnum" style={{ textAlign: "right", fontSize: 13 }}>{formatNum(s.urls)}</span>
                  <span className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>{s.indexed}</span>
                  <div style={{ textAlign: "right" }}><Pill tone="ok">{s.status}</Pill></div>
                </div>
              ))}
            </StudioCard>

            <StudioCard title="index coverage" sub="how much of the catalog Google has indexed">
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                <span className="brand-grad-text tnum stat-num" style={{ fontSize: 34 }}>{formatNum(g.indexed)}</span>
                <span style={{ color: "var(--ink-3)", fontSize: 13 }} className="lower">/ {formatNum(g.submitted)} submitted</span>
              </div>
              <div className="meter" style={{ height: 10 }}><span style={{ width: `${(g.indexed/g.submitted)*100}%`, background: "var(--brand-gradient)" }} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12 }}>
                <span style={{ color: "#10b981", fontWeight: 700 }} className="tnum">{formatNum(g.indexed)} indexed</span>
                <span style={{ color: "#ef4444", fontWeight: 700 }} className="tnum">{formatNum(g.errors)} errors / excluded</span>
              </div>
            </StudioCard>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StudioCard title="redirects" sub="legacy URL → canonical · keeps link equity"
              action={<button onClick={() => toast("add redirect rule")} className="btn btn-glass" style={{ padding: "7px 11px", fontSize: 12 }}><Icon name="plus" size={13} stroke={2.4} /> add</button>}
              pad={false}>
              {g.redirects.map((r, i) => (
                <div key={i} className="st-row" style={{ gridTemplateColumns: "1fr auto", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
                  <div style={{ minWidth: 0, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                    <span style={{ color: "var(--ink-3)" }}>{r.from}</span> <Icon name="arrowR" size={11} stroke={2.2} style={{ verticalAlign: -1, color: "var(--ink-4)" }} /> <span style={{ color: "var(--ink-1)", fontWeight: 600 }}>{r.to}</span>
                    <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 3 }}>{r.hits}</div>
                  </div>
                  <Pill tone="ok">{r.code}</Pill>
                </div>
              ))}
            </StudioCard>

            <StudioCard title="structured data" sub="schema.org coverage of public pages">
              {[["VideoObject", 142800], ["BroadcastEvent (live)", 1284], ["Person / Organization", 9840], ["Product (drops)", 4120], ["BreadcrumbList", 192400]].map(([k, n]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--hairline)" }}>
                  <span style={{ fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 7 }}><Icon name="check" size={13} stroke={2.6} style={{ color: "#10b981" }} /> <span className="mono">{k}</span></span>
                  <span className="tnum" style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{formatNum(n)} pages</span>
                </div>
              ))}
            </StudioCard>
          </div>
        </div>
      )}

      {tab === "tech" && (
        <div className="st-split" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StudioCard title="core web vitals" sub="field data · Google ranking signals">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[["LCP", g.cwv.lcp, "loading"], ["CLS", g.cwv.cls, "stability"], ["INP", g.cwv.inp, "interactivity"]].map(([k, val, sub]) => (
                  <div key={k} style={{ padding: 16, background: "var(--surface-2)", borderRadius: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", color: "var(--ink-4)" }}>{k}</div>
                    <div className="tnum stat-num" style={{ fontSize: 26, margin: "6px 0 2px", color: "#10b981" }}>{val}</div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-4)" }} className="lower">{sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, padding: "10px 14px", background: "rgba(16,185,129,0.1)", borderRadius: 10 }}>
                <span style={{ fontSize: 12.5, color: "#10b981", fontWeight: 700 }} className="lower">{g.cwv.pass}% of pages pass all three</span>
                <Pill tone="ok">good</Pill>
              </div>
            </StudioCard>

            <StudioCard title="metadata defaults" sub="templates applied across the site">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><label className="st-label">title template</label><input className="st-input mono" defaultValue="{title} · {creator} | technotainment" /></div>
                <div><label className="st-label">description template</label><input className="st-input mono" defaultValue="{summary} — watch on technotainment" /></div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}><button onClick={() => toast("metadata templates saved")} className="btn btn-grad" style={{ padding: "10px 16px", fontSize: 13 }}>save templates</button></div>
              </div>
            </StudioCard>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StudioCard title="technical checklist" sub="SSR / crawlability health" pad={false}>
              {[
                ["server-side rendering (Next.js)", true],
                ["canonical URLs", true],
                ["Open Graph + Twitter cards", true],
                ["video sitemap + key moments", true],
                ["hreflang (6 regions)", true],
                ["robots.txt + crawl budget", true],
                ["AMP / instant pages", false],
                ["llms.txt (AI discovery)", false],
              ].map(([k, ok], i) => (
                <div key={k} className="st-row" style={{ gridTemplateColumns: "1fr auto", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
                  <span style={{ fontSize: 13 }}>{k}</span>
                  {ok ? <Icon name="check" size={16} stroke={2.6} style={{ color: "#10b981" }} /> : <span style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 700 }} className="lower">planned</span>}
                </div>
              ))}
            </StudioCard>

            <div className="st-hint">SSR, schema.org markup, sitemaps and Core Web Vitals are implemented in the web app (Next.js). this panel surfaces their live status and the data Search Console reports back.</div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { AdminGrowth });
})();
