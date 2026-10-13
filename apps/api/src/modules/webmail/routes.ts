import type { FastifyPluginAsync } from "fastify";
import { db, outboundEmails, mailboxes } from "@zegabytez/database";
import { sendEmailSchema } from "@zegabytez/shared";
import {
  decryptPassword,
  ImapMailboxClient,
} from "@zegabytez/mail-core";
import { requireAuth } from "../auth/plugin";
import { requireMailboxAccess } from "../../common/guards";
import { outboundEmailQueue, redisConnection } from "../../common/queues";
import crypto from "crypto";

export const webmailRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", requireAuth);

  // Helper to construct an IMAP client for a target mailbox
  function getImapClientForMailbox(mailbox: any): ImapMailboxClient {
    const rawPass = decryptPassword(mailbox.encryptedPassword);
    const host = process.env.CPANEL_HOST || "localhost";
    const port = 993;

    return new ImapMailboxClient({
      host,
      port,
      secure: true,
      auth: {
        user: mailbox.emailAddress,
        pass: rawPass,
      },
    });
  }

  // 1. List folders
  fastify.get(
    "/api/v1/mailboxes/:id/folders",
    { preHandler: [(req, reply) => requireMailboxAccess(req, reply, "read")] },
    async (req) => {
      const mailbox = (req as any).targetMailbox;

      // In mock/dev mode if host is localhost
      if (!process.env.CPANEL_HOST || process.env.CPANEL_HOST.includes("yourcpanelserver")) {
        return {
          folders: [
            { path: "INBOX", name: "Inbox", delimiter: "/" },
            { path: "Sent", name: "Sent", delimiter: "/", specialUse: "\\Sent" },
            { path: "Drafts", name: "Drafts", delimiter: "/", specialUse: "\\Drafts" },
            { path: "Spam", name: "Spam", delimiter: "/", specialUse: "\\Junk" },
            { path: "Trash", name: "Trash", delimiter: "/", specialUse: "\\Trash" },
          ],
        };
      }

      const client = getImapClientForMailbox(mailbox);
      await client.connect();
      try {
        const folders = await client.listFolders();
        return { folders };
      } finally {
        await client.logout();
      }
    }
  );

  // 2. List messages in a folder (Fast Envelope Caching with Redis)
  fastify.get(
    "/api/v1/mailboxes/:id/messages",
    { preHandler: [(req, reply) => requireMailboxAccess(req, reply, "read")] },
    async (req) => {
      const mailbox = (req as any).targetMailbox;
      const query = req.query as any;
      const folder = query.folder || "INBOX";
      const page = parseInt(query.page || "1", 10);
      const limit = parseInt(query.limit || "25", 10);

      // Check Redis Envelope Cache
      const cacheKey = `cache:envelope:${mailbox.id}:${folder}:${page}:${limit}`;
      try {
        const cached = await redisConnection.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch {
        // Fallback to fetch if Redis is offline
      }

      // Dev Mock mode fallback
      if (!process.env.CPANEL_HOST || process.env.CPANEL_HOST.includes("yourcpanelserver")) {
        const mockResponse = {
          messages: [
            {
              uid: 101,
              seq: 1,
              subject: "Welcome to your new Zegabytez Business Mailbox!",
              from: { name: "Zegabytez Team", address: "support@zegabytez.com" },
              to: [{ address: mailbox.emailAddress }],
              date: new Date().toISOString(),
              flags: ["\\Seen"],
              hasAttachments: false,
              size: 2048,
            },
          ],
          total: 1,
          page,
          limit,
        };

        try {
          await redisConnection.setex(cacheKey, 300, JSON.stringify(mockResponse));
        } catch {}

        return mockResponse;
      }

      // Live Dovecot IMAP Fetch
      const client = getImapClientForMailbox(mailbox);
      await client.connect();
      try {
        const result = await client.listMessages(folder, page, limit);
        const payload = {
          ...result,
          page,
          limit,
        };

        // Cache envelopes in Redis for 5 minutes (300s)
        try {
          await redisConnection.setex(cacheKey, 300, JSON.stringify(payload));
        } catch {}

        return payload;
      } finally {
        await client.logout();
      }
    }
  );

  // 3. Get message details (On-Demand Body & Attachment Streaming)
  fastify.get(
    "/api/v1/mailboxes/:id/messages/:uid",
    { preHandler: [(req, reply) => requireMailboxAccess(req, reply, "read")] },
    async (req, reply) => {
      const mailbox = (req as any).targetMailbox;
      const uid = parseInt((req.params as any).uid, 10);
      const query = req.query as any;
      const folder = query.folder || "INBOX";

      if (!process.env.CPANEL_HOST || process.env.CPANEL_HOST.includes("yourcpanelserver")) {
        return {
          message: {
            uid,
            seq: 1,
            subject: "Welcome to your new Zegabytez Business Mailbox!",
            from: { name: "Zegabytez Team", address: "support@zegabytez.com" },
            to: [{ address: mailbox.emailAddress }],
            date: new Date().toISOString(),
            flags: ["\\Seen"],
            hasAttachments: false,
            size: 2048,
            text: "Hello and welcome to your new business email service powered by Zegabytez Mail!\n\nYour account is fully active and ready to send and receive business emails.",
            html: "<div style='font-family: sans-serif; padding: 20px;'><h2>Welcome to Zegabytez Mail</h2><p>Your business email account is ready.</p></div>",
            attachments: [],
          },
        };
      }

      const client = getImapClientForMailbox(mailbox);
      await client.connect();
      try {
        const message = await client.getMessage(folder, uid);
        if (!message) return reply.status(404).send({ error: "Message not found." });
        return { message };
      } finally {
        await client.logout();
      }
    }
  );

  // 4. Send an email (Queued outbound delivery + Cache Invalidation)
  fastify.post(
    "/api/v1/mailboxes/:id/send",
    { preHandler: [(req, reply) => requireMailboxAccess(req, reply, "send")] },
    async (req, reply) => {
      const mailbox = (req as any).targetMailbox;
      const parsed = sendEmailSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.format() });
      }

      const messageId = `msg_${crypto.randomUUID()}`;

      // 1. Record in database with 'queued' state
      await db.insert(outboundEmails).values({
        id: messageId,
        organizationId: mailbox.organizationId,
        mailboxId: mailbox.id,
        fromAddress: mailbox.emailAddress,
        toAddresses: parsed.data.to,
        ccAddresses: parsed.data.cc,
        bccAddresses: parsed.data.bcc,
        subject: parsed.data.subject,
        status: "queued",
      });

      // 2. Dispatch to background worker via BullMQ
      try {
        await outboundEmailQueue.add(
          "send-email",
          {
            messageId,
            mailboxId: mailbox.id,
            from: mailbox.emailAddress,
            to: parsed.data.to,
            cc: parsed.data.cc,
            bcc: parsed.data.bcc,
            subject: parsed.data.subject,
            text: parsed.data.text,
            html: parsed.data.html,
            attachments: parsed.data.attachments,
          },
          {
            jobId: messageId,
          }
        );
      } catch (err: any) {
        console.warn("[Queue Warning] Redis queue not available, saving as queued:", err.message);
      }

      // 3. Invalidate Redis envelope cache for this mailbox
      try {
        const pattern = `cache:envelope:${mailbox.id}:*`;
        const keys = await redisConnection.keys(pattern);
        if (keys.length > 0) {
          await redisConnection.del(...keys);
        }
      } catch {}

      return reply.status(202).send({
        statusCode: 202,
        messageId,
        status: "queued",
        message: "Email accepted for delivery and queued.",
      });
    }
  );
};
