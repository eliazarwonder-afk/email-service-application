import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import {
  db,
  organizations,
  organizationMembers,
  domains,
  provisioningJobs,
  users,
  sessions,
} from "@zegabytez/database";
import { eq, and } from "drizzle-orm";
import { whmcsProvisionSchema, OrgRole } from "@zegabytez/shared";
import { WhmApiClient } from "@zegabytez/mail-core";
import crypto from "crypto";

const whmClient = new WhmApiClient();

export const whmcsRoutes: FastifyPluginAsync = async (fastify) => {
  // Helper to verify WHMCS internal secret
  function verifyWhmcsSecret(req: FastifyRequest): boolean {
    const authHeader = req.headers["x-zegabytez-whmcs-secret"] as string;
    const expectedSecret = process.env.WHMCS_INTERNAL_WEBHOOK_SECRET || "super_secret_whmcs_webhook_token";
    return Boolean(authHeader && authHeader === expectedSecret);
  }

  // 1. One-Click SSO Verification Endpoint (Browser redirect from WHMCS)
  // GET /api/v1/auth/sso?token=...
  fastify.get("/api/v1/auth/sso", async (req: FastifyRequest, reply: FastifyReply) => {
    const { token } = req.query as { token?: string };
    if (!token) {
      return reply.status(400).send("Invalid or missing SSO token.");
    }

    const secret = process.env.WHMCS_INTERNAL_WEBHOOK_SECRET || "super_secret_whmcs_webhook_token";

    try {
      const [payloadB64, signature] = token.split(".");
      if (!payloadB64 || !signature) {
        return reply.status(400).send("Malformed SSO token format.");
      }

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(payloadB64)
        .digest("base64url");

      if (signature !== expectedSignature) {
        return reply.status(401).send("Invalid SSO token signature.");
      }

      const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
      const now = Math.floor(Date.now() / 1000);

      // Check token expiration (valid for 5 minutes)
      if (now > payload.exp) {
        return reply.status(401).send("SSO token has expired. Please launch again from WHMCS.");
      }

      const { whmcsClientId, email, name } = payload;

      // 1. Find or create User
      let user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
      });

      if (!user) {
        const userId = crypto.randomUUID();
        const [newUser] = await db
          .insert(users)
          .values({
            id: userId,
            email: email.toLowerCase(),
            name: name || email.split("@")[0],
            emailVerified: true,
          })
          .returning();
        user = newUser;
      }

      // 2. Link to Organization
      const org = await db.query.organizations.findFirst({
        where: eq(organizations.whmcsClientId, whmcsClientId),
      });

      if (org) {
        const existingMember = await db.query.organizationMembers.findFirst({
          where: and(
            eq(organizationMembers.organizationId, org.id),
            eq(organizationMembers.userId, user.id)
          ),
        });

        if (!existingMember) {
          await db.insert(organizationMembers).values({
            id: crypto.randomUUID(),
            organizationId: org.id,
            userId: user.id,
            role: OrgRole.OWNER,
          });
        }
      }

      // 3. Issue Better Auth Session Token
      const sessionToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await db.insert(sessions).values({
        id: crypto.randomUUID(),
        userId: user.id,
        token: sessionToken,
        expiresAt,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      // Set cookie
      reply.setCookie("zega_session", sessionToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
      });

      const redirectTarget = process.env.WEB_URL || "http://localhost:3000";
      return reply.redirect(redirectTarget);
    } catch (err: any) {
      return reply.status(500).send(`SSO Error: ${err.message}`);
    }
  });

  // Guard for server-to-server endpoints
  async function requireWhmcsServerAuth(req: FastifyRequest, reply: FastifyReply) {
    if (!verifyWhmcsSecret(req)) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Invalid or missing WHMCS internal secret header.",
      });
    }
  }

  // 2. Generate One-Time SSO Launch Link (Called by WHMCS module)
  // POST /internal/v1/whmcs/sso-token
  fastify.post(
    "/internal/v1/whmcs/sso-token",
    { preHandler: [requireWhmcsServerAuth] },
    async (req, reply) => {
      const { whmcsClientId, email, name } = req.body as any;
      if (!whmcsClientId || !email) {
        return reply.status(400).send({ error: "whmcsClientId and email are required" });
      }

      const secret = process.env.WHMCS_INTERNAL_WEBHOOK_SECRET || "super_secret_whmcs_webhook_token";
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        whmcsClientId,
        email,
        name: name || "",
        iat: now,
        exp: now + 300, // 5 minutes expiration
      };

      const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
      const signature = crypto
        .createHmac("sha256", secret)
        .update(payloadB64)
        .digest("base64url");

      const token = `${payloadB64}.${signature}`;
      const apiUrl = process.env.API_URL || "http://localhost:4000";
      const ssoUrl = `${apiUrl}/api/v1/auth/sso?token=${token}`;

      return { ssoUrl, token, expiresInSeconds: 300 };
    }
  );

  // 3. WHMCS Order Provisioning with Dedicated cPanel Account Creation
  // POST /internal/v1/whmcs/provision
  fastify.post(
    "/internal/v1/whmcs/provision",
    { preHandler: [requireWhmcsServerAuth] },
    async (req, reply) => {
      const parsed = whmcsProvisionSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.format() });
      }

      const {
        orderId,
        whmcsClientId,
        clientEmail,
        clientName,
        packagePlan,
        maxMailboxes,
        storageLimitMb,
        primaryDomain,
        whmcsDomainId,
      } = parsed.data;

      const idempotencyKey = `whmcs_order_${orderId}`;

      // Check idempotency
      const existingJob = await db.query.provisioningJobs.findFirst({
        where: eq(provisioningJobs.idempotencyKey, idempotencyKey),
      });

      if (existingJob && existingJob.status === "completed") {
        return {
          success: true,
          message: "Order already provisioned.",
          result: existingJob.result,
        };
      }

      // 1. Generate dedicated cPanel username (max 16 chars: e.g. zgm_<clientId>)
      const cpanelUser = `zgm_${whmcsClientId}_${Math.random().toString(36).slice(2, 6)}`;
      const cleanPrimaryDomain = primaryDomain
        ? primaryDomain.toLowerCase().trim()
        : `${cpanelUser}.zegabytezmail.com`;

      // 2. Call WHM API to provision dedicated cPanel account
      try {
        await whmClient.createDedicatedAccount({
          username: cpanelUser,
          domain: cleanPrimaryDomain,
          contactEmail: clientEmail,
          quotaMb: storageLimitMb,
          plan: packagePlan,
        });
      } catch (err: any) {
        return reply.status(502).send({
          statusCode: 502,
          error: "WHM Provisioning Error",
          message: `Failed to create dedicated cPanel account via WHM: ${err.message}`,
        });
      }

      // 3. Find or create Organization
      let org = await db.query.organizations.findFirst({
        where: eq(organizations.whmcsClientId, whmcsClientId),
      });

      let isNewOrg = false;
      if (!org) {
        isNewOrg = true;
        const orgId = crypto.randomUUID();
        const [created] = await db
          .insert(organizations)
          .values({
            id: orgId,
            name: `${clientName}'s Organization`,
            whmcsClientId,
            packagePlan,
            cpanelUser,
            maxMailboxes,
            storageLimitMb,
            subscriptionStatus: "active",
          })
          .returning();
        org = created;
      } else {
        const [updated] = await db
          .update(organizations)
          .set({
            packagePlan,
            cpanelUser: org.cpanelUser || cpanelUser,
            maxMailboxes: Math.max(org.maxMailboxes, maxMailboxes),
            storageLimitMb: Math.max(org.storageLimitMb, storageLimitMb),
            subscriptionStatus: "active",
            updatedAt: new Date(),
          })
          .where(eq(organizations.id, org.id))
          .returning();
        org = updated;
      }

      // 4. Attach primary domain if provided
      let domainRecord = null;
      if (primaryDomain) {
        const existingDomain = await db.query.domains.findFirst({
          where: eq(domains.domainName, cleanPrimaryDomain),
        });

        if (!existingDomain) {
          const [createdDomain] = await db
            .insert(domains)
            .values({
              id: crypto.randomUUID(),
              organizationId: org.id,
              domainName: cleanPrimaryDomain,
              verificationToken: `zgm_verify_${crypto.randomBytes(16).toString("hex")}`,
              isVerified: true, // Auto-verified since purchased via WHMCS!
              whmcsDomainId: whmcsDomainId,
            })
            .returning();
          domainRecord = createdDomain;
        } else {
          domainRecord = existingDomain;
        }
      }

      const resultData = {
        organizationId: org.id,
        whmcsClientId,
        cpanelUser: org.cpanelUser,
        domainId: domainRecord?.id,
        primaryDomain: cleanPrimaryDomain,
        isNewOrg,
      };

      await db.insert(provisioningJobs).values({
        id: crypto.randomUUID(),
        organizationId: org.id,
        type: "sync_whmcs_order",
        idempotencyKey,
        status: "completed",
        payload: parsed.data,
        result: resultData,
        completedAt: new Date(),
      });

      return reply.status(200).send({
        success: true,
        message: "Dedicated cPanel account and Zegabytez Mail organization provisioned successfully.",
        data: resultData,
      });
    }
  );

  // 4. WHMCS Suspend Service (Suspends dedicated cPanel account)
  fastify.post(
    "/internal/v1/whmcs/suspend",
    { preHandler: [requireWhmcsServerAuth] },
    async (req, reply) => {
      const { whmcsClientId } = req.body as any;
      if (!whmcsClientId) {
        return reply.status(400).send({ error: "whmcsClientId is required" });
      }

      const org = await db.query.organizations.findFirst({
        where: eq(organizations.whmcsClientId, whmcsClientId),
      });

      if (org?.cpanelUser) {
        await whmClient.suspendAccount(org.cpanelUser, "Overdue WHMCS Invoice");
      }

      await db
        .update(organizations)
        .set({ subscriptionStatus: "suspended", updatedAt: new Date() })
        .where(eq(organizations.whmcsClientId, whmcsClientId));

      return { success: true, message: "Service and cPanel account suspended." };
    }
  );

  // 5. WHMCS Unsuspend Service
  fastify.post(
    "/internal/v1/whmcs/unsuspend",
    { preHandler: [requireWhmcsServerAuth] },
    async (req, reply) => {
      const { whmcsClientId } = req.body as any;
      if (!whmcsClientId) {
        return reply.status(400).send({ error: "whmcsClientId is required" });
      }

      const org = await db.query.organizations.findFirst({
        where: eq(organizations.whmcsClientId, whmcsClientId),
      });

      if (org?.cpanelUser) {
        await whmClient.unsuspendAccount(org.cpanelUser);
      }

      await db
        .update(organizations)
        .set({ subscriptionStatus: "active", updatedAt: new Date() })
        .where(eq(organizations.whmcsClientId, whmcsClientId));

      return { success: true, message: "Service and cPanel account unsuspended." };
    }
  );

  // 6. WHMCS Terminate Service
  fastify.post(
    "/internal/v1/whmcs/terminate",
    { preHandler: [requireWhmcsServerAuth] },
    async (req, reply) => {
      const { whmcsClientId } = req.body as any;
      if (!whmcsClientId) {
        return reply.status(400).send({ error: "whmcsClientId is required" });
      }

      const org = await db.query.organizations.findFirst({
        where: eq(organizations.whmcsClientId, whmcsClientId),
      });

      if (org?.cpanelUser) {
        await whmClient.terminateAccount(org.cpanelUser);
      }

      await db
        .update(organizations)
        .set({ subscriptionStatus: "terminated", updatedAt: new Date() })
        .where(eq(organizations.whmcsClientId, whmcsClientId));

      return { success: true, message: "Service and cPanel account terminated." };
    }
  );
};
