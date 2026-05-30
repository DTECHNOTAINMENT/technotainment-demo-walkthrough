import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { DevSignIn, type DevUserOption } from "@/components/app/DevSignIn";

export const metadata: Metadata = { title: "sign in", robots: { index: false } };

type Role = "member" | "creator" | "staff";

function toRole(role: string): Role {
  return role === "creator" || role === "staff" ? role : "member";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const nextParam = searchParams.next;
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/home";

  const dbUsers = await prisma.user.findMany({
    orderBy: { role: "desc" },
    take: 12,
    select: { id: true, handle: true, displayName: true, role: true, avatarUrl: true },
  });

  const users: DevUserOption[] = dbUsers.map((u) => ({
    id: u.id,
    handle: u.handle,
    displayName: u.displayName,
    role: toRole(u.role),
    avatarUrl: u.avatarUrl,
  }));

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 18px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span aria-hidden style={{ width: 24, height: 24, borderRadius: 7, background: "var(--brand-gradient)" }} />
          <span className="brand-grad-text lower" style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}>
            technotainment
          </span>
        </div>

        <h1 className="lower" style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
          sign in
        </h1>
        <p className="lower" style={{ color: "var(--ink-3)", fontSize: 13, margin: "0 0 20px", lineHeight: 1.6 }}>
          dev one-click sign-in — pick a seeded user to explore the app. in production this is
          handled by clerk; the session shape is identical.
        </p>

        {users.length === 0 ? (
          <div className="card" style={{ padding: 24, background: "var(--surface)", textAlign: "center" }}>
            <div className="lower" style={{ fontWeight: 700, fontSize: 14 }}>
              no seeded users
            </div>
            <p className="lower" style={{ color: "var(--ink-3)", fontSize: 12, marginTop: 6 }}>
              run the database seed to create demo accounts.
            </p>
          </div>
        ) : (
          <DevSignIn users={users} next={next} />
        )}

        <p className="mono" style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 18 }}>
          © 2026 technotainment
        </p>
      </div>
    </div>
  );
}
