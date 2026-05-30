import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { library } from "@/lib/queries/viewer";
import { formatCast } from "@/lib/cast";
import { PageHeader } from "@/components/viewer/shared";

export const metadata: Metadata = { title: "library", robots: { index: false } };

export default async function LibraryPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in?next=/library");

  const { memberships, purchases } = await library(session.userId);
  const empty = memberships.length === 0 && purchases.length === 0;

  return (
    <div className="page-pad" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <PageHeader
        eyebrow="your library"
        title="library"
        sub="your memberships and everything you've unlocked with CAST."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {empty ? (
        <div className="card" style={{ padding: 40, textAlign: "center", background: "var(--surface)" }}>
          <div className="lower" style={{ fontWeight: 800, fontSize: 16 }}>
            your library is empty
          </div>
          <p className="lower" style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 6 }}>
            join a membership or unlock a pay-per-view to start building it.
          </p>
        </div>
      ) : (
        <>
          <section className="card" style={{ background: "var(--surface)" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--hairline)" }}>
              <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
                active memberships · <span className="tnum">{memberships.length}</span>
              </div>
              <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                renewing in CAST. manage any in profile.
              </div>
            </div>
            {memberships.length === 0 ? (
              <div className="lower" style={{ padding: "18px", color: "var(--ink-3)", fontSize: 13 }}>
                no active memberships yet.
              </div>
            ) : (
              memberships.map((m, i) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    borderTop: i ? "1px solid var(--hairline)" : "none",
                  }}
                >
                  <span
                    className="av-ring"
                    style={{ flex: "0 0 auto", background: `linear-gradient(135deg, ${m.channel.creator.brand}, ${m.channel.creator.brand2})` }}
                  >
                    <span style={{ display: "block", width: 40, height: 40, borderRadius: "50%", background: "var(--surface-2)" }} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/c/${m.channel.handle.replace(/^@/, "")}`} style={{ fontSize: 14, fontWeight: 700 }}>
                      {m.channel.name}
                    </Link>
                    <div className="lower" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                      {m.tier.name} · {m.channel.handle}
                    </div>
                  </div>
                  <span className="brand-grad-text tnum" style={{ fontWeight: 800, fontSize: 15 }}>
                    {formatCast(m.priceCastLocked)} CAST/mo
                  </span>
                </div>
              ))
            )}
          </section>

          <section className="card" style={{ background: "var(--surface)" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--hairline)" }}>
              <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
                purchases · <span className="tnum">{purchases.length}</span>
              </div>
              <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                pay-per-view and drops you own.
              </div>
            </div>
            {purchases.length === 0 ? (
              <div className="lower" style={{ padding: "18px", color: "var(--ink-3)", fontSize: 13 }}>
                no purchases yet.
              </div>
            ) : (
              purchases.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    borderTop: i ? "1px solid var(--hairline)" : "none",
                  }}
                >
                  <span
                    className="chip lower"
                    style={{ flex: "0 0 auto", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}
                  >
                    {p.kind}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 700 }}>
                      {p.id}
                    </div>
                    <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      {p.createdAt.toLocaleDateString("en-GB")}
                    </div>
                  </div>
                  <span className="tnum" style={{ fontWeight: 700, fontSize: 14 }}>
                    {formatCast(Math.abs(p.cast))} CAST
                  </span>
                </div>
              ))
            )}
          </section>
        </>
      )}
      </div>
    </div>
  );
}
