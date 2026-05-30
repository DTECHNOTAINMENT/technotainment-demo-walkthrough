// Channel page — /c/:handle. ISR (docs/ROUTES.md: revalidate 60s).
// schema.org: Person + BreadcrumbList + Product list. Server-rendered.
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChannelByHandle } from "@/lib/queries/public";
import { buildMetadata, clampDescription } from "@/lib/seo/meta";
import { person, breadcrumb, product } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { ChannelHeader, TierCard, VideoCard } from "@/components/public/cards";
import { SupportBar } from "@/components/SupportBar";
import { formatCast, formatFiat } from "@/lib/cast";

export const revalidate = 60;

type Props = { params: { handle: string } };

/** Decode the handle and resolve the channel, tolerating a missing leading "@". */
async function load(rawHandle: string) {
  const decoded = decodeURIComponent(rawHandle);
  // Try as-given first, then with a "@" prefix if it lacked one.
  let channel = await getChannelByHandle(decoded);
  if (!channel && !decoded.startsWith("@")) {
    channel = await getChannelByHandle(`@${decoded}`);
  }
  return channel;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const channel = await load(params.handle);
  if (!channel) return buildMetadata({ title: "channel not found", description: "", path: `/c/${params.handle}`, noindex: true });
  const handle = channel.handle;
  return buildMetadata({
    title: `${channel.name} (${handle})`,
    description: clampDescription(channel.bio ?? `${channel.name} on the platform — live streams, videos and drops.`),
    path: `/c/${handle}`,
    type: "profile",
  });
}

export default async function ChannelPage({ params }: Props) {
  const channel = await load(params.handle);
  if (!channel) notFound();

  const handle = channel.handle;
  const live = channel.streams[0];

  const jsonLd = [
    person(channel.creator),
    breadcrumb([
      { name: "home", path: "/" },
      { name: channel.name, path: `/c/${handle}` },
    ]),
    ...channel.products.map((p) => product({ name: p.name, priceCast: p.priceCast, imgUrl: p.imgUrl, channelHandle: handle })),
  ];

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 96px" }}>
      <JsonLd data={jsonLd} />
      <ChannelHeader channel={channel} />

      {live && (
        <Link
          href={`/c/${handle}`}
          className="card"
          style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, marginBottom: 28, textDecoration: "none" }}
        >
          <span className="live-pill">live</span>
          <span style={{ fontWeight: 700 }}>{live.title}</span>
          <span className="tnum lower" style={{ color: "var(--ink-3)", fontSize: 13 }}>
            {formatCast(live.viewers)} watching
          </span>
        </Link>
      )}

      <div style={{ marginBottom: 28 }}>
        <SupportBar
          channelId={channel.id}
          tiers={channel.tiers.map((t) => ({
            id: t.id,
            name: t.name,
            priceCast: t.priceCast,
            perks: t.perks,
            popular: t.popular ?? false,
          }))}
          products={channel.products.map((p) => ({
            id: p.id,
            name: p.name,
            priceCast: p.priceCast,
            kind: p.kind,
          }))}
        />
      </div>

      <section style={{ marginBottom: 40 }}>
        <h2 className="lower" style={{ fontSize: 20, marginBottom: 16 }}>library</h2>
        {channel.videos.length ? (
          <div className="grid-tiles">
            {channel.videos.map((v) => (
              <VideoCard key={v.id} video={{ ...v, channel: { creator: channel.creator } }} />
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--ink-3)" }} className="lower">no public videos yet.</p>
        )}
      </section>

      {channel.tiers.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 className="lower" style={{ fontSize: 20, marginBottom: 16 }}>membership</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {channel.tiers.map((t) => (
              <TierCard key={t.id} tier={{ name: t.name, priceCast: t.priceCast, perks: t.perks, popular: t.popular ?? false }} />
            ))}
          </div>
        </section>
      )}

      {channel.products.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 className="lower" style={{ fontSize: 20, marginBottom: 16 }}>store</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {channel.products.map((p) => (
              <div key={p.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div className="thumb" style={{ aspectRatio: "4 / 3", backgroundImage: `url(${p.imgUrl})`, backgroundSize: "cover" }} />
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  <span className="chip lower" style={{ alignSelf: "flex-start" }}>{p.kind}</span>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                  {p.edition && <div className="lower" style={{ color: "var(--ink-3)", fontSize: 12 }}>{p.edition}</div>}
                  <div style={{ marginTop: "auto", display: "flex", alignItems: "baseline", gap: 8, paddingTop: 8 }}>
                    <span className="stat-num tnum" style={{ fontSize: 18 }}>{formatCast(p.priceCast)}</span>
                    <span style={{ color: "var(--ink-3)", fontSize: 12 }}>CAST · {formatFiat(p.priceCast)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
