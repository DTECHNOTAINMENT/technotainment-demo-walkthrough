/**
 * Creator Studio — dashboard (/studio). Server-rendered overview: KPI stat cards
 * (followers, active members, videos, available CAST), a payout snapshot, and a
 * recent-activity ledger. Data via studioOverview(); money formatted at the edge
 * with formatCast/formatFiat. Mirrors prototype/v4/studio-dashboard.jsx.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { studioOverview } from "@/lib/queries/studio";
import { formatCast, formatFiat } from "@/lib/cast";

const KIND_LABEL: Record<string, string> = {
  tip: "tip",
  membership: "new member",
  gift: "gifted subs",
  drop: "drop sale",
  ppv: "ppv rental",
  topup: "top-up",
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

interface StatProps {
  label: string;
  value: string;
  unit?: string;
  fiat?: string;
}

function StatCard({ label, value, unit, fiat }: StatProps) {
  return (
    <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, background: "var(--surface)" }}>
      <span
        className="lower"
        style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span className="tnum stat-num" style={{ fontSize: 30 }}>
          {value}
        </span>
        {unit && (
          <span className="lower" style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 700 }}>
            {unit}
          </span>
        )}
      </div>
      <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)", minHeight: 14 }}>
        {fiat ?? ""}
      </span>
    </div>
  );
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

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "28px 24px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 7 }}>
            creator studio
          </div>
          <h1 className="lower" style={{ margin: 0, fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            dashboard
          </h1>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 6 }}>your channel at a glance — audience, content and money in.</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/studio/live" className="btn btn-grad lower" style={{ padding: "12px 18px", textDecoration: "none" }}>
            go live
          </Link>
          <Link href="/studio/content" className="btn btn-grad-stroke lower" style={{ padding: "12px 18px", textDecoration: "none" }}>
            upload
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <StatCard label="followers" value={formatCast(followerCount)} unit="total" />
        <StatCard label="active members" value={formatCast(memberCount)} unit="active" />
        <StatCard label="videos" value={formatCast(videoCount)} unit="in library" />
        <StatCard
          label="available CAST"
          value={formatCast(earnings.availableCast)}
          unit="to pay out"
          fiat={`= ${formatFiat(earnings.availableCast)}`}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 360px)", gap: 16, marginTop: 16, alignItems: "start" }}>
        {/* Recent activity */}
        <section className="card" style={{ background: "var(--surface)", overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
            <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
              recent activity
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>money in, newest first</div>
          </div>
          {recent.length ? (
            <div>
              {recent.map((tx, i) => {
                const positive = tx.cast > 0;
                return (
                  <div
                    key={tx.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      padding: "13px 18px",
                      borderTop: i ? "1px solid var(--hairline)" : "none",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lower" style={{ fontSize: 13, fontWeight: 700 }}>
                        {KIND_LABEL[tx.kind] ?? tx.kind}
                      </div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                        {timeAgo(tx.createdAt)} ago · {tx.method}
                      </div>
                    </div>
                    <span className="tnum" style={{ fontSize: 13, fontWeight: 800, color: positive ? "#10b981" : "var(--ink-1)" }}>
                      {positive ? "+" : "−"}
                      {formatCast(Math.abs(tx.cast))}
                    </span>
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
        </section>

        {/* Payout snapshot */}
        <section className="card" style={{ background: "var(--surface)", overflow: "hidden", alignSelf: "start" }}>
          <div className="brand-hairline" />
          <div style={{ padding: 18 }}>
            <div className="lower" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              available to pay out
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 10 }}>
              <span className="cast-glyph" style={{ width: 26, height: 26, fontSize: 13 }}>
                c
              </span>
              <span className="tnum brand-grad-text stat-num" style={{ fontSize: 40 }}>
                {formatCast(earnings.availableCast)}
              </span>
            </div>
            <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>
              = {formatFiat(earnings.availableCast)} · {formatCast(earnings.pendingCast)} CAST clearing
            </div>
            <Link href="/studio/earnings" className="btn btn-grad lower" style={{ width: "100%", marginTop: 14, padding: 12, textDecoration: "none", justifyContent: "center", display: "flex" }}>
              withdraw
            </Link>
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
              <span>lifetime net · {formatCast(earnings.netCast)} CAST</span>
              <span>paid out · {formatCast(earnings.paidCast)} CAST</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
