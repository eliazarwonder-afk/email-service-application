import { NextResponse } from "next/server";
import { readDb, writeDb, StoredUser } from "@/lib/store";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(error || "Google login cancelled.")}`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("zega_oauth_state")?.value;

  if (savedState && state && savedState !== state) {
    return NextResponse.redirect(`${appUrl}/login?error=Invalid+OAuth+State`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/login?error=Google+OAuth+credentials+not+configured`);
  }

  try {
    // 1. Exchange code for access_token & id_token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || "Failed to exchange token with Google.");
    }

    // 2. Fetch User Profile
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    if (!profile || !profile.email) {
      throw new Error("Could not retrieve email from Google profile.");
    }

    const cleanEmail = profile.email.toLowerCase().trim();
    const db = readDb();
    let user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      const userId = "usr_" + crypto.randomUUID().slice(0, 8);
      const orgId = "org_" + crypto.randomUUID().slice(0, 8);

      user = {
        id: userId,
        name: profile.name || cleanEmail.split("@")[0],
        email: cleanEmail,
        role: "owner",
        orgId: orgId,
        emailVerified: true, // Automatically verified by Google OAuth!
        authProvider: "google",
        avatarUrl: profile.picture,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
    } else {
      user.emailVerified = true;
      user.authProvider = "google";
      if (profile.picture) user.avatarUrl = profile.picture;
    }

    // 3. Issue Session Token
    const sessionToken = "ses_" + crypto.randomBytes(24).toString("hex");
    db.sessions.push({
      token: sessionToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    });
    writeDb(db);

    // Check if user has an existing active domain
    const hasDomain = db.domains.some((d) => d.orgId === user?.orgId && d.verified);
    const destination = hasDomain ? `${appUrl}/app` : `${appUrl}/onboarding/domain`;

    const response = NextResponse.redirect(destination);
    response.cookies.set("zega_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(err.message || "Google authentication failed.")}`);
  }
}
