"use client";

// Global error boundary (Phase 5 polish). Catches unhandled render/runtime errors so a
// single failure never blanks the app. Reports via the observability seam on mount.
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Avoid importing server-only observability here; log to console (captured by the platform).
    console.error("[app error]", error?.message, error?.digest);
  }, [error]);

  return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="card" style={{ padding: 28, maxWidth: 420, textAlign: "center" }}>
        <div className="brand-hairline" style={{ marginBottom: 16 }} />
        <h2 style={{ margin: 0, fontSize: 20 }} className="lower">
          something went wrong
        </h2>
        <p style={{ color: "var(--ink-3)", fontSize: 14, marginTop: 8 }}>
          we hit an unexpected error. you can try again.
        </p>
        <button type="button" className="btn btn-grad" style={{ marginTop: 18 }} onClick={reset}>
          try again
        </button>
      </div>
    </div>
  );
}
