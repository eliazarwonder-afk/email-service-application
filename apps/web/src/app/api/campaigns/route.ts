import { NextResponse } from "next/server";
import { readDb, writeDb, getCampaigns, createCampaign, StoredCampaign } from "@/lib/store";
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
        if (user) {
          orgId = user.orgId;
        }
      }
    }

    const campaigns = getCampaigns(orgId);

    // Compute aggregate metrics
    let totalSent = 0;
    let totalDelivered = 0;
    let totalOpened = 0;
    let totalReplied = 0;
    let totalClicked = 0;
    let activeCount = 0;

    for (const c of campaigns) {
      if (c.status === "active") activeCount++;
      totalSent += c.metrics?.sent || 0;
      totalDelivered += c.metrics?.delivered || 0;
      totalOpened += c.metrics?.opened || 0;
      totalReplied += c.metrics?.replied || 0;
      totalClicked += c.metrics?.clicked || 0;
    }

    const openRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : "0.0";
    const replyRate = totalDelivered > 0 ? ((totalReplied / totalDelivered) * 100).toFixed(1) : "0.0";
    const clickRate = totalDelivered > 0 ? ((totalClicked / totalDelivered) * 100).toFixed(1) : "0.0";
    const deliverabilityRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : "99.8";

    return NextResponse.json({
      success: true,
      campaigns,
      stats: {
        totalSent,
        totalDelivered,
        activeCount,
        openRate: Number(openRate),
        replyRate: Number(replyRate),
        clickRate: Number(clickRate),
        deliverabilityRate: Number(deliverabilityRate),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      goal = "cold_outreach",
      fromName,
      fromEmail,
      replyTo,
      sendingMailboxes = [],
      schedule,
      settings,
      compliance,
      steps = [],
      leads = [],
    } = body;

    if (!name || !fromEmail) {
      return NextResponse.json(
        { success: false, error: "Campaign name and sender email are required." },
        { status: 400 }
      );
    }

    if (!steps || steps.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one sequence step is required." },
        { status: 400 }
      );
    }

    const db = readDb();
    const cookieStore = await cookies();
    const token = cookieStore.get("zega_session")?.value;

    let orgId = "org_acme_001";
    let senderName = fromName || "Alex Carter";

    if (token) {
      const session = db.sessions.find((s) => s.token === token);
      if (session) {
        const user = db.users.find((u) => u.id === session.userId);
        if (user) {
          orgId = user.orgId;
          if (!fromName) senderName = user.name;
        }
      }
    }

    const defaultSchedule = {
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      startTime: "09:00",
      endTime: "17:00",
      timezone: "America/New_York",
      maxPerDay: 50,
      delaySeconds: 120,
      ...schedule,
    };

    const defaultSettings = {
      trackOpens: true,
      trackClicks: true,
      stopOnReply: true,
      stopOnClick: false,
      sendAsPlaintext: true,
      customTrackingDomain: true,
      ...settings,
    };

    const defaultCompliance = {
      physicalAddress: "100 Innovation Way, Suite 400, New York, NY 10001",
      includeUnsubscribeHeader: true,
      unsubscribeText: "If you'd prefer not to hear from us, click here to unsubscribe.",
      ...compliance,
    };

    const newCampaign = createCampaign({
      orgId,
      name: name.trim(),
      goal,
      status: "active",
      fromName: senderName,
      fromEmail: fromEmail.trim(),
      replyTo: (replyTo || fromEmail).trim(),
      sendingMailboxes: sendingMailboxes.length > 0 ? sendingMailboxes : [fromEmail.trim()],
      schedule: defaultSchedule,
      settings: defaultSettings,
      compliance: defaultCompliance,
      steps: steps.map((s: any, idx: number) => ({
        stepNumber: idx + 1,
        delayDays: s.delayDays ?? (idx === 0 ? 0 : 3),
        subject: s.subject || `Follow-up ${idx + 1}`,
        body: s.body || "",
        sendAsReply: s.sendAsReply ?? (idx > 0),
      })),
      leads,
    });

    return NextResponse.json({ success: true, campaign: newCampaign });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
