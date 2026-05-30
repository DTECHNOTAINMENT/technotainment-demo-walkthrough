/**
 * Admin users — every account on technotainment as a table: handle, role, status,
 * kyc, lifetime spend, with per-row suspend/reinstate + verify-kyc actions.
 * Server component: data via listUsers(). Spec: prototype/v4/admin-users.jsx.
 */
import { listUsers } from "@/lib/queries/admin";
import { formatCast } from "@/lib/cast";
import { AdPageHead, AdCard, AdEmpty, AdPill, adPagePad, type PillTone } from "@/components/admin/AdPrimitives";
import { AdUserActions } from "@/components/admin/AdUserActions";

export const dynamic = "force-dynamic";

const KYC_TONE: Record<string, PillTone> = { verified: "ok", pending: "warn", failed: "live", none: "neutral" };
const STATUS_TONE: Record<string, PillTone> = { active: "ok", suspended: "live", pending: "warn" };

const COLS = "1.6fr 90px 100px 100px 130px auto";

export default async function AdminUsersPage() {
  let users: Awaited<ReturnType<typeof listUsers>> = [];
  let failed = false;
  try {
    users = await listUsers();
  } catch {
    failed = true;
  }

  return (
    <div style={adPagePad}>
      <AdPageHead
        eyebrow="operations"
        title="users"
        sub="every account on technotainment. inspect status and kyc, suspend or reinstate, and verify identity."
      />

      <AdCard>
        <div
          className="lower"
          style={{
            display: "grid",
            gridTemplateColumns: COLS,
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
          <span>user</span>
          <span>role</span>
          <span>status</span>
          <span>kyc</span>
          <span style={{ textAlign: "right" }}>lifetime spend</span>
          <span style={{ textAlign: "right" }}>actions</span>
        </div>

        {failed ? (
          <AdEmpty>couldn&rsquo;t load users right now. try refreshing.</AdEmpty>
        ) : users.length === 0 ? (
          <AdEmpty>no users yet.</AdEmpty>
        ) : (
          users.map((u, i) => (
            <div
              key={u.id}
              style={{
                display: "grid",
                gridTemplateColumns: COLS,
                gap: 12,
                padding: "14px 18px",
                alignItems: "center",
                borderTop: i ? "1px solid var(--hairline)" : "none",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  {u.handle}
                  {u.flags.length > 0 ? <AdPill tone="live">{u.flags[0]}</AdPill> : null}
                </div>
                <div className="lower tnum" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  {u.id} · {u.email}
                </div>
              </div>
              <span className="lower" style={{ fontSize: 12, color: "var(--ink-2)" }}>
                {u.role}
              </span>
              <span>
                <AdPill tone={STATUS_TONE[u.status] ?? "neutral"}>{u.status}</AdPill>
              </span>
              <span>
                <AdPill tone={KYC_TONE[u.kyc] ?? "neutral"}>{u.kyc}</AdPill>
              </span>
              <span className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>
                {formatCast(u.lifetimeSpentCast)}{" "}
                <span className="lower" style={{ fontWeight: 600, color: "var(--ink-4)", fontSize: 11 }}>
                  cast
                </span>
              </span>
              <AdUserActions id={u.id} status={u.status} kyc={u.kyc} />
            </div>
          ))
        )}
      </AdCard>
    </div>
  );
}
