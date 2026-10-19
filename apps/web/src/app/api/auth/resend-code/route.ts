import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/store";
import { sendVerificationEmail } from "@/lib/email-service";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email address is required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return NextResponse.json({ success: false, error: "Account not found." }, { status: 404 });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newCode;
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    writeDb(db);

    const emailResult = await sendVerificationEmail(cleanEmail, user.name, newCode);

    return NextResponse.json({
      success: true,
      previewCode: emailResult.previewCode,
      message: "A fresh 6-digit confirmation code has been dispatched to your email.",
    });
  } catch (err: any) {
    console.error("Resend verification code error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to resend confirmation code." },
      { status: 500 }
    );
  }
}
