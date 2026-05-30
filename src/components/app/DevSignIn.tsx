"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface DevUserOption {
  id: string;
  handle: string;
  displayName: string;
  role: "member" | "creator" | "staff";
  avatarUrl: string | null;
}

/**
 * Dev one-click sign-in: POSTs /api/auth/signin { userId }, then routes to `next` (or /home).
 * In prod Clerk owns this flow behind the same cookie shape.
 */
export function DevSignIn({ users, next }: { users: DevUserOption[]; next: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(userId: string) {
    if (pending) return;
    setPending(userId);
    setError(null);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("sign-in failed");
      router.replace(next);
      router.refresh();
    } catch {
      setError("couldn't sign in — try again");
      setPending(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {users.map((u) => (
        <button
          key={u.id}
          type="button"
          onClick={() => signIn(u.id)}
          disabled={pending !== null}
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            textAlign: "left",
            background: "var(--surface)",
            opacity: pending && pending !== u.id ? 0.5 : 1,
            cursor: pending ? "default" : "pointer",
          }}
        >
          <span className="av-ring" style={{ flex: "0 0 auto" }}>
            <span
              style={{
                display: "block",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: u.avatarUrl
                  ? `center / cover no-repeat url(${u.avatarUrl})`
                  : "var(--brand-gradient)",
              }}
            />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{u.displayName}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="lower">
              {u.handle} · {u.role}
            </div>
          </div>
          <span style={{ fontSize: 12, color: "var(--ink-3)" }} className="lower">
            {pending === u.id ? "signing in…" : "sign in"}
          </span>
        </button>
      ))}
      {error && (
        <div style={{ fontSize: 12, color: "var(--live)" }} className="lower">
          {error}
        </div>
      )}
    </div>
  );
}
