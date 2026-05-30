/**
 * Audit trail. Every privileged/admin action writes an append-only AuditEvent — built as
 * infrastructure, not a feature (CLAUDE.md §4). Use within the same tx as the mutation where
 * possible; here it's a best-effort write callers await after the action.
 */
import { prisma } from "@/lib/db";

export type AuditKind = "moderation" | "finance" | "security" | "config" | "users" | "creators";

export async function writeAudit(input: { who: string; action: string; kind: AuditKind }): Promise<void> {
  await prisma.auditEvent.create({ data: input });
}
