import type { Job } from "bullmq";
import { db, outboundEmails, mailboxes } from "@zegabytez/database";
import { eq } from "drizzle-orm";
import { decryptPassword, SmtpTransportClient } from "@zegabytez/mail-core";

export async function processOutboundEmail(job: Job) {
  const { messageId, mailboxId, from, to, cc, bcc, subject, text, html, attachments } = job.data;
  console.log(`[Worker] Processing outbound email ${messageId} to ${to.join(", ")}`);

  try {
    let authCredentials = {
      user: process.env.CPANEL_USERNAME || "default_user",
      pass: "default_pass",
    };

    if (mailboxId) {
      const mailbox = await db.query.mailboxes.findFirst({
        where: eq(mailboxes.id, mailboxId),
      });

      if (mailbox) {
        authCredentials = {
          user: mailbox.emailAddress,
          pass: decryptPassword(mailbox.encryptedPassword),
        };
      }
    }

    const host = process.env.CPANEL_HOST || "localhost";
    const port = 587;

    // Check if in mock dev mode
    if (!process.env.CPANEL_HOST || process.env.CPANEL_HOST.includes("yourcpanelserver")) {
      console.log(`[Worker Mock SMTP] Simulated delivery of email ${messageId}`);
      await db
        .update(outboundEmails)
        .set({
          status: "delivered",
          smtpResponse: "250 2.0.0 OK (Mock Simulated Delivery)",
          sentAt: new Date(),
        })
        .where(eq(outboundEmails.id, messageId));
      return { success: true, mock: true };
    }

    const smtpClient = new SmtpTransportClient({
      host,
      port,
      secure: false,
      auth: authCredentials,
    });

    const result = await smtpClient.send({
      from,
      to,
      cc,
      bcc,
      subject,
      text,
      html,
      attachments,
    });

    if (result.success) {
      await db
        .update(outboundEmails)
        .set({
          status: "delivered",
          smtpResponse: result.response || "250 OK",
          sentAt: new Date(),
        })
        .where(eq(outboundEmails.id, messageId));
    } else {
      throw new Error(result.error);
    }

    return result;
  } catch (err: any) {
    console.error(`[Worker Error] Failed to send email ${messageId}:`, err.message);
    await db
      .update(outboundEmails)
      .set({
        status: "failed",
        errorMessage: err.message,
      })
      .where(eq(outboundEmails.id, messageId));

    throw err; // Trigger BullMQ retry
  }
}
