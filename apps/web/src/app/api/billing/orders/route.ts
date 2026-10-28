import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDb, getOrders, getInvoices, submitOrderCryptoTx } from "@/lib/store";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("zega_session")?.value;
    const db = readDb();
    const session = token ? db.sessions.find((s) => s.token === token) : null;
    const user = session ? db.users.find((u) => u.id === session.userId) : db.users[0];
    const org = user ? db.orgs.find((o) => o.id === user.orgId) : db.orgs[0];

    const orgId = org ? org.id : "org_acme_001";
    const orders = getOrders(orgId);
    const invoices = getInvoices(orgId);

    return NextResponse.json({
      success: true,
      orders,
      invoices,
    });
  } catch (err: any) {
    console.error("Fetch orders error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, txHash } = body;

    if (!orderId || !txHash) {
      return NextResponse.json(
        { success: false, error: "orderId and txHash are required." },
        { status: 400 }
      );
    }

    const updated = submitOrderCryptoTx(orderId, txHash);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Order not found or invalid crypto details." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction hash recorded. Billing administrator notified for confirmation.",
      order: updated,
    });
  } catch (err: any) {
    console.error("Submit TX Hash error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to submit transaction hash." },
      { status: 500 }
    );
  }
}
