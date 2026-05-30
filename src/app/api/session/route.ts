import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";

// Lightweight client-readable session probe (no secrets) so SEO/ISR pages can stay static
// while client components (e.g. LiveChat) tailor UI to the signed-in state.
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getCurrentSession();
  return NextResponse.json(
    s ? { signedIn: true, handle: s.handle, role: s.role } : { signedIn: false },
    { headers: { "cache-control": "no-store" } },
  );
}
