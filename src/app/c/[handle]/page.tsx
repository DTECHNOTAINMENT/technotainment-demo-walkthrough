// Channel page — /c/:handle. ISR (docs/ROUTES.md: revalidate 60s).
// schema.org: Person + BreadcrumbList + Product list. Server-rendered.
// Presentation rebuilt to match prototype/v4/microcast.jsx (hero banner, avatar, stats,
// tabs, live/library/store/membership). Data wiring (SupportBar, LiveChat, JsonLd,
// generateMetadata, getChannelByHandle) is unchanged.
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChannelByHandle } from "@/lib/queries/public";
import { buildMetadata, clampDescription } from "@/lib/seo/meta";
import { person, breadcrumb, product } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { VideoCard } from "@/components/public/cards";
import { SupportBar } from "@/components/SupportBar";
import { LiveChat } from "@/components/LiveChat";
import { ChannelTabs } from "@/components/viewer/ChannelTabs";
import { Avatar, formatNum } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { formatCast, formatFiat } from "@/lib/cast";

export const revalidate = 60;

type Props = { params: { handle: string } };

/** Decode the handle and resolve the channel, tolerating a missing leading "@". */
async function load(rawHandle: string) {
  const decoded = decodeURIComponent(rawHandle);
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
  const c = channel.creator;
  const banner = `https://picsum.photos/seed/${encodeURIComponent(`${c.id}-banner-${c.brand}`)}/1600/600`;

  const jsonLd = [
    person(channel.creator),
    breadcrumb([
      { name: "home", path: "/" },
      { name: channel.name, path: `/c/${handle}` },
    ]),
    ...channel.products.map((p) => product({ name: p.name, priceCast: p.priceCast, imgUrl: p.imgUrl, channelHandle: handle })),
  ];

  const supportBar = (
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
  );

  // --- tab slots --------------------------------------------------------
  const liveSlot = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {live ? (
        <>
          <Link
            href={`/c/${handle}`}
            className="card"
            style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, textDecoration: "none" }}
          >
            <span className="live-pill">live</span>
            <span style={{ fontWeight: 700 }}>{live.title}</span>
            <span className="tnum lower" style={{ color: "var(--ink-3)", fontSize: 13 }}>
              {formatNum(live.viewers)} watching
            </span>
          </Link>
          <div style={{ maxWidth: 420 }}>
            <LiveChat streamId={live.id} />
          </div>
        </>
      ) : (
        <p className="lower" style={{ color: "var(--ink-3)" }}>
          nothing live right now — catch the library below or join for upcoming sessions.
        </p>
      )}
    </div>
  );

  const librarySlot = channel.videos.length ? (
    <div className="grid-tiles">
      {channel.videos.map((v) => (
        <VideoCard key={v.id} video={{ ...v, channel: { creator: channel.creator } }} />
      ))}
    </div>
  ) : (
    <p style={{ color: "var(--ink-3)" }} className="lower">no public videos yet.</p>
  );

  const storeSlot = channel.products.length ? (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
      {channel.products.map((p) => (
        <div key={p.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="thumb" style={{ aspectRatio: "4 / 3", borderRadius: 0, backgroundImage: `url(${p.imgUrl})`, backgroundSize: "cover" }}>
            <div className="thumb-overlay" />
            <span
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                fontSize: 10,
                fontWeight: 800,
                color: "white",
                background: "rgba(0,0,0,0.65)",
                padding: "3px 8px",
                borderRadius: 6,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                backdropFilter: "blur(6px)",
              }}
            >
              {p.kind}
            </span>
          </div>
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{p.name}</div>
            {p.edition && <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)" }}>{p.edition}</div>}
            <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span className="tnum brand-grad-text" style={{ fontWeight: 800, fontSize: 20 }}>{formatCast(p.priceCast)}</span>
                <span style={{ fontSize: 11, color: "var(--ink-3)" }}>CAST · {formatFiat(p.priceCast)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div style={{ gridColumn: "1 / -1" }}>{supportBar}</div>
    </div>
  ) : (
    <p className="lower" style={{ color: "var(--ink-3)" }}>no store items yet.</p>
  );

  const membersSlot = channel.tiers.length ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
        {channel.tiers.map((t) => (
          <div key={t.id} className={`tier ${t.popular ? "popular" : ""}`}>
            {t.popular && (
              <span
                style={{
                  position: "absolute",
                  top: -10,
                  left: 18,
                  fontSize: 10,
                  fontWeight: 800,
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "var(--brand-gradient)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                most members
              </span>
            )}
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>{t.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 10 }}>
              <span className="tnum brand-grad-text stat-num" style={{ fontSize: 38 }}>{formatCast(t.priceCast)}</span>
              <span style={{ fontSize: 13, color: "var(--ink-3)" }}>CAST / month</span>
            </div>
            <ul style={{ paddingLeft: 0, listStyle: "none", margin: "16px 0 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              {t.perks.map((p, i) => (
                <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13 }}>
                  <Icon name="check" size={16} stroke={2.4} style={{ color: c.brand, flex: "0 0 16px", marginTop: 2 }} /> <span>{p}</span>
                </li>
              ))}
            </ul>
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-4)", textAlign: "center" }}>renews monthly · cancel any time</div>
          </div>
        ))}
      </div>
      {supportBar}
    </div>
  ) : (
    <p className="lower" style={{ color: "var(--ink-3)" }}>no membership tiers yet.</p>
  );

  const aboutSlot = (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>about</div>
        <p style={{ fontSize: 15, lineHeight: 1.65, marginTop: 8, color: "var(--ink-2)" }}>
          {channel.bio ?? `${channel.name} streams ${c.category} on the platform. the audience belongs to ${channel.name.split(" ")[0]} — if they ever move off-platform, the relationship moves with them.`}
        </p>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>category</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          <span className="chip lower">{c.category}</span>
          <span className="chip lower">{formatNum(c.followers)} followers</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 96 }}>
      <JsonLd data={jsonLd} />

      {/* HERO */}
      <div
        style={{
          position: "relative",
          height: "clamp(220px, 32vw, 380px)",
          backgroundImage: `url(${banner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 70%, var(--bg) 100%), linear-gradient(135deg, ${c.brand}88, transparent 60%)`,
          }}
        />
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 0, transform: "translateY(40%)", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-end", flexWrap: "wrap" }}>
            <span style={{ padding: 4, borderRadius: "50%", background: `linear-gradient(135deg, ${c.brand}, ${c.brand2})`, boxShadow: "0 24px 48px -16px rgba(0,0,0,0.6)" }}>
              <span style={{ display: "block", padding: 3, borderRadius: "50%", background: "var(--bg)" }}>
                <Avatar creator={c} size={110} />
              </span>
            </span>
            <div style={{ flex: 1, minWidth: 240, color: "white" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 800, opacity: 0.85 }}>microcast · creator destination</div>
              <h1 style={{ margin: "6px 0 4px", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>{channel.name}</h1>
              <div style={{ fontSize: 13, opacity: 0.9 }} className="lower">{handle} · {c.category}</div>
            </div>
          </div>
        </div>
      </div>

      {/* stats + actions */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", color: "var(--ink-1)" }}>
            <Stat value={formatNum(c.followers)} label="followers" />
            {live && <Stat value={formatNum(live.viewers)} label="watching now" grad />}
            <Stat value={String(channel.videos.length)} label="videos" />
            <Stat value={String(channel.tiers.length)} label="tiers" />
            <Stat value={String(channel.products.length)} label="store items" />
          </div>
          <div style={{ minWidth: 280 }}>{supportBar}</div>
        </div>

        {/* tabs */}
        <ChannelTabs
          tabs={[
            { id: "live", label: "live & upcoming" },
            { id: "library", label: "library" },
            { id: "store", label: "store" },
            { id: "members", label: "membership" },
            { id: "about", label: "about" },
          ]}
          initial={live ? "live" : "library"}
          slots={{ live: liveSlot, library: librarySlot, store: storeSlot, members: membersSlot, about: aboutSlot }}
        />
      </div>
    </div>
  );
}

function Stat({ value, label, grad = false }: { value: string; label: string; grad?: boolean }) {
  return (
    <div>
      <div className={`tnum stat-num${grad ? " brand-grad-text" : ""}`} style={{ fontSize: 22 }}>
        {value}
      </div>
      <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)" }}>
        {label}
      </div>
    </div>
  );
}
