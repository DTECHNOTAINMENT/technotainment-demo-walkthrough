import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { consentFor } from "@/lib/queries/viewer";
import { balanceOf } from "@/lib/money";
import { formatCast } from "@/lib/cast";
import { ConsentToggles, type ConsentRow } from "@/components/app/ConsentToggles";

export const metadata: Metadata = { title: "profile", robots: { index: false } };

export default async function ProfilePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in?next=/profile");

  const [grants, balance] = await Promise.all([consentFor(session.userId), balanceOf(session.userId)]);

  const rows: ConsentRow[] = grants.map((g) => ({
    creatorId: g.creatorId,
    creatorName: g.creator.name,
    creatorHandle: g.creator.handle,
    brand: g.creator.brand,
    brand2: g.creator.brand2,
    watchHistory: g.watchHistory,
    chatMessages: g.chatMessages,
    tipsPurchases: g.tipsPurchases,
    marketingEmail: g.marketingEmail,
  }));

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
      {/* header */}
      <div
        className="card"
        style={{ padding: 24, background: "var(--surface)", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}
      >
        <span className="av-ring" style={{ flex: "0 0 auto" }}>
          <span style={{ display: "block", width: 72, height: 72, borderRadius: "50%", background: "var(--brand-gradient)" }} />
        </span>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.01em" }}>{session.displayName}</h1>
          <div className="lower" style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
            {session.handle} · {session.role}
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "baseline" }}>
            <div>
              <span className="stat-num brand-grad-text tnum" style={{ fontSize: 18 }}>
                {formatCast(balance)}
              </span>{" "}
              <span className="lower" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                CAST balance
              </span>
            </div>
            <div>
              <span className="stat-num tnum" style={{ fontSize: 18 }}>
                {rows.length}
              </span>{" "}
              <span className="lower" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                creators with consent
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* consent intro */}
      <div className="card" style={{ padding: 18, background: "var(--surface)" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div
            aria-hidden
            style={{ width: 38, height: 38, borderRadius: 10, flex: "0 0 38px", background: "var(--brand-gradient)" }}
          />
          <div>
            <div className="lower" style={{ fontWeight: 800, fontSize: 16 }}>
              your audience belongs to your creators.
            </div>
            <p style={{ margin: "6px 0 0", color: "var(--ink-2)", fontSize: 13, lineHeight: 1.6 }}>
              metascape doesn&rsquo;t keep a profile of you for its own purposes. each creator you
              follow gets only what you allow — separately. turn something off and the creator&rsquo;s
              copy is deleted within 7 days.
            </p>
          </div>
        </div>
      </div>

      {/* per-creator consent */}
      <div className="card" style={{ background: "var(--surface)" }}>
        <div
          style={{
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
            per-creator consent · <span className="tnum">{rows.length}</span>
          </div>
        </div>
        <ConsentToggles rows={rows} />
      </div>
    </div>
  );
}
