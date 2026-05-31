"use client";

/**
 * AxModeration — the moderation workspace with two tabs (Seg): the report queue (severity
 * triage + per-report enforcement via AdReportActions) and the live monitor (a grid of every
 * public live stream with viewer count, a flagged indicator and a watch action). The page
 * (server component) reads listReports + listLiveStreams and passes serialisable rows down.
 * Spec: prototype/v4/admin-moderation.jsx.
 */
import { useState } from "react";
import { StudioCard, Pill, Seg, type PillTone } from "@/components/studio-ui";
import { Icon } from "@/components/ui/Icon";
import { AdReportActions } from "@/components/admin/AdReportActions";

export interface ModReport {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  reportCount: number;
  severity: "high" | "medium" | "low" | string;
  status: "open" | "investigating" | "actioned" | "dismissed";
}

export interface LiveStreamRow {
  id: string;
  title: string;
  category: string;
  creatorName: string;
  viewers: number;
  flagged: boolean;
}

const SEV_TONE: Record<string, PillTone> = { high: "live", medium: "warn", low: "neutral" };
const STATUS_TONE: Record<string, PillTone> = {
  open: "warn",
  investigating: "info",
  actioned: "ok",
  dismissed: "neutral",
};
const TYPE_ICON: Record<string, string> = {
  stream: "flame",
  product: "bag",
  user: "user",
  vod: "film",
  clip: "play",
};

const COLS = "40px 1.5fr 110px 80px 100px auto";
const SEVERITIES = ["all", "high", "medium", "low"] as const;

function fmt(n: number): string {
  return n.toLocaleString("en-GB");
}

export function AxModeration({ reports, live }: { reports: ModReport[]; live: LiveStreamRow[] }) {
  const [tab, setTab] = useState<"queue" | "live">("queue");
  const [sev, setSev] = useState<(typeof SEVERITIES)[number]>("all");

  const filtered = reports.filter((r) => sev === "all" || r.severity === sev);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", margin: "18px 0 0" }}>
        <Seg
          items={[
            { id: "queue", label: "report queue" },
            { id: "live", label: "live monitor" },
          ]}
          value={tab}
          onChange={(id) => setTab(id as "queue" | "live")}
        />
      </div>

      {tab === "queue" && (
        <>
          <div style={{ display: "flex", gap: 6, margin: "14px 0" }}>
            {SEVERITIES.map((f) => (
              <button
                key={f}
                type="button"
                className={`chip${sev === f ? " active" : ""}`}
                onClick={() => setSev(f)}
                style={{ padding: "7px 13px", fontSize: 12 }}
              >
                <span className="lower">{f === "all" ? "all severities" : f}</span>
              </button>
            ))}
          </div>

          <StudioCard pad={false}>
            <div className="st-row head" style={{ gridTemplateColumns: COLS }}>
              <span />
              <span>target · reason</span>
              <span>severity</span>
              <span style={{ textAlign: "right" }}>reports</span>
              <span>status</span>
              <span style={{ textAlign: "right" }}>action</span>
            </div>

            {filtered.length === 0 ? (
              <div className="lower" style={{ padding: "32px 18px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
                nothing in the queue — all clear.
              </div>
            ) : (
              filtered.map((r) => (
                <div key={r.id} className="st-row" style={{ gridTemplateColumns: COLS }}>
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: "var(--surface-2)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--ink-3)",
                    }}
                  >
                    <Icon name={TYPE_ICON[r.targetType] ?? "flame"} size={15} stroke={2} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.targetId}
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      {r.id} · {r.reason}
                    </div>
                  </div>
                  <div>
                    <Pill tone={SEV_TONE[r.severity] ?? "neutral"}>{r.severity}</Pill>
                  </div>
                  <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 800 }}>
                    {r.reportCount}
                  </div>
                  <div>
                    <Pill tone={STATUS_TONE[r.status] ?? "neutral"}>{r.status}</Pill>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <AdReportActions id={r.id} status={r.status} />
                  </div>
                </div>
              ))
            )}
          </StudioCard>
        </>
      )}

      {tab === "live" && (
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
            marginTop: 18,
          }}
        >
          {live.length === 0 ? (
            <StudioCard>
              <div className="lower" style={{ color: "var(--ink-3)", fontSize: 13 }}>
                nobody is live right now.
              </div>
            </StudioCard>
          ) : (
            live.map((s) => (
              <div key={s.id} className="card" style={{ background: "var(--surface)", overflow: "hidden" }}>
                <div className="stream-preview" style={{ aspectRatio: "16/9", borderRadius: 0, position: "relative" }}>
                  <div className="bars">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <span key={j} style={{ animationDelay: `${j * 0.1}s`, height: `${20 + (j % 4) * 16}%` }} />
                    ))}
                  </div>
                  <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
                    <span className="onair" style={{ padding: "4px 9px 4px 8px", fontSize: 10 }}>
                      live
                    </span>
                    {s.flagged && <Pill tone="live">flagged</Pill>}
                  </div>
                  <span
                    className="tnum"
                    style={{
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 800,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {fmt(s.viewers)} watching
                  </span>
                </div>
                <div style={{ padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.creatorName}
                    </div>
                    <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      {s.category}
                    </div>
                  </div>
                  <button type="button" className="btn btn-glass lower" style={{ padding: "7px 10px", fontSize: 11.5, flex: "0 0 auto" }}>
                    watch
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}

export default AxModeration;
