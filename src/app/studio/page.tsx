/**
 * Creator Studio — dashboard (/studio). Server-rendered overview ported to full
 * fidelity with prototype/v4/studio-dashboard.jsx:
 *   - StudioPageHead (greeting + go-live / upload actions)
 *   - KPI row of 4 StatCards (this month gross+net, members+mrr, followers, watch time)
 *   - LEFT column: "revenue · last 12 months" (big number + Bars) and "top content · 30 days"
 *   - RIGHT rail: payout snapshot, "where it came from" (SegBar + legend),
 *     "recent activity" (money-in ledger) and "scheduled" (upcoming streams)
 * Data via studioOverview() + studioDashboardExtras(); money formatted at the edge.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { studioOverview, studioDashboardExtras } from "@/lib/queries/studio";
import { formatCast, formatFiat } from "@/lib/cast";
import { Icon } from "@/components/ui/Icon";
import { formatNum } from "@/components/ui/primitives";
import {
  StatCard,
  StudioCard,
  StudioPageHead,
  Pill,
  Bars,
  SegBar,
  type PillTone,
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

const VIS_TONE: Record<string, PillTone> = {
  public: "neutral",
  members: "info",
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

  const [{ memberCount, followerCount, recent, earnings }, extras] = await Promise.all([
    studioOverview(channelId, creatorId),
    studioDashboardExtras(channelId),
  ]);

  const splitTotal = extras.revenueSplit.reduce((a, r) => a + r.cast, 0) || extras.grossMonth;

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
        <StatCard
          label="this month"
          icon="cast"
          value={formatNum(extras.grossMonth)}
          unit="CAST gross"
          fiat={`net ${formatFiat(earnings.netCast)} after fee`}
          spark={extras.earnSeries.slice(-8)}
          sparkColor="#8b5cf6"
        />
        <StatCard
          label="members"
          icon="heart"
          value={formatNum(memberCount)}
          unit="active"
          fiat={`${formatCast(earnings.netCast)} CAST mrr`}
          spark={extras.memberSeries.slice(-8)}
          sparkColor="#ec4899"
        />
        <StatCard
          label="followers"
          icon="users"
          value={formatNum(followerCount)}
          unit="total"
          spark={extras.followSeries.slice(-8)}
          sparkColor="#06b6d4"
        />
        <StatCard
          label="watch time"
          icon="clock"
          value={`${formatNum(extras.viewSeries[extras.viewSeries.length - 1] ?? 0)}k`}
          unit="min · 30d"
          spark={extras.viewSeries.slice(-8)}
          sparkColor="#10b981"
        />
      </div>

      {/* Main split */}
      <div className="st-split" style={{ marginTop: 16 }}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Revenue chart */}
          <StudioCard
            title="revenue · last 12 months"
            sub="CAST gross, before platform fee"
            action={
              <Link href="/studio/analytics" className="btn btn-glass lower" style={{ padding: "8px 12px", fontSize: 12, textDecoration: "none" }}>
                full analytics <Icon name="arrowR" size={13} stroke={2.2} />
              </Link>
            }
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
              <span className="tnum brand-grad-text stat-num" style={{ fontSize: 40 }}>
                {formatNum(extras.grossMonth)}
              </span>
              <span className="lower" style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 700 }}>
                CAST this month
              </span>
            </div>
            <Bars data={extras.earnSeries} labels={extras.months} h={190} fmt={(v) => formatNum(v) + " CAST"} />
          </StudioCard>

          {/* Top content */}
          <StudioCard
            title="top content · 30 days"
            action={
              <Link href="/studio/content" className="btn btn-glass lower" style={{ padding: "8px 12px", fontSize: 12, textDecoration: "none" }}>
                library <Icon name="arrowR" size={13} stroke={2.2} />
              </Link>
            }
            pad={false}
          >
            {extras.topContent.map((c, i) => (
              <Link
                key={c.id}
                href={`/studio/content/${c.id}`}
                className="st-row"
                style={{
                  gridTemplateColumns: "20px 92px 1fr auto",
                  borderTop: i ? "1px solid var(--hairline)" : "none",
                  cursor: "pointer",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <span className="mono" style={{ color: "var(--ink-4)", fontSize: 13, fontWeight: 800 }}>
                  {i + 1}
                </span>
                <div className="thumb" style={{ backgroundImage: `url(${c.thumbUrl})`, aspectRatio: "16/9", borderRadius: 8 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.title}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                    {formatNum(c.views)} views · {c.watch}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="tnum" style={{ fontSize: 14, fontWeight: 800 }}>
                    {formatNum(c.castEarned)}
                  </div>
                  <div className="lower" style={{ fontSize: 10, color: "var(--ink-4)" }}>
                    CAST earned
                  </div>
                </div>
              </Link>
            ))}
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
                  C
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
            </div>
          </div>

          {/* Revenue split */}
          {extras.revenueSplit.length > 0 && (
            <StudioCard title="where it came from" sub="this month · by source">
              <SegBar segments={extras.revenueSplit} total={splitTotal} />
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
                {extras.revenueSplit.map((r) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="legdot" style={{ background: r.color }} />
                    <span className="lower" style={{ flex: 1, fontSize: 12.5, color: "var(--ink-2)" }}>
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

          {/* Recent activity */}
          <StudioCard title="recent activity" sub="money in, newest first" action={<Pill tone="ok">live</Pill>} pad={false}>
            {recent.length ? (
              <div style={{ padding: "8px 8px 12px", maxHeight: 320, overflowY: "auto" }}>
                {recent.map((tx) => {
                  const st = ACT_STYLE[tx.kind] ?? { color: "#8b5cf6", icon: "cast" };
                  return (
                    <div key={tx.id} className="act-row">
                      <span className="act-ico" style={{ background: st.color }}>
                        <Icon name={st.icon} size={16} stroke={2.2} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="lower" style={{ fontSize: 12.5, fontWeight: 700 }}>
                          {ACT_LABEL[tx.kind] ?? tx.kind}
                        </div>
                        <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                          {tx.method}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="tnum" style={{ fontSize: 13, fontWeight: 800, color: "#10b981" }}>
                          +{formatCast(Math.abs(tx.cast))}
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

          {/* Scheduled */}
          {extras.schedule.length > 0 && (
            <StudioCard
              title="scheduled"
              action={
                <Link href="/studio/content" className="btn btn-glass lower" style={{ padding: "7px 11px", fontSize: 12, textDecoration: "none" }}>
                  edit
                </Link>
              }
              pad={false}
            >
              {extras.schedule.map((sc, i) => (
                <div
                  key={sc.id}
                  className="st-row"
                  style={{ gridTemplateColumns: "1fr auto", borderTop: i ? "1px solid var(--hairline)" : "none" }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {sc.title}
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                      {sc.when} · {formatNum(sc.reminders)} reminders set
                    </div>
                  </div>
                  <Pill tone={VIS_TONE[sc.visibility] ?? "warn"}>{sc.visibility}</Pill>
                </div>
              ))}
            </StudioCard>
          )}
        </div>
      </div>
    </div>
  );
}
