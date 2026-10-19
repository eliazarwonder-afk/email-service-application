import { NextResponse } from "next/server";
import { verifyAndActivateOrder } from "@/lib/store";
import { timingSafeCompare, verifyWebhookSignature } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const authSecret = req.headers.get("x-zegabytez-whmcs-secret");
    const hmacSig = req.headers.get("x-zegabytez-signature");
    const authBearer = req.headers.get("authorization")?.replace("Bearer ", "");
    const configuredSecret = process.env.WHMCS_INTERNAL_WEBHOOK_SECRET || "super_secret_whmcs_webhook_token";

    // Timing-safe authentication check
    const isSecretValid = authSecret ? timingSafeCompare(authSecret, configuredSecret) : false;
    const isBearerValid = authBearer ? timingSafeCompare(authBearer, configuredSecret) : false;
    const isHmacValid = hmacSig ? verifyWebhookSignature(rawBody, hmacSig, configuredSecret) : false;

    if (process.env.NODE_ENV === "production" && !isSecretValid && !isBearerValid && !isHmacValid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid WHMCS webhook secret or HMAC signature." },
        { status: 401 }
      );
    }

    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: "Malformed JSON payload." }, { status: 400 });
    }

    const { orderId } = body;
    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing required parameter: 'orderId'." }, { status: 400 });
    }

    const activated = verifyAndActivateOrder(orderId);
    if (!activated) {
      return NextResponse.json({ success: false, error: `Order '${orderId}' not found in registry.` }, { status: 404 });
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
