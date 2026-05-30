import { ThemeToggle } from "@/components/theme";
import { branding } from "@/lib/config";
import { formatCast, formatFiat } from "@/lib/cast";
import { deriveBalance } from "@/lib/ledger";

// Phase 0 landing: proves the app boots, design tokens + light/dark work, and the CAST
// ledger derives a balance. When a DB is configured it shows the seeded user's real
// balance (summed from WalletEntry rows); otherwise it falls back to sample entries so
// the app is always runnable on mocks. Dynamic so the build never depends on a live DB.
export const dynamic = "force-dynamic";

const SEEDED_HANDLE = "@mira.k";
const sampleLedger = [{ deltaCast: 5000 }, { deltaCast: -1200 }, { deltaCast: -800 }, { deltaCast: -250 }];

async function getBalance(): Promise<{ balance: number; source: "db" | "sample"; entries: number }> {
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/db");
      const user = await prisma.user.findUnique({ where: { handle: SEEDED_HANDLE }, select: { id: true } });
      if (user) {
        const rows = await prisma.walletEntry.findMany({
          where: { userId: user.id },
          select: { deltaCast: true },
        });
        return { balance: deriveBalance(rows), source: "db", entries: rows.length };
      }
    } catch {
      /* fall through to sample */
    }
  }
  return { balance: deriveBalance(sampleLedger), source: "sample", entries: sampleLedger.length };
}

export default async function Home() {
  const { balance, source, entries } = await getBalance();

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: "48px 24px 96px" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 18 }}>
          <span className="cast-glyph">C</span>
          {branding.appName.toLowerCase()}
          <span style={{ color: "var(--ink-4)", fontWeight: 400, fontSize: 13 }}>
            · {branding.companyName.toLowerCase()}
          </span>
        </span>
        <ThemeToggle />
      </header>

      <div className="brand-hairline" style={{ margin: "20px 0 36px" }} />

      <h1 style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
        <span className="brand-grad-text">{branding.tagline}</span>
      </h1>
      <p style={{ color: "var(--ink-3)", fontSize: 18, maxWidth: 640, marginTop: 16 }}>
        live-streaming + VOD built on <strong style={{ color: "var(--ink-1)" }}>{branding.currencyName}</strong>, a
        closed-loop platform credit. this is the production app scaffold — Phase 0.
      </p>

      <section className="card" style={{ padding: 24, marginTop: 32, maxWidth: 440 }}>
        <div
          className="lower"
          style={{ color: "var(--ink-3)", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800 }}
        >
          {source === "db" ? `${SEEDED_HANDLE} · wallet (db)` : "wallet · sample ledger"}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 12 }}>
          <span className="cast-glyph" style={{ width: 28, height: 28 }}>C</span>
          <span className="stat-num tnum" style={{ fontSize: 40 }}>{formatCast(balance)}</span>
          <span className="mono" style={{ color: "var(--ink-3)" }}>{formatFiat(balance)}</span>
        </div>
        <div style={{ color: "var(--ink-4)", fontSize: 13, marginTop: 10 }}>
          {entries} append-only entries · balance is never stored, always summed
        </div>
      </section>

      <nav style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
        <a className="btn btn-grad" href="/api/health">health</a>
        <a className="btn btn-glass" href="/prototype/index.html">view prototype</a>
      </nav>

      <footer style={{ color: "var(--ink-4)", fontSize: 13, marginTop: 48 }}>
        {branding.companyName} · {branding.currencyName} = closed-loop credit · mock-first, AWS-portable
      </footer>
    </main>
  );
}
