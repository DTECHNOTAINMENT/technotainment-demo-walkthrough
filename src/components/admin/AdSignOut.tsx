"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Posts /api/auth/signout, then returns the operator to the admin sign-in screen. */
export function AdSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.replace("/admin/signin");
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="btn btn-glass lower"
      style={{ padding: "8px 12px", fontSize: 12, opacity: busy ? 0.6 : 1 }}
    >
      {busy ? "signing out…" : "sign out"}
    </button>
  );
}
