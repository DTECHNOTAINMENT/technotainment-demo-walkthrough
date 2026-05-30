/**
 * Admin creators — applications (status = review) with approve/decline, plus the full
 * roster with status, kyc, editable take-rate and a payout-hold toggle. KPI cards up top.
 * Server component: data via listApplications() + listCreators(); the action buttons post
 * to /api/admin/action. Spec: prototype/v4/admin-users.jsx (AdminCreators).
 */
import { listApplications, listCreators } from "@/lib/queries/admin";
import { StatCard, StudioCard, StudioPageHead, Pill, type PillTone } from "@/components/studio-ui";
import { AdApplicationActions, AdCreatorRowActions } from "@/components/admin/AdCreatorActions";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, PillTone> = {
  active: "ok",
  review: "warn",
  payout_hold: "warn",
  suspended: "live",
};
const STATUS_LABEL: Record<string, string> = {
  active: "active",
  review: "in review",
  payout_hold: "payout-hold",
  suspended: "suspended",
};
const KYC_TONE: Record<string, PillTone> = { verified: "ok", pending: "warn", failed: "live", none: "neutral" };

const ROSTER_COLS = "1.5fr 120px 90px 90px auto";

export default async function AdminCreatorsPage() {
  let applications: Awaited<ReturnType<typeof listApplications>> = [];
  let creators: Awaited<ReturnType<typeof listCreators>> = [];
  let failed = false;
  try {
    [applications, creators] = await Promise.all([listApplications(), listCreators()]);
  } catch {
    failed = true;
  }

  const active = creators.filter((c) => c.status === "active").length;
  const inReview = creators.filter((c) => c.status === "review").length;
  const holds = creators.filter((c) => c.status === "payout_hold").length;
  const avgTake = creators.length
    ? (creators.reduce((s, c) => s + c.takeRatePct, 0) / creators.length).toFixed(1)
    : "—";

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="operations"
        title="creators"
        sub="the people earning on technotainment — review applications, then manage status, take-rate and payouts."
      />

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <StatCard
          label="active creators"
          icon="cast"
          value={active.toLocaleString("en-GB")}
          unit="earning"
          delta="+240"
          deltaUp
          fiat="this month"
          spark={[8.9, 9.1, 9.3, 9.4, 9.5, 9.6, 9.7, 9.84]}
          sparkColor="#8b5cf6"
        />
        <StatCard
          label="applications"
          icon="sparkle"
          value={applications.length.toLocaleString("en-GB")}
          unit="pending"
          fiat="awaiting review"
          spark={[2, 3, 2, 4, 3, 5, 4, applications.length || 1]}
          sparkColor="#06b6d4"
        />
        <StatCard
          label="in review / hold"
          icon="eye"
          value={(inReview + holds).toLocaleString("en-GB")}
          unit="creators"
          fiat={`payout-hold: ${holds}`}
          spark={[2, 1, 2, 1, 1, 1, 1, 1]}
          sparkColor="#f59e0b"
        />
        <StatCard
          label="avg. take rate"
          icon="trend"
          value={`${avgTake}%`}
          unit="blended"
          fiat="negotiated per-creator"
          spark={[12, 12, 12, 11.9, 11.9, 11.8, 11.8, 11.8]}
          sparkColor="#06b6d4"
        />
      </div>

      {/* applications */}
      <StudioCard
        title="creator applications"
        sub="review identity & risk, then approve or decline"
        action={<Pill tone="info">{applications.length} pending</Pill>}
        pad={false}
        style={{ marginTop: 18 }}
      >
        {failed ? (
          <div className="lower" style={{ padding: "28px 18px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
            couldn&rsquo;t load applications right now. try refreshing.
          </div>
        ) : applications.length === 0 ? (
          <div className="lower" style={{ padding: "28px 18px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
            no applications waiting — queue clear.
          </div>
        ) : (
          applications.map((ap, i) => (
            <div
              key={ap.id}
              className="st-row"
              style={{ gridTemplateColumns: "1fr auto", borderTop: i ? "1px solid var(--hairline)" : "none" }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{ap.name}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                  {ap.id} · {ap.handle} · {ap.category} · {ap.followers.toLocaleString("en-GB")} followers
                </div>
              </div>
              <AdApplicationActions id={ap.id} />
            </div>
          ))
        )}
      </StudioCard>

      {/* roster */}
      <StudioCard pad={false} style={{ marginTop: 16 }}>
        <div className="st-row head" style={{ gridTemplateColumns: ROSTER_COLS }}>
          <span>creator</span>
          <span>status</span>
          <span>kyc</span>
          <span style={{ textAlign: "right" }}>take</span>
          <span style={{ textAlign: "right" }}>actions</span>
        </div>

        {failed ? (
          <div className="lower" style={{ padding: "28px 18px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
            couldn&rsquo;t load creators right now. try refreshing.
          </div>
        ) : creators.length === 0 ? (
          <div className="lower" style={{ padding: "28px 18px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
            no creators yet.
          </div>
        ) : (
          creators.map((c) => {
            const payoutHold = c.status === "payout_hold";
            return (
              <div key={c.id} className="st-row" style={{ gridTemplateColumns: ROSTER_COLS }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                  <span
                    aria-hidden
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      flex: "0 0 36px",
                      background: `linear-gradient(135deg, ${c.brand}, ${c.brand2})`,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.name}
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      {c.id} · {c.channel?.handle ?? c.handle}
                    </div>
                  </div>
                </div>
                <div>
                  <Pill tone={STATUS_TONE[c.status] ?? "neutral"}>{STATUS_LABEL[c.status] ?? c.status}</Pill>
                </div>
                <div>
                  <Pill tone={KYC_TONE[c.user.kyc] ?? "neutral"}>{c.user.kyc}</Pill>
                </div>
                <div
                  className="tnum"
                  style={{
                    textAlign: "right",
                    fontSize: 13,
                    fontWeight: 700,
                    color: c.takeRatePct < 12 ? "#8b5cf6" : "var(--ink-1)",
                  }}
                >
                  {c.takeRatePct}%
                </div>
                <AdCreatorRowActions id={c.id} takeRatePct={c.takeRatePct} payoutHold={payoutHold} />
              </div>
            );
          })
        )}
      </StudioCard>
    </div>
  );
}
