// Following — /following. Signed-in. Presentation rebuilt to match the FollowingScreen in
// prototype/v4/extras.jsx (PageHeader, live-now grid, all-creators card grid). Data wiring
// (listFollowing) is unchanged.
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { listFollowing } from "@/lib/queries/viewer";
import { PageHeader } from "@/components/viewer/shared";
import { Avatar, formatNum } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "following", robots: { index: false } };

export default async function FollowingPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in?next=/following");

  const channels = await listFollowing(session.userId);
  const liveChannels = channels.filter((ch) => ch.streams.length > 0);

  return (
    <div className="page-pad" style={{ maxWidth: 1200, margin: "0 auto" }}>
      <PageHeader
        eyebrow="your follows"
        title={`following · ${channels.length} ${channels.length === 1 ? "creator" : "creators"}`}
        sub="live now + everyone you follow."
      />

      {channels.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", background: "var(--surface)" }}>
          <div className="lower" style={{ fontWeight: 800, fontSize: 16 }}>you don&rsquo;t follow anyone yet</div>
          <p className="lower" style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 6 }}>explore channels and follow the creators you love.</p>
        </div>
      ) : (
        <>
          {liveChannels.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <h2 className="lower" style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800 }}>live right now · {liveChannels.length}</h2>
              <div className="grid-tiles">
                {liveChannels.map((ch) => {
                  const live = ch.streams[0];
                  return (
                    <Link key={ch.id} href={`/c/${ch.handle.replace(/^@/, "")}`} className="gtile tile" style={{ display: "block", textDecoration: "none" }}>
                      <div
                        className="thumb"
                        style={{ position: "relative", background: `linear-gradient(120deg, ${ch.creator.brand}, ${ch.creator.brand2})` }}
                      >
                        <div className="thumb-overlay" />
                        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, alignItems: "center" }}>
                          <span className="live-pill">live</span>
                          <span
                            className="tnum"
                            style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, backdropFilter: "blur(6px)" }}
                          >
                            {formatNum(live.viewers)} watching
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10, padding: "10px 2px", alignItems: "flex-start" }}>
                        <Avatar creator={ch.creator} size={36} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{live.title}</div>
                          <div className="lower" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{ch.handle}</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <h2 className="lower" style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800 }}>all creators</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
              {channels.map((ch) => {
                const isLive = ch.streams.length > 0;
                return (
                  <Link
                    key={ch.id}
                    href={`/c/${ch.handle.replace(/^@/, "")}`}
                    className="card"
                    style={{ background: "var(--surface)", padding: 14, display: "flex", gap: 12, alignItems: "center", textDecoration: "none" }}
                  >
                    <Avatar creator={ch.creator} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{ch.name}</div>
                      <div
                        className="lower"
                        style={{ fontSize: 11, color: isLive ? "#ef2b3d" : "var(--ink-3)", fontWeight: isLive ? 700 : 500 }}
                      >
                        {isLive ? "· live now" : `${ch.creator.category} · ${formatNum(ch.creator.followers)} followers`}
                      </div>
                    </div>
                    {isLive && <span className="sb-live-dot" />}
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
