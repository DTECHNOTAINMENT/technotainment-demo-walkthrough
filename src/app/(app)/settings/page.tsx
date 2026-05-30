import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { ThemeToggle } from "@/components/theme";
import { PageHeader } from "@/components/viewer/shared";

export const metadata: Metadata = { title: "settings", robots: { index: false } };

export default async function SettingsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in?next=/settings");

  const fields: [string, string][] = [
    ["display name", session.displayName],
    ["handle", session.handle],
    ["email", session.email],
    ["role", session.role],
  ];

  return (
    <div className="page-pad" style={{ maxWidth: 720, margin: "0 auto" }}>
      <PageHeader eyebrow="you" title="settings" sub="account basics and preferences." />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <section className="card" style={{ padding: 18, background: "var(--surface)" }}>
        <div className="lower" style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>
          account
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {fields.map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                border: "1px solid var(--hairline)",
                borderRadius: 10,
              }}
            >
              <div>
                <div className="mono lower" style={{ fontSize: 10, color: "var(--ink-3)" }}>
                  {k}
                </div>
                <div style={{ fontSize: 13, marginTop: 2 }}>{v}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="lower" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 12 }}>
          profile details are managed by your identity provider (clerk in production).
        </p>
      </section>

      <section
        className="card"
        style={{ padding: 18, background: "var(--surface)", display: "flex", alignItems: "center", gap: 14 }}
      >
        <div style={{ flex: 1 }}>
          <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
            appearance
          </div>
          <div className="lower" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
            switch between night and day. your choice is remembered on this device.
          </div>
        </div>
        <ThemeToggle />
      </section>

      <section className="card" style={{ padding: 18, background: "var(--surface)" }}>
        <div className="lower" style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>
          more
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Link href="/profile" className="btn btn-glass lower" style={{ padding: "8px 14px", fontSize: 12 }}>
            privacy & consent
          </Link>
          <Link href="/wallet" className="btn btn-glass lower" style={{ padding: "8px 14px", fontSize: 12 }}>
            wallet
          </Link>
          <Link href="/library" className="btn btn-glass lower" style={{ padding: "8px 14px", fontSize: 12 }}>
            library
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}
