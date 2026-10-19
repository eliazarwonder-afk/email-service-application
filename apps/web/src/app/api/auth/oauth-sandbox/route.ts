import { NextResponse } from "next/server";
import { readDb, writeDb, StoredUser } from "@/lib/store";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { provider, name, email, avatarUrl } = await req.json();

    if (!provider || !email) {
      return NextResponse.json(
        { success: false, error: "Provider and email address are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name?.trim() || cleanEmail.split("@")[0];
    const db = readDb();

    let user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      const userId = "usr_" + crypto.randomUUID().slice(0, 8);
      const orgId = "org_" + crypto.randomUUID().slice(0, 8);

      user = {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        role: "owner",
        orgId: orgId,
        emailVerified: true,
        authProvider: provider as "google" | "github",
        avatarUrl:
          avatarUrl ||
          (provider === "google"
            ? "https://lh3.googleusercontent.com/a/default-user=s96-c"
            : "https://avatars.githubusercontent.com/u/9919?v=4"),
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
    } else {
      user.emailVerified = true;
      user.authProvider = provider as "google" | "github";
    }

    // Create Session
    const sessionToken = "ses_" + crypto.randomBytes(24).toString("hex");
    db.sessions.push({
      token: sessionToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    });
    writeDb(db);

    const hasDomain = db.domains.some((d) => d.orgId === user?.orgId && d.verified);
    const redirectUrl = hasDomain ? "/app" : "/onboarding/domain";

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
      },
      redirectUrl,
    });

    response.cookies.set("zega_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Sandbox OAuth error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process OAuth." },
      { status: 500 }
    );
  }
}
