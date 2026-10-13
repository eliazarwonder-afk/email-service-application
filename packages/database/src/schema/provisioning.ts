import { pgTable, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { organizations } from "./tenancy";

export const provisioningJobs = pgTable("provisioning_jobs", {
  id: text("id").primaryKey(), // job uuid
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'create_mailbox', 'delete_mailbox', 'update_password', 'sync_whmcs_order', 'verify_domain_dns'
  idempotencyKey: text("idempotency_key").notNull().unique(),
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
  payload: jsonb("payload").notNull().default({}),
  result: jsonb("result"),
  error: text("error"),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(5),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});
