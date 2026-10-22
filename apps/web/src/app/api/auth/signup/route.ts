import { NextResponse } from "next/server";
import { readDb, writeDb, hashPassword, StoredUser } from "@/lib/store";
import { sendVerificationEmail } from "@/lib/email-service";
import {
  validateEmail,
  validatePassword,
  validateFullName,
  validatePhone,
  validateCacNumber,
} from "@/lib/validation";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { fullName, email, password, companyName, phoneNumber, cacNumber } = body;

    const nameCheck = validateFullName(fullName, "Full Name");
    if (!nameCheck.isValid) {
      return NextResponse.json({ success: false, error: nameCheck.error }, { status: 400 });
    }

    const emailCheck = validateEmail(email, "Work Email");
    if (!emailCheck.isValid) {
      return NextResponse.json({ success: false, error: emailCheck.error }, { status: 400 });
    }

    const passCheck = validatePassword(password, 6);
    if (!passCheck.isValid) {
      return NextResponse.json({ success: false, error: passCheck.error }, { status: 400 });
    }

    const phoneCheck = validatePhone(phoneNumber);
    if (!phoneCheck.isValid) {
      return NextResponse.json({ success: false, error: phoneCheck.error }, { status: 400 });
    }

    const cacCheck = validateCacNumber(cacNumber);
    if (!cacCheck.isValid) {
      return NextResponse.json({ success: false, error: cacCheck.error }, { status: 400 });
    }

    const cleanEmail = emailCheck.value;
    const db = readDb();

    // Check if user already exists
    const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      // If user exists and is already verified
      if (existing.emailVerified) {
        return NextResponse.json(
          { success: false, error: "An account with this email address already exists. Please sign in instead." },
          { status: 409 }
        );
      } else {
        // If user exists but is unverified, regenerate code and prompt verification
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        existing.verificationCode = code;
        existing.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        existing.passwordHash = hashPassword(password);
        existing.name = fullName.trim();
        if (companyName) existing.companyName = companyName.trim();
        if (phoneNumber) existing.phoneNumber = phoneNumber.trim();
        if (cacNumber) existing.cacNumber = cacNumber.trim();

        writeDb(db);
        const emailRes = await sendVerificationEmail(cleanEmail, existing.name, code);

        return NextResponse.json({
          success: true,
          requiresVerification: true,
          email: cleanEmail,
          previewCode: emailRes.previewCode,
          message: "A confirmation code has been dispatched to your email address.",
        });
      }
    }

    const userId = "usr_" + crypto.randomUUID().slice(0, 8);
    const orgId = "org_" + crypto.randomUUID().slice(0, 8);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create User (unverified until 6-digit confirmation code is entered)
    const newUser: StoredUser = {
      id: userId,
      name: fullName.trim(),
      email: cleanEmail,
      passwordHash: hashPassword(password),
      role: "owner",
      orgId: orgId,
      emailVerified: false,
      verificationCode,
      verificationCodeExpires: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      authProvider: "email",
      companyName: companyName ? companyName.trim() : undefined,
      phoneNumber: phoneNumber ? phoneNumber.trim() : undefined,
      cacNumber: cacNumber ? cacNumber.trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDb(db);

    // Send confirmation email
    const emailResult = await sendVerificationEmail(cleanEmail, newUser.name, verificationCode);

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      userId: newUser.id,
      previewCode: emailResult.previewCode,
      message: "Account created! Please check your email for your 6-digit confirmation code.",
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to create account." }, { status: 500 });
  }
}
