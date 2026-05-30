/**
 * /admin/growth — SEO & discovery surface. This is informative: the real SEO work (SSR,
 * schema.org, sitemaps, canonical/OG) is implemented in the web app; this page links to the
 * live artifacts (sitemaps, robots) and surfaces the metadata defaults read from branding.
 * Search Console itself is a mock connector (see /admin/connectors), so the numbers it would
 * report back are illustrative.
 */
import { branding } from "@/lib/config";
import { AxPageHead, AxCard, AxRow, AxPill, AxHint, AX_PAGE } from "@/components/admin-x/AxPrimitives";

export const dynamic = "force-dynamic";

const SITEMAPS = [
  { name: "creators.xml", path: "/sitemap/creators.xml", desc: "every public channel · Person/Organization" },
  { name: "videos.xml", path: "/sitemap/videos.xml", desc: "watch pages · VideoObject + key moments" },
  { name: "clips.xml", path: "/sitemap/clips.xml", desc: "short clips · VideoObject clip" },
  { name: "categories.xml", path: "/sitemap/categories.xml", desc: "explore hubs · programmatic SEO" },
];

const TECHNICAL: Array<[string, boolean]> = [
  ["server-side rendering (Next.js app router)", true],
  ["canonical URLs", true],
  ["open graph + twitter cards", true],
  ["dynamic og-image per video & creator", true],
  ["schema.org JSON-LD (VideoObject, BroadcastEvent, Person)", true],
  ["video sitemap + key moments", true],
  ["robots.txt + crawl budget", true],
  ["hreflang (multi-region)", false],
  ["llms.txt (AI discovery)", false],
];

const SCHEMA_COVERAGE: Array<[string, string]> = [
  ["VideoObject", "every /watch and /clip page"],
  ["BroadcastEvent", "live streams while on air"],
  ["Person / Organization", "every /c/:handle channel"],
  ["Product", "store drops & tickets"],
  ["BreadcrumbList", "explore + category hubs"],
];

export default async function AdminGrowthPage() {
  return (
    <div style={AX_PAGE}>
      <AxPageHead
        eyebrow="growth"
        title="seo & discovery"
        sub="how Technotainment shows up in search and social — the live sitemaps, robots policy, schema coverage and the metadata defaults applied across every public page."
      />

      <AxHint>
        the SEO engine (SSR, schema.org markup, sitemaps and core web vitals) is implemented in the web app. this console links
        to the live artifacts and surfaces the data search console reports back — search console is wired as a mock connector
        (see connectors), so the reported figures are illustrative.
      </AxHint>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16, marginTop: 16, alignItems: "start" }}>
        {/* sitemaps + robots */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <AxCard title="sitemaps" sub="auto-generated · pinged to search engines on publish" pad={false}>
            {SITEMAPS.map((s, i) => (
              <AxRow key={s.path} cols="1fr auto" first={i === 0}>
                <div style={{ minWidth: 0 }}>
                  <a
                    href={s.path}
                    className="mono"
                    style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-1)" }}
                  >
                    {s.path}
                  </a>
                  <div className="lower" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 3 }}>
                    {s.desc}
                  </div>
                </div>
                <AxPill tone="ok">live</AxPill>
              </AxRow>
            ))}
            <div style={{ padding: "12px 18px", borderTop: "1px solid var(--hairline)" }}>
              <a href="/robots.txt" className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)" }}>
                /robots.txt
              </a>
              <span className="lower" style={{ fontSize: 12, color: "var(--ink-4)" }}>
                {" "}· allows crawl, points to the sitemap index
              </span>
            </div>
          </AxCard>

          <AxCard title="structured data" sub="schema.org coverage of public pages" pad={false}>
            {SCHEMA_COVERAGE.map(([type, where], i) => (
              <AxRow key={type} cols="1fr auto" first={i === 0}>
                <span className="mono" style={{ fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#10b981", fontWeight: 900 }}>✓</span> {type}
                </span>
                <span className="lower" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                  {where}
                </span>
              </AxRow>
            ))}
          </AxCard>
        </div>

        {/* technical + metadata defaults */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <AxCard title="technical checklist" sub="SSR / crawlability health" pad={false}>
            {TECHNICAL.map(([label, ok], i) => (
              <AxRow key={label} cols="1fr auto" first={i === 0}>
                <span style={{ fontSize: 12.5 }}>{label}</span>
                {ok ? (
                  <span style={{ color: "#10b981", fontWeight: 900 }}>✓</span>
                ) : (
                  <span className="lower" style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 700 }}>
                    planned
                  </span>
                )}
              </AxRow>
            ))}
          </AxCard>

          <AxCard title="metadata defaults" sub={`templates applied across ${branding.appName}`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <MetaRow label="title template" value={`{title} · {creator} | ${branding.appName}`} />
              <MetaRow label="description template" value={`{summary} — watch on ${branding.companyName}`} />
              <MetaRow label="brand" value={`${branding.companyName} · ${branding.appName}`} />
              <MetaRow label="default tagline" value={branding.tagline} />
              <MetaRow label="og image" value="/api/og?title={title}&creator={handle}" />
            </div>
            <AxHint>
              <span style={{ marginTop: 4, display: "block" }}>
                these defaults come from branding in the control center — change them there and every public page&apos;s
                {" "}&lt;head&gt; updates at runtime, no deploy.
              </span>
            </AxHint>
          </AxCard>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="lower"
        style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 5 }}
      >
        {label}
      </div>
      <div
        className="mono"
        style={{
          fontSize: 12.5,
          color: "var(--ink-2)",
          padding: "9px 11px",
          borderRadius: 9,
          background: "var(--surface-2)",
          border: "1px solid var(--hairline)",
          wordBreak: "break-all",
        }}
      >
        {value}
      </div>
    </div>
  );
}
