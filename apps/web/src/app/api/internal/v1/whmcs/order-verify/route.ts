import { NextResponse } from "next/server";
import { verifyAndActivateOrder } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const authSecret = req.headers.get("x-zegabytez-whmcs-secret");
    const configuredSecret = process.env.WHMCS_INTERNAL_WEBHOOK_SECRET || "super_secret_whmcs_webhook_token";

    if (process.env.NODE_ENV === "production" && authSecret !== configuredSecret) {
      return NextResponse.json({ success: false, error: "Unauthorized WHMCS secret." }, { status: 401 });
    }

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing orderId parameter." }, { status: 400 });
    }

    const activated = verifyAndActivateOrder(orderId);
    if (!activated) {
      return NextResponse.json({ success: false, error: `Order '${orderId}' not found.` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Order #${activated.orderNumber} successfully verified and activated.`,
      order: activated,
    });
  } catch (err: any) {
    console.error("[WHMCS Internal Order Verify] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to verify order" },
      { status: 500 }
    );
  }
}
