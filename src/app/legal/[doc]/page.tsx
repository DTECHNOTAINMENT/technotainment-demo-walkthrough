import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSetting } from "@/lib/admin";
import { buildMetadata } from "@/lib/seo/meta";
import { branding } from "@/lib/config";

// Legal / policy pages (Phase 6). Public + crawlable. Content is CMS-editable via the Setting
// table (Admin control center, "configure don't code"); these defaults are DRAFT PLACEHOLDERS —
// have a lawyer review and finalise before launch (docs/DECISIONS.md §4.4).
export const revalidate = 3600;

const DOCS: Record<string, { title: string; body: string }> = {
  terms: {
    title: "terms of service",
    body: `These terms govern your use of ${branding.companyName} (${branding.appName}). By creating an account you agree to them. ${branding.currencyName} is a closed-loop platform credit, not legal tender or an investment; it is redeemable only for goods and services on the platform. Creators are independent and responsible for their content. We may suspend accounts that violate the community guidelines.`,
  },
  privacy: {
    title: "privacy policy",
    body: `We collect the data needed to run the service (account, payments, usage) and process it lawfully. You control analytics consent per creator in your profile; withdrawing consent deletes the relevant data within 7 days. We never sell personal data. Payments and identity checks are handled by our processors. You can request export or deletion of your data at any time.`,
  },
  guidelines: {
    title: "community guidelines",
    body: `Be respectful. No harassment, hate, illegal content, or infringement. Age-restricted content is gated (18+). We use automated and human review; violations follow a 3-strike model (warn → temporary suspension → ban), with immediate action for severe harm. Report anything that breaks these rules.`,
  },
};

export async function generateMetadata({ params }: { params: { doc: string } }): Promise<Metadata> {
  const d = DOCS[params.doc];
  if (!d) return {};
  return buildMetadata({ title: d.title, description: `${d.title} — ${branding.companyName}`, path: `/legal/${params.doc}` });
}

export default async function LegalPage({ params }: { params: { doc: string } }) {
  const base = DOCS[params.doc];
  if (!base) notFound();
  // CMS override (owner-edited copy), falling back to the draft default.
  const override = await getSetting<{ title?: string; body?: string } | null>(`legal.${params.doc}`, null);
  const title = override?.title ?? base.title;
  const body = override?.body ?? base.body;

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 96px" }}>
      <div className="brand-hairline" style={{ marginBottom: 24 }} />
      <h1 className="lower" style={{ fontSize: 34, letterSpacing: "-0.02em", margin: 0 }}>
        {title}
      </h1>
      {!override && (
        <div
          className="chip lower"
          style={{ marginTop: 12, color: "var(--ink-3)" }}
          role="note"
        >
          draft placeholder · have a lawyer review before launch
        </div>
      )}
      <p style={{ color: "var(--ink-2)", fontSize: 16, lineHeight: 1.7, marginTop: 24 }}>{body}</p>
      <p style={{ color: "var(--ink-4)", fontSize: 13, marginTop: 32 }}>
        {branding.companyName} · last updated on publish · editable in admin → settings.
      </p>
    </main>
  );
}
