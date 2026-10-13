import { pgTable, text, timestamp, boolean, integer, unique } from "drizzle-orm/pg-core";
import { organizations } from "./tenancy";
import { domains } from "./domains";
import { users } from "./auth";

export const mailboxes = pgTable(
  "mailboxes",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    domainId: text("domain_id")
      .notNull()
      .references(() => domains.id, { onDelete: "cascade" }),
    localPart: text("local_part").notNull(), // e.g. 'sales'
    emailAddress: text("email_address").notNull().unique(), // sales@zegabytez.com
    encryptedPassword: text("encrypted_password").notNull(), // AES-256-GCM (iv:authTag:ciphertext)
    quotaMb: integer("quota_mb").notNull().default(5000),
    usedQuotaMb: integer("used_quota_mb").default(0),
    cpanelUser: text("cpanel_user"),
    isSuspended: boolean("is_suspended").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique("domain_local_part_idx").on(table.domainId, table.localPart),
  ]
);

export const mailboxPermissions = pgTable(
  "mailbox_permissions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mailboxId: text("mailbox_id")
      .notNull()
      .references(() => mailboxes.id, { onDelete: "cascade" }),
    canRead: boolean("can_read").notNull().default(true),
    canSend: boolean("can_send").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("user_mailbox_perm_idx").on(table.userId, table.mailboxId),
  ]
);
