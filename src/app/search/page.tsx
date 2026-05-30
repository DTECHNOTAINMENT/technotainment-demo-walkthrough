// Search — /search?q=. SSR. Result pages are noindex (docs/ROUTES.md). Server-rendered.
// Presentation rebuilt to match prototype/v4/search.jsx (results header, filter chips,
// creator + video result cards). Data wiring (searchPublic, noindex) is unchanged.
import Link from "next/link";
import type { Metadata } from "next";
import { searchPublic } from "@/lib/queries/public";
import { buildMetadata } from "@/lib/seo/meta";
import { VideoCard } from "@/components/public/cards";
import { Avatar, formatNum } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

type Props = { searchParams?: { q?: string } };

export function generateMetadata({ searchParams }: Props): Metadata {
  const q = searchParams?.q?.trim() ?? "";
  return buildMetadata({
    title: q ? `search · ${q}` : "search",
    description: q ? `results for "${q}".` : "search creators, channels and videos.",
    path: q ? `/search?q=${encodeURIComponent(q)}` : "/search",
    noindex: true,
  });
}

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams?.q?.trim() ?? "";
  const results = q ? await searchPublic(q) : { channels: [], videos: [] };
  const total = results.channels.length + results.videos.length;
  const hasResults = total > 0;

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px 96px" }}>
      {/* search bar */}
      <form method="GET" action="/search" style={{ display: "flex", gap: 8, marginBottom: 24, maxWidth: 540 }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 14px",
            borderRadius: 999,
            background: "var(--surface-2)",
            border: "1px solid var(--hairline)",
            color: "var(--ink-3)",
          }}
        >
          <Icon name="search" size={14} stroke={2.2} />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="search creators, microcasts, drops"
            aria-label="search"
            style={{ flex: 1, padding: "12px 0", background: "none", border: "none", outline: "none", fontSize: 14, color: "var(--ink-1)" }}
          />
        </div>
        <button type="submit" className="btn btn-grad" style={{ padding: "10px 20px" }}>search</button>
      </form>

      {/* results header */}
      <div style={{ paddingBottom: 16, borderBottom: "1px solid var(--hairline)" }}>
        <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800 }}>search results</div>
        <h1 className="lower" style={{ margin: "6px 0 0", fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
          {q ? (
            <>
              {total} {total === 1 ? "match" : "matches"} for &quot;<span className="brand-grad-text">{q}</span>&quot;
            </>
          ) : (
            "search"
          )}
        </h1>
      </div>

      {/* filter chips */}
      {q && (
        <div style={{ display: "flex", gap: 6, padding: "16px 0", overflowX: "auto" }}>
          <span className="chip active">all ({total})</span>
          <span className="chip">creators ({results.channels.length})</span>
          <span className="chip">videos ({results.videos.length})</span>
        </div>
      )}

      {!q && (
        <p className="lower" style={{ color: "var(--ink-3)", marginTop: 20 }}>type something above to search across the platform.</p>
      )}

      {q && !hasResults && (
        <div style={{ padding: 60, textAlign: "center", color: "var(--ink-3)" }}>
          <div style={{ fontSize: 16, fontWeight: 700 }} className="lower">no matches</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>try a different category or check spelling</div>
        </div>
      )}

      {results.channels.length > 0 && (
        <section style={{ marginBottom: 36, marginTop: 12 }}>
          <h2 className="lower" style={{ fontSize: 18, marginBottom: 16, fontWeight: 800 }}>creators</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {results.channels.map((c) => (
              <Link
                key={c.id}
                href={`/c/${c.handle}`}
                className="card"
                style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, textDecoration: "none", background: "var(--surface)" }}
              >
                <span style={{ padding: 2, borderRadius: "50%", background: `linear-gradient(135deg, ${c.creator.brand}, ${c.creator.brand2})`, flexShrink: 0 }}>
                  <Avatar creator={c.creator} size={48} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{c.name}</div>
                  <div className="lower" style={{ color: "var(--ink-3)", fontSize: 12 }}>
                    {c.handle} · {c.creator.category}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
                    <span className="tnum">{formatNum(c.creator.followers)}</span> followers
                  </div>
                </div>
                <Icon name="chevR" size={14} stroke={2.2} style={{ color: "var(--ink-3)" }} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {results.videos.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 className="lower" style={{ fontSize: 18, marginBottom: 16, fontWeight: 800 }}>videos</h2>
          <div className="grid-tiles">
            {results.videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
