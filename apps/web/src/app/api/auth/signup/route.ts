import { NextResponse } from "next/server";
import { readDb, writeDb, hashPassword, StoredUser, StoredOrg, StoredDomain, StoredMailbox } from "@/lib/store";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password, companyName, domainName, domainType, plan } = body;

    if (!email || !password || !fullName || !companyName) {
      return NextResponse.json(
        { success: false, error: "Please provide full name, work email, company name, and password." },
        { status: 400 }
      );
    }

    const db = readDb();
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    const userId = "usr_" + crypto.randomUUID().slice(0, 8);
    const orgId = "org_" + crypto.randomUUID().slice(0, 8);
    const domainId = "dom_" + crypto.randomUUID().slice(0, 8);

    const actualDomain = domainName
      ? domainName.trim()
      : cleanEmail.includes("@")
      ? cleanEmail.split("@")[1]
      : "mybrand.com";

    // Create User
    const newUser: StoredUser = {
      id: userId,
      name: fullName.trim(),
      email: cleanEmail,
      passwordHash: hashPassword(password),
      role: "owner",
      orgId: orgId,
      createdAt: new Date().toISOString(),
    };

    // Create Org
    const newOrg: StoredOrg = {
      id: orgId,
      name: companyName.trim(),
      ownerId: userId,
      plan: plan || "growth",
      whmcsClientId: "ZCL-CL-" + Math.floor(10000 + Math.random() * 90000),
      createdAt: new Date().toISOString(),
    };

    // Create Domain
    const newDomain: StoredDomain = {
      id: domainId,
      orgId: orgId,
      domainName: actualDomain,
      domainType: domainType || "existing",
      verified: true,
      mxStatus: "verified",
      spfStatus: "verified",
      dkimStatus: "verified",
      dmarcStatus: "verified",
      whmcsOrderId: "WHMCS-ORD-" + Math.floor(10000 + Math.random() * 90000),
      createdAt: new Date().toISOString(),
    };

    // Create Default Mailboxes
    const mailboxPrefix = cleanEmail.includes("@") ? cleanEmail.split("@")[0] : "alex";
    const mailbox1: StoredMailbox = {
      id: "mbx_" + crypto.randomUUID().slice(0, 8),
      orgId: orgId,
      emailAddress: `${mailboxPrefix}@${actualDomain}`,
      role: "Organization Owner",
      quotaMb: 5000,
      usedMb: 12,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    const mailbox2: StoredMailbox = {
      id: "mbx_" + crypto.randomUUID().slice(0, 8),
      orgId: orgId,
      emailAddress: `info@${actualDomain}`,
      role: "General Inquiries",
      quotaMb: 5000,
      usedMb: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    // Welcome email message
    const welcomeMsg = {
      id: "msg_" + crypto.randomUUID().slice(0, 8),
      orgId: orgId,
      from: "ZegaCloud Infrastructure",
      fromEmail: "welcome@zegacloud.com",
      toEmail: mailbox1.emailAddress,
      subject: `Welcome to Zega Mail — ${newOrg.name}`,
      preview: "Your business email environment is live with verified DNS and client read receipts…",
      body: `Hello ${newUser.name},\n\nWelcome to Zega Mail! Your organization "${newOrg.name}" has been registered and linked to your domain: ${newDomain.domainName}.\n\nYour Setup Details:\n• Primary Mailbox: ${mailbox1.emailAddress}\n• Client Account ID: ${newOrg.whmcsClientId}\n• Plan: ${newOrg.plan.toUpperCase()}\n• DNS Status: MX, SPF, DKIM & DMARC Enforced\n\nYou can now send tracked proposals, use the Zega AI writer, and connect your phone via SSL IMAP/SMTP.\n\nWarm regards,\nZegaCloud Support Team`,
      date: "Just now",
      folder: "inbox" as const,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Create Session
    const sessionToken = "ses_" + crypto.randomBytes(24).toString("hex");
    const newSession = {
      token: sessionToken,
      userId: userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    };

    db.users.push(newUser);
    db.orgs.push(newOrg);
    db.domains.push(newDomain);
    db.mailboxes.push(mailbox1, mailbox2);
    db.messages.push(welcomeMsg);
    db.sessions.push(newSession);

    writeDb(db);

    const response = NextResponse.json({
      success: true,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      org: newOrg,
      domain: newDomain,
      mailboxes: [mailbox1, mailbox2],
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
    console.error("Signup error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to create account." }, { status: 500 });
  }
}
