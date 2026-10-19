import { NextResponse } from "next/server";
import { readDb, getFolders, getTemplates } from "@/lib/store";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("zega_session")?.value;
    const db = readDb();

    let user: any = null;
    let org: any = null;
    let domain: any = null;
    let mailboxes: any[] = [];
    let authenticated = false;

    if (token) {
      const session = db.sessions.find((s) => s.token === token);
      if (session && new Date(session.expiresAt) >= new Date()) {
        user = db.users.find((u) => u.id === session.userId);
        if (user) {
          authenticated = true;
          org = db.orgs.find((o) => o.id === user.orgId);
          domain = db.domains.find((d) => d.orgId === user.orgId);
          mailboxes = db.mailboxes.filter((m) => m.orgId === user.orgId);
        }
      }
    }

    // If unauthenticated or demo mode
    if (!authenticated) {
      const fallbackUser = db.users[0];
      user = { id: fallbackUser.id, name: fallbackUser.name, email: fallbackUser.email, role: fallbackUser.role };
      org = db.orgs.find((o) => o.id === fallbackUser.orgId);
      domain = db.domains.find((d) => d.orgId === fallbackUser.orgId);
      mailboxes = db.mailboxes.filter((m) => m.orgId === fallbackUser.orgId);
    }

    const targetOrgId = org?.id || "org_acme_001";
    const messages = db.messages.filter((m) => m.orgId === targetOrgId);
    const folders = getFolders(targetOrgId);
    const templates = getTemplates(targetOrgId);
    const billingOrders = db.orders.filter((o) => o.orgId === targetOrgId);

    return NextResponse.json({
      success: true,
      authenticated,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        authProvider: user.authProvider,
        avatarUrl: user.avatarUrl,
        orgId: user.orgId,
      },
      org,
      domain,
      mailboxes,
      messages,
      folders,
      templates,
      billingOrders,
    });
  } catch (err: any) {
    console.error("Bootstrap error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
