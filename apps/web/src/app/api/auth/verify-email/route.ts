import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/store";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "Email address and 6-digit confirmation code are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Account not found for this email address." },
        { status: 404 }
      );
    }

    // Check if code matches (or universal dev sandbox code '123456' for rapid dev testing)
    const isSandboxCode = process.env.NODE_ENV !== "production" && cleanCode === "123456";
    const isMatchingCode = user.verificationCode === cleanCode;

    if (!isMatchingCode && !isSandboxCode) {
      return NextResponse.json(
        { success: false, error: "Invalid confirmation code. Please check your inbox or click Resend." },
        { status: 400 }
      );
    }

    // Check expiration
    if (user.verificationCodeExpires && !isSandboxCode) {
      if (new Date(user.verificationCodeExpires) < new Date()) {
        return NextResponse.json(
          { success: false, error: "Confirmation code has expired. Please request a new code." },
          { status: 400 }
        );
      }
    }

    // Mark verified
    user.emailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    // Issue session token
    const sessionToken = "ses_" + crypto.randomBytes(24).toString("hex");
    const newSession = {
      token: sessionToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    };

    db.sessions.push(newSession);
    writeDb(db);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: true,
        companyName: user.companyName,
        orgId: user.orgId,
      },
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
    console.error("Email verification error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to verify confirmation code." },
      { status: 500 }
    );
  }
}
