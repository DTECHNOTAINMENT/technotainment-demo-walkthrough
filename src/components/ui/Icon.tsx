// Inline SVG icon set (line, 2px stroke, rounded, lucide-aligned).
// Ported verbatim from prototype/v4/shared.jsx ICONS. Server-safe (no client hooks).
import type { ReactElement, CSSProperties } from "react";

const ICONS: Record<string, ReactElement> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 1112 0v5l1.5 2.5h-15L6 14V9z" />
      <path d="M10 19a2 2 0 004 0" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  check: <path d="M5 12l5 5L20 7" />,
  chevR: <path d="M9 6l6 6-6 6" />,
  chevL: <path d="M15 6l-6 6 6 6" />,
  chevD: <path d="M6 9l6 6 6-6" />,
  arrowR: (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  play: <path d="M7 4l13 8-13 8V4z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none" />
      <rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none" />
    </>
  ),
  heart: <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 6a5.5 5.5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z" />,
  home: (
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="4" />
      <circle cx="17" cy="9" r="3" />
      <path d="M2 21c1-4 4-6 7-6s6 2 7 6" />
      <path d="M16 21c.6-2.4 2-4 4-4" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  chat: (
    <>
      <path d="M21 12a8 8 0 01-8 8H7l-4 3V12a8 8 0 018-8h2a8 8 0 018 8z" />
    </>
  ),
  tip: (
    <>
      <path d="M12 3v18" />
      <path d="M16 7H10a2.5 2.5 0 000 5h4a2.5 2.5 0 010 5H7" />
    </>
  ),
  share: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8 11l8-4" />
      <path d="M8 13l8 4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />,
  flame: <path d="M12 3s5 4 5 9a5 5 0 11-10 0c0-2 1-3 2-4 0 2 1 3 3 2-2-3 0-5 0-7z" />,
  gift: (
    <>
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M3 12h18" />
      <path d="M12 8v13" />
      <path d="M12 8s-3-4-5-2 2 2 5 2zM12 8s3-4 5-2-2 2-5 2z" />
    </>
  ),
  bag: (
    <>
      <path d="M6 7h12l-1 12a2 2 0 01-2 2H9a2 2 0 01-2-2L6 7z" />
      <path d="M9 7V5a3 3 0 016 0v2" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.4 1.8l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.8-.4 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1A1.7 1.7 0 008.6 19a1.7 1.7 0 00-1.8.4l-.06.06A2 2 0 113.91 16.6l.06-.06a1.7 1.7 0 00.4-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1A1.7 1.7 0 005 8.6a1.7 1.7 0 00-.4-1.8L4.55 6.7a2 2 0 112.83-2.83l.06.06A1.7 1.7 0 009.24 4.3a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.4l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.4 1.8V9.4a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </>
  ),
  cast: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l3 6 3-6" />
      <path d="M9 13h6" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 3v18M17 3v18M3 12h18M3 7h4M3 17h4M17 7h4M17 17h4" />
    </>
  ),
  trend: (
    <>
      <path d="M3 17l6-6 4 4 7-7" />
      <path d="M14 8h6v6" />
    </>
  ),
  sparkle: <path d="M12 3l1.6 5L18 9.6 13.6 12 12 17 10.4 12 6 9.6 10.4 8 12 3z" fill="currentColor" stroke="none" />,
  bookmark: <path d="M6 4h12v17l-6-4-6 4V4z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
};

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  stroke = 2,
  className = "",
  style = {},
  fill = "none",
}: {
  name: string;
  size?: number;
  stroke?: number;
  className?: string;
  style?: CSSProperties;
  fill?: string;
}) {
  const path = ICONS[name];
  if (!path) {
    return <span className={className} style={{ display: "inline-block", width: size, height: size, ...style }} />;
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      {path}
    </svg>
  );
}
