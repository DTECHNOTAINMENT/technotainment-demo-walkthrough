/**
 * Admin creators — two sections: applications (status = review) with
 * approve/decline, and the full roster with status, editable take-rate and a
 * payout-hold toggle. Server component: data via listApplications() +
 * listCreators(). Spec: prototype/v4/admin-users.jsx (AdminCreators).
 */
import { listApplications, listCreators } from "@/lib/queries/admin";
import { AdPageHead, AdCard, AdEmpty, AdPill, adPagePad, type PillTone } from "@/components/admin/AdPrimitives";
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

const ROSTER_COLS = "1.6fr 120px 1fr auto";

export default async function AdminCreatorsPage() {
  let applications: Awaited<ReturnType<typeof listApplications>> = [];
  let creators: Awaited<ReturnType<typeof listCreators>> = [];
  let failed = false;
  try {
    [applications, creators] = await Promise.all([listApplications(), listCreators()]);
  } catch {
    failed = true;
  }

  return (
    <div style={adPagePad}>
      <AdPageHead
        eyebrow="operations"
        title="creators"
        sub="the people earning on technotainment — review applications, then manage status, take-rate and payouts."
      />

      {/* applications */}
      <AdCard style={{ marginBottom: 20 }}>
        <div
          className="lower"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-4)" }}>
            applications · review identity &amp; risk
          </span>
          <AdPill tone="info">{applications.length} pending</AdPill>
        </div>

        {failed ? (
          <AdEmpty>couldn&rsquo;t load applications right now. try refreshing.</AdEmpty>
        ) : applications.length === 0 ? (
          <AdEmpty>no applications waiting — queue clear.</AdEmpty>
        ) : (
          applications.map((ap, i) => (
            <div
              key={ap.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 12,
                padding: "14px 18px",
                alignItems: "center",
                borderTop: i ? "1px solid var(--hairline)" : "none",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{ap.name}</div>
                <div className="lower tnum" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                  {ap.id} · {ap.handle} · {ap.category} · {ap.followers.toLocaleString("en-GB")} followers
                </div>
              </div>
              <AdApplicationActions id={ap.id} />
            </div>
          ))
        )}
      </AdCard>

      {/* roster */}
      <AdCard>
        <div
          className="lower"
          style={{
            display: "grid",
            gridTemplateColumns: ROSTER_COLS,
            gap: 12,
            padding: "12px 18px",
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--ink-4)",
            borderBottom: "1px solid var(--hairline)",
            alignItems: "center",
          }}
        >
          <span>creator</span>
          <span>status</span>
          <span>kyc</span>
          <span style={{ textAlign: "right" }}>actions</span>
        </div>

        {failed ? (
          <AdEmpty>couldn&rsquo;t load creators right now. try refreshing.</AdEmpty>
        ) : creators.length === 0 ? (
          <AdEmpty>no creators yet.</AdEmpty>
        ) : (
          creators.map((c, i) => {
            const payoutHold = c.status === "payout_hold";
            return (
              <div
                key={c.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: ROSTER_COLS,
                  gap: 12,
                  padding: "14px 18px",
                  alignItems: "center",
                  borderTop: i ? "1px solid var(--hairline)" : "none",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.name}
                  </div>
                  <div className="lower tnum" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                    {c.id} · {c.channel?.handle ?? c.handle}
                  </div>
                </div>
                <span>
                  <AdPill tone={STATUS_TONE[c.status] ?? "neutral"}>{STATUS_LABEL[c.status] ?? c.status}</AdPill>
                </span>
                <span>
                  <AdPill
                    tone={c.user.kyc === "verified" ? "ok" : c.user.kyc === "failed" ? "live" : "warn"}
                  >
                    {c.user.kyc}
                  </AdPill>
                </span>
                <AdCreatorRowActions id={c.id} takeRatePct={c.takeRatePct} payoutHold={payoutHold} />
              </div>
            );
          })
        )}
      </AdCard>
    </div>
  );
}
