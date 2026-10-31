import { NextResponse } from "next/server";
import { getWhmcsProducts } from "@/lib/whmcs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getWhmcsProducts();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        fromWhmcs: false,
        error: err.message || "Failed to load products from billing system.",
        products: [],
      },
      { status: 500 }
    );
  }
}
