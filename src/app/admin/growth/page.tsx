/**
 * /admin/growth — SEO & discovery. KPI cards (organic clicks/impressions/position/index),
 * an organic-clicks chart, top queries + landing pages, the live sitemaps/robots artifacts,
 * structured-data coverage, the technical checklist and the metadata defaults read from branding.
 * The real SEO work (SSR, schema.org, sitemaps, OG) is implemented in the web app; Search Console
 * is wired as a mock connector, so the reported figures are illustrative.
 * Spec: prototype/v4/admin-growth.jsx.
 */
import { branding } from "@/lib/config";
import { StatCard, StudioCard, StudioPageHead, Pill, Meter, Bars, formatCast, type PillTone } from "@/components/studio-ui";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

const MONTHS = ["jun", "jul", "aug", "sep", "oct", "nov", "dec", "jan", "feb", "mar", "apr", "may"];
const CLICKS = [128, 142, 161, 188, 204, 241, 286, 312, 358, 402, 451, 512].map((k) => k * 1000);
const IMPRESSIONS = [4.1, 4.6, 5.2, 6.1, 6.8, 7.9, 9.2, 10.1, 11.4, 12.8, 14.2, 16.1].map((v) => Math.round(v * 1e6));
const INDEXED = 184200;
const SUBMITTED = 192400;
const ERRORS = 1240;

const TYPE_TONE: Record<string, PillTone> = { channel: "info", video: "ok", category: "warn", clip: "info", index: "neutral" };

const TOP_QUERIES = [
  { q: "modular synth live stream", clicks: 18400, impr: 412000, pos: 2.1 },
  { q: "nyx okafor buchla", clicks: 12100, impr: 88000, pos: 1.4 },
  { q: "ambient music live", clicks: 9800, impr: 640000, pos: 6.8 },
  { q: "watch live cooking", clicks: 7200, impr: 980000, pos: 9.2 },
  { q: "patch sheet download", clicks: 4100, impr: 52000, pos: 3.0 },
];
const TOP_PAGES = [
  { url: "/c/nyxsynth", clicks: 41200, type: "channel" },
  { url: "/watch/night-session-13", clicks: 28800, type: "video" },
  { url: "/explore/modular-synth", clicks: 19400, type: "category" },
  { url: "/clip/the-bass-thing", clicks: 16100, type: "clip" },
  { url: "/live", clicks: 12400, type: "index" },
];
const SITEMAPS = [
  { name: "creators.xml", path: "/sitemap/creators.xml", urls: 9840, indexed: "98%" },
  { name: "videos.xml", path: "/sitemap/videos.xml", urls: 142800, indexed: "94%" },
  { name: "clips.xml", path: "/sitemap/clips.xml", urls: 38200, indexed: "91%" },
  { name: "categories.xml", path: "/sitemap/categories.xml", urls: 64, indexed: "100%" },
];
const SCHEMA: Array<[string, number]> = [
  ["VideoObject", 142800],
  ["BroadcastEvent (live)", 1284],
  ["Person / Organization", 9840],
  ["Product (drops)", 4120],
  ["BreadcrumbList", 192400],
];
const TECHNICAL: Array<[string, boolean]> = [
  ["server-side rendering (Next.js)", true],
  ["canonical URLs", true],
  ["Open Graph + Twitter cards", true],
  ["dynamic og-image per video & creator", true],
  ["video sitemap + key moments", true],
  ["robots.txt + crawl budget", true],
  ["hreflang (multi-region)", false],
  ["llms.txt (AI discovery)", false],
];

export default async function AdminGrowthPage() {
  return (
    <div className="page-pad" style={{ maxWidth: 1450, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="growth"
        title="seo & discovery"
        sub="how technotainment shows up in search and social — index health, rankings and the technical SEO surface implemented in the web app."
      />

      <div className="kpi-grid">
        <StatCard
          label="organic clicks · mo"
          icon="trend"
          value={formatCast(CLICKS[CLICKS.length - 1])}
          unit="from search"
          delta="+13.5%"
          deltaUp
          fiat="38% of new signups"
          spark={CLICKS.slice(-8)}
          sparkColor="#10b981"
        />
        <StatCard
          label="impressions"
          icon="eye"
          value={formatCast(IMPRESSIONS[IMPRESSIONS.length - 1])}
          unit="in search"
          delta="+13%"
          deltaUp
          fiat="3.2% CTR"
          spark={IMPRESSIONS.slice(-8)}
          sparkColor="#06b6d4"
        />
        <StatCard
          label="avg. position"
          icon="grid"
          value="8.4"
          unit="ranking"
          delta="−1.2"
          deltaUp
          fiat="lower is better"
          spark={[11, 10.5, 10, 9.6, 9.2, 8.9, 8.6, 8.4]}
          sparkColor="#8b5cf6"
        />
        <StatCard
          label="indexed pages"
          icon="check"
          value={formatCast(INDEXED)}
          unit="indexed"
          delta="96%"
          deltaUp
          fiat={`${formatCast(SUBMITTED)} submitted`}
          spark={[160, 165, 170, 174, 178, 180, 182, 184]}
          sparkColor="#f59e0b"
        />
      </div>

      <div className="st-split" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="organic clicks · 12 months" sub="visits from search engines">
            <Bars data={CLICKS} labels={MONTHS} h={180} fmt={(v) => formatCast(v)} />
          </StudioCard>

          <StudioCard title="top search queries" sub="what people search to find you" pad={false}>
            <div className="st-row head" style={{ gridTemplateColumns: "1fr 90px 90px 70px" }}>
              <span>query</span>
              <span style={{ textAlign: "right" }}>clicks</span>
              <span style={{ textAlign: "right" }}>impr.</span>
              <span style={{ textAlign: "right" }}>pos.</span>
            </div>
            {TOP_QUERIES.map((q) => (
              <div key={q.q} className="st-row" style={{ gridTemplateColumns: "1fr 90px 90px 70px" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{q.q}</span>
                <span className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>
                  {formatCast(q.clicks)}
                </span>
                <span className="tnum" style={{ textAlign: "right", fontSize: 12.5, color: "var(--ink-3)" }}>
                  {formatCast(q.impr)}
                </span>
                <span
                  className="tnum"
                  style={{ textAlign: "right", fontSize: 12.5, fontWeight: 700, color: q.pos <= 3 ? "#10b981" : "var(--ink-2)" }}
                >
                  {q.pos}
                </span>
              </div>
            ))}
          </StudioCard>

          <StudioCard title="metadata defaults" sub={`templates applied across ${branding.appName}`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="st-label">title template</label>
                <input className="st-input mono" defaultValue={`{title} · {creator} | ${branding.appName}`} readOnly />
              </div>
              <div>
                <label className="st-label">description template</label>
                <input className="st-input mono" defaultValue={`{summary} — watch on ${branding.companyName}`} readOnly />
              </div>
              <div>
                <label className="st-label">og image</label>
                <input className="st-input mono" defaultValue="/api/og?title={title}&creator={handle}" readOnly />
              </div>
            </div>
            <div className="st-hint" style={{ marginTop: 14 }}>
              these defaults come from branding in the control center — change them there and every public page&apos;s
              &lt;head&gt; updates at runtime, no deploy.
            </div>
          </StudioCard>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="top landing pages" sub="entry points from search" pad={false}>
            {TOP_PAGES.map((p, i) => (
              <div
                key={p.url}
                className="st-row"
                style={{ gridTemplateColumns: "1fr auto", borderTop: i ? "1px solid var(--hairline)" : "none" }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    className="mono"
                    style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {p.url}
                  </div>
                  <div style={{ marginTop: 3 }}>
                    <Pill tone={TYPE_TONE[p.type] ?? "neutral"}>{p.type}</Pill>
                  </div>
                </div>
                <span className="tnum" style={{ fontSize: 13, fontWeight: 700 }}>
                  {formatCast(p.clicks)}
                </span>
              </div>
            ))}
          </StudioCard>

          <StudioCard title="sitemaps & index" sub="auto-generated · pinged to search engines on publish" pad={false}>
            <div className="st-row head" style={{ gridTemplateColumns: "1fr 100px 80px" }}>
              <span>sitemap</span>
              <span style={{ textAlign: "right" }}>urls</span>
              <span style={{ textAlign: "right" }}>indexed</span>
            </div>
            {SITEMAPS.map((s, i) => (
              <div key={s.name} className="st-row" style={{ gridTemplateColumns: "1fr 100px 80px", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
                <a className="mono" href={s.path} style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)", textDecoration: "none" }}>
                  {s.name}
                </a>
                <span className="tnum" style={{ textAlign: "right", fontSize: 13 }}>
                  {formatCast(s.urls)}
                </span>
                <span className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>
                  {s.indexed}
                </span>
              </div>
            ))}
            <div style={{ padding: "16px 18px", borderTop: "1px solid var(--hairline)" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
                <span className="brand-grad-text tnum stat-num" style={{ fontSize: 28 }}>
                  {formatCast(INDEXED)}
                </span>
                <span className="lower" style={{ color: "var(--ink-3)", fontSize: 12.5 }}>
                  / {formatCast(SUBMITTED)} submitted
                </span>
              </div>
              <Meter value={INDEXED / SUBMITTED} style={{ height: 10 }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12 }}>
                <span className="tnum" style={{ color: "#10b981", fontWeight: 700 }}>
                  {formatCast(INDEXED)} indexed
                </span>
                <span className="tnum" style={{ color: "#ef4444", fontWeight: 700 }}>
                  {formatCast(ERRORS)} errors / excluded
                </span>
              </div>
              <a className="mono" href="/robots.txt" style={{ display: "inline-block", marginTop: 12, fontSize: 12, color: "var(--ink-2)", textDecoration: "none" }}>
                /robots.txt
              </a>
            </div>
          </StudioCard>

          <StudioCard title="technical & structured data" sub="SSR / crawlability + schema.org coverage" pad={false}>
            {TECHNICAL.map(([label, ok], i) => (
              <div
                key={label}
                className="st-row"
                style={{ gridTemplateColumns: "1fr auto", borderTop: i ? "1px solid var(--hairline)" : "none" }}
              >
                <span style={{ fontSize: 13 }}>{label}</span>
                {ok ? (
                  <Icon name="check" size={16} stroke={2.6} style={{ color: "#10b981" }} />
                ) : (
                  <span className="lower" style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 700 }}>
                    planned
                  </span>
                )}
              </div>
            ))}
            <div style={{ padding: "12px 18px", borderTop: "1px solid var(--hairline)" }}>
              {SCHEMA.map(([k, n]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                  }}
                >
                  <span style={{ fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <Icon name="check" size={13} stroke={2.6} style={{ color: "#10b981" }} />{" "}
                    <span className="mono">{k}</span>
                  </span>
                  <span className="tnum" style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
                    {formatCast(n)} pages
                  </span>
                </div>
              ))}
            </div>
          </StudioCard>
        </div>
      </div>
    </div>
  );
}
