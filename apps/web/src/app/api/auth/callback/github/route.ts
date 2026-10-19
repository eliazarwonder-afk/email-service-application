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
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(error || "GitHub login cancelled.")}`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("zega_github_state")?.value;

  if (savedState && state && savedState !== state) {
    return NextResponse.redirect(`${appUrl}/login?error=Invalid+GitHub+OAuth+State`);
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/login?error=GitHub+OAuth+credentials+not+configured`);
  }

  try {
    // 1. Exchange code for access_token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || "Failed to exchange authorization code with GitHub.");
    }

    // 2. Fetch User Profile
    const profileRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "ZegaMail-App",
      },
    });
    const profile = await profileRes.json();

    // 3. Fetch User Emails to get primary verified email
    let userEmail = profile.email;
    if (!userEmail) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent": "ZegaMail-App",
        },
      });
      const emails = await emailRes.json();
      if (Array.isArray(emails)) {
        const primary = emails.find((e: any) => e.primary && e.verified) || emails[0];
        if (primary) userEmail = primary.email;
      }
    }

    if (!userEmail) {
      throw new Error("Could not retrieve a verified email address from your GitHub account.");
    }

    const cleanEmail = userEmail.toLowerCase().trim();
    const db = readDb();
    let user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      const userId = "usr_" + crypto.randomUUID().slice(0, 8);
      const orgId = "org_" + crypto.randomUUID().slice(0, 8);

      user = {
        id: userId,
        name: profile.name || profile.login || cleanEmail.split("@")[0],
        email: cleanEmail,
        role: "owner",
        orgId: orgId,
        emailVerified: true,
        authProvider: "github",
        avatarUrl: profile.avatar_url,
        companyName: profile.company || undefined,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
    } else {
      user.emailVerified = true;
      user.authProvider = "github";
      if (profile.avatar_url) user.avatarUrl = profile.avatar_url;
    }

    // 4. Issue Session Token
    const sessionToken = "ses_" + crypto.randomBytes(24).toString("hex");
    db.sessions.push({
      token: sessionToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    });
    writeDb(db);

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
    console.error("GitHub OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(err.message || "GitHub authentication failed.")}`);
  }
}
