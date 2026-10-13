import { NextResponse } from "next/server";
import { readDb, getFolders, createFolder } from "@/lib/store";
import { cookies } from "next/headers";

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

    const folders = getFolders(orgId);
    return NextResponse.json({ success: true, folders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Folder name is required." }, { status: 400 });
    }

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

    const folder = createFolder(orgId, name.trim(), color);
    return NextResponse.json({ success: true, folder });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
