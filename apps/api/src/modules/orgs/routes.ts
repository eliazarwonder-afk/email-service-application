import type { FastifyPluginAsync } from "fastify";
import { db, organizations, organizationMembers } from "@zegabytez/database";
import { eq, and } from "drizzle-orm";
import { createOrganizationSchema, OrgRole } from "@zegabytez/shared";
import { requireAuth } from "../auth/plugin";
import { requireOrgRole } from "../../common/guards";
import crypto from "crypto";

export const orgRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", requireAuth);

  // List user's organizations
  fastify.get("/api/v1/organizations", async (req) => {
    const memberships = await db.query.organizationMembers.findMany({
      where: eq(organizationMembers.userId, req.user.id),
      with: {
        // Will populate if relations are setup, or we can query directly
      },
    });

    const orgIds = memberships.map((m) => m.organizationId);
    if (orgIds.length === 0) return { organizations: [] };

    const orgList = await Promise.all(
      orgIds.map(async (id) => {
        const org = await db.query.organizations.findFirst({
          where: eq(organizations.id, id),
        });
        const m = memberships.find((item) => item.organizationId === id);
        return {
          ...org,
          userRole: m?.role,
        };
      })
    );

    return { organizations: orgList };
  });

  // Create an organization
  fastify.post("/api/v1/organizations", async (req, reply) => {
    const parsed = createOrganizationSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.format() });
    }

    const orgId = crypto.randomUUID();
    const [newOrg] = await db
      .insert(organizations)
      .values({
        id: orgId,
        name: parsed.data.name,
      })
      .returning();

    // Assign creator as OWNER
    await db.insert(organizationMembers).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId: req.user.id,
      role: OrgRole.OWNER,
    });

    return reply.status(201).send({ organization: newOrg });
  });

  // Get organization details
  fastify.get(
    "/api/v1/organizations/:id",
    { preHandler: [requireOrgRole(OrgRole.MEMBER)] },
    async (req, reply) => {
      const orgId = (req.params as any).id;
      const org = await db.query.organizations.findFirst({
        where: eq(organizations.id, orgId),
      });

      if (!org) return reply.status(404).send({ error: "Organization not found" });
      return { organization: org };
    }
  );

  // List members
  fastify.get(
    "/api/v1/organizations/:id/members",
    { preHandler: [requireOrgRole(OrgRole.ADMIN)] },
    async (req) => {
      const orgId = (req.params as any).id;
      const members = await db.query.organizationMembers.findMany({
        where: eq(organizationMembers.organizationId, orgId),
      });
      return { members };
    }
  );
};
