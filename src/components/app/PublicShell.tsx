import { getCurrentSession } from "@/lib/session";
import { balanceOf } from "@/lib/money";
import { prisma } from "@/lib/db";
import { listFollowing } from "@/lib/queries/viewer";
import { Sidebar, type SidebarCreator } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import type { CreatorLike } from "@/components/ui/primitives";

/**
 * Shared viewer chrome (sidebar + topbar) for the public/standalone routes — /live, /videos,
 * /explore, /search, /watch, /clip, /c, /wallet, etc. Those pages render their own <main> and
 * previously had NO navigation on desktop (the sidebar/topbar only existed in the (app) layout
 * and the home page). Wrapping them in <PublicShell> gives every page full nav. Works whether
 * signed in (real balance + following) or anonymous (sign-in CTA). No-DB safe.
 */
async function getFollowing(userId: string): Promise<SidebarCreator[]> {
  try {
    const channels = await listFollowing(userId);
    return channels.map((ch) => ({
      id: ch.id,
      name: ch.creator.name,
      handle: ch.creator.handle,
      brand: ch.creator.brand,
      brand2: ch.creator.brand2,
      category: ch.creator.category,
      live: ch.streams.length > 0,
    }));
  } catch {
    return [];
  }
}

async function getUser(userId: string): Promise<CreatorLike | null> {
  try {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true, handle: true, avatarUrl: true, creator: { select: { brand: true, brand2: true } } },
    });
    if (!u) return null;
    return {
      name: u.displayName,
      handle: u.handle,
      avatarUrl: u.avatarUrl,
      brand: u.creator?.brand ?? "#7c3aed",
      brand2: u.creator?.brand2 ?? "#ec4899",
    };
  } catch {
    return null;
  }
}

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();

  const [balance, following, user] = await Promise.all([
    session ? balanceOf(session.userId).catch(() => 0) : Promise.resolve(null),
    session ? getFollowing(session.userId) : Promise.resolve<SidebarCreator[]>([]),
    session ? getUser(session.userId) : Promise.resolve<CreatorLike | null>(null),
  ]);

  return (
    <div className="app-shell">
      <Sidebar
        following={following}
        isAnon={!session}
        isCreator={session?.role === "creator" || session?.role === "staff"}
      />
      <div className="main-col">
        <Topbar balance={balance} user={user} />
        {children}
      </div>
    </div>
  );
}
