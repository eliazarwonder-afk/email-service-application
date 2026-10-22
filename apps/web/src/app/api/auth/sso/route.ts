import { NextResponse } from "next/server";
import { readDb, writeDb, StoredUser, StoredOrg, StoredDomain, StoredMailbox } from "@/lib/store";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || url.searchParams.get("sso_token");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!token) {
      return NextResponse.redirect(`${appUrl}/login?error=Missing+SSO+token`);
    }

    const expectedSecret = process.env.WHMCS_INTERNAL_WEBHOOK_SECRET || "super_secret_whmcs_webhook_token";

    // Handle Sandbox / Simulated Token for local dev testing
    if (token.startsWith("simulated_") || token.startsWith("sandbox_")) {
      const db = readDb();
      const fallbackUser = db.users[0] || {
        id: "usr_owner_001",
        name: "Alex Carter",
        email: "owner@zegacloud.com",
        role: "owner",
        orgId: "org_acme_001",
      };

      const sessionToken = "ses_" + crypto.randomBytes(24).toString("hex");
      db.sessions.push({
        token: sessionToken,
        userId: fallbackUser.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      });
      writeDb(db);

      const res = NextResponse.redirect(`${appUrl}/app?sso=activated`);
      res.cookies.set("zega_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });
      return res;
    }

    // Standard Cryptographic HMAC-SHA256 Token Verification
    const parts = token.split(".");
    if (parts.length !== 2) {
      return NextResponse.redirect(`${appUrl}/login?error=Malformed+SSO+token`);
    }

    const [payloadB64, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", expectedSecret)
      .update(payloadB64)
      .digest("base64url");

    if (signature !== expectedSig) {
      return NextResponse.redirect(`${appUrl}/login?error=Invalid+SSO+signature`);
    }

    const payloadRaw = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadRaw);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return NextResponse.redirect(`${appUrl}/login?error=SSO+token+expired.+Please+re-launch+from+ZegaCloud+Client+Area`);
    }

    const db = readDb();
    const cleanEmail = (payload.email || "owner@zegacloud.com").toLowerCase().trim();
    const clientId = payload.whmcsClientId ? `WHMCS-CL-${payload.whmcsClientId}` : "WHMCS-CL-40192";

    let user = db.users.find(
      (u) => u.email.toLowerCase() === cleanEmail || (u as any).whmcsClientId === clientId
    );

    let org = db.orgs.find((o) => o.whmcsClientId === clientId);

    if (!user) {
      const userId = "usr_" + crypto.randomUUID().slice(0, 8);
      const orgId = "org_" + crypto.randomUUID().slice(0, 8);

      if (!org) {
        org = {
          id: orgId,
          name: payload.name ? `${payload.name}'s Organization` : "ZegaCloud Business Mail",
          ownerId: userId,
          plan: "growth",
          whmcsClientId: clientId,
          createdAt: new Date().toISOString(),
        };
        db.orgs.push(org);
      }

      user = {
        id: userId,
        name: payload.name || cleanEmail.split("@")[0],
        email: cleanEmail,
        role: "owner",
        orgId: org.id,
        emailVerified: true,
        authProvider: "whmcs_sso" as any,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
    } else {
      user.emailVerified = true;
      user.authProvider = "whmcs_sso" as any;
      if (org) user.orgId = org.id;
    }

    // Ensure at least one active domain exists for this organization
    let domain = db.domains.find((d) => d.orgId === user?.orgId);
    if (!domain) {
      const domainName = cleanEmail.includes("@") ? cleanEmail.split("@")[1] : "acmedesign.co";
      domain = {
        id: "dom_" + crypto.randomUUID().slice(0, 8),
        orgId: user.orgId,
        domainName: domainName,
        domainType: "zegacloud",
        verified: true,
        mxStatus: "verified",
        spfStatus: "verified",
        dkimStatus: "verified",
        dmarcStatus: "verified",
        whmcsOrderId: "ZORD-" + Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString(),
      };
      db.domains.push(domain);
    }

    // Ensure mailbox exists
    let mailbox = db.mailboxes.find((m) => m.orgId === user?.orgId);
    if (!mailbox) {
      mailbox = {
        id: "mbx_" + crypto.randomUUID().slice(0, 8),
        orgId: user.orgId,
        emailAddress: cleanEmail,
        role: "Organization Admin",
        quotaMb: 10000,
        usedMb: 45,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      db.mailboxes.push(mailbox);
    }

    // Create session
    const sessionToken = "ses_" + crypto.randomBytes(24).toString("hex");
    db.sessions.push({
      token: sessionToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    });
    writeDb(db);

    const response = NextResponse.redirect(`${appUrl}/app?sso=activated`);
    response.cookies.set("zega_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("SSO Error:", err);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(err.message || "Failed to process SSO token.")}`);
  }
}
