import type { FastifyRequest, FastifyReply } from "fastify";
import { db, organizationMembers, organizations, domains, mailboxes, mailboxPermissions } from "@zegabytez/database";
import { eq, and } from "drizzle-orm";
import { OrgRole, type OrgRoleType } from "@zegabytez/shared";

declare module "fastify" {
  interface FastifyRequest {
    currentOrgMember?: {
      organizationId: string;
      userId: string;
      role: OrgRoleType;
    };
  }
}

/**
 * Ensures the authenticated user belongs to the specified organization (via header or param)
 * with at least the required role hierarchy.
 */
export function requireOrgRole(requiredRole: OrgRoleType = OrgRole.MEMBER) {
  const roleHierarchy: Record<OrgRoleType, number> = {
    [OrgRole.MAILBOX_USER]: 1,
    [OrgRole.MEMBER]: 2,
    [OrgRole.ADMIN]: 3,
    [OrgRole.OWNER]: 4,
  };

  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const orgId =
      (req.headers["x-organization-id"] as string) ||
      (req.params as any)?.orgId ||
      (req.params as any)?.organizationId;

    if (!orgId) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Organization ID is required in X-Organization-Id header or URL parameter.",
      });
    }

    const member = await db.query.organizationMembers.findFirst({
      where: and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, req.user.id)
      ),
    });

    if (!member) {
      return reply.status(403).send({
        statusCode: 403,
        error: "Forbidden",
        message: "You are not a member of this organization.",
      });
    }

    const userLevel = roleHierarchy[member.role as OrgRoleType] || 0;
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      return reply.status(403).send({
        statusCode: 403,
        error: "Forbidden",
        message: `Insufficient permissions. Requires '${requiredRole}' role.`,
      });
    }

    req.currentOrgMember = {
      organizationId: member.organizationId,
      userId: member.userId,
      role: member.role as OrgRoleType,
    };
  };
}

/**
 * Validates that the requested mailbox belongs to the user's organization
 * and that the user is permitted to access it.
 */
export async function requireMailboxAccess(
  req: FastifyRequest,
  reply: FastifyReply,
  requiredMode: "read" | "send" = "read"
) {
  if (!req.user) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  const mailboxId = (req.params as any)?.mailboxId || (req.params as any)?.id;
  if (!mailboxId) {
    return reply.status(400).send({ error: "Mailbox ID is required." });
  }

  // 1. Fetch mailbox
  const mailbox = await db.query.mailboxes.findFirst({
    where: eq(mailboxes.id, mailboxId),
  });

  if (!mailbox) {
    return reply.status(404).send({ error: "Mailbox not found." });
  }

  // 2. Fetch membership in mailbox's organization
  const member = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.organizationId, mailbox.organizationId),
      eq(organizationMembers.userId, req.user.id)
    ),
  });

  if (!member) {
    return reply.status(403).send({ error: "Access denied to this mailbox's organization." });
  }

  // Owners and Admins have global access to all mailboxes in the org
  if (member.role === OrgRole.OWNER || member.role === OrgRole.ADMIN) {
    (req as any).targetMailbox = mailbox;
    return;
  }

  // Members and Mailbox_Users must have explicit permission grant
  const perm = await db.query.mailboxPermissions.findFirst({
    where: and(
      eq(mailboxPermissions.userId, req.user.id),
      eq(mailboxPermissions.mailboxId, mailboxId)
    ),
  });

  if (!perm) {
    return reply.status(403).send({ error: "You do not have permission to access this mailbox." });
  }

  if (requiredMode === "read" && !perm.canRead) {
    return reply.status(403).send({ error: "Read permission denied for this mailbox." });
  }

  if (requiredMode === "send" && !perm.canSend) {
    return reply.status(403).send({ error: "Send permission denied for this mailbox." });
  }

  (req as any).targetMailbox = mailbox;
}
