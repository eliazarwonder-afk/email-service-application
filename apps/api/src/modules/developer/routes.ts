import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { db, apiKeys, outboundEmails, domains, organizations } from "@zegabytez/database";
import { eq, and, isNull } from "drizzle-orm";
import { createApiKeySchema, sendEmailSchema, OrgRole } from "@zegabytez/shared";
import { requireAuth } from "../auth/plugin";
import { requireOrgRole } from "../../common/guards";
import { outboundEmailQueue } from "../../common/queues";
import crypto from "crypto";

export const developerRoutes: FastifyPluginAsync = async (fastify) => {
  // 1. Dashboard: List API Keys
  fastify.get(
    "/api/v1/developer/keys",
    { preHandler: [requireAuth, requireOrgRole(OrgRole.ADMIN)] },
    async (req) => {
      const orgId = req.currentOrgMember!.organizationId;
      const keys = await db.query.apiKeys.findMany({
        where: and(eq(apiKeys.organizationId, orgId), isNull(apiKeys.revokedAt)),
      });

      return {
        keys: keys.map((k) => ({
          id: k.id,
          name: k.name,
          keyPrefix: k.keyPrefix,
          scopes: k.scopes,
          createdAt: k.createdAt,
          lastUsedAt: k.lastUsedAt,
        })),
      };
    }
  );

  // 2. Dashboard: Create API Key
  fastify.post(
    "/api/v1/developer/keys",
    { preHandler: [requireAuth, requireOrgRole(OrgRole.ADMIN)] },
    async (req, reply) => {
      const orgId = req.currentOrgMember!.organizationId;
      const parsed = createApiKeySchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.format() });
      }

      const randomEntropy = crypto.randomBytes(24).toString("base64url");
      const apiKey = `zgm_live_${randomEntropy}`;
      const keyPrefix = apiKey.slice(0, 14); // 'zgm_live_XXXX'
      const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

      const [record] = await db
        .insert(apiKeys)
        .values({
          id: crypto.randomUUID(),
          organizationId: orgId,
          name: parsed.data.name,
          keyPrefix,
          keyHash,
          scopes: parsed.data.scopes,
        })
        .returning();

      return reply.status(201).send({
        id: record.id,
        name: record.name,
        keyPrefix: record.keyPrefix,
        apiKey, // Raw key shown ONLY ONCE!
        message: "Make sure to copy your API key now as you won't be able to see it again.",
      });
    }
  );

  // 3. Dashboard: Revoke API Key
  fastify.delete(
    "/api/v1/developer/keys/:id",
    { preHandler: [requireAuth, requireOrgRole(OrgRole.ADMIN)] },
    async (req, reply) => {
      const keyId = (req.params as any).id;
      const orgId = req.currentOrgMember!.organizationId;

      await db
        .update(apiKeys)
        .set({ revokedAt: new Date() })
        .where(and(eq(apiKeys.id, keyId), eq(apiKeys.organizationId, orgId)));

      return { success: true, message: "API key revoked." };
    }
  );

  // 4. Public Resend-compatible Transactional Sending API
  // POST /v1/emails
  fastify.post("/v1/emails", async (req: FastifyRequest, reply: FastifyReply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({
        statusCode: 401,
        name: "unauthorized",
        message: "Missing or invalid Bearer authorization header.",
      });
    }

    const token = authHeader.slice(7).trim();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Authenticate API key
    let keyRecord: any = null;
    try {
      keyRecord = await db.query.apiKeys.findFirst({
        where: and(eq(apiKeys.keyHash, tokenHash), isNull(apiKeys.revokedAt)),
      });
    } catch {
      keyRecord = null;
    }

    if (!keyRecord) {
      return reply.status(401).send({
        statusCode: 401,
        name: "invalid_api_key",
        message: "Invalid or revoked API key.",
      });
    }

    const parsed = sendEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({
        statusCode: 422,
        name: "validation_error",
        message: "Invalid email payload.",
        errors: parsed.error.format(),
      });
    }

    const { from, to, cc, bcc, subject, text, html, attachments } = req.body as any;
    if (!from) {
      return reply.status(422).send({
        statusCode: 422,
        name: "validation_error",
        message: "Field 'from' is required (e.g. 'sender@yourdomain.com').",
      });
    }

    // Extract sending domain
    const match = from.match(/<([^>]+)>/) || [null, from];
    const rawSenderEmail = (match[1] || "").trim();
    const senderDomain = rawSenderEmail.split("@")[1];

    if (!senderDomain) {
      return reply.status(422).send({
        statusCode: 422,
        name: "invalid_sender",
        message: "Invalid sender email address.",
      });
    }

    // Check that domain belongs to this API key's organization and is verified
    const domainRecord = await db.query.domains.findFirst({
      where: and(
        eq(domains.domainName, senderDomain.toLowerCase()),
        eq(domains.organizationId, keyRecord.organizationId)
      ),
    });

    if (!domainRecord) {
      return reply.status(403).send({
        statusCode: 403,
        name: "domain_not_found",
        message: `The domain '${senderDomain}' does not belong to your organization.`,
      });
    }

    const messageId = `msg_${crypto.randomUUID()}`;

    // Record outbound email
    await db.insert(outboundEmails).values({
      id: messageId,
      organizationId: keyRecord.organizationId,
      apiKeyId: keyRecord.id,
      fromAddress: from,
      toAddresses: parsed.data.to,
      ccAddresses: parsed.data.cc,
      bccAddresses: parsed.data.bcc,
      subject: parsed.data.subject,
      status: "queued",
    });

    // Update last used at for API key
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, keyRecord.id));

    // Queue outbound delivery
    try {
      await outboundEmailQueue.add(
        "send-transactional",
        {
          messageId,
          apiKeyId: keyRecord.id,
          from,
          to: parsed.data.to,
          cc: parsed.data.cc,
          bcc: parsed.data.bcc,
          subject: parsed.data.subject,
          text: parsed.data.text,
          html: parsed.data.html,
          attachments,
        },
        { jobId: messageId }
      );
    } catch (err: any) {
      console.warn("[Queue Warning] Redis queue unreachable:", err.message);
    }

    // Return Resend-compatible response
    return reply.status(200).send({
      id: messageId,
      from,
      to: parsed.data.to,
      created_at: new Date().toISOString(),
    });
  });
};
