import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";

export const metadata: Metadata = { title: "notifications", robots: { index: false } };

export default async function NotificationsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in?next=/notifications");

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 className="lower" style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
        notifications
      </h1>
      <p className="lower" style={{ color: "var(--ink-3)", fontSize: 13, margin: "0 0 20px" }}>
        go-live alerts, drops, and replies will land here.
      </p>

      <div className="card" style={{ padding: 48, textAlign: "center", background: "var(--surface)" }}>
        <div
          aria-hidden
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            margin: "0 auto 14px",
            background: "var(--brand-gradient)",
          }}
        />
        <div className="lower" style={{ fontWeight: 800, fontSize: 16 }}>
          you&rsquo;re all caught up
        </div>
        <p className="lower" style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 6, maxWidth: 380, margin: "6px auto 0" }}>
          notifications aren&rsquo;t wired up yet. when creators you follow go live or drop
          something new, you&rsquo;ll see it here.
        </p>
      </div>
    </div>
  );
}
