/**
 * /admin/signin — staff entry point. The admin layout (owned by the shell agent) redirects
 * any non-staff session here; this page therefore must render the sign-in UI WITHOUT calling
 * a staff gate. It only checks: if you're ALREADY staff, bounce to /admin. Otherwise it lists
 * the seeded AdminUsers for one-click demo sign-in (AxSignin → /api/admin/signin).
 *
 * In prod this is SSO + enforced MFA (docs/ROUTES.md); the demo trades that for a roster.
 */
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { branding } from "@/lib/config";
import { AxSignin } from "@/components/admin-x/AxSignin";

export const dynamic = "force-dynamic";

export default async function AdminSignInPage() {
  const session = await getCurrentSession();
  if (session?.role === "staff") redirect("/admin");

  const team = await prisma.adminUser.findMany({ orderBy: { role: "asc" } });
  const staff = team.map((m) => ({ id: m.id, name: m.name, email: m.email, role: m.role, mfa: m.mfa }));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        overflowY: "auto",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            className="lower"
            style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-3)" }}
          >
            {branding.companyName} · operations
          </div>
          <h1 className="lower" style={{ fontSize: 30, fontWeight: 800, margin: "10px 0 0" }}>
            staff sign-in
          </h1>
          <p className="lower" style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "8px 0 0", lineHeight: 1.5 }}>
            access the {branding.appName} back-office — finance, connectors, growth and the control center.
          </p>
        </div>

        <div className="card" style={{ background: "var(--surface)", padding: 18, overflow: "hidden" }}>
          <div className="brand-hairline" style={{ margin: "-18px -18px 16px" }} />
          <AxSignin staff={staff} />
        </div>

        <p
          className="lower"
          style={{ textAlign: "center", fontSize: 11.5, color: "var(--ink-4)", marginTop: 16, lineHeight: 1.5 }}
        >
          demo staff sign-in — SSO + MFA in prod. every privileged action is logged to the audit trail.
        </p>
      </div>
    </div>
  );
}
