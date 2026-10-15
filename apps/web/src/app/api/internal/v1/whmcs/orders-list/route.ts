import { NextResponse } from "next/server";
import { readDb } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const authSecret = req.headers.get("x-zegabytez-whmcs-secret");
    const configuredSecret = process.env.WHMCS_INTERNAL_WEBHOOK_SECRET || "super_secret_whmcs_webhook_token";

    if (process.env.NODE_ENV === "production" && authSecret !== configuredSecret) {
      return NextResponse.json({ success: false, error: "Unauthorized WHMCS secret." }, { status: 401 });
    }

    const db = readDb();
    const orders = db.orders || [];
    const invoices = db.invoices || [];

    return NextResponse.json({
      success: true,
      data: {
        orders,
        invoices,
        totalOrders: orders.length,
      },
    });
  } catch (err: any) {
    console.error("[WHMCS Internal Orders List] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to list orders" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}
