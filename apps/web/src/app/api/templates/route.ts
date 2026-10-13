import { NextResponse } from "next/server";
import { getTemplates, createTemplate } from "@/lib/store";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("zega_session")?.value;
    const templates = getTemplates("org_acme_001");
    return NextResponse.json({ success: true, templates });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category = "general", subject, body: templateBody, isHtml = false } = body;

    if (!name || !subject || !templateBody) {
      return NextResponse.json(
        { success: false, error: "Name, subject, and body are required." },
        { status: 400 }
      );
    }

    const newTemplate = createTemplate({
      orgId: "org_acme_001",
      name: name.trim(),
      category,
      subject: subject.trim(),
      body: templateBody,
      isHtml,
    });

    return NextResponse.json({ success: true, template: newTemplate });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
