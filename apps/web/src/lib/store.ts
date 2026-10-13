import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "owner" | "admin" | "member" | "mailbox_user";
  orgId: string;
  createdAt: string;
}

export interface StoredOrg {
  id: string;
  name: string;
  ownerId: string;
  plan: "free" | "starter" | "growth" | "pro";
  whmcsClientId: string;
  createdAt: string;
}

export interface StoredDomain {
  id: string;
  orgId: string;
  domainName: string;
  domainType: "existing" | "zegacloud" | "sandbox";
  verified: boolean;
  mxStatus: "verified" | "pending";
  spfStatus: "verified" | "pending";
  dkimStatus: "verified" | "pending";
  dmarcStatus: "verified" | "pending";
  whmcsOrderId?: string;
  createdAt: string;
}

export interface StoredMailbox {
  id: string;
  orgId: string;
  emailAddress: string;
  role: string;
  quotaMb: number;
  usedMb: number;
  status: "active" | "suspended";
  createdAt: string;
}

export interface StoredMessage {
  id: string;
  orgId: string;
  from: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
  preview: string;
  date: string;
  folder: "inbox" | "sent" | "tracked" | "drafts" | "archive" | "spam" | string;
  isRead: boolean;
  tracked?: boolean;
  openCount?: number;
  lastOpened?: string;
  device?: string;
  followUpDue?: string;
  isHtml?: boolean;
  attachments?: { name: string; size: string; type: string }[];
  createdAt: string;
}

export interface StoredCustomFolder {
  id: string;
  orgId: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface StoredTemplate {
  id: string;
  orgId: string;
  name: string;
  category: "proposals" | "followups" | "billing" | "onboarding" | "general";
  subject: string;
  body: string;
  isHtml?: boolean;
  createdAt: string;
}

export interface CampaignStep {
  stepNumber: number;
  delayDays: number;
  subject: string;
  body: string;
  sendAsReply: boolean;
}

export interface CampaignSchedule {
  days: string[];
  startTime: string;
  endTime: string;
  timezone: string;
  maxPerDay: number;
  delaySeconds: number;
}

export interface CampaignSettings {
  trackOpens: boolean;
  trackClicks: boolean;
  stopOnReply: boolean;
  stopOnClick: boolean;
  sendAsPlaintext: boolean;
  customTrackingDomain: boolean;
}

export interface CampaignCompliance {
  physicalAddress: string;
  includeUnsubscribeHeader: boolean;
  unsubscribeText: string;
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  bounced: number;
  opened: number;
  clicked: number;
  replied: number;
  unsubscribed: number;
}

export interface StoredCampaign {
  id: string;
  orgId: string;
  name: string;
  goal: "cold_outreach" | "proposal_followup" | "product_launch" | "newsletter" | "re_engagement";
  status: "draft" | "active" | "paused" | "completed";
  fromName: string;
  fromEmail: string;
  replyTo: string;
  sendingMailboxes: string[];
  audienceCount: number;
  targetListId: string;
  schedule: CampaignSchedule;
  settings: CampaignSettings;
  compliance: CampaignCompliance;
  steps: CampaignStep[];
  metrics: CampaignMetrics;
  createdAt: string;
}

export interface StoredCampaignLead {
  id: string;
  campaignId: string;
  orgId: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle?: string;
  status: "queued" | "sent" | "opened" | "clicked" | "replied" | "unsubscribed" | "bounced";
  currentStep: number;
  openCount: number;
  lastEventTimestamp: string;
}

export interface StoredSession {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface DatabaseSchema {
  users: StoredUser[];
  orgs: StoredOrg[];
  domains: StoredDomain[];
  mailboxes: StoredMailbox[];
  messages: StoredMessage[];
  folders: StoredCustomFolder[];
  templates: StoredTemplate[];
  campaigns: StoredCampaign[];
  leads: StoredCampaignLead[];
  sessions: StoredSession[];
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "_zegasecret_salt_2026").digest("hex");
}

function getInitialDatabase(): DatabaseSchema {
  const ownerId = "usr_owner_001";
  const orgId = "org_acme_001";
  const campaignId1 = "cmp_enterprise_01";
  const campaignId2 = "cmp_invoice_02";

  return {
    users: [
      {
        id: ownerId,
        name: "Alex Carter",
        email: "owner@zegacloud.com",
        passwordHash: hashPassword("OwnerDemo#2026"),
        role: "owner",
        orgId: orgId,
        createdAt: new Date().toISOString(),
      },
      {
        id: "usr_sales_002",
        name: "Sarah Jenkins",
        email: "sales@acmedesign.co",
        passwordHash: hashPassword("SalesDemo#2026"),
        role: "admin",
        orgId: orgId,
        createdAt: new Date().toISOString(),
      },
      {
        id: "usr_support_003",
        name: "Support Desk",
        email: "support@zegacloud.com",
        passwordHash: hashPassword("SupportDemo#2026"),
        role: "member",
        orgId: orgId,
        createdAt: new Date().toISOString(),
      },
    ],
    orgs: [
      {
        id: orgId,
        name: "Acme Creative Studio Ltd",
        ownerId: ownerId,
        plan: "growth",
        whmcsClientId: "ZCL-CL-40192",
        createdAt: new Date().toISOString(),
      },
    ],
    domains: [
      {
        id: "dom_acme_001",
        orgId: orgId,
        domainName: "acmedesign.co",
        domainType: "existing",
        verified: true,
        mxStatus: "verified",
        spfStatus: "verified",
        dkimStatus: "verified",
        dmarcStatus: "verified",
        whmcsOrderId: "ZCL-DOM-90214",
        createdAt: new Date().toISOString(),
      },
      {
        id: "dom_acme_002",
        orgId: orgId,
        domainName: "acmegroup.com",
        domainType: "zegacloud",
        verified: true,
        mxStatus: "verified",
        spfStatus: "verified",
        dkimStatus: "verified",
        dmarcStatus: "verified",
        whmcsOrderId: "ZCL-DOM-90355",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      },
      {
        id: "dom_acme_003",
        orgId: orgId,
        domainName: "acmestudio.net",
        domainType: "existing",
        verified: false,
        mxStatus: "verified",
        spfStatus: "verified",
        dkimStatus: "pending",
        dmarcStatus: "pending",
        whmcsOrderId: "ZCL-DOM-90412",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
    ],
    mailboxes: [
      {
        id: "mbx_1",
        orgId: orgId,
        emailAddress: "alex@acmedesign.co",
        role: "Organization Admin",
        quotaMb: 10000,
        usedMb: 620,
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: "mbx_2",
        orgId: orgId,
        emailAddress: "sales@acmedesign.co",
        role: "Client Outreach Desk",
        quotaMb: 10000,
        usedMb: 240,
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: "mbx_3",
        orgId: orgId,
        emailAddress: "support@acmedesign.co",
        role: "Shared Support Inbox",
        quotaMb: 10000,
        usedMb: 110,
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ],
    messages: [
      {
        id: "msg_1",
        orgId: orgId,
        from: "Sarah Jenkins (Meridian Corp)",
        fromEmail: "s.jenkins@meridiancorp.com",
        toEmail: "sales@acmedesign.co",
        subject: "Re: Q4 Brand & Web Development Retainer Proposal",
        preview: "We reviewed the proposal internally this morning. The dedicated SLA looks great…",
        body: `Hi Alex,\n\nThank you for sending the updated proposal yesterday. The leadership team and I reviewed the project scope this morning.\n\nWe are very happy with the dedicated SLA and the multi-region hosting allocation you specified. I just have two brief questions regarding the milestone rollout schedule:\n1. Can the initial brand guidelines be delivered by the third week of November?\n2. Does the retainer cover ongoing analytics reporting?\n\nIf so, we are ready to sign off on the contract! Let's arrange a 15-minute sync tomorrow afternoon if you are available.\n\nBest regards,\nSarah Jenkins\nVP Operations, Meridian Corp`,
        date: "10:42 AM",
        folder: "inbox",
        isRead: false,
        attachments: [
          { name: "Retainer-Scope-v2.pdf", size: "1.8 MB", type: "pdf" },
          { name: "Architecture-Spec.fig", size: "2.4 MB", type: "figma" },
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: "msg_2",
        orgId: orgId,
        from: "You (Tracked Outbound)",
        fromEmail: "sales@acmedesign.co",
        toEmail: "s.jenkins@meridiancorp.com",
        subject: "Proposal: Q4 Brand & Web Development Retainer",
        preview: "Attached is our comprehensive retainer scope for Q4. We have locked in the dedicated SLA…",
        body: `Hi Sarah,\n\nAttached is our comprehensive retainer scope for Q4. We’ve locked in the dedicated SLA and custom API endpoint allocation you requested.\n\nKey highlights included in this proposal:\n• Full responsive redesign & web application UI system\n• Custom domain routing and email infrastructure setup\n• 24/7 priority response guarantee with 99.99% uptime SLA\n\nLet me know if 2:00 PM tomorrow works for a quick 10-minute kickoff review!\n\nWarm regards,\nAlex Carter\nPrincipal, Acme Creative Studio`,
        date: "Yesterday",
        folder: "tracked",
        isRead: true,
        tracked: true,
        openCount: 3,
        lastOpened: "4 minutes ago",
        device: "Chrome 129 on macOS 15.0",
        followUpDue: "Tomorrow, 9:00 AM",
        attachments: [{ name: "Contract-Draft-2026.pdf", size: "1.2 MB", type: "pdf" }],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: "msg_3",
        orgId: orgId,
        from: "ZegaCloud DNS Automation",
        fromEmail: "systems@zegacloud.com",
        toEmail: "admin@acmedesign.co",
        subject: "DNS Records Verified: DKIM, SPF and MX are Active",
        preview: "All DNS records for acmedesign.co have propagated successfully across the network…",
        body: `Hello Alex,\n\nGreat news! The DNS health-check worker has confirmed full propagation for your business domain: acmedesign.co.\n\nVerification Summary:\n• MX: mail.zegamail.com (Priority 10) — Passed\n• SPF: v=spf1 include:spf.zegamail.com ~all — Passed\n• DKIM: 2048-bit RSA selector (default._domainkey) — Passed\n• DMARC: v=DMARC1; p=quarantine; sp=quarantine — Passed\n\nYour outgoing emails now have the highest possible reputation score and will deliver directly into recipient inboxes.\n\nZegaCloud Infrastructure Team`,
        date: "Oct 9",
        folder: "inbox",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
      {
        id: "msg_spam_1",
        orgId: orgId,
        from: "Crypto Yield Protocol",
        fromEmail: "rewards@fast-bit-yield.net",
        toEmail: "sales@acmedesign.co",
        subject: "URGENT: Claim $14,250 in Liquidity Allocation (Expires in 6h)",
        preview: "Your wallet address has been whitelisted for a 100% risk-free token distribution…",
        body: `Dear User,\n\nWe are pleased to inform you that your corporate domain has been selected for our VIP Liquidity Airdrop.\n\nYou have an unclaimed balance of $14,250 USD equivalent. Connect your private keys immediately using the link below to confirm identity.\n\nRisk-free guarantee! Do not reply to this email directly.\n\nAutomated Yield Bot`,
        date: "Yesterday",
        folder: "spam",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      },
      {
        id: "msg_spam_2",
        orgId: orgId,
        from: "SEO Blast Direct",
        fromEmail: "leads@rankfirst-online.biz",
        toEmail: "alex@acmedesign.co",
        subject: "Guaranteed #1 Google Ranking in 48 Hours — Buy Backlinks",
        preview: "Get 15,000 high PR backlinks for just $49! 100% free trial available…",
        body: `Hello Webmaster,\n\nWe noticed acmedesign.co is not ranking #1 for all high volume search terms.\n\nOur automated AI blast tool will generate 15,000 backlinks in 48 hours guaranteed. Click here to purchase our bulk package now!\n\nRankFirst Online`,
        date: "Oct 8",
        folder: "spam",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      },
    ],
    folders: [
      {
        id: "fld_proposals",
        orgId: orgId,
        name: "Client Proposals",
        color: "#3b82f6",
        createdAt: new Date().toISOString(),
      },
      {
        id: "fld_invoices",
        orgId: orgId,
        name: "Invoices & Billing",
        color: "#10b981",
        createdAt: new Date().toISOString(),
      },
      {
        id: "fld_legal",
        orgId: orgId,
        name: "Contracts & Legal",
        color: "#8b5cf6",
        createdAt: new Date().toISOString(),
      },
    ],
    templates: [
      {
        id: "tmpl_proposal",
        orgId: orgId,
        name: "Retainer & Scope Proposal",
        category: "proposals",
        subject: "Scope of Work & Retainer Agreement — {{companyName}}",
        body: `Hi {{firstName}},\n\nFollowing our discussion, please find attached our comprehensive retainer proposal for {{companyName}}.\n\nKey Deliverables:\n• Dedicated cloud email and DNS architecture\n• Verified 2048-bit DKIM encryption and 99.99% SLA\n• Custom domain configuration and mailbox onboarding\n\nNext Steps:\n1. Review scope details in the attached agreement\n2. Authorize digital sign-off via client portal\n3. Schedule our 30-minute kickoff sync\n\nBest regards,\n{{fromName}}\nAcme Creative Studio`,
        createdAt: new Date().toISOString(),
      },
      {
        id: "tmpl_meeting_recap",
        orgId: orgId,
        name: "Meeting Action Items & Next Steps",
        category: "followups",
        subject: "Recap & Next Steps: Sync with {{companyName}}",
        body: `Hi {{firstName}},\n\nThank you for your time today. Here is a summary of the core items we aligned on:\n\nKey Decisions:\n• Project milestone target: End of month\n• Domain routing: Maintained on primary enterprise DNS\n\nAction Items:\n- [ ] Acme Studio: Deliver technical architecture spec\n- [ ] {{companyName}}: Provide DNS registrar delegation\n\nLooking forward to our next checkpoint!\n\nBest,\n{{fromName}}`,
        createdAt: new Date().toISOString(),
      },
      {
        id: "tmpl_invoice_reminder",
        orgId: orgId,
        name: "Statement & Payment Due Notice",
        category: "billing",
        subject: "Statement Due: Invoice for {{companyName}}",
        body: `Hi {{firstName}},\n\nThis is a quick notification that invoice #INV-40192 for {{companyName}} is due for processing on the 1st.\n\nYou can access your verified statement directly in your account dashboard.\n\nThank you for your continued partnership!\n\nBest,\nAcme Creative Studio Accounts`,
        createdAt: new Date().toISOString(),
      },
      {
        id: "tmpl_onboarding",
        orgId: orgId,
        name: "Client Welcome & Onboarding Brief",
        category: "onboarding",
        subject: "Welcome to Acme Studio — {{companyName}} Kickoff Guide",
        body: `Hi {{firstName}},\n\nWe are thrilled to officially welcome {{companyName}}!\n\nWe have initialized your dedicated client workspace and configured your business mail infrastructure.\n\nPlease check the onboarding link below to complete your profile setup:\nhttps://client.acmedesign.co/onboarding\n\nWarmly,\n{{fromName}}`,
        createdAt: new Date().toISOString(),
      },
    ],
    campaigns: [
      {
        id: campaignId1,
        orgId: orgId,
        name: "Q4 Enterprise Retainer Outreach",
        goal: "cold_outreach",
        status: "active",
        fromName: "Alex Carter",
        fromEmail: "sales@acmedesign.co",
        replyTo: "alex@acmedesign.co",
        sendingMailboxes: ["sales@acmedesign.co", "alex@acmedesign.co"],
        audienceCount: 420,
        targetListId: "lst_tech_founders",
        schedule: {
          days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          startTime: "09:00",
          endTime: "17:30",
          timezone: "America/New_York",
          maxPerDay: 50,
          delaySeconds: 120,
        },
        settings: {
          trackOpens: true,
          trackClicks: true,
          stopOnReply: true,
          stopOnClick: false,
          sendAsPlaintext: true,
          customTrackingDomain: true,
        },
        compliance: {
          physicalAddress: "100 Innovation Way, Suite 400, New York, NY 10001",
          includeUnsubscribeHeader: true,
          unsubscribeText: "If you'd prefer not to hear from us, click here to unsubscribe.",
        },
        steps: [
          {
            stepNumber: 1,
            delayDays: 0,
            subject: "Quick thought on {{companyName}}'s web architecture",
            body: `Hi {{firstName}},\n\nI noticed {{companyName}} recently announced your international expansion—congratulations!\n\nGrowing infrastructure often introduces deliverability and latency bottlenecks. We built dedicated business mail infrastructure with verified 2048-bit DKIM and guaranteed 99.99% uptime.\n\nWould you be open to a 10-minute sync this Thursday at 3:00 PM?\n\nBest,\nAlex Carter`,
            sendAsReply: false,
          },
          {
            stepNumber: 2,
            delayDays: 3,
            subject: "Re: Quick thought on {{companyName}}'s web architecture",
            body: `Hi {{firstName}},\n\nFollowing up on my note from Tuesday. We recently helped Meridian Corp cut their email SaaS overhead by over $600/year while boosting deliverability to 99.8%.\n\nWould love to share the 1-page breakdown if you're exploring ways to streamline Q4 tooling.\n\nCheers,\nAlex`,
            sendAsReply: true,
          },
          {
            stepNumber: 3,
            delayDays: 5,
            subject: "Re: Quick thought on {{companyName}}'s web architecture",
            body: `Hi {{firstName}},\n\nI know you're super busy leading {{companyName}}. Should I check back with your team next quarter, or is infrastructure optimization on your radar this month?\n\nEither way, wishing you continued momentum!\n\nBest,\nAlex`,
            sendAsReply: true,
          },
        ],
        metrics: {
          sent: 420,
          delivered: 418,
          bounced: 2,
          opened: 284,
          clicked: 137,
          replied: 89,
          unsubscribed: 3,
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
      {
        id: campaignId2,
        orgId: orgId,
        name: "Automated Invoice Due & Renewal Notice",
        goal: "proposal_followup",
        status: "active",
        fromName: "Acme Billing Team",
        fromEmail: "sales@acmedesign.co",
        replyTo: "billing@acmedesign.co",
        sendingMailboxes: ["sales@acmedesign.co"],
        audienceCount: 184,
        targetListId: "lst_active_clients",
        schedule: {
          days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          startTime: "10:00",
          endTime: "16:00",
          timezone: "America/New_York",
          maxPerDay: 40,
          delaySeconds: 90,
        },
        settings: {
          trackOpens: true,
          trackClicks: true,
          stopOnReply: true,
          stopOnClick: false,
          sendAsPlaintext: false,
          customTrackingDomain: true,
        },
        compliance: {
          physicalAddress: "100 Innovation Way, Suite 400, New York, NY 10001",
          includeUnsubscribeHeader: false,
          unsubscribeText: "This is a transactional billing notice.",
        },
        steps: [
          {
            stepNumber: 1,
            delayDays: 0,
            subject: "Statement for {{companyName}} — Invoice Due Date Reminder",
            body: `Hi {{firstName}},\n\nThis is a quick friendly reminder that Invoice #1094 for {{companyName}} is scheduled for processing.\n\nYou can view and download your verified receipt directly in your client portal.\n\nThank you for your partnership,\nAcme Creative Studio`,
            sendAsReply: false,
          },
          {
            stepNumber: 2,
            delayDays: 4,
            subject: "Re: Statement for {{companyName}} — Invoice Due Date Reminder",
            body: `Hi {{firstName}},\n\nFollowing up to ensure the billing details arrived safely. Let us know if you need any adjustments to payment routing.\n\nBest,\nAcme Accounting`,
            sendAsReply: true,
          },
        ],
        metrics: {
          sent: 184,
          delivered: 184,
          bounced: 0,
          opened: 155,
          clicked: 113,
          replied: 42,
          unsubscribed: 0,
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      },
    ],
    leads: [
      {
        id: "lead_1",
        campaignId: campaignId1,
        orgId: orgId,
        firstName: "Sarah",
        lastName: "Jenkins",
        email: "s.jenkins@meridiancorp.com",
        company: "Meridian Corp",
        jobTitle: "VP Operations",
        status: "replied",
        currentStep: 2,
        openCount: 3,
        lastEventTimestamp: "10:42 AM Today",
      },
      {
        id: "lead_2",
        campaignId: campaignId1,
        orgId: orgId,
        firstName: "David",
        lastName: "Miller",
        email: "david@hyperscaletech.com",
        company: "HyperScale Tech",
        jobTitle: "VP Marketing",
        status: "opened",
        currentStep: 1,
        openCount: 2,
        lastEventTimestamp: "Yesterday, 4:15 PM",
      },
      {
        id: "lead_3",
        campaignId: campaignId1,
        orgId: orgId,
        firstName: "Elena",
        lastName: "Rostova",
        email: "elena@vanguardrobotics.io",
        company: "Vanguard Robotics",
        jobTitle: "Head of Growth",
        status: "clicked",
        currentStep: 1,
        openCount: 4,
        lastEventTimestamp: "Yesterday, 2:30 PM",
      },
      {
        id: "lead_4",
        campaignId: campaignId1,
        orgId: orgId,
        firstName: "Marcus",
        lastName: "Thorne",
        email: "marcus@vanguardmedia.com",
        company: "Vanguard Media Group",
        jobTitle: "Managing Director",
        status: "sent",
        currentStep: 1,
        openCount: 0,
        lastEventTimestamp: "Today, 9:02 AM",
      },
    ],
    sessions: [],
  };
}

export function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    
    let needsSync = false;
    // Ensure campaigns and leads arrays exist
    if (!parsed.campaigns) {
      parsed.campaigns = getInitialDatabase().campaigns;
      needsSync = true;
    }
    if (!parsed.leads) {
      parsed.leads = getInitialDatabase().leads;
      needsSync = true;
    }
    if (!parsed.folders) {
      parsed.folders = getInitialDatabase().folders;
      needsSync = true;
    }
    if (!parsed.templates) {
      parsed.templates = getInitialDatabase().templates;
      needsSync = true;
    }
    if (parsed.messages && !parsed.messages.some((m: any) => m.folder === "spam")) {
      const spamMsgs = getInitialDatabase().messages.filter((m) => m.folder === "spam");
      parsed.messages.push(...spamMsgs);
      needsSync = true;
    }
    if (parsed.domains && parsed.domains.length <= 1) {
      parsed.domains = getInitialDatabase().domains;
      needsSync = true;
    }
    if (needsSync) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
    }
    return parsed;
  } catch (err) {
    console.error("Error reading database file, returning initial", err);
    return getInitialDatabase();
  }
}

export function writeDb(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

export function getCampaigns(orgId?: string): StoredCampaign[] {
  const db = readDb();
  if (!orgId) return db.campaigns;
  return db.campaigns.filter((c) => c.orgId === orgId);
}

export function getCampaignById(id: string): { campaign: StoredCampaign | null; leads: StoredCampaignLead[] } {
  const db = readDb();
  const campaign = db.campaigns.find((c) => c.id === id) || null;
  const leads = db.leads.filter((l) => l.campaignId === id);
  return { campaign, leads };
}

export function createCampaign(data: {
  orgId: string;
  name: string;
  goal: StoredCampaign["goal"];
  status?: StoredCampaign["status"];
  fromName: string;
  fromEmail: string;
  replyTo: string;
  sendingMailboxes: string[];
  audienceCount?: number;
  targetListId?: string;
  schedule: CampaignSchedule;
  settings: CampaignSettings;
  compliance: CampaignCompliance;
  steps: CampaignStep[];
  leads?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    jobTitle?: string;
  }>;
}): StoredCampaign {
  const db = readDb();
  const campaignId = "cmp_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
  
  const leadList = data.leads || [];
  const audienceCount = leadList.length > 0 ? leadList.length : (data.audienceCount || 1);

  const newCampaign: StoredCampaign = {
    id: campaignId,
    orgId: data.orgId,
    name: data.name,
    goal: data.goal,
    status: data.status || "active",
    fromName: data.fromName,
    fromEmail: data.fromEmail,
    replyTo: data.replyTo || data.fromEmail,
    sendingMailboxes: data.sendingMailboxes && data.sendingMailboxes.length > 0 ? data.sendingMailboxes : [data.fromEmail],
    audienceCount: audienceCount,
    targetListId: data.targetListId || "custom_audience",
    schedule: data.schedule,
    settings: data.settings,
    compliance: data.compliance,
    steps: data.steps,
    metrics: {
      sent: 0,
      delivered: 0,
      bounced: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      unsubscribed: 0,
    },
    createdAt: new Date().toISOString(),
  };

  db.campaigns.unshift(newCampaign);

  // If initial leads were provided, insert them
  if (leadList.length > 0) {
    leadList.forEach((ld, idx) => {
      db.leads.push({
        id: "lead_" + Date.now().toString(36) + "_" + idx,
        campaignId: campaignId,
        orgId: data.orgId,
        firstName: ld.firstName,
        lastName: ld.lastName,
        email: ld.email,
        company: ld.company,
        jobTitle: ld.jobTitle || "Business Executive",
        status: "queued",
        currentStep: 1,
        openCount: 0,
        lastEventTimestamp: "Queued",
      });
    });
  }

  writeDb(db);
  return newCampaign;
}

export function updateCampaign(
  id: string,
  updates: Partial<StoredCampaign>
): StoredCampaign | null {
  const db = readDb();
  const index = db.campaigns.findIndex((c) => c.id === id);
  if (index === -1) return null;

  db.campaigns[index] = {
    ...db.campaigns[index],
    ...updates,
  };

  writeDb(db);
  return db.campaigns[index];
}

export function deleteCampaign(id: string): boolean {
  const db = readDb();
  const initialLength = db.campaigns.length;
  db.campaigns = db.campaigns.filter((c) => c.id !== id);
  db.leads = db.leads.filter((l) => l.campaignId !== id);
  
  if (db.campaigns.length !== initialLength) {
    writeDb(db);
    return true;
  }
  return false;
}

export function getFolders(orgId?: string): StoredCustomFolder[] {
  const db = readDb();
  if (!orgId) return db.folders || [];
  return (db.folders || []).filter((f) => f.orgId === orgId);
}

export function createFolder(orgId: string, name: string, color?: string): StoredCustomFolder {
  const db = readDb();
  if (!db.folders) db.folders = [];
  const folder: StoredCustomFolder = {
    id: "fld_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6),
    orgId,
    name: name.trim(),
    color: color || "#3b82f6",
    createdAt: new Date().toISOString(),
  };
  db.folders.push(folder);
  writeDb(db);
  return folder;
}

export function deleteFolder(id: string): boolean {
  const db = readDb();
  if (!db.folders) return false;
  const init = db.folders.length;
  db.folders = db.folders.filter((f) => f.id !== id);
  // Move any messages in that folder back to inbox
  db.messages = db.messages.map((m) => (m.folder === id ? { ...m, folder: "inbox" } : m));
  if (db.folders.length !== init) {
    writeDb(db);
    return true;
  }
  return false;
}

export function moveMessage(messageId: string, targetFolder: string): StoredMessage | null {
  const db = readDb();
  const msg = db.messages.find((m) => m.id === messageId);
  if (!msg) return null;
  msg.folder = targetFolder;
  writeDb(db);
  return msg;
}

export function getTemplates(orgId?: string): StoredTemplate[] {
  const db = readDb();
  if (!orgId) return db.templates || [];
  return (db.templates || []).filter((t) => t.orgId === orgId || t.orgId === "org_acme_001");
}

export function createTemplate(template: Omit<StoredTemplate, "id" | "createdAt">): StoredTemplate {
  const db = readDb();
  if (!db.templates) db.templates = [];
  const newTmpl: StoredTemplate = {
    id: "tmpl_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
    ...template,
  };
  db.templates.push(newTmpl);
  writeDb(db);
  return newTmpl;
}

export function getDomains(orgId?: string): StoredDomain[] {
  const db = readDb();
  if (!orgId) return db.domains || [];
  return (db.domains || []).filter((d) => d.orgId === orgId);
}

export function addDomain(
  orgId: string,
  domainName: string,
  domainType: "existing" | "zegacloud" | "sandbox" = "existing"
): StoredDomain {
  const db = readDb();
  if (!db.domains) db.domains = [];
  const cleanName = domainName.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const existing = db.domains.find((d) => d.domainName.toLowerCase() === cleanName);
  if (existing) return existing;

  const isZegaOrSandbox = domainType === "zegacloud" || domainType === "sandbox";

  const newDomain: StoredDomain = {
    id: "dom_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6),
    orgId,
    domainName: cleanName,
    domainType,
    verified: isZegaOrSandbox,
    mxStatus: isZegaOrSandbox ? "verified" : "pending",
    spfStatus: isZegaOrSandbox ? "verified" : "pending",
    dkimStatus: isZegaOrSandbox ? "verified" : "pending",
    dmarcStatus: isZegaOrSandbox ? "verified" : "pending",
    whmcsOrderId: "ZCL-DOM-" + Math.floor(10000 + Math.random() * 90000),
    createdAt: new Date().toISOString(),
  };

  db.domains.push(newDomain);
  writeDb(db);
  return newDomain;
}

export function verifyDomain(domainId: string): StoredDomain | null {
  const db = readDb();
  const domain = db.domains.find((d) => d.id === domainId || d.domainName === domainId);
  if (!domain) return null;

  domain.verified = true;
  domain.mxStatus = "verified";
  domain.spfStatus = "verified";
  domain.dkimStatus = "verified";
  domain.dmarcStatus = "verified";

  writeDb(db);
  return domain;
}
