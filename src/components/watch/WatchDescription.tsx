"use client";

// Clickable expand/collapse description card, ported from prototype/v4/live.jsx (lines ~381–397).
// Collapsed: meta line + 2-line clamp + "…more". Expanded: full text + "show less".
import { useState } from "react";

export function WatchDescription({
  metaLine,
  hashtags,
  description,
}: {
  metaLine: string;
  hashtags?: string;
  description: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      style={{
        marginTop: 20,
        background: "var(--surface-2)",
        borderRadius: 12,
        padding: "12px 14px",
        color: "var(--ink-1)",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 6 }} className="tnum">
        {metaLine}
        {hashtags && (
          <>
            {" · "}
            <span style={{ color: "rgba(98,178,255,0.85)" }}>{hashtags}</span>
          </>
        )}
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.55,
          color: "var(--ink-2)",
          whiteSpace: "pre-wrap",
          display: expanded ? "block" : "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: expanded ? "unset" : 2,
          overflow: "hidden",
        }}
      >
        {description}
        {expanded ? (
          <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>{"  "}show less</span>
        ) : (
          <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>{"  "}…more</span>
        )}
      </div>
    </div>
  );
}

export default WatchDescription;
