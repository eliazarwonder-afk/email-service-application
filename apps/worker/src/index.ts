import { Worker } from "bullmq";
import Redis from "ioredis";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

import { processOutboundEmail } from "./processors/outbound-mail.processor";
import { processCpanelProvisioning } from "./processors/cpanel.processor";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy(times) {
    return Math.min(times * 200, 3000);
  },
});

connection.on("error", (err) => {
  console.warn(`[Worker Redis Warning]: ${err.message}`);
});

async function main() {
  console.log("⚙️ Starting Zegabytez Mail Background Worker...");

  // 1. Worker for outbound emails
  const emailWorker = new Worker("outbound-email", processOutboundEmail, {
    connection,
    concurrency: 10,
  });

  emailWorker.on("completed", (job) => {
    console.log(`[Worker] Outbound email job ${job.id} completed successfully.`);
  });

  emailWorker.on("failed", (job, err) => {
    console.error(`[Worker] Outbound email job ${job?.id} failed:`, err.message);
  });

  emailWorker.on("error", (err) => {
    console.warn(`[Worker Email Queue Warning]: ${err.message}`);
  });

  // 2. Worker for cPanel provisioning
  const cpanelWorker = new Worker("cpanel-provisioning", processCpanelProvisioning, {
    connection,
    concurrency: 5,
  });

  cpanelWorker.on("completed", (job) => {
    console.log(`[Worker] cPanel job ${job.id} completed successfully.`);
  });

  cpanelWorker.on("failed", (job, err) => {
    console.error(`[Worker] cPanel job ${job?.id} failed:`, err.message);
  });

  cpanelWorker.on("error", (err) => {
    console.warn(`[Worker cPanel Queue Warning]: ${err.message}`);
  });

  console.log("✅ Zegabytez Mail Workers active and listening for jobs.");
}

main().catch((err) => {
  console.error("Worker failed to start:", err);
  process.exit(1);
});
