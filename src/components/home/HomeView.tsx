// Viewer home — Hero marquee + uniform grid of live/VOD tiles.
// Ported from prototype/v4/home.jsx (Hero + GTile). Server component (no client hooks).
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Avatar, LiveBadge, ViewerBadge, Thumb, formatNum, type CreatorLike } from "@/components/ui/primitives";

export interface HomeTile {
  id: string;
  title: string;
  href: string;
  thumb: string;
  creator: CreatorLike;
  live: boolean;
  viewers?: number;
  ago?: string | null;
  dur?: string | null;
}

export interface HeroData {
  title: string;
  sub?: string | null;
  kicker?: string[];
  href: string;
  img: string;
  viewers: number;
  creator: CreatorLike;
}

function GTile({ post }: { post: HomeTile }) {
  return (
    <Link href={post.href} className="gtile tile" style={{ display: "block" }}>
      <Thumb src={post.thumb}>
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, alignItems: "center" }}>
          {post.live && <LiveBadge />}
          {post.live && post.viewers != null && <ViewerBadge n={post.viewers} />}
          {!post.live && post.dur && (
            <span
              className="tnum"
              style={{
                background: "rgba(0,0,0,0.65)",
                color: "white",
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                backdropFilter: "blur(6px)",
              }}
            >
              {post.dur}
            </span>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 4,
            background: `linear-gradient(90deg, ${post.creator.brand ?? "#7c3aed"}, ${post.creator.brand2 ?? "#ec4899"})`,
            opacity: 0.95,
          }}
        />
      </Thumb>
      <div style={{ display: "flex", gap: 10, padding: "10px 2px", alignItems: "flex-start" }}>
        <Avatar creator={post.creator} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              lineHeight: 1.25,
              color: "var(--ink-1)",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {post.title}
          </div>
          <div className="lower" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
            {post.creator.handle}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>
            {post.live && post.viewers != null && <span className="tnum">{formatNum(post.viewers)} watching</span>}
            {!post.live && post.ago && <span>{post.ago}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

function Hero({ hero }: { hero: HeroData }) {
  return (
    <div className="marquee" style={{ backgroundImage: `url(${hero.img})`, position: "relative", zIndex: 1 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          padding: "clamp(20px, 3.6vw, 40px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          <LiveBadge />
          {(hero.kicker ?? []).map((k, i) => (
            <span key={k} style={{ display: "inline-flex", gap: 10 }}>
              {i > 0 && <span style={{ opacity: 0.5 }}>·</span>}
              <span>{k}</span>
            </span>
          ))}
        </div>
        <h1
          className="lower"
          style={{
            margin: 0,
            fontSize: "clamp(28px, 5vw, 60px)",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            lineHeight: 1.0,
            maxWidth: 880,
          }}
        >
          {hero.title}
        </h1>
        {hero.sub && (
          <div style={{ marginTop: 8, fontSize: "clamp(13px, 1.2vw, 16px)", opacity: 0.85, maxWidth: 640 }}>{hero.sub}</div>
        )}
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <Link href={hero.href} className="btn btn-grad" style={{ padding: "13px 22px", fontSize: 14 }}>
            <Icon name="play" size={14} stroke={2.4} fill="currentColor" /> watch live
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar creator={hero.creator} size={34} />
            <div style={{ fontSize: 13 }}>
              <div style={{ fontWeight: 700 }}>{hero.creator.name}</div>
              <div className="lower" style={{ fontSize: 11, opacity: 0.7 }}>
                {hero.creator.handle}
              </div>
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "baseline", gap: 8 }}>
            <span
              className="tnum"
              style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", color: "white" }}
            >
              {formatNum(hero.viewers)}
            </span>
            <span style={{ fontSize: 12, opacity: 0.75, fontStyle: "italic" }}>watching now</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeView({ hero, tiles }: { hero: HeroData | null; tiles: HomeTile[] }) {
  return (
    <div className="page-pad">
      {hero && <Hero hero={hero} />}

      <section style={{ marginTop: hero ? 28 : 0 }}>
        <div className="grid-tiles">
          {tiles.map((t) => (
            <GTile key={t.id} post={t} />
          ))}
        </div>
        {tiles.length === 0 && (
          <div style={{ padding: 60, textAlign: "center", color: "var(--ink-3)" }}>
            <div className="lower" style={{ fontSize: 16, fontWeight: 700 }}>
              nothing live right now
            </div>
            <div style={{ fontSize: 13, marginTop: 6 }}>check back later or browse the categories.</div>
          </div>
        )}
      </section>
    </div>
  );
}
