// Search — /search?q=. SSR. Result pages are noindex (docs/ROUTES.md). Server-rendered.
import Link from "next/link";
import type { Metadata } from "next";
import { searchPublic } from "@/lib/queries/public";
import { buildMetadata } from "@/lib/seo/meta";
import { VideoCard } from "@/components/public/cards";
import { formatCast } from "@/lib/cast";

export const dynamic = "force-dynamic";

type Props = { searchParams?: { q?: string } };

export function generateMetadata({ searchParams }: Props): Metadata {
  const q = searchParams?.q?.trim() ?? "";
  // Result pages are noindex; the empty search facet is fine to crawl but kept simple.
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
  const hasResults = results.channels.length > 0 || results.videos.length > 0;

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 96px" }}>
      <h1 className="lower" style={{ fontSize: 30, letterSpacing: "-0.02em", margin: "0 0 20px" }}>search</h1>

      <form method="GET" action="/search" style={{ display: "flex", gap: 8, marginBottom: 32, maxWidth: 540 }}>
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="search creators, channels, videos"
          aria-label="search"
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 999,
            background: "var(--surface-2)",
            border: "1px solid var(--hairline)",
            color: "var(--ink-1)",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button type="submit" className="btn btn-grad" style={{ padding: "10px 20px" }}>search</button>
      </form>

      {!q && (
        <p className="lower" style={{ color: "var(--ink-3)" }}>type something above to search across the platform.</p>
      )}

      {q && !hasResults && (
        <p className="lower" style={{ color: "var(--ink-3)" }}>
          no matches for &quot;{q}&quot;.
        </p>
      )}

      {results.channels.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 className="lower" style={{ fontSize: 18, marginBottom: 16 }}>channels</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {results.channels.map((c) => (
              <Link
                key={c.id}
                href={`/c/${c.handle}`}
                className="card"
                style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, textDecoration: "none" }}
              >
                <span
                  className="av-ring"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: `linear-gradient(120deg, ${c.creator.brand}, ${c.creator.brand2})`,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                  <div className="lower" style={{ color: "var(--ink-3)", fontSize: 12 }}>
                    {c.handle} · {c.creator.category} · <span className="tnum">{formatCast(c.creator.followers)}</span> followers
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {results.videos.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 className="lower" style={{ fontSize: 18, marginBottom: 16 }}>videos</h2>
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
