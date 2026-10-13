import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { organizations } from "./tenancy";

export const apiKeys = pgTable("api_keys", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  keyPrefix: text("key_prefix").notNull(), // e.g. 'zgm_live_ab12'
  keyHash: text("key_hash").notNull().unique(), // SHA-256 hash of secret
  scopes: jsonb("scopes").$type<string[]>().notNull().default(["mail.send"]),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

export const outboundEmails = pgTable("outbound_emails", {
  id: text("id").primaryKey(), // messageId
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  mailboxId: text("mailbox_id"),
  apiKeyId: text("api_key_id"),
  fromAddress: text("from_address").notNull(),
  toAddresses: jsonb("to_addresses").$type<string[]>().notNull(),
  ccAddresses: jsonb("cc_addresses").$type<string[]>().default([]),
  bccAddresses: jsonb("bcc_addresses").$type<string[]>().default([]),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("queued"), // 'queued', 'sent', 'failed', 'delivered', 'bounced'
  smtpResponse: text("smtp_response"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  sentAt: timestamp("sent_at"),
});
