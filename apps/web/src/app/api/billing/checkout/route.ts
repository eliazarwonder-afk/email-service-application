import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import {
  readDb,
  writeDb,
  hashPassword,
  createOrderAndInvoice,
  StoredUser,
  StoredOrg,
  StoredDomain,
  StoredMailbox,
} from "@/lib/store";
import {
  validateEmail,
  validatePassword,
  validateDomain,
} from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      planId = "growth",
      billingCycle = "annually",
      currency = "USD",
      clientEmail,
      clientName,
      password,
      domainName,
      domainNameToRegister,
    } = body;

    const isAnnual = billingCycle === "annually" || billingCycle === "annual";

    // 1. Session & User Verification / Auto-Provisioning
    const cookieStore = await cookies();
    const token = cookieStore.get("zega_session")?.value;
    const db = readDb();

    let session = token ? db.sessions?.find((s) => s.token === token) : null;
    let user: StoredUser | null = session ? db.users?.find((u) => u.id === session.userId) || null : null;
    let org: StoredOrg | null = user ? db.orgs?.find((o) => o.id === user?.orgId) || null : null;
    let newSessionToken: string | null = null;

    if (!user) {
      // User is claiming free plan or onboarding without prior session
      const emailCheck = validateEmail(clientEmail, "Contact Email");
      if (!emailCheck.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: emailCheck.error || "Please enter a valid business contact email address to configure your mailboxes.",
          },
          { status: 400 }
        );
      }

      if (password) {
        const passCheck = validatePassword(password, 6);
        if (!passCheck.isValid) {
          return NextResponse.json({ success: false, error: passCheck.error }, { status: 400 });
        }
      }

      if (domainName) {
        const domCheck = validateDomain(domainName);
        if (!domCheck.isValid) {
          return NextResponse.json({ success: false, error: domCheck.error }, { status: 400 });
        }
      }

      const cleanEmail = emailCheck.value;

      // Check if user exists
      user = db.users?.find((u) => u.email.toLowerCase() === cleanEmail) || null;

      if (user) {
        org = db.orgs?.find((o) => o.id === user?.orgId) || null;
      } else {
        const userId = "usr_" + crypto.randomUUID().slice(0, 8);
        const orgId = "org_" + crypto.randomUUID().slice(0, 8);
        const whmcsClientId = "ZCL-CL-" + Math.floor(10000 + Math.random() * 90000);

        org = {
          id: orgId,
          name: clientName ? `${clientName.trim()}'s Organization` : "ZegaMail Organization",
          ownerId: userId,
          plan: (planId as any) || "free",
          whmcsClientId,
          createdAt: new Date().toISOString(),
        };
        db.orgs.push(org);

        user = {
          id: userId,
          name: clientName ? clientName.trim() : cleanEmail.split("@")[0],
          email: cleanEmail,
          passwordHash: hashPassword(password || "ZegaSecure#2026"),
          role: "owner",
          orgId: org.id,
          emailVerified: true,
          authProvider: "email",
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
      }

      // Issue authentication session cookie
      newSessionToken = "ses_" + crypto.randomBytes(24).toString("hex");
      if (!db.sessions) db.sessions = [];
      db.sessions.push({
        token: newSessionToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      });
      writeDb(db);
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "Failed to initialize user account." }, { status: 500 });
    }

    const email = user.email;
    const name = user.name;
    const orgId = org ? org.id : user.orgId;
    const userId = user.id;

    // 2. Domain & Mailbox Provisioning
    const rawTarget = domainNameToRegister || domainName || (email.includes("@") ? email.split("@")[1] : "mybusiness.com");
    const targetDomain = rawTarget.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    let domainRecord = db.domains?.find((d) => d.orgId === orgId && d.domainName.toLowerCase() === targetDomain);
    if (!domainRecord) {
      domainRecord = {
        id: "dom_" + crypto.randomUUID().slice(0, 8),
        orgId,
        domainName: targetDomain,
        domainType: "zegacloud",
        verified: true,
        mxStatus: "verified",
        spfStatus: "verified",
        dkimStatus: "verified",
        dmarcStatus: "verified",
        whmcsOrderId: "ZCL-ORD-" + Math.floor(10000 + Math.random() * 90000),
        createdAt: new Date().toISOString(),
      };
      if (!db.domains) db.domains = [];
      db.domains.push(domainRecord);
    }

    // Ensure primary admin mailbox exists
    const primaryMailboxAddress = email.includes("@") ? email : `admin@${targetDomain}`;
    let primaryMailbox = db.mailboxes?.find((m) => m.orgId === orgId && m.emailAddress.toLowerCase() === primaryMailboxAddress.toLowerCase());
    if (!primaryMailbox) {
      if (!db.mailboxes) db.mailboxes = [];
      db.mailboxes.push({
        id: "mbx_" + crypto.randomUUID().slice(0, 8),
        orgId,
        emailAddress: primaryMailboxAddress,
        role: "Organization Admin",
        quotaMb: planId === "free" ? 1000 : planId === "starter" ? 2500 : 5000,
        usedMb: 24,
        status: "active",
        createdAt: new Date().toISOString(),
      });
    }

    // Helper to set session cookie on any response
    const setSessionOnResponse = (res: NextResponse) => {
      if (newSessionToken) {
        res.cookies.set("zega_session", newSessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "lax",
        });
      }
      return res;
    };

    // 3. FREE PLAN CLAIMS ($0 / ₦0 FOREVER)
    if (planId === "free") {
      const secondMailboxAddress = `info@${targetDomain}`;
      if (!db.mailboxes.some((m) => m.orgId === orgId && m.emailAddress.toLowerCase() === secondMailboxAddress)) {
        db.mailboxes.push({
          id: "mbx_" + crypto.randomUUID().slice(0, 8),
          orgId,
          emailAddress: secondMailboxAddress,
          role: "General Support",
          quotaMb: 1000,
          usedMb: 5,
          status: "active",
          createdAt: new Date().toISOString(),
        });
      }

      if (org) org.plan = "free";
      writeDb(db);

      const { order, invoice } = createOrderAndInvoice({
        orgId,
        userId,
        clientEmail: email,
        clientName: name,
        planId: "free",
        billingCycle: "annually",
        paymentMethod: "free_forever",
        currency,
        customAmount: 0,
      });

      const response = NextResponse.json({
        success: true,
        isFreePlan: true,
        orderId: order.id,
        invoiceId: invoice.id,
        redirectUrl: "/app?welcome=free_tier",
        message: "Free Forever plan activated! Your mailboxes have been provisioned.",
      });

      return setSessionOnResponse(response);
    }

    // 4. PAID PLANS (Starter, Growth, Enterprise Pro) -> Redirect to ZegaCloud Client Portal
    const productPidMap: Record<string, string> = {
      starter: "1",
      growth: "2",
      pro: "3",
    };
    const pid = productPidMap[planId] || "2";
    const cycle = isAnnual ? "annually" : "monthly";
    const whmcsCheckoutUrl = `https://billing.zegacloud.com/cart.php?a=add&pid=${pid}&billingcycle=${cycle}`;

    const response = NextResponse.json({
      success: true,
      redirectUrl: whmcsCheckoutUrl,
      message: "Redirecting to ZegaCloud Portal for secure payment and automated provisioning.",
    });

    return setSessionOnResponse(response);
  } catch (err: any) {
    console.error("Billing checkout error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process checkout order." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  return NextResponse.json({
    success: true,
    message: "Payments are processed centrally by the ZegaCloud Client Portal.",
  });
}
