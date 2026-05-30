import { NextResponse } from "next/server";
import { requireStaff, AdminError } from "@/lib/admin";
import * as admin from "@/lib/admin";

/**
 * Unified admin action endpoint. Every branch is staff-gated and audited inside the service.
 * POST /api/admin/action { resource, action, ...params }
 */
export async function POST(req: Request) {
  let staff;
  try {
    staff = await requireStaff();
  } catch {
    return NextResponse.json({ error: "staff only" }, { status: 403 });
  }
  const who = staff.email;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const resource = String(b.resource ?? "");
  const action = String(b.action ?? "");

  try {
    switch (resource) {
      case "user":
        if (action === "suspend") await admin.suspendUser(who, String(b.id));
        else if (action === "reinstate") await admin.reinstateUser(who, String(b.id));
        else if (action === "kyc") await admin.setUserKyc(who, String(b.id), b.kyc as "verified");
        else return bad();
        break;
      case "creator":
        if (action === "approve") await admin.approveApplication(who, String(b.id));
        else if (action === "decline") await admin.declineApplication(who, String(b.id));
        else if (action === "take-rate") await admin.setTakeRate(who, String(b.id), Number(b.value));
        else if (action === "payout-hold") await admin.setPayoutHold(who, String(b.id), Boolean(b.value));
        else return bad();
        break;
      case "report":
        await admin.actionReport(who, String(b.id), action as admin.ReportAction);
        break;
      case "finance":
        if (action === "refund") return NextResponse.json(await admin.refundTransaction(who, String(b.txnId)));
        if (action === "payout-run-approve") return NextResponse.json(await admin.approvePayoutRun(who, String(b.runId)));
        if (action === "payout-run-hold") {
          await admin.holdPayoutRun(who, String(b.runId));
          break;
        }
        return bad();
      case "connector":
        if (action === "configure")
          return NextResponse.json(
            await admin.setConnectorCredentials(who, String(b.id), {
              enabled: Boolean(b.enabled),
              credentials: (b.credentials ?? {}) as Record<string, string>,
            }),
          );
        await admin.toggleConnector(who, String(b.id), b.status as "live" | "beta" | "off");
        break;
      case "flag":
        await admin.toggleFlag(who, String(b.id), Boolean(b.on));
        break;
      case "setting":
        await admin.setSetting(who, String(b.key), b.value);
        break;
      default:
        return bad();
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AdminError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
}

function bad() {
  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
