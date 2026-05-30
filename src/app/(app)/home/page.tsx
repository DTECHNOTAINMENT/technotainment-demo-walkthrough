import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { homeFeed } from "@/lib/queries/viewer";
import { VideoCard } from "@/components/public/cards";

export const metadata: Metadata = { title: "home", robots: { index: false } };

export default async function HomePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in?next=/home");

  const videos = await homeFeed(session.userId);

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto" }}>
      <h1 className="lower" style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
        home
      </h1>
      <p className="lower" style={{ color: "var(--ink-3)", fontSize: 13, margin: "0 0 20px" }}>
        fresh from creators you follow.
      </p>

      {videos.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", background: "var(--surface)" }}>
          <div className="lower" style={{ fontWeight: 800, fontSize: 16 }}>
            follow creators to fill your home
          </div>
          <p className="lower" style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 6 }}>
            once you follow channels, their newest videos show up here.
          </p>
        </div>
      ) : (
        <div className="grid-tiles">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}
