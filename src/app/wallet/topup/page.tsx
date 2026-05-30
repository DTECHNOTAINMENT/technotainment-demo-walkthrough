// Top-up — /wallet/topup. Server shell (auth gate) that renders the client TopupFlow.
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { TopupFlow } from "@/components/wallet/TopupFlow";

export const metadata: Metadata = {
  title: "top up CAST",
  robots: { index: false, follow: false },
};

export default async function TopupPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in");

  return (
    <main style={{ maxWidth: 540, margin: "0 auto", padding: "32px 24px 96px" }}>
      <Link href="/wallet" className="btn btn-glass lower" style={{ padding: "8px 14px", fontSize: 12, marginBottom: 16 }}>
        back to wallet
      </Link>
      <h1 className="lower" style={{ fontSize: 24, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
        top up CAST
      </h1>
      <TopupFlow />
    </main>
  );
}
