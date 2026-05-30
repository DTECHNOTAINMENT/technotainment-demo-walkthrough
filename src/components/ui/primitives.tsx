// Viewer UI primitives — ported from prototype/v4/shared.jsx (Avatar, Thumb, LiveBadge,
// ViewerBadge, CastGlyph, formatNum). Server-safe; design-token styling only.
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

export interface CreatorLike {
  name: string;
  handle: string;
  brand?: string | null;
  brand2?: string | null;
  avatarUrl?: string | null;
}

/** Compact number formatter: 48300 -> "48.3K", 1_200_000 -> "1.2M". */
export function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

/** Picsum seeded thumbnail, matching the prototype's pic() fallback. */
export function picThumb(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/640/360`;
}

export function CastGlyph({ size = 22 }: { size?: number }) {
  return (
    <span className="cast-glyph" style={{ width: size, height: size, fontSize: size * 0.5 }}>
      C
    </span>
  );
}

export function Avatar({ creator, size = 40, ring = false }: { creator: CreatorLike; size?: number; ring?: boolean }) {
  const initials = creator?.name
    ? creator.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";
  const inner = (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: creator?.brand
          ? `linear-gradient(135deg, ${creator.brand}, ${creator.brand2 ?? creator.brand})`
          : "linear-gradient(135deg,#333,#666)",
        backgroundImage: creator?.avatarUrl ? `url(${creator.avatarUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        fontWeight: 800,
        fontSize: size * 0.38,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: `0 0 ${size}px`,
        overflow: "hidden",
      }}
    >
      {!creator?.avatarUrl && initials}
    </div>
  );
  if (ring) {
    return (
      <span className="av-ring" style={{ display: "inline-block" }}>
        <span className="av-inner" style={{ display: "inline-block" }}>
          {inner}
        </span>
      </span>
    );
  }
  return inner;
}

export function LiveBadge() {
  return <span className="live-pill">live</span>;
}

export function ViewerBadge({ n, ml = false }: { n: number; ml?: boolean }) {
  return (
    <span
      className="tnum"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "rgba(0,0,0,0.65)",
        color: "white",
        padding: "3px 8px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        backdropFilter: "blur(6px)",
        marginLeft: ml ? 6 : 0,
      }}
    >
      <Icon name="eye" size={11} stroke={2.4} /> {formatNum(n)}
    </span>
  );
}

/** 16:9 thumbnail with image (or gradient placeholder) + overlay + children. */
export function Thumb({
  src,
  gradClass = "thumb-grad-1",
  title,
  overlay = true,
  children,
  style,
}: {
  src?: string | null;
  gradClass?: string;
  title?: string;
  overlay?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`thumb ${src ? "" : gradClass}`}
      style={{ backgroundImage: src ? `url(${src})` : undefined, ...style }}
    >
      {overlay && <div className="thumb-overlay" />}
      {children}
      {title && !src && <div className="thumb-title">{title}</div>}
    </div>
  );
}
