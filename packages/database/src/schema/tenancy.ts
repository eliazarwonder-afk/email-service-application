import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(), // uuid string
  name: text("name").notNull(),
  whmcsClientId: integer("whmcs_client_id"), // Zegabytez Cloud WHMCS Client ID
  subscriptionStatus: text("subscription_status").notNull().default("active"),
  packagePlan: text("package_plan").default("standard"),
  cpanelUser: text("cpanel_user"),
  maxMailboxes: integer("max_mailboxes").notNull().default(5),
  storageLimitMb: integer("storage_limit_mb").notNull().default(25000),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const organizationMembers = pgTable("organization_members", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // 'owner', 'admin', 'member', 'mailbox_user'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
