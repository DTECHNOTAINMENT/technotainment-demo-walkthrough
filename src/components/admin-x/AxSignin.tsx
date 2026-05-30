"use client";

/**
 * AxSignin — demo staff sign-in. One button per seeded AdminUser; clicking POSTs
 * /api/admin/signin { adminUserId } which sets the staff session cookie, then routes
 * to /admin. In prod this is SSO + enforced MFA (docs/ROUTES.md); here it's one-click.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

interface StaffOption {
  id: string;
  name: string;
  email: string;
  role: string;
  mfa: boolean;
}

export function AxSignin({ staff }: { staff: StaffOption[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(adminUserId: string) {
    setBusyId(adminUserId);
    setError(null);
    try {
      const res = await fetch("/api/admin/signin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ adminUserId }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "sign-in failed · try again");
        setBusyId(null);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("network error · try again");
      setBusyId(null);
    }
  }

  if (staff.length === 0) {
    return (
      <div className="lower" style={{ fontSize: 13, color: "var(--ink-3)", textAlign: "center" }}>
        no staff accounts seeded — run the database seed to create the operations team.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {staff.map((m) => {
        const busy = busyId === m.id;
        const initials = m.name
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("");
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => void signIn(m.id)}
            disabled={busyId !== null}
            className="card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              width: "100%",
              textAlign: "left",
              padding: "13px 15px",
              background: "var(--surface)",
              cursor: busyId !== null ? "default" : "pointer",
              opacity: busyId !== null && !busy ? 0.55 : 1,
            }}
          >
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                flex: "0 0 40px",
                background: "var(--surface-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 800,
                color: "var(--ink-2)",
              }}
            >
              {initials.toUpperCase()}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 14, fontWeight: 800 }}>{m.name}</span>
              <span className="lower" style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 3 }}>
                <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 700 }}>{m.role}</span>
                <span
                  className="lower"
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "1px 7px",
                    borderRadius: 999,
                    background: m.mfa ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)",
                    color: m.mfa ? "#10b981" : "#ef4444",
                  }}
                >
                  {m.mfa ? "mfa on" : "mfa off"}
                </span>
              </span>
            </span>
            <span className="lower" style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-3)" }}>
              {busy ? "signing in…" : "sign in"}
            </span>
          </button>
        );
      })}
      {error && (
        <div className="lower" style={{ fontSize: 12, color: "#ef4444", textAlign: "center", marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default AxSignin;
