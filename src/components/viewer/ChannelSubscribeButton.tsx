"use client";

// Per-tier "subscribe with CAST" button on the membership tab — mirrors microcast.jsx's
// full-width tier CTA. POSTs to /api/spend exactly like SupportBar's tier "join" action.
// No-DB safe: /api/spend returns a balance in the demo path; 401 bounces to sign-in.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCast } from "@/lib/cast";

export function ChannelSubscribeButton({
  channelId,
  tierId,
  tierName,
  priceCast,
}: {
  channelId: string;
  tierId: string;
  tierName: string;
  priceCast: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/spend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "membership", cast: priceCast, channelId, tierId }),
      });
      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      const data: { balance?: number; error?: string } = await res.json();
      if (!res.ok || typeof data.balance !== "number") {
        setError(data.error ?? "something went wrong");
        return;
      }
      setDone(`joined ${tierName} · balance ${formatCast(data.balance)} CAST`);
    } catch {
      setError("network error · try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button
        onClick={() => void subscribe()}
        className="btn btn-grad lower"
        style={{ width: "100%", padding: 12 }}
        disabled={busy}
      >
        {busy ? "…" : "subscribe with CAST"}
      </button>
      {done && (
        <div className="lower" style={{ fontSize: 11, color: "#10b981", textAlign: "center" }}>
          {done} ✓
        </div>
      )}
      {error && (
        <div className="lower" style={{ fontSize: 11, color: "var(--bg-red)", textAlign: "center" }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default ChannelSubscribeButton;
