"use client";

// Client tab shell for the channel page — mirrors microcast.jsx tab strip. Receives the
// per-tab content as named slots so the server page keeps owning all data + the SupportBar /
// LiveChat client islands.
import { useState, type ReactNode } from "react";

export interface ChannelTab {
  id: string;
  label: string;
}

export function ChannelTabs({
  tabs,
  initial,
  slots,
}: {
  tabs: ChannelTab[];
  initial: string;
  slots: Record<string, ReactNode>;
}) {
  const [tab, setTab] = useState(initial);
  return (
    <>
      <div
        style={{
          marginTop: 22,
          borderBottom: "1px solid var(--hairline)",
          display: "flex",
          gap: 24,
          overflowX: "auto",
          scrollbarWidth: "none",
          paddingBottom: 0,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`nav-link ${tab === t.id ? "active" : ""}`}
            style={{ paddingBottom: 14 }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ paddingTop: 24 }}>{slots[tab]}</div>
    </>
  );
}
