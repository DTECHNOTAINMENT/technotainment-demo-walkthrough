/**
 * Admin users — every account on technotainment as a table: handle, kyc, status, balance/
 * spend, with per-row suspend/reinstate + verify-kyc actions. KPI cards up top. Server
 * component: data via listUsers(); the action buttons (AdUserActions) post to /api/admin/action.
 * Spec: prototype/v4/admin-users.jsx (AdminUsers).
 */
import { listUsers } from "@/lib/queries/admin";
import { formatCast } from "@/lib/cast";
import { StatCard, StudioCard, StudioPageHead, Pill, gbpShort, type PillTone } from "@/components/studio-ui";
import { AdUserActions } from "@/components/admin/AdUserActions";

export const dynamic = "force-dynamic";

const KYC_TONE: Record<string, PillTone> = { verified: "ok", pending: "warn", failed: "live", none: "neutral" };
const STATUS_TONE: Record<string, PillTone> = { active: "ok", suspended: "live", pending: "warn" };

const USERS_SPARK = [180, 196, 214, 241, 262, 289, 318, 342].map((k) => k * 1000);
const COLS = "1.4fr 90px 90px 110px 100px auto";

export default async function AdminUsersPage() {
  let users: Awaited<ReturnType<typeof listUsers>> = [];
  let failed = false;
  try {
    users = await listUsers();
  } catch {
    failed = true;
  }

  const total = users.length;
  const verified = users.filter((u) => u.kyc === "verified").length;
  const suspended = users.filter((u) => u.status === "suspended").length;
  const avgBalance = 3180;

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="operations"
        title="users"
        sub="every account on technotainment. inspect balances, manage status and KYC, suspend or reinstate."
      />

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <StatCard
          label="total users"
          icon="users"
          value={formatCast(total)}
          unit="accounts"
          delta="+34k"
          deltaUp
          fiat="30-day net"
          spark={USERS_SPARK}
          sparkColor="#06b6d4"
        />
        <StatCard
          label="kyc verified"
          icon="check"
          value={total ? `${Math.round((verified / total) * 100)}%` : "—"}
          unit="of accounts"
          delta="+0.6%"
          deltaUp
          fiat={`${verified} verified`}
          spark={[91, 92, 92, 93, 93, 94, 94, 94]}
          sparkColor="#10b981"
        />
        <StatCard
          label="suspended"
          icon="user"
          value={formatCast(suspended)}
          unit="accounts"
          delta="fraud / abuse"
          deltaUp={false}
          fiat="trust & safety"
          spark={[1.0, 1.05, 1.1, 1.12, 1.15, 1.18, 1.19, 1.2]}
          sparkColor="#ef4444"
        />
        <StatCard
          label="avg. balance"
          icon="cast"
          value={formatCast(avgBalance)}
          unit="CAST"
          delta="+4%"
          deltaUp
          fiat={gbpShort(avgBalance)}
          spark={[2.8, 2.9, 3.0, 3.0, 3.1, 3.1, 3.15, 3.18]}
          sparkColor="#8b5cf6"
        />
      </div>

      <StudioCard pad={false} style={{ marginTop: 18 }}>
        <div className="st-row head" style={{ gridTemplateColumns: COLS }}>
          <span>user</span>
          <span>kyc</span>
          <span>status</span>
          <span style={{ textAlign: "right" }}>lifetime spend</span>
          <span>role</span>
          <span style={{ textAlign: "right" }}>actions</span>
        </div>

        {failed ? (
          <div className="lower" style={{ padding: "32px 18px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
            couldn&rsquo;t load users right now. try refreshing.
          </div>
        ) : users.length === 0 ? (
          <div className="lower" style={{ padding: "32px 18px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
            no users yet.
          </div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="st-row" style={{ gridTemplateColumns: COLS }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--surface-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "var(--ink-2)",
                    flex: "0 0 36px",
                  }}
                >
                  {u.handle.replace(/^@/, "").slice(0, 2).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    {u.handle}
                    {u.flags.length > 0 ? <Pill tone="live">{u.flags[0]}</Pill> : null}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                    {u.id} · {u.email}
                  </div>
                </div>
              </div>
              <div>
                <Pill tone={KYC_TONE[u.kyc] ?? "neutral"}>{u.kyc}</Pill>
              </div>
              <div>
                <Pill tone={STATUS_TONE[u.status] ?? "neutral"}>{u.status}</Pill>
              </div>
              <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>
                {formatCast(u.lifetimeSpentCast)}
              </div>
              <div className="lower" style={{ fontSize: 12, color: "var(--ink-2)" }}>
                {u.role}
              </div>
              <AdUserActions id={u.id} status={u.status} kyc={u.kyc} />
            </div>
          ))
        )}
      </StudioCard>
    </div>
  );
}
