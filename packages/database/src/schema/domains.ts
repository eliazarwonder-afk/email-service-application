import { pgTable, text, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { organizations } from "./tenancy";

export const domains = pgTable("domains", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  domainName: text("domain_name").notNull().unique(),
  verificationToken: text("verification_token").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
  dnsStatus: jsonb("dns_status").$type<{
    mx: boolean;
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
    lastChecked?: string;
  }>().default({
    mx: false,
    spf: false,
    dkim: false,
    dmarc: false,
  }),
  whmcsDomainId: integer("whmcs_domain_id"), // If registered through WHMCS (NameSilo)
  cpanelZoneConfigured: boolean("cpanel_zone_configured").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
