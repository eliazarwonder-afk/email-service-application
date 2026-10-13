import { z } from "zod";

// Roles & Permissions
export const OrgRole = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
  MAILBOX_USER: "mailbox_user",
} as const;

export type OrgRoleType = (typeof OrgRole)[keyof typeof OrgRole];

// Verification Status
export const DnsVerificationStatus = z.object({
  mx: z.boolean().default(false),
  spf: z.boolean().default(false),
  dkim: z.boolean().default(false),
  dmarc: z.boolean().default(false),
  details: z.record(z.string(), z.any()).optional(),
});
export type DnsVerificationStatusType = z.infer<typeof DnsVerificationStatus>;

// Provisioning Job Status
export const ProvisioningStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type ProvisioningStatusType = (typeof ProvisioningStatus)[keyof typeof ProvisioningStatus];

// API Schemas: Organizations
export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(100),
});
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

// API Schemas: Domains
export const createDomainSchema = z.object({
  domainName: z
    .string()
    .min(3)
    .max(253)
    .regex(
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      "Invalid domain name format"
    ),
});
export type CreateDomainInput = z.infer<typeof createDomainSchema>;

// API Schemas: Mailboxes
export const createMailboxSchema = z.object({
  domainId: z.string().uuid(),
  localPart: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9._-]+$/, "Only letters, numbers, periods, dashes and underscores allowed"),
  quotaMb: z.number().int().min(100).max(100000).default(5000),
  password: z.string().min(8).max(128).optional(), // If omitted, backend generates a high-entropy password
});
export type CreateMailboxInput = z.infer<typeof createMailboxSchema>;

export const updateMailboxPasswordSchema = z.object({
  password: z.string().min(8).max(128),
});
export type UpdateMailboxPasswordInput = z.infer<typeof updateMailboxPasswordSchema>;

// API Schemas: Webmail & Outbound Email
export const sendEmailSchema = z.object({
  to: z.array(z.string().email()).min(1),
  cc: z.array(z.string().email()).optional().default([]),
  bcc: z.array(z.string().email()).optional().default([]),
  subject: z.string().max(998),
  text: z.string().optional(),
  html: z.string().optional(),
  replyTo: z.string().email().optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        content: z.string(), // Base64 encoded
        contentType: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});
export type SendEmailInput = z.infer<typeof sendEmailSchema>;

// API Schemas: Developer API Keys
export const createApiKeySchema = z.object({
  name: z.string().min(2).max(100),
  scopes: z.array(z.enum(["mail.send", "mail.read", "domains.read", "mailboxes.read"])).min(1),
});
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;

// WHMCS Provisioning Webhook / API Schema
export const whmcsProvisionSchema = z.object({
  orderId: z.string(),
  whmcsClientId: z.number().int().positive(),
  clientEmail: z.string().email(),
  clientName: z.string(),
  packagePlan: z.string(), // e.g. "zegabytez-mail-pro"
  maxMailboxes: z.number().int().default(5),
  storageLimitMb: z.number().int().default(25000),
  primaryDomain: z.string().optional(),
  whmcsDomainId: z.number().int().optional(),
});
export type WhmcsProvisionInput = z.infer<typeof whmcsProvisionSchema>;
