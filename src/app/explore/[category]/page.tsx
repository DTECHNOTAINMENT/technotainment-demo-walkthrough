// Explore category hub — /explore/:category. ISR (revalidate 60). Programmatic SEO.
// schema.org: BreadcrumbList. Server-rendered grid of public videos.
import type { Metadata } from "next";
import { listExplore } from "@/lib/queries/public";
import { buildMetadata, clampDescription } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { VideoCard } from "@/components/public/cards";

export const revalidate = 60;

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
      <h1 className="lower brand-grad-text" style={{ fontSize: 34, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
        explore {category}
      </h1>
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
