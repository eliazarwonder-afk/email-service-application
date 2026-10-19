import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDb, writeDb, StoredMailbox } from "@/lib/store";
import { createCpanelMailbox, getCpanelDnsRecords } from "@/lib/cpanel-uapi";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domainFilter = searchParams.get("domain");

    const cookieStore = await cookies();
    const token = cookieStore.get("zega_session")?.value;
    const db = readDb();

    let orgId = "org_acme_001";
    if (token) {
      const session = db.sessions?.find((s) => s.token === token);
      if (session) {
        const user = db.users?.find((u) => u.id === session.userId);
        if (user) orgId = user.orgId;
      }
    }

    let mailboxes = (db.mailboxes || []).filter((m) => m.orgId === orgId);
    if (domainFilter) {
      mailboxes = mailboxes.filter((m) => m.emailAddress.endsWith(`@${domainFilter}`));
    }

    return NextResponse.json({
      success: true,
      mailboxes,
    });
  } catch (err: any) {
    console.error("List mailboxes error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve mailboxes." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { emailPrefix, domain, password, quotaMb = 5000, role = "Custom Mailbox", isDemo = false } = body;

    if (!emailPrefix || !domain) {
      return NextResponse.json(
        { success: false, error: "emailPrefix and domain are required." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("zega_session")?.value;
    const db = readDb();

    let orgId = "org_acme_001";
    if (token) {
      const session = db.sessions?.find((s) => s.token === token);
      if (session) {
        const user = db.users?.find((u) => u.id === session.userId);
        if (user) orgId = user.orgId;
      }
    }

    const cleanPrefix = emailPrefix.toLowerCase().trim().replace(/[^a-z0-9._-]/g, "");
    const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const fullEmail = `${cleanPrefix}@${cleanDomain}`;

    // Check if mailbox already exists in database
    const existing = (db.mailboxes || []).find(
      (m) => m.emailAddress.toLowerCase() === fullEmail.toLowerCase()
    );
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Mailbox ${fullEmail} already exists.` },
        { status: 409 }
      );
    }

    // Call cPanel UAPI client (or demo mock if in demo mode / credentials missing)
    const provisionResult = await createCpanelMailbox({
      emailPrefix: cleanPrefix,
      domain: cleanDomain,
      password: password || `ZegaMail_${Date.now()}#2026`,
      quotaMb,
    });

    const newMailbox: StoredMailbox = {
      id: "mbx_" + Date.now().toString(36),
      orgId,
      emailAddress: fullEmail,
      role,
      quotaMb,
      usedMb: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    if (!db.mailboxes) db.mailboxes = [];
    db.mailboxes.push(newMailbox);
    writeDb(db);

    return NextResponse.json({
      success: true,
      message: `Mailbox ${fullEmail} provisioned successfully on cPanel Anycast cluster!`,
      mailbox: newMailbox,
      dns: provisionResult.dns,
      smtpSettings: provisionResult.smtpSettings,
    });
  } catch (err: any) {
    console.error("Create mailbox error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to provision mailbox on cPanel cluster." },
      { status: 500 }
    );
  }
}
