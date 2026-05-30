/**
 * Creator Studio — dashboard (/studio). Server-rendered overview ported to match
 * prototype/v4/studio-dashboard.jsx: KPI StatCards (with icons + sparks), a payout
 * snapshot rail, a revenue-split SegBar derived from settled activity, and a recent
 * activity ledger (`.act-row`). Data via studioOverview(); money formatted at the edge
 * with formatCast/formatFiat. Charts/cards reuse the studio-ui primitives.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { studioOverview } from "@/lib/queries/studio";
import { formatCast, formatFiat } from "@/lib/cast";
import { Icon } from "@/components/ui/Icon";
import {
  StatCard,
  StudioCard,
  StudioPageHead,
  Pill,
  SegBar,
  type SegBarSegment,
} from "@/components/studio-ui";

const ACT_STYLE: Record<string, { color: string; icon: string }> = {
  tip: { color: "#ec4899", icon: "tip" },
  membership: { color: "#8b5cf6", icon: "heart" },
  gift: { color: "#f97316", icon: "gift" },
  drop: { color: "#06b6d4", icon: "bag" },
  ppv: { color: "#10b981", icon: "film" },
  topup: { color: "#06b6d4", icon: "wallet" },
};
const ACT_LABEL: Record<string, string> = {
  tip: "tip",
  membership: "new member",
  gift: "gifted subs",
  drop: "drop sale",
  ppv: "ppv rental",
  topup: "top-up",
};

const SPLIT_COLOR: Record<string, string> = {
  membership: "#8b5cf6",
  tip: "#ec4899",
  ppv: "#f97316",
  drop: "#06b6d4",
  gift: "#10b981",
};

function timeAgo(d: Date): string {
  const secs = Math.max(0, Math.round((Date.now() - d.getTime()) / 1000));
  if (secs < 60) return `${secs}s`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}

export default async function StudioDashboardPage() {
  let channelId: string;
  let creatorId: string;
  try {
    const { channel, creator } = await requireCreatorChannel();
    channelId = channel.id;
    creatorId = creator.id;
  } catch {
    redirect("/studio/onboarding");
  }

  const { videoCount, memberCount, followerCount, recent, earnings } = await studioOverview(channelId, creatorId);

  // Revenue split derived from the recent settled activity (presentation only).
  const byKind: Record<string, number> = {};
  for (const tx of recent) {
    if (tx.cast > 0) byKind[tx.kind] = (byKind[tx.kind] ?? 0) + tx.cast;
  }
  const splitTotal = Object.values(byKind).reduce((a, v) => a + v, 0);
  const segments: SegBarSegment[] = Object.entries(byKind)
    .sort((a, b) => b[1] - a[1])
    .map(([id, cast]) => ({ id, label: ACT_LABEL[id] ?? id, cast, color: SPLIT_COLOR[id] ?? "#8b5cf6" }));

  return (
    <div className="page-pad" style={{ maxWidth: 1500, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="dashboard"
        sub="your channel at a glance — audience, content and money in."
        actions={
          <>
            <Link href="/studio/live" className="btn btn-grad lower" style={{ padding: "12px 18px", textDecoration: "none" }}>
              <Icon name="flame" size={15} stroke={2.4} /> go live
            </Link>
            <Link href="/studio/content" className="btn btn-grad-stroke lower" style={{ padding: "12px 18px", textDecoration: "none" }}>
              <Icon name="plus" size={15} stroke={2.6} /> upload
            </Link>
          </>
        }
      />

      {/* KPI row */}
      <div className="kpi-grid">
        <StatCard label="followers" icon="users" value={formatCast(followerCount)} unit="total" />
        <StatCard label="members" icon="heart" value={formatCast(memberCount)} unit="active" sparkColor="#ec4899" />
        <StatCard label="videos" icon="film" value={formatCast(videoCount)} unit="in library" sparkColor="#06b6d4" />
        <StatCard
          label="available CAST"
          icon="cast"
          value={formatCast(earnings.availableCast)}
          unit="to pay out"
          fiat={`= ${formatFiat(earnings.availableCast)}`}
        />
      </div>

      <div className="st-split" style={{ marginTop: 16 }}>
        {/* LEFT — recent activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="recent activity" sub="money in, newest first" action={<Pill tone="ok">live</Pill>} pad={false}>
            {recent.length ? (
              <div style={{ padding: "8px 8px 12px", maxHeight: 460, overflowY: "auto" }}>
                {recent.map((tx) => {
                  const st = ACT_STYLE[tx.kind] ?? { color: "#8b5cf6", icon: "cast" };
                  const positive = tx.cast > 0;
                  return (
                    <div key={tx.id} className="act-row">
                      <span className="act-ico" style={{ background: st.color }}>
                        <Icon name={st.icon} size={16} stroke={2.2} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700 }} className="lower">
                          {ACT_LABEL[tx.kind] ?? tx.kind}
                        </div>
                        <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                          {tx.method}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="tnum" style={{ fontSize: 13, fontWeight: 800, color: positive ? "#10b981" : "var(--ink-1)" }}>
                          {positive ? "+" : "−"}
                          {formatCast(Math.abs(tx.cast))}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--ink-4)" }}>{timeAgo(tx.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: "32px 18px", textAlign: "center" }}>
                <p className="lower" style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>
                  no activity yet — once fans tip, subscribe or buy, it shows up here.
                </p>
              </div>
            )}
          </StudioCard>
        </div>

        {/* RIGHT rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Payout snapshot */}
          <div className="card" style={{ background: "var(--surface)", overflow: "hidden" }}>
            <div className="brand-hairline" />
            <div style={{ padding: 18 }}>
              <div
                className="lower"
                style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}
              >
                available to pay out
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 10 }}>
                <span className="cast-glyph" style={{ width: 26, height: 26, fontSize: 13 }}>
                  c
                </span>
                <span className="tnum brand-grad-text stat-num" style={{ fontSize: 44 }}>
                  {formatCast(earnings.availableCast)}
                </span>
              </div>
              <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>
                = {formatFiat(earnings.availableCast)} · {formatCast(earnings.pendingCast)} CAST clearing
              </div>
              <Link
                href="/studio/earnings"
                className="btn btn-grad lower"
                style={{ width: "100%", marginTop: 14, padding: 12, textDecoration: "none", justifyContent: "center", display: "flex" }}
              >
                <Icon name="wallet" size={15} stroke={2.2} /> withdraw
              </Link>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                <span>lifetime net · {formatCast(earnings.netCast)} CAST</span>
                <span>paid out · {formatCast(earnings.paidCast)} CAST</span>
              </div>
            </div>
          </div>

          {/* Revenue split */}
          {segments.length > 0 && (
            <StudioCard title="where it came from" sub="recent activity · by source">
              <SegBar segments={segments} total={splitTotal} />
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
                {segments.map((r) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="legdot" style={{ background: r.color }} />
                    <span style={{ flex: 1, fontSize: 12.5, color: "var(--ink-2)" }} className="lower">
                      {r.label}
                    </span>
                    <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700 }}>
                      {formatCast(r.cast)}
                    </span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)", width: 34, textAlign: "right" }}>
                      {Math.round((r.cast / splitTotal) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </StudioCard>
          )}
        </div>
      </div>
    </div>
  );
}
