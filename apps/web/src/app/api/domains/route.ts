import { NextResponse } from "next/server";
import { readDb, getDomains, addDomain, verifyDomain } from "@/lib/store";
import { cookies } from "next/headers";
import { validateDomain } from "@/lib/validation";

export async function GET() {
  try {
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

    const domains = getDomains(orgId);
    return NextResponse.json({ success: true, domains });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action = "register", domainName, domainType = "existing" } = body;

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

    if (action === "search") {
      const rawName = (domainName || body.query || "").toLowerCase().trim().replace(/^https?:\/\//, "").split(".")[0];
      if (!rawName) {
        return NextResponse.json({ success: false, error: "Search query required" }, { status: 400 });
      }

      // Generate realistic TLD availability options
      const tlds = [
        { tld: ".com", price: "$12.95/yr", available: true },
        { tld: ".co", price: "$24.00/yr", available: true },
        { tld: ".io", price: "$39.00/yr", available: rawName.length % 2 === 0 },
        { tld: ".net", price: "$14.50/yr", available: true },
        { tld: ".org", price: "$15.00/yr", available: true },
      ];

      const results = tlds.map((t) => ({
        fullDomain: `${rawName}${t.tld}`,
        tld: t.tld,
        price: t.price,
        available: t.available,
      }));

      return NextResponse.json({ success: true, results });
    }

    if (action === "register" || action === "connect") {
      const domCheck = validateDomain(domainName);
      if (!domCheck.isValid) {
        return NextResponse.json({ success: false, error: domCheck.error }, { status: 400 });
      }

      const type = action === "register" ? "zegacloud" : domainType;
      const domain = addDomain(orgId, domCheck.value, type);

      const dnsRecords = {
        mx: { type: "MX", host: "@", value: "mail.zegamail.com", priority: 10 },
        spf: { type: "TXT", host: "@", value: "v=spf1 include:spf.zegamail.com ~all" },
        dkim: {
          type: "TXT",
          host: "default._domainkey",
          value: "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA32X+ZegaCloud2026DKIMKey...",
        },
        dmarc: { type: "TXT", host: "_dmarc", value: "v=DMARC1; p=quarantine; sp=quarantine" },
      };

      return NextResponse.json({
        success: true,
        domain,
        dnsRecords,
        message: action === "register" ? "Domain registered and pre-configured!" : "Domain added. Configure DNS to activate.",
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { domainId } = body;

    if (!domainId) {
      return NextResponse.json({ success: false, error: "domainId is required" }, { status: 400 });
    }

    const domain = verifyDomain(domainId);
    if (!domain) {
      return NextResponse.json({ success: false, error: "Domain not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      domain,
      message: "All DNS records (MX, SPF, DKIM, DMARC) verified successfully!",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
