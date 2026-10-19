import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDb } from "@/lib/store";
import { createWhmcsSsoToken, callWhmcsApi } from "@/lib/whmcs";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("zega_session")?.value;
    const db = readDb();

    let clientEmail = "owner@zegacloud.com";
    let clientId: string | number = 1049;

    if (token) {
      const session = db.sessions?.find((s) => s.token === token);
      if (session) {
        const user = db.users?.find((u) => u.id === session.userId);
        if (user) {
          clientEmail = user.email;
          // In production, user would have whmcsClientId stored on user record
          clientId = (user as any).whmcsClientId || 1049;
        }
      }
    }

    // Call WHMCS CreateSsoToken API
    const ssoResult = await createWhmcsSsoToken(clientId);

    return NextResponse.json({
      success: true,
      redirectUrl: ssoResult.redirectUrl,
      clientEmail,
      message: "One-Click SSO session initialized for ZegaCloud WHMCS Client Area.",
    });
  } catch (err: any) {
    console.error("WHMCS SSO error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to initialize SSO." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const ssoResult = await createWhmcsSsoToken(1049);
    if (ssoResult.redirectUrl) {
      return NextResponse.redirect(ssoResult.redirectUrl);
    }
    return NextResponse.json({ success: false, error: "SSO URL unavailable" }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
