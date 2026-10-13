import { NextResponse } from "next/server";
import { readDb, writeDb, hashPassword } from "@/lib/store";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your email and password." },
        { status: 400 }
      );
    }

    const db = readDb();
    const cleanEmail = email.toLowerCase().trim();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. No account found with this email." },
        { status: 401 }
      );
    }

    const calculatedHash = hashPassword(password);
    if (user.passwordHash !== calculatedHash) {
      return NextResponse.json(
        { success: false, error: "Invalid password. Please check your credentials and try again." },
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
