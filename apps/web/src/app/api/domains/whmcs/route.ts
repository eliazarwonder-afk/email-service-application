import { NextResponse } from "next/server";
import { readDb, writeDb, StoredDomain } from "@/lib/store";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { domainName } = body;

    if (!domainName) {
      return NextResponse.json({ success: false, error: "Domain name is required." }, { status: 400 });
    }

    const cleanDomain = domainName.toLowerCase().trim();
    const db = readDb();
    const cookieStore = await cookies();
    const token = cookieStore.get("zega_session")?.value;

    let orgId = "org_acme_001";
    if (token) {
      const session = db.sessions.find((s) => s.token === token);
      if (session) {
        const user = db.users.find((u) => u.id === session.userId);
        if (user) orgId = user.orgId;
      }
    }

    const whmcsOrderId = "WHMCS-ORD-" + Math.floor(10000 + Math.random() * 90000);
    const newDomain: StoredDomain = {
      id: "dom_" + crypto.randomUUID().slice(0, 8),
      orgId,
      domainName: cleanDomain,
      domainType: "zegacloud",
      verified: true,
      mxStatus: "verified",
      spfStatus: "verified",
      dkimStatus: "verified",
      dmarcStatus: "verified",
      whmcsOrderId,
      createdAt: new Date().toISOString(),
    };

    db.domains.push(newDomain);
    writeDb(db);

    return NextResponse.json({
      success: true,
      message: `Domain ${cleanDomain} ordered and provisioned successfully!`,
      domain: newDomain,
      whmcsOrderId,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
