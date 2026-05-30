"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/** The JSON body shapes accepted by POST /api/admin/action. */
export type AdActionBody =
  | { resource: "user"; action: "suspend" | "reinstate" | "kyc"; id: string; kyc?: string }
  | {
      resource: "creator";
      action: "approve" | "decline" | "take-rate" | "payout-hold";
      id: string;
      value?: number | boolean;
    }
  | { resource: "report"; action: "investigate" | "strike" | "remove" | "dismiss"; id: string };

interface AdActionResult {
  /** True while a mutation is in flight (disable buttons). */
  pending: boolean;
  /** Last error message, or null. */
  error: string | null;
  /** Fire an action; on success calls router.refresh() to re-fetch server data. */
  run: (body: AdActionBody) => Promise<void>;
}

/**
 * useAdAction — shared client helper for admin mutations. POSTs to
 * /api/admin/action, then router.refresh() on success. Every mutation writes an
 * AuditEvent server-side (docs/ROUTES.md). Optimistic disable-while-pending.
 */
export function useAdAction(): AdActionResult {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (body: AdActionBody) => {
      if (pending) return;
      setPending(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/action", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          setError(data.error ?? `action failed (${res.status})`);
          return;
        }
        router.refresh();
      } catch {
        setError("network error");
      } finally {
        setPending(false);
      }
    },
    [pending, router],
  );

  return { pending, error, run };
}
