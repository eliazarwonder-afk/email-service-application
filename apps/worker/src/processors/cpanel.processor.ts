import type { Job } from "bullmq";
import { db, provisioningJobs, mailboxes } from "@zegabytez/database";
import { eq } from "drizzle-orm";
import { CpanelUapiClient, decryptPassword } from "@zegabytez/mail-core";

const cpanelClient = new CpanelUapiClient();

export async function processCpanelProvisioning(job: Job) {
  const { jobId, type, mailboxId, emailLocalPart, domain, password, quotaMb } = job.data;
  console.log(`[Worker cPanel] Processing job ${job.id} - type: ${type}`);

  try {
    if (jobId) {
      await db
        .update(provisioningJobs)
        .set({ status: "processing", attempts: job.attemptsMade + 1, updatedAt: new Date() })
        .where(eq(provisioningJobs.id, jobId));
    }

    let result: any = null;

    switch (type) {
      case "create_mailbox": {
        result = await cpanelClient.createMailbox(emailLocalPart, domain, password, quotaMb);
        break;
      }
      case "update_password": {
        result = await cpanelClient.updatePassword(emailLocalPart, domain, password);
        break;
      }
      case "delete_mailbox": {
        result = await cpanelClient.deleteMailbox(emailLocalPart, domain);
        break;
      }
      case "suspend_mailbox": {
        result = await cpanelClient.suspendMailbox(emailLocalPart, domain);
        break;
      }
      default:
        throw new Error(`Unknown provisioning type: ${type}`);
    }

    if (jobId) {
      await db
        .update(provisioningJobs)
        .set({
          status: "completed",
          result,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(provisioningJobs.id, jobId));
    }

    return result;
  } catch (err: any) {
    console.error(`[Worker cPanel Error] Job failed:`, err.message);
    if (jobId) {
      await db
        .update(provisioningJobs)
        .set({
          status: "failed",
          error: err.message,
          updatedAt: new Date(),
        })
        .where(eq(provisioningJobs.id, jobId));
    }
    throw err;
  }
}
