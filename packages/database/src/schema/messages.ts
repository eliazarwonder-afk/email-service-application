import { pgTable, text, timestamp, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { organizations } from "./tenancy";

export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey(), // "msg_..."
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    mailboxId: text("mailbox_id"),
    from: text("from").notNull(),
    fromEmail: text("from_email").notNull(),
    toEmail: text("to_email").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    preview: text("preview").notNull(),
    folder: text("folder").notNull().default("inbox"), // 'inbox', 'sent', 'tracked', 'drafts', 'archive', 'spam', custom
    isRead: boolean("is_read").notNull().default(false),
    tracked: boolean("tracked").default(false),
    deliveryStatus: text("delivery_status").default("delivered"), // 'sent', 'delivered', 'bounced', 'failed'
    openCount: integer("open_count").default(0),
    lastOpened: text("last_opened"),
    device: text("device"),
    followUpDue: text("follow_up_due"),
    isHtml: boolean("is_html").default(false),
    attachments: jsonb("attachments").$type<{ name: string; size: string; type: string }[]>().default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("msg_org_folder_idx").on(table.organizationId, table.folder),
    index("msg_org_created_idx").on(table.organizationId, table.createdAt),
    index("msg_to_email_idx").on(table.toEmail),
  ]
);

export const customFolders = pgTable(
  "custom_folders",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").default("#3b82f6"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("folder_org_idx").on(table.organizationId),
  ]
);

export const templates = pgTable(
  "templates",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull().default("general"), // 'proposals', 'followups', 'billing', 'onboarding', 'general'
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    isHtml: boolean("is_html").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("tmpl_org_category_idx").on(table.organizationId, table.category),
  ]
);
