"use client";

// Hero "watching now" counter that ticks every couple of seconds — a light live-feel touch for
// the home hero (ported in spirit from the prototype's animated live counters). No realtime feed
// is wired yet, so it jitters the seed count by a small random delta around the base value.
import { useEffect, useState } from "react";
import { formatNum } from "@/components/ui/primitives";

export function AnimatedViewerCount({ base }: { base: number }) {
  const [n, setN] = useState(base);

  useEffect(() => {
    const id = window.setInterval(() => {
      const delta = Math.round((Math.random() - 0.45) * Math.max(8, base * 0.01));
      setN((prev) => Math.max(0, Math.round(base * 0.9 + (prev - base * 0.9) * 0.6 + delta)));
    }, 2200);
    return () => window.clearInterval(id);
  }, [base]);

  return (
    <span
      className="tnum"
      style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", color: "white" }}
    >
      {formatNum(n)}
    </span>
  );
}
