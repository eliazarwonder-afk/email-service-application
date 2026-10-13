import type { FastifyPluginAsync } from "fastify";
import { db, mailboxes, mailboxPermissions, domains, organizations } from "@zegabytez/database";
import { eq, and, count } from "drizzle-orm";
import {
  createMailboxSchema,
  updateMailboxPasswordSchema,
  OrgRole,
} from "@zegabytez/shared";
import {
  encryptPassword,
  decryptPassword,
  generateRandomPassword,
  CpanelUapiClient,
} from "@zegabytez/mail-core";
import { requireAuth } from "../auth/plugin";
import { requireOrgRole, requireMailboxAccess } from "../../common/guards";
import crypto from "crypto";

const cpanelClient = new CpanelUapiClient();

export const mailboxRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", requireAuth);

  // List mailboxes for current organization
  fastify.get(
    "/api/v1/mailboxes",
    { preHandler: [requireOrgRole(OrgRole.MEMBER)] },
    async (req) => {
      const orgId = req.currentOrgMember!.organizationId;
      const orgMailboxes = await db.query.mailboxes.findMany({
        where: eq(mailboxes.organizationId, orgId),
      });

      // Filter by permissions if user is not OWNER/ADMIN
      if (
        req.currentOrgMember!.role !== OrgRole.OWNER &&
        req.currentOrgMember!.role !== OrgRole.ADMIN
      ) {
        const userPerms = await db.query.mailboxPermissions.findMany({
          where: eq(mailboxPermissions.userId, req.user.id),
        });
        const allowedIds = new Set(userPerms.map((p) => p.mailboxId));
        return {
          mailboxes: orgMailboxes
            .filter((m) => allowedIds.has(m.id))
            .map(({ encryptedPassword, ...rest }) => rest),
        };
      }

      // Hide encrypted passwords from listing
      return {
        mailboxes: orgMailboxes.map(({ encryptedPassword, ...rest }) => rest),
      };
    }
  );

  // Create a new mailbox
  fastify.post(
    "/api/v1/mailboxes",
    { preHandler: [requireOrgRole(OrgRole.ADMIN)] },
    async (req, reply) => {
      const orgId = req.currentOrgMember!.organizationId;
      const parsed = createMailboxSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.format() });
      }

      const { domainId, localPart, quotaMb, password } = parsed.data;

      // 1. Check organization mailbox limits
      const org = await db.query.organizations.findFirst({
        where: eq(organizations.id, orgId),
      });

      if (!org) return reply.status(404).send({ error: "Organization not found." });

      const [currentCountResult] = await db
        .select({ count: count() })
        .from(mailboxes)
        .where(eq(mailboxes.organizationId, orgId));

      if (currentCountResult.count >= org.maxMailboxes) {
        return reply.status(403).send({
          statusCode: 403,
          error: "Quota Exceeded",
          message: `Your organization plan limit of ${org.maxMailboxes} mailboxes has been reached. Please upgrade on Zegabytez Cloud.`,
        });
      }

      // 2. Check domain ownership and verification
      const domain = await db.query.domains.findFirst({
        where: and(eq(domains.id, domainId), eq(domains.organizationId, orgId)),
      });

      if (!domain) {
        return reply.status(404).send({ error: "Domain not found in this organization." });
      }

      const fullEmail = `${localPart}@${domain.domainName}`;

      // Check if mailbox already exists in DB
      const existing = await db.query.mailboxes.findFirst({
        where: eq(mailboxes.emailAddress, fullEmail),
      });

      if (existing) {
        return reply.status(409).send({ error: `Mailbox ${fullEmail} already exists.` });
      }

      const actualPassword = password || generateRandomPassword(20);
      const encrypted = encryptPassword(actualPassword);

      // 3. Provision on cPanel
      try {
        await cpanelClient.createMailbox(
          localPart,
          domain.domainName,
          actualPassword,
          quotaMb
        );
      } catch (err: any) {
        return reply.status(502).send({
          statusCode: 502,
          error: "Provisioning Failed",
          message: `cPanel failed to create mailbox: ${err.message}`,
        });
      }

      // 4. Save to PostgreSQL
      const mailboxId = crypto.randomUUID();
      const [newMailbox] = await db
        .insert(mailboxes)
        .values({
          id: mailboxId,
          organizationId: orgId,
          domainId: domain.id,
          localPart,
          emailAddress: fullEmail,
          encryptedPassword: encrypted,
          quotaMb,
          cpanelUser: process.env.CPANEL_USERNAME || "cpanel_user",
        })
        .returning();

      // 5. Grant permission to creator
      await db.insert(mailboxPermissions).values({
        id: crypto.randomUUID(),
        userId: req.user.id,
        mailboxId,
        canRead: true,
        canSend: true,
      });

      const { encryptedPassword: _, ...safeMailbox } = newMailbox;

      return reply.status(201).send({
        mailbox: safeMailbox,
        generatedPassword: password ? undefined : actualPassword,
      });
    }
  );

  // Get mailbox details
  fastify.get(
    "/api/v1/mailboxes/:id",
    { preHandler: [(req, reply) => requireMailboxAccess(req, reply, "read")] },
    async (req) => {
      const mailbox = (req as any).targetMailbox;
      const { encryptedPassword, ...safeMailbox } = mailbox;
      return { mailbox: safeMailbox };
    }
  );

  // Update mailbox password
  fastify.post(
    "/api/v1/mailboxes/:id/password",
    { preHandler: [requireOrgRole(OrgRole.ADMIN)] },
    async (req, reply) => {
      const mailboxId = (req.params as any).id;
      const parsed = updateMailboxPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.format() });
      }

      const mailbox = await db.query.mailboxes.findFirst({
        where: eq(mailboxes.id, mailboxId),
      });

      if (!mailbox) return reply.status(404).send({ error: "Mailbox not found." });

      const domain = await db.query.domains.findFirst({
        where: eq(domains.id, mailbox.domainId),
      });

      if (!domain) return reply.status(404).send({ error: "Associated domain not found." });

      // Update password on cPanel
      await cpanelClient.updatePassword(
        mailbox.localPart,
        domain.domainName,
        parsed.data.password
      );

      // Save new encrypted password
      const newEncrypted = encryptPassword(parsed.data.password);
      await db
        .update(mailboxes)
        .set({ encryptedPassword: newEncrypted, updatedAt: new Date() })
        .where(eq(mailboxes.id, mailboxId));

      return { success: true, message: "Mailbox password updated successfully." };
    }
  );

  // External email client credentials (for Outlook, Thunderbird, mobile apps)
  fastify.get(
    "/api/v1/mailboxes/:id/credentials",
    { preHandler: [requireOrgRole(OrgRole.ADMIN)] },
    async (req, reply) => {
      const mailboxId = (req.params as any).id;
      const mailbox = await db.query.mailboxes.findFirst({
        where: eq(mailboxes.id, mailboxId),
      });

      if (!mailbox) return reply.status(404).send({ error: "Mailbox not found." });

      const decryptedPassword = decryptPassword(mailbox.encryptedPassword);
      const mailHost = process.env.CPANEL_HOST || "mail.zegabytez.com";

      return {
        email: mailbox.emailAddress,
        username: mailbox.emailAddress,
        password: decryptedPassword,
        incomingServer: {
          protocol: "IMAP",
          host: mailHost,
          port: 993,
          security: "SSL / TLS",
        },
        outgoingServer: {
          protocol: "SMTP",
          host: mailHost,
          port: 587,
          security: "STARTTLS (or SSL on port 465)",
        },
      };
    }
  );

  // Get live disk usage
  fastify.get(
    "/api/v1/mailboxes/:id/usage",
    { preHandler: [(req, reply) => requireMailboxAccess(req, reply, "read")] },
    async (req, reply) => {
      const mailbox = (req as any).targetMailbox;
      const domain = await db.query.domains.findFirst({
        where: eq(domains.id, mailbox.domainId),
      });

      if (!domain) return reply.status(404).send({ error: "Associated domain not found." });

      const usage = await cpanelClient.getMailboxUsage(mailbox.localPart, domain.domainName);

      // Update cached used quota in DB
      await db
        .update(mailboxes)
        .set({ usedQuotaMb: usage.diskUsedMb, updatedAt: new Date() })
        .where(eq(mailboxes.id, mailbox.id));

      return { usage };
    }
  );
};
