// Shared viewer presentation pieces — ported from prototype/v4 (extras.jsx PageHeader,
// GTile, microcast hero/tabs). Server-safe; design-token styling only. These reskin the
// existing viewer pages to pixel-match the prototype without touching data wiring.
import type { ReactNode } from "react";
import Link from "next/link";
import { Avatar, LiveBadge, ViewerBadge, Thumb, formatNum, type CreatorLike } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

/** Section page header strip — eyebrow + big lowercase title + sub + optional action. */
export function PageHeader({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingBottom: 18,
        borderBottom: "1px solid var(--hairline)",
        marginBottom: 24,
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div>
        {eyebrow && (
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            {eyebrow}
          </div>
        )}
        <h1
          className="lower"
          style={{ margin: "6px 0 0", fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.04 }}
        >
          {title}
        </h1>
        {sub && <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 6 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

export interface GTilePost {
  creator: CreatorLike;
  title: string;
  thumb?: string | null;
  viewers?: number | null;
  in?: string | null;
  dur?: string | null;
}

/** Grid tile — thumbnail + creator avatar row, matches prototype GTile (extras.jsx). */
export function GTile({ post, href }: { post: GTilePost; href: string }) {
  const isLive = post.viewers != null && !post.in && !post.dur;
  const isSoon = !!post.in;
  return (
    <Link href={href} className="gtile tile" style={{ display: "block", textDecoration: "none" }}>
      <Thumb src={post.thumb}>
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, alignItems: "center" }}>
          {isLive && <LiveBadge />}
          {isLive && post.viewers != null && <ViewerBadge n={post.viewers} />}
          {isSoon && (
            <span
              className="tnum"
              style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, backdropFilter: "blur(6px)" }}
            >
              <Icon name="clock" size={11} stroke={2.4} style={{ marginRight: 4, verticalAlign: -1 }} />in {post.in}
            </span>
          )}
          {!isLive && !isSoon && post.dur && (
            <span
              className="tnum"
              style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, backdropFilter: "blur(6px)" }}
            >
              {post.dur}
            </span>
          )}
        </div>
      </Thumb>
      <div style={{ display: "flex", gap: 10, padding: "10px 2px", alignItems: "flex-start" }}>
        <Avatar creator={post.creator} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.3,
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
        </div>
      </div>
    </Link>
  );
}

export { formatNum };
