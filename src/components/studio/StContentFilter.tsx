"use client";

/**
 * StContentFilter — client wrapper for the studio content library, ported to match
 * prototype/v4/studio-content.jsx. The page is a server component, so it hands us the
 * already-fetched video rows and we own the interactive bits: the videos/schedule tab
 * (`Seg`), the status filter chips (all / published / drafts / processing / scheduled),
 * the filtered `.st-row` table, and a "schedule" section. There is no scheduled status
 * on Video, so "scheduled" / the schedule view derive from draft videos surfaced as
 * upcoming — honest to the data and matching the prototype's visual.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { formatCast } from "@/lib/cast";
import { StudioCard, Pill, Seg, type PillTone, type SegItem } from "@/components/studio-ui";

export interface ContentRow {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "processing" | "published";
  visibility: "public" | "members" | "ppv";
  thumbUrl: string | null;
  durationSec: number;
  views: number;
  castEarned: number;
  createdAt: string; // ISO
}

const STATUS_TONE: Record<string, PillTone> = {
  published: "ok",
  processing: "warn",
  draft: "neutral",
};
const VIS_TONE: Record<string, PillTone> = {
  public: "neutral",
  members: "info",
  ppv: "warn",
};

const ROW = "104px 1fr 110px 90px 110px";

const TABS: SegItem[] = [
  { id: "videos", label: "videos" },
  { id: "schedule", label: "schedule" },
];

const FILTERS = ["all", "published", "drafts", "processing", "scheduled"] as const;
type Filter = (typeof FILTERS)[number];

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function fmtDuration(sec: number): string {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function matches(row: ContentRow, filter: Filter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "published":
      return row.status === "published";
    case "drafts":
      return row.status === "draft";
    case "processing":
      return row.status === "processing";
    case "scheduled":
      // no scheduled status on Video — drafts are the upcoming/unpublished pool.
      return row.status === "draft";
  }
}

export function StContentFilter({ rows }: { rows: ContentRow[] }) {
  const [tab, setTab] = useState("videos");
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(() => rows.filter((r) => matches(r, filter)), [rows, filter]);
  // upcoming = draft videos surfaced as scheduled/unpublished items.
  const upcoming = useMemo(() => rows.filter((r) => r.status === "draft"), [rows]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <Seg items={TABS} value={tab} onChange={setTab} />
        {tab === "videos" && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`chip ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
                style={{ padding: "6px 13px", fontSize: 12 }}
              >
                <span className="lower">{f}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === "videos" && (
        <StudioCard pad={false}>
          <div className="st-row head" style={{ gridTemplateColumns: ROW }}>
            <span>video</span>
            <span>title</span>
            <span>status</span>
            <span style={{ textAlign: "right" }}>views</span>
            <span style={{ textAlign: "right" }}>CAST</span>
          </div>

          {list.length ? (
            list.map((v) => (
              <Link
                key={v.id}
                href={`/studio/content/${v.id}`}
                className="st-row"
                style={{ gridTemplateColumns: ROW, cursor: "pointer", textDecoration: "none", color: "var(--ink-1)" }}
              >
                <div
                  className="thumb"
                  style={{
                    backgroundImage: v.thumbUrl ? `url(${v.thumbUrl})` : undefined,
                    aspectRatio: "16/9",
                    borderRadius: 8,
                    position: "relative",
                  }}
                >
                  {v.status === "processing" && (
                    <div
                      className="lower"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      processing
                    </div>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {v.title}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3, display: "flex", gap: 8, alignItems: "center" }}>
                    <Pill tone={VIS_TONE[v.visibility] ?? "neutral"}>{v.visibility}</Pill>
                    {fmtDuration(v.durationSec)} · {fmtDate(v.createdAt)}
                  </div>
                </div>
                <div>
                  <Pill tone={STATUS_TONE[v.status] ?? "neutral"}>{v.status}</Pill>
                </div>
                <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>
                  {v.views ? formatCast(v.views) : "—"}
                </div>
                <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 800 }}>
                  {v.castEarned ? formatCast(v.castEarned) : "—"}
                </div>
              </Link>
            ))
          ) : (
            <div style={{ padding: "44px 18px", textAlign: "center" }}>
              <p className="lower" style={{ fontSize: 14, color: "var(--ink-3)", margin: "0 0 6px" }}>
                nothing here yet.
              </p>
              <p className="lower" style={{ fontSize: 12.5, color: "var(--ink-4)", margin: 0 }}>
                {filter === "all" ? "hit upload to add your first one — recordings of your streams land here too." : "no videos match this filter."}
              </p>
            </div>
          )}
        </StudioCard>
      )}

      {tab === "schedule" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="upcoming" sub="drafts and unpublished cuts waiting to go out — publish them from the editor" pad={false}>
            {upcoming.length ? (
              upcoming.map((sc, i) => (
                <Link
                  key={sc.id}
                  href={`/studio/content/${sc.id}`}
                  className="st-row"
                  style={{ gridTemplateColumns: "44px 1fr auto auto", borderTop: i ? "1px solid var(--hairline)" : "none", textDecoration: "none", color: "var(--ink-1)" }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)" }}>
                    <Icon name="clock" size={20} stroke={2} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sc.title}</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                      draft · {sc.visibility} · added {fmtDate(sc.createdAt)}
                    </div>
                  </div>
                  <Pill tone={VIS_TONE[sc.visibility] ?? "neutral"}>{sc.visibility}</Pill>
                  <Pill tone="neutral">upcoming</Pill>
                </Link>
              ))
            ) : (
              <div style={{ padding: "44px 18px", textAlign: "center" }}>
                <p className="lower" style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>
                  nothing scheduled — save a draft to line it up here.
                </p>
              </div>
            )}
          </StudioCard>
          <div className="st-hint">
            recordings of every stream land in <strong>videos</strong> automatically once you end the broadcast — trim, retitle and publish them there.
          </div>
        </div>
      )}
    </>
  );
}
