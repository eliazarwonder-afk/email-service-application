import { NextResponse } from "next/server";
import { readDb } from "@/lib/store";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("zega_session")?.value;

    const db = readDb();

    if (!token) {
      // Default fallback demo user if no cookie set yet
      const fallbackUser = db.users[0];
      const org = db.orgs.find((o) => o.id === fallbackUser.orgId);
      const domain = db.domains.find((d) => d.orgId === fallbackUser.orgId);
      const mailboxes = db.mailboxes.filter((m) => m.orgId === fallbackUser.orgId);

      return NextResponse.json({
        authenticated: false,
        user: { id: fallbackUser.id, name: fallbackUser.name, email: fallbackUser.email, role: fallbackUser.role },
        org,
        domain,
        mailboxes,
      });
    }

    const session = db.sessions.find((s) => s.token === token);
    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = db.users.find((u) => u.id === session.userId);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const org = db.orgs.find((o) => o.id === user.orgId);
    const domain = db.domains.find((d) => d.orgId === user.orgId);
    const mailboxes = db.mailboxes.filter((m) => m.orgId === user.orgId);

    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      org,
      domain,
      mailboxes,
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
