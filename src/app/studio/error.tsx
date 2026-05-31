"use client";

// any studio error (notably StudioError for a non-creator / no-channel session)
// renders the onboarding prompt rather than the generic error screen. with no db
// the demo creator never reaches here — the queries fall back to fixtures.
export default function StudioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={{ padding: 32, maxWidth: 520 }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>set up your studio</h1>
      <p style={{ opacity: 0.7, fontSize: 14, lineHeight: 1.5 }}>
        you don&apos;t have a creator channel yet. start a channel to open the
        studio, go live, upload content, and get paid.
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <a
          href="/studio/onboard"
          style={{
            background: "#6d5efc",
            color: "#fff",
            padding: "9px 16px",
            borderRadius: 10,
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          start a channel
        </a>
        <button
          onClick={reset}
          style={{
            background: "transparent",
            color: "inherit",
            border: "1px solid #2a2a36",
            padding: "9px 16px",
            borderRadius: 10,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          retry
        </button>
      </div>
    </main>
  );
}
