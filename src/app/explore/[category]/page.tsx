// Explore category hub — /explore/:category. ISR (revalidate 60). Programmatic SEO.
// schema.org: BreadcrumbList. Presentation rebuilt to match the explore hub in
// prototype/v4/extras.jsx (PageHeader + category chips + tile grid). Data wiring
// (listExplore) is unchanged.
import Link from "next/link";
import type { Metadata } from "next";
import { listExplore } from "@/lib/queries/public";
import { buildMetadata, clampDescription } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { VideoCard } from "@/components/public/cards";
import { PageHeader } from "@/components/viewer/shared";

export const revalidate = 60;

const CATEGORIES = ["music", "art", "sports", "gaming", "cooking", "outdoors", "tech"] as const;

type Props = { params: { category: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = decodeURIComponent(params.category);
  return buildMetadata({
    title: `explore ${category}`,
    description: clampDescription(`browse the best ${category} creators, live streams and videos.`),
    path: `/explore/${params.category}`,
  });
}

export default async function ExplorePage({ params }: Props) {
  const category = decodeURIComponent(params.category);
  const videos = await listExplore(category);

  const jsonLd = breadcrumb([
    { name: "home", path: "/" },
    { name: "explore", path: "/explore" },
    { name: category, path: `/explore/${params.category}` },
  ]);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 96px" }}>
      <JsonLd data={jsonLd} />
      <PageHeader eyebrow="explore" title={category} sub={`live streams, videos and drops in ${category}.`} />

      <div style={{ display: "flex", gap: 6, marginBottom: 22, flexWrap: "wrap" }}>
        {CATEGORIES.map((cat) => (
          <Link key={cat} href={`/explore/${encodeURIComponent(cat)}`} className={`chip ${cat === category.toLowerCase() ? "active" : ""}`}>
            {cat}
          </Link>
        ))}
      </div>

      {videos.length ? (
        <div className="grid-tiles">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      ) : (
        <p className="lower" style={{ color: "var(--ink-3)" }}>nothing here yet — check back soon.</p>
      )}
    </main>
  );
}
