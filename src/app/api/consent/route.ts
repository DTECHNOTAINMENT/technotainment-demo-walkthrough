import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

type Scope = "watchHistory" | "chatMessages" | "tipsPurchases" | "marketingEmail";
const SCOPES: readonly Scope[] = ["watchHistory", "chatMessages", "tipsPurchases", "marketingEmail"];

function isScope(v: unknown): v is Scope {
  return typeof v === "string" && (SCOPES as readonly string[]).includes(v);
}

// POST /api/consent  { creatorId, scope, value }
// Sets one consent scope for the signed-in viewer ↔ a creator (unique [userId, creatorId]).
export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const { creatorId, scope, value } = (await req.json().catch(() => ({}))) as {
    creatorId?: string;
    scope?: string;
    value?: boolean;
  };
  if (!creatorId) return NextResponse.json({ error: "creatorId required" }, { status: 400 });
  if (!isScope(scope)) return NextResponse.json({ error: "invalid scope" }, { status: 400 });
  if (typeof value !== "boolean") {
    return NextResponse.json({ error: "value must be boolean" }, { status: 400 });
  }

  const grant = await prisma.consentGrant.upsert({
    where: { userId_creatorId: { userId: session.userId, creatorId } },
    create: { userId: session.userId, creatorId, [scope]: value },
    update: { [scope]: value },
  });

  return NextResponse.json({
    ok: true,
    consent: {
      creatorId,
      watchHistory: grant.watchHistory,
      chatMessages: grant.chatMessages,
      tipsPurchases: grant.tipsPurchases,
      marketingEmail: grant.marketingEmail,
    },
  });
}
