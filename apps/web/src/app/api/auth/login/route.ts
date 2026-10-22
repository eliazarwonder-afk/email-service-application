import { NextResponse } from "next/server";
import { readDb, writeDb, hashPassword } from "@/lib/store";
import { checkRateLimit, timingSafeCompare } from "@/lib/security";
import { validateEmail, validatePassword } from "@/lib/validation";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return NextResponse.json(
        { success: false, error: emailCheck.error || "Please enter a valid work email address." },
        { status: 400 }
      );
    }

    const passCheck = validatePassword(password, 6);
    if (!passCheck.isValid) {
      return NextResponse.json(
        { success: false, error: passCheck.error || "Please enter your password." },
        { status: 400 }
      );
    }

    const cleanEmail = emailCheck.value;

    // Security: Rate limit login attempts to prevent brute-force attacks
    const rateCheck = checkRateLimit(`login_${ip}_${cleanEmail}`, 5, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many failed login attempts. Please wait 60 seconds before trying again.",
          retryAfterMs: rateCheck.resetInMs,
        },
        { status: 429 }
      );
    }

    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    // Security: Generic error message to prevent user enumeration
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          error: `This account was registered using ${user.authProvider === "google" ? "Google" : "GitHub"}. Please sign in with ${user.authProvider === "google" ? "Google" : "GitHub"}.`,
        },
        { status: 400 }
      );
    }

    const calculatedHash = hashPassword(password);
    if (!timingSafeCompare(user.passwordHash, calculatedHash)) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const org = db.orgs.find((o) => o.id === user.orgId);
    const domain = db.domains.find((d) => d.orgId === user.orgId);
    const mailboxes = db.mailboxes.filter((m) => m.orgId === user.orgId);

    // Create or renew session
    const sessionToken = "ses_" + crypto.randomBytes(24).toString("hex");
    db.sessions.push({
      token: sessionToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    });
    writeDb(db);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      org: org || null,
      domain: domain || null,
      mailboxes: mailboxes,
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
    console.error("Login error:", err);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
