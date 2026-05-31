// shared server-safe presentational helpers for studio pages.
// lowercase voice, tnum for numbers, dark-first inheriting --ink-1.

export function PageHead({
  title,
  sub,
}: {
  title: string;
  sub?: string;
}) {
  return (
    <header style={{ marginBottom: 20 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>{title}</h1>
      {sub ? (
        <p style={{ opacity: 0.6, fontSize: 13, margin: "4px 0 0" }}>{sub}</p>
      ) : null}
    </header>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #1e1e28",
        borderRadius: 12,
        padding: "14px 16px",
        background: "#11111a",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.6 }}>{label}</div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          marginTop: 4,
        }}
      >
        {value}
      </div>
      {hint ? (
        <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>{hint}</div>
      ) : null}
    </div>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
        marginBottom: 20,
      }}
    >
      {children}
    </div>
  );
}

export function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        border: "1px solid #1e1e28",
        borderRadius: 12,
        padding: 16,
        background: "#11111a",
        marginBottom: 16,
      }}
    >
      {title ? (
        <h2 style={{ fontSize: 14, margin: "0 0 12px" }}>{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

export function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    ok: "#1f7a4d",
    live: "#c0392b",
    warn: "#b5852a",
    info: "#3a6ea5",
    neutral: "#2a2a36",
  };
  return (
    <span
      style={{
        background: colors[tone] ?? colors.neutral,
        color: "#fff",
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 999,
      }}
    >
      {children}
    </span>
  );
}

export function num(n: number): string {
  return n.toLocaleString("en-GB");
}

export function castToFiat(cast: number): string {
  // 100 cast = £1.00. presentation edge only.
  const pounds = cast / 100;
  return pounds.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
  });
}

export function Bars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              height: `${(d.value / max) * 90}px`,
              background: "linear-gradient(180deg,#4ad,#6d5efc)",
              borderRadius: 6,
            }}
            title={num(d.value)}
          />
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}
