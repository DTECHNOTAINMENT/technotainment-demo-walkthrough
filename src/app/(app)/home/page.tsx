import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { homeFeed } from "@/lib/queries/viewer";
import { listLiveStreams } from "@/lib/queries/public";
import { HomeView } from "@/components/home/HomeView";
import { buildHome } from "@/components/home/build";

export const metadata: Metadata = { title: "home", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in?next=/home");

  const [streams, videos] = await Promise.all([
    listLiveStreams().catch(() => []),
    homeFeed(session.userId).catch(() => []),
  ]);

  const { hero, tiles } = buildHome(streams, videos);
  return <HomeView hero={hero} tiles={tiles} />;
}
