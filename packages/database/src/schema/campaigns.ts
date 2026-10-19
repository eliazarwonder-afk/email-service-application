import { pgTable, text, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { organizations } from "./tenancy";

export interface CampaignStepDef {
  stepNumber: number;
  delayDays: number;
  subject: string;
  body: string;
  sendAsReply: boolean;
}

export interface CampaignScheduleDef {
  startDate: string;
  sendingDays: string[];
  sendingHoursStart: string;
  sendingHoursEnd: string;
  timeZone: string;
  dailyLimit: number;
  minGapSeconds: number;
}

export interface CampaignSettingsDef {
  trackOpens: boolean;
  trackClicks: boolean;
  stopOnReply: boolean;
  stopOnAutoReply: boolean;
  replyToOption: "same" | "custom";
}

export interface CampaignComplianceDef {
  includeUnsubscribeLink: boolean;
  unsubscribeText: string;
  physicalAddress: string;
  customOptOutUrl?: string;
}

export interface CampaignMetricsDef {
  totalLeads: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  repliedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
}

export const campaigns = pgTable(
  "campaigns",
  {
    id: text("id").primaryKey(), // "camp_..."
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    goal: text("goal").notNull().default("cold_outreach"), // 'cold_outreach', 'proposal_followup', 'product_launch', 'newsletter', 're_engagement'
    status: text("status").notNull().default("draft"), // 'draft', 'active', 'paused', 'completed'
    fromName: text("from_name").notNull(),
    fromEmail: text("from_email").notNull(),
    replyTo: text("reply_to").notNull(),
    sendingMailboxes: jsonb("sending_mailboxes").$type<string[]>().notNull().default([]),
    audienceCount: integer("audience_count").notNull().default(0),
    targetListId: text("target_list_id").notNull().default("default"),
    schedule: jsonb("schedule").$type<CampaignScheduleDef>().notNull(),
    settings: jsonb("settings").$type<CampaignSettingsDef>().notNull(),
    compliance: jsonb("compliance").$type<CampaignComplianceDef>().notNull(),
    steps: jsonb("steps").$type<CampaignStepDef[]>().notNull().default([]),
    metrics: jsonb("metrics").$type<CampaignMetricsDef>().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("camp_org_status_idx").on(table.organizationId, table.status),
    index("camp_org_created_idx").on(table.organizationId, table.createdAt),
  ]
);

export const campaignLeads = pgTable(
  "campaign_leads",
  {
    id: text("id").primaryKey(), // "lead_..."
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    company: text("company").notNull(),
    jobTitle: text("job_title"),
    status: text("status").notNull().default("queued"), // 'queued', 'sent', 'opened', 'clicked', 'replied', 'unsubscribed', 'bounced'
    currentStep: integer("current_step").notNull().default(0),
    openCount: integer("open_count").notNull().default(0),
    lastEventTimestamp: timestamp("last_event_timestamp").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("lead_camp_status_idx").on(table.campaignId, table.status),
    index("lead_org_email_idx").on(table.organizationId, table.email),
  ]
);
