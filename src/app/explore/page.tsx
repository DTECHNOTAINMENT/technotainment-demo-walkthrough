// Explore index — /explore. Category hub: links into /explore/:category. Public (SSR/ISR),
// crawlable. Fixes the bottom-nav "explore" link that previously 404'd (only /explore/[category]
// existed). Renders inside the global shell-less page; the global MobileNav covers navigation.
import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/meta";
import { listRecentVideos } from "@/lib/queries/public";
import { VideoCard } from "@/components/public/cards";
import { PublicShell } from "@/components/app/PublicShell";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: "explore",
  description: "browse creators and videos by category — music, gaming, sports, talk, education and more.",
  path: "/explore",
});

// The platform's browse categories (mirrors the sidebar BROWSE group / prototype CATEGORIES).
const CATEGORIES: { id: string; label: string; grad: string }[] = [
  { id: "music", label: "music", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)" },
  { id: "gaming", label: "gaming", grad: "linear-gradient(135deg,#06b6d4,#3b82f6)" },
  { id: "sports", label: "sports", grad: "linear-gradient(135deg,#ef4444,#f97316)" },
  { id: "talk", label: "talk", grad: "linear-gradient(135deg,#10b981,#06b6d4)" },
  { id: "education", label: "education", grad: "linear-gradient(135deg,#3b82f6,#8b5cf6)" },
  { id: "esports", label: "esports", grad: "linear-gradient(135deg,#f97316,#ef4444)" },
  { id: "drops", label: "drops", grad: "linear-gradient(135deg,#ec4899,#f97316)" },
  { id: "faith", label: "faith", grad: "linear-gradient(135deg,#06b6d4,#10b981)" },
];

export default async function ExploreIndexPage() {
  const trending = await listRecentVideos(12).catch(() => []);

  return (
    <PublicShell>
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 96px" }}>
      <header style={{ marginBottom: 24 }}>
        <div className="lower" style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}>
          browse
        </div>
        <h1 className="lower" style={{ margin: "4px 0 0", fontSize: "clamp(26px,4vw,36px)", letterSpacing: "-0.02em" }}>
          explore
        </h1>
      </header>

      {/* category tiles */}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))" }}>
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/explore/${c.id}`}
            className="lower"
            style={{
              position: "relative",
              borderRadius: 14,
              minHeight: 96,
              padding: 16,
              display: "flex",
              alignItems: "flex-end",
              fontWeight: 800,
              fontSize: 18,
              color: "#fff",
              textDecoration: "none",
              background: c.grad,
              boxShadow: "var(--shadow-card)",
            }}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {/* trending */}
      {trending.length > 0 && (
        <section style={{ marginTop: 36 }}>
          <h2 className="lower" style={{ fontSize: 18, fontWeight: 800, margin: "0 0 14px" }}>
            trending now
          </h2>
          <div className="grid-tiles">
            {trending.map((v) => (
              <VideoCard
                key={v.id}
                video={{
                  slug: v.slug,
                  title: v.title,
                  thumbUrl: v.thumbUrl,
                  durationSec: v.durationSec,
                  views: v.views,
                  kind: v.kind as "vod" | "clip",
                  channel: { creator: { name: v.channel.creator.name, handle: v.channel.creator.handle } },
                }}
              />
            ))}
          </div>
        </section>
      )}
    </main>
    </PublicShell>
  );
}
