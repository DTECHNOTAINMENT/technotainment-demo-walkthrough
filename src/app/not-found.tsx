import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="card" style={{ padding: 28, maxWidth: 420, textAlign: "center" }}>
        <div className="stat-num brand-grad-text" style={{ fontSize: 48 }}>
          404
        </div>
        <p style={{ color: "var(--ink-3)", fontSize: 14, marginTop: 8 }} className="lower">
          we couldn&apos;t find that page.
        </p>
        <Link href="/" className="btn btn-glass lower" style={{ marginTop: 18 }}>
          back home
        </Link>
      </div>
    </div>
  );
}
