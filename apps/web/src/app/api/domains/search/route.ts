import { NextResponse } from "next/server";
import { checkWhmcsDomain } from "@/lib/whmcs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain") || searchParams.get("query") || searchParams.get("q");

    if (!domain) {
      return NextResponse.json(
        { success: false, error: "Domain query parameter is required." },
        { status: 400 }
      );
    }

    const clean = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const baseName = clean.includes(".") ? clean.split(".")[0] : clean;

    // Check primary requested domain
    const primaryResult = await checkWhmcsDomain(clean.includes(".") ? clean : `${clean}.com`);

    // Also check standard TLD variants (.com, .net, .org, .co, .ng, .com.ng)
    const tldList = [".com", ".ng", ".com.ng", ".net", ".org", ".co", ".io", ".africa"];
    const variants = await Promise.all(
      tldList.map(async (tld) => {
        const d = `${baseName}${tld}`;
        return checkWhmcsDomain(d);
      })
    );

    return NextResponse.json({
      success: true,
      primary: primaryResult,
      results: variants,
      domain: clean,
    });
  } catch (err: any) {
    console.error("Domain search error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to search domain via WHMCS." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const domain = body.domain || body.domainName || body.query;

    if (!domain) {
      return NextResponse.json(
        { success: false, error: "Domain query is required." },
        { status: 400 }
      );
    }

    const clean = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const result = await checkWhmcsDomain(clean.includes(".") ? clean : `${clean}.com`);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to check domain." },
      { status: 500 }
    );
  }
}
