import { Queue } from "bullmq";
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy(times) {
    // Retry up to 5 times during dev, capped at 2 seconds
    if (times > 5 && process.env.NODE_ENV === "test") {
      return null;
    }
    return Math.min(times * 100, 2000);
  },
});

// Attach error handler so connection refusal does not crash Node.js process
redisConnection.on("error", (err) => {
  if (process.env.NODE_ENV !== "test") {
    console.warn(`[Redis Connection Warning]: ${err.message}`);
  }
});

export const cpanelQueue = new Queue("cpanel-provisioning", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const outboundEmailQueue = new Queue("outbound-email", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 200,
    removeOnFail: 1000,
  },
});

// Suppress unhandled queue error logs during offline testing
cpanelQueue.on("error", () => {});
outboundEmailQueue.on("error", () => {});
