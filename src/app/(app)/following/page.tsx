import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { listFollowing } from "@/lib/queries/viewer";
import { formatCast } from "@/lib/cast";

export const metadata: Metadata = { title: "following", robots: { index: false } };

export default async function FollowingPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in?next=/following");

  const channels = await listFollowing(session.userId);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <h1 className="lower" style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
        following · <span className="tnum">{channels.length}</span>
      </h1>
      <p className="lower" style={{ color: "var(--ink-3)", fontSize: 13, margin: "0 0 20px" }}>
        free. no charge. unfollow any time.
      </p>

      {channels.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", background: "var(--surface)" }}>
          <div className="lower" style={{ fontWeight: 800, fontSize: 16 }}>
            you don&rsquo;t follow anyone yet
          </div>
          <p className="lower" style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 6 }}>
            explore channels and follow the creators you love.
          </p>
        </div>
      ) : (
        <div className="card" style={{ background: "var(--surface)" }}>
          {channels.map((ch, i) => {
            const isLive = ch.streams.length > 0;
            return (
              <Link
                key={ch.id}
                href={`/c/${ch.handle.replace(/^@/, "")}`}
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
                  style={{ flex: "0 0 auto", background: `linear-gradient(135deg, ${ch.creator.brand}, ${ch.creator.brand2})` }}
                >
                  <span
                    style={{ display: "block", width: 40, height: 40, borderRadius: "50%", background: "var(--surface-2)" }}
                  />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{ch.name}</div>
                  <div className="lower" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                    {ch.handle} · {ch.creator.category} · <span className="tnum">{formatCast(ch.creator.followers)}</span> followers
                  </div>
                </div>
                {isLive && <span className="live-pill">live</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
