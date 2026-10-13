import fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

import { authPlugin } from "./modules/auth/plugin";
import { orgRoutes } from "./modules/orgs/routes";
import { domainRoutes } from "./modules/domains/routes";
import { mailboxRoutes } from "./modules/mailboxes/routes";
import { webmailRoutes } from "./modules/webmail/routes";
import { whmcsRoutes } from "./modules/whmcs/routes";
import { developerRoutes } from "./modules/developer/routes";

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "info" : process.env.NODE_ENV === "test" ? "silent" : "debug",
    },
  });

  // Security & HTTP plugins
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: [
      process.env.WEB_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  });

  await app.register(cookie);

  // Authentication Plugin (Better Auth)
  await app.register(authPlugin);

  // Modular Business Route Plugins
  await app.register(orgRoutes);
  await app.register(domainRoutes);
  await app.register(mailboxRoutes);
  await app.register(webmailRoutes);
  await app.register(whmcsRoutes);
  await app.register(developerRoutes);

  // Health check
  app.get("/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Zegabytez Mail API",
      version: "0.1.0",
    };
  });

  return app;
}

// Start server if executed directly
if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  const host = "0.0.0.0";

  buildApp().then(async (app) => {
    try {
      await app.listen({ port, host });
      console.log(`🚀 Zegabytez Mail API running on http://localhost:${port}`);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  });
}
