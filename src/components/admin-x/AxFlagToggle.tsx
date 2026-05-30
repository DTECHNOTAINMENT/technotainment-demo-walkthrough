"use client";

/**
 * AxFlagToggle — flip a feature flag on/off (the .tg switch). POSTs
 * { resource:'flag', id, on } and re-reads. Flipping a roadmap flag turns the
 * feature on with no deploy ("configure, don't code").
 */
import { useState } from "react";
import { useAxAction } from "./useAxAction";

export function AxFlagToggle({ id, on }: { id: string; on: boolean }) {
  const { run, busy } = useAxAction();
  const [current, setCurrent] = useState(on);

  async function flip() {
    if (busy) return;
    const next = !current;
    setCurrent(next); // optimistic
    const res = await run({ resource: "flag", id, on: next });
    if (!res) setCurrent(!next);
  }

  return (
    <span
      role="switch"
      aria-checked={current}
      aria-label="feature flag"
      tabIndex={0}
      onClick={() => void flip()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void flip();
        }
      }}
      className={`tg${current ? " on" : ""}`}
      style={{ cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}
    />
  );
}

export default AxFlagToggle;
