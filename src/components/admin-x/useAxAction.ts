"use client";

/**
 * useAxAction — shared client helper for the unified admin action endpoint
 * (POST /api/admin/action). Posts a JSON body, surfaces busy/error/result, and
 * calls router.refresh() on success so the server components re-read the DB.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

export interface AxActionResult {
  ok?: boolean;
  error?: string;
  // finance: refund
  refunded?: boolean;
  deltaCast?: number;
  // finance: payout-run-approve
  cleared?: number;
  totalCast?: number;
}

export function useAxAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(body: Record<string, unknown>): Promise<AxActionResult | null> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as AxActionResult;
      if (!res.ok || data.error) {
        setError(data.error ?? "action failed · try again");
        return null;
      }
      router.refresh();
      return data;
    } catch {
      setError("network error · try again");
      return null;
    } finally {
      setBusy(false);
    }
  }

  return { run, busy, error, setError };
}
