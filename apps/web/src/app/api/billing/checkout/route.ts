import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDb, createOrderAndInvoice } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, billingCycle, paymentMethod, clientEmail, clientName } = body;

    if (!planId || !billingCycle || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Missing planId, billingCycle, or paymentMethod." },
        { status: 400 }
      );
    }

    // Try finding logged in user from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("zega_session")?.value;
    const db = readDb();
    const session = token ? db.sessions.find((s) => s.token === token) : null;
    const user = session ? db.users.find((u) => u.id === session.userId) : db.users[0];
    const org = user ? db.orgs.find((o) => o.id === user.orgId) : db.orgs[0];

    const result = createOrderAndInvoice({
      orgId: org ? org.id : "org_acme_001",
      userId: user ? user.id : "usr_owner_001",
      clientEmail: clientEmail || (user ? user.email : "owner@zegacloud.com"),
      clientName: clientName || (user ? user.name : "Alex Carter"),
      planId,
      billingCycle,
      paymentMethod,
    });

    return NextResponse.json({
      success: true,
      message: "Order and invoice successfully created in WHMCS registry.",
      order: result.order,
      invoice: result.invoice,
    });
  } catch (err: any) {
    console.error("Billing checkout error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create order." },
      { status: 500 }
    );
  }
}
