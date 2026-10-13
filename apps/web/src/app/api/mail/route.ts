import { NextResponse } from "next/server";
import { readDb, writeDb, StoredMessage } from "@/lib/store";
import { cookies } from "next/headers";
import crypto from "crypto";

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
        if (user) {
          orgId = user.orgId;
        }
      }
    }

    const messages = db.messages.filter((m) => m.orgId === orgId);
    return NextResponse.json({ success: true, messages });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { toEmail, subject, body: content, enableTracking, attachments = [], isHtml = false } = body;

    if (!toEmail || !subject || !content) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    const db = readDb();
    const cookieStore = await cookies();
    const token = cookieStore.get("zega_session")?.value;

    let orgId = "org_acme_001";
    let senderEmail = "sales@acmedesign.co";
    let senderName = "Alex Carter";

    if (token) {
      const session = db.sessions.find((s) => s.token === token);
      if (session) {
        const user = db.users.find((u) => u.id === session.userId);
        if (user) {
          orgId = user.orgId;
          senderEmail = user.email;
          senderName = user.name;
        }
      }
    }

    const plainPreview = isHtml
      ? content.replace(/<[^>]*>?/gm, "").slice(0, 75) + "…"
      : content.slice(0, 75) + "…";

    const newMessage: StoredMessage = {
      id: "msg_" + crypto.randomUUID().slice(0, 8),
      orgId: orgId,
      from: `You (${senderName})`,
      fromEmail: senderEmail,
      toEmail: toEmail.trim(),
      subject: subject.trim(),
      preview: plainPreview,
      body: content,
      date: "Just now",
      folder: enableTracking ? "tracked" : "sent",
      isRead: true,
      tracked: enableTracking,
      openCount: 0,
      lastOpened: "Awaiting recipient open…",
      device: "Tracking pixel active (2048-bit DKIM)",
      followUpDue: "In 2 days",
      isHtml: isHtml,
      attachments: attachments,
      createdAt: new Date().toISOString(),
    };

    db.messages.unshift(newMessage);
    writeDb(db);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { messageId, folder, isRead } = body;

    if (!messageId) {
      return NextResponse.json({ success: false, error: "messageId is required" }, { status: 400 });
    }

    const db = readDb();
    const message = db.messages.find((m) => m.id === messageId);
    if (!message) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
    }

    if (folder !== undefined) {
      message.folder = folder;
    }
    if (isRead !== undefined) {
      message.isRead = isRead;
    }

    writeDb(db);
    return NextResponse.json({ success: true, message });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
