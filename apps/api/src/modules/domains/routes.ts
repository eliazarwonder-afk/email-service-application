import type { FastifyPluginAsync } from "fastify";
import { db, domains } from "@zegabytez/database";
import { eq, and } from "drizzle-orm";
import { createDomainSchema, OrgRole } from "@zegabytez/shared";
import { requireAuth } from "../auth/plugin";
import { requireOrgRole } from "../../common/guards";
import crypto from "crypto";
import dns from "dns/promises";

export const domainRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", requireAuth);

  // List domains for an organization
  fastify.get(
    "/api/v1/domains",
    { preHandler: [requireOrgRole(OrgRole.MEMBER)] },
    async (req) => {
      const orgId = req.currentOrgMember!.organizationId;
      const orgDomains = await db.query.domains.findMany({
        where: eq(domains.organizationId, orgId),
      });
      return { domains: orgDomains };
    }
  );

  // Add a new domain
  fastify.post(
    "/api/v1/domains",
    { preHandler: [requireOrgRole(OrgRole.ADMIN)] },
    async (req, reply) => {
      const orgId = req.currentOrgMember!.organizationId;
      const parsed = createDomainSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.format() });
      }

      const domainName = parsed.data.domainName.toLowerCase();

      // Check if domain is already registered
      const existing = await db.query.domains.findFirst({
        where: eq(domains.domainName, domainName),
      });

      if (existing) {
        return reply.status(409).send({ error: "Domain already added to Zegabytez Mail." });
      }

      const verificationToken = `zgm_verify_${crypto.randomBytes(16).toString("hex")}`;
      const domainId = crypto.randomUUID();

      const [newDomain] = await db
        .insert(domains)
        .values({
          id: domainId,
          organizationId: orgId,
          domainName,
          verificationToken,
          isVerified: false,
        })
        .returning();

      return reply.status(201).send({ domain: newDomain });
    }
  );

  // Get DNS configuration instructions for a domain
  fastify.get(
    "/api/v1/domains/:id/dns",
    { preHandler: [requireOrgRole(OrgRole.MEMBER)] },
    async (req, reply) => {
      const orgId = req.currentOrgMember!.organizationId;
      const domainId = (req.params as any).id;

      const domain = await db.query.domains.findFirst({
        where: and(eq(domains.id, domainId), eq(domains.organizationId, orgId)),
      });

      if (!domain) {
        return reply.status(404).send({ error: "Domain not found." });
      }

      const mailServerHost = process.env.CPANEL_HOST || "mail.zegabytez.com";

      const records = [
        {
          type: "TXT",
          name: `_zegabytez-verification.${domain.domainName}`,
          value: domain.verificationToken,
          status: domain.isVerified ? "verified" : "pending",
          purpose: "Domain ownership verification",
        },
        {
          type: "MX",
          name: domain.domainName,
          value: mailServerHost,
          priority: 10,
          status: (domain.dnsStatus as any)?.mx ? "verified" : "pending",
          purpose: "Inbound email routing",
        },
        {
          type: "TXT (SPF)",
          name: domain.domainName,
          value: `v=spf1 include:${mailServerHost} ~all`,
          status: (domain.dnsStatus as any)?.spf ? "verified" : "pending",
          purpose: "Sender Policy Framework (Spam prevention)",
        },
        {
          type: "TXT (DMARC)",
          name: `_dmarc.${domain.domainName}`,
          value: `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@zegabytez.com`,
          status: (domain.dnsStatus as any)?.dmarc ? "verified" : "pending",
          purpose: "Domain-based Message Authentication, Reporting & Conformance",
        },
      ];

      return { domain, records };
    }
  );

  // Check / Verify DNS live
  fastify.post(
    "/api/v1/domains/:id/verify",
    { preHandler: [requireOrgRole(OrgRole.ADMIN)] },
    async (req, reply) => {
      const orgId = req.currentOrgMember!.organizationId;
      const domainId = (req.params as any).id;

      const domain = await db.query.domains.findFirst({
        where: and(eq(domains.id, domainId), eq(domains.organizationId, orgId)),
      });

      if (!domain) {
        return reply.status(404).send({ error: "Domain not found." });
      }

      let isOwnershipVerified = domain.isVerified;
      let mxVerified = false;
      let spfVerified = false;
      let dmarcVerified = false;

      // 1. Check TXT verification record
      try {
        const txtRecords = await dns.resolveTxt(`_zegabytez-verification.${domain.domainName}`);
        const flattened = txtRecords.flat();
        if (flattened.includes(domain.verificationToken)) {
          isOwnershipVerified = true;
        }
      } catch {
        // DNS lookup failed or not propagated yet
      }

      // 2. Check MX records
      try {
        const mxRecords = await dns.resolveMx(domain.domainName);
        if (mxRecords && mxRecords.length > 0) {
          mxVerified = true;
        }
      } catch {
        // MX not set yet
      }

      // 3. Check SPF TXT record
      try {
        const rootTxt = await dns.resolveTxt(domain.domainName);
        const spf = rootTxt.flat().find((r) => r.startsWith("v=spf1"));
        if (spf) {
          spfVerified = true;
        }
      } catch {
        // SPF not set yet
      }

      const updatedStatus = {
        mx: mxVerified,
        spf: spfVerified,
        dkim: (domain.dnsStatus as any)?.dkim || false,
        dmarc: dmarcVerified,
        lastChecked: new Date().toISOString(),
      };

      const [updated] = await db
        .update(domains)
        .set({
          isVerified: isOwnershipVerified,
          verifiedAt: isOwnershipVerified && !domain.isVerified ? new Date() : domain.verifiedAt,
          dnsStatus: updatedStatus,
          updatedAt: new Date(),
        })
        .where(eq(domains.id, domainId))
        .returning();

      return {
        success: isOwnershipVerified,
        domain: updated,
        message: isOwnershipVerified
          ? "Domain ownership verified successfully!"
          : "Verification TXT record not found yet. Please allow DNS propagation.",
      };
    }
  );
};
