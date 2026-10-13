import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/store";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("zega_session")?.value;

    if (token) {
      const db = readDb();
      db.sessions = db.sessions.filter((s) => s.token !== token);
      writeDb(db);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("zega_session");
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
