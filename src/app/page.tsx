import { getCurrentSession } from "@/lib/session";
import { balanceOf } from "@/lib/money";
import { listLiveStreams, listRecentVideos } from "@/lib/queries/public";
import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { HomeView } from "@/components/home/HomeView";
import { buildHome } from "@/components/home/build";

// Public front door — the rich streaming home for anonymous visitors. Same shell + grid as
// the authed /home, with a sign-in CTA in place of the avatar/balance. Authed users go to /home.
export const dynamic = "force-dynamic";

export default async function PublicHome() {
  const session = await getCurrentSession();
  const anon = !session;

  const [streams, videos, balance] = await Promise.all([
    listLiveStreams().catch(() => []),
    listRecentVideos(18).catch(() => []),
    session ? balanceOf(session.userId).catch(() => 0) : Promise.resolve(null),
  ]);

  const { hero, tiles } = buildHome(streams, videos);

  return (
    <div className="app-shell">
      <Sidebar following={[]} isAnon={anon} />
      <div className="main-col">
        <Topbar balance={balance} />
        <main>
          <HomeView hero={hero} tiles={tiles} />
        </main>
      </div>
    </div>
  );
}
