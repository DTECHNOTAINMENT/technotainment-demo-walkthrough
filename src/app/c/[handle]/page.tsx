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
import { ChannelTabs } from "@/components/viewer/ChannelTabs";
import { ChannelActions } from "@/components/viewer/ChannelActions";
import { ChannelStore } from "@/components/viewer/ChannelStore";
import { ChannelSubscribeButton } from "@/components/viewer/ChannelSubscribeButton";
import { Avatar, Thumb, LiveBadge, ViewerBadge, formatNum } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { formatCast } from "@/lib/cast";
import { catImage } from "@/lib/img";
import { PublicShell } from "@/components/app/PublicShell";

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
  const banner = catImage(c.category, `${c.id}-banner`, 1600, 600);
  // Poster for the live tile thumbnail (the rich player itself lives on /watch/live/:id).
  const livePoster = live ? catImage(c.category, `${live.id}-live`) : "";

  const jsonLd = [
    person(channel.creator),
    breadcrumb([
      { name: "home", path: "/" },
      { name: channel.name, path: `/c/${handle}` },
    ]),
    ...channel.products.map((p) => product({ name: p.name, priceCast: p.priceCast, imgUrl: p.imgUrl, channelHandle: handle })),
  ];

  const supportBar = (
    <div id="support">
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
  );

  // --- derived stats (shaped like the prototype: followers | members | live hours |
  //     top supporter | drops to date). Demo-deterministic from the creator/channel so
  //     the no-DB render stays stable. ---
  const members = channel.tiers.reduce((sum, _t, i) => sum + 300 + i * 180, 0) + (c.followers % 900);
  const liveHours = 120 + (c.followers % 280);
  const SUPPORTERS = ["@theo", "@mara", "@kit", "@juno", "@rae", "@bex"];
  const topSupporter = SUPPORTERS[c.followers % SUPPORTERS.length];
  const dropsToDate = channel.products.length * 7 + (c.followers % 30);
  const firstName = channel.name.split(" ")[0];

  // --- tab slots --------------------------------------------------------
  // upcoming/schedule rows (demo data, shaped like the prototype's upcoming tiles).
  const schedule = [
    { title: "patch workshop · members only", when: "tomorrow 19:00", reminders: 412 },
    { title: "open q&a", when: "sat 16:00", reminders: 188 },
    { title: "release listening · 'glass tide'", when: "mon 21:00", reminders: 96 },
    { title: "studio tour · 2026 edition", when: "wed 17:00", reminders: 54 },
  ];

  // The "live & upcoming" tab is a horizontal rail of tiles (prototype/v4/microcast.jsx →
  // tab === "live": <Tile .../> rows in a `.rail`). The live tile links through to the rich
  // live-watch page (/watch/live/:id); upcoming tiles carry a clock "in {when}" badge.
  const liveSlot = (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="rail">
        {live && (
          <Link
            href={`/watch/live/${live.id}`}
            className="tile"
            style={{ width: 320, cursor: "pointer", textDecoration: "none", display: "block" }}
          >
            <Thumb src={livePoster}>
              <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, alignItems: "center" }}>
                <LiveBadge />
                <ViewerBadge n={live.viewers} />
              </div>
              <div style={{ position: "absolute", left: 10, bottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ padding: 2, borderRadius: "50%", background: `linear-gradient(135deg, ${c.brand}, ${c.brand2})` }}>
                  <Avatar creator={c} size={26} />
                </span>
              </div>
            </Thumb>
            <div style={{ display: "flex", gap: 10, padding: "10px 2px", alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3, color: "var(--ink-1)", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden" }}>
                  {live.title}
                </div>
                <div className="lower" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{handle}</span>
                  <span>· <span className="tnum">{formatNum(live.viewers)}</span> watching</span>
                </div>
              </div>
            </div>
          </Link>
        )}
        {schedule.map((s, i) => (
          <div key={s.title} className="tile" style={{ width: 320 }}>
            <Thumb src={catImage(c.category, `${c.id}-up${i + 1}`)}>
              <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, alignItems: "center" }}>
                <span className="tnum" style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, backdropFilter: "blur(6px)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Icon name="clock" size={11} stroke={2.4} /> in {s.when}
                </span>
              </div>
              <div style={{ position: "absolute", left: 10, bottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ padding: 2, borderRadius: "50%", background: `linear-gradient(135deg, ${c.brand}, ${c.brand2})` }}>
                  <Avatar creator={c} size={26} />
                </span>
              </div>
            </Thumb>
            <div style={{ display: "flex", gap: 10, padding: "10px 2px", alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3, color: "var(--ink-1)", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden" }}>
                  {s.title}
                </div>
                <div className="lower" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span>{handle}</span>
                  <span>· <Icon name="bell" size={12} stroke={2.2} style={{ verticalAlign: -1 }} /> <span className="tnum">{formatNum(s.reminders)}</span></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
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
    <ChannelStore
      channelId={channel.id}
      products={channel.products.map((p) => ({
        id: p.id,
        name: p.name,
        priceCast: p.priceCast,
        kind: p.kind,
        edition: p.edition,
        imgUrl: p.imgUrl,
      }))}
    />
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
            <ChannelSubscribeButton channelId={channel.id} tierId={t.id} tierName={t.name} priceCast={t.priceCast} />
            <div className="mono" style={{ marginTop: 10, fontSize: 10, color: "var(--ink-4)", textAlign: "center" }}>renews monthly · cancel any time</div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <p className="lower" style={{ color: "var(--ink-3)" }}>no membership tiers yet.</p>
  );

  const aboutSlot = (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 22 }}>
      {/* (a) about / bio */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>about</div>
        <p style={{ fontSize: 15, lineHeight: 1.65, marginTop: 8, color: "var(--ink-2)" }}>
          {channel.bio ??
            `${channel.name} streams ${c.category} on the platform. live work twice a week, archives every set, runs a monthly q&a for members. the audience belongs to ${firstName} — if they ever move off-platform, the relationship moves with them.`}
        </p>
      </div>

      {/* (b) where you can find this microcast */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>
          where you can find this microcast
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {["metascape", "small rooms metacast", `embedded on ${handle.replace("@", "")}.fm`].map((loc) => (
            <span key={loc} className="chip lower">{loc}</span>
          ))}
        </div>
      </div>

      {/* (c) data transparency */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>
          what {firstName} keeps about members
        </div>
        <div
          style={{
            marginTop: 10,
            padding: 16,
            background: "var(--surface)",
            border: "1px solid var(--hairline)",
            borderRadius: 14,
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--ink-2)",
          }}
        >
          handle, email, and subscription history (required to run membership).
          <div style={{ marginTop: 6 }}>
            listening / watch history, chat, and tips / purchases — only if you allow it. controlled in{" "}
            <Link href="/profile" style={{ textDecoration: "underline" }}>profile → consent</Link>.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <PublicShell>
    <main style={{ paddingBottom: 96 }}>
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
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 0, transform: "translateY(40%)", maxWidth: 1440, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-end", flexWrap: "wrap" }}>
            <span style={{ padding: 4, borderRadius: "50%", background: `linear-gradient(135deg, ${c.brand}, ${c.brand2})`, boxShadow: "0 24px 48px -16px rgba(0,0,0,0.6)" }}>
              <span style={{ display: "block", padding: 3, borderRadius: "50%", background: "var(--bg)" }}>
                <Avatar creator={c} size={110} />
              </span>
            </span>
            <div style={{ flex: 1, minWidth: 240, color: "white" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 800, opacity: 0.85 }}>microcast · creator destination</div>
              <h1 style={{ margin: "6px 0 4px", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", textShadow: "0 2px 12px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", gap: 10 }}>
                {channel.name}
                <span
                  title="verified"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: "var(--brand-gradient)", color: "white", flex: "0 0 26px" }}
                >
                  <Icon name="check" size={15} stroke={3} />
                </span>
              </h1>
              <div style={{ fontSize: 13, opacity: 0.9 }} className="lower">{handle} · {c.category}</div>
            </div>
          </div>
        </div>
      </div>

      {/* stats + actions */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "80px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", color: "var(--ink-1)" }}>
            <Stat value={formatNum(c.followers)} label="followers" />
            <Stat value={formatNum(members)} label="members" grad />
            <Stat value={formatNum(liveHours)} label="live hours" />
            <Stat value={topSupporter} label="top supporter" />
            <Stat value={formatNum(dropsToDate)} label="drops to date" />
          </div>
          <ChannelActions channelId={channel.id} handle={handle} />
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

        {/* support / membership card — persistent so "tip with CAST" can scroll to it from any tab */}
        <div style={{ marginTop: 28, maxWidth: 520 }}>{supportBar}</div>
      </div>
    </main>
    </PublicShell>
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
