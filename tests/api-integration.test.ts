import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

import { buildApp } from "../apps/api/src/server";
import type { FastifyInstance } from "fastify";

describe("Fastify Modular Monolith API Integration", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.BETTER_AUTH_URL = "http://localhost:4000";
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should respond to GET /health", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("Zegabytez Mail API");
  });

  it("should block unauthenticated requests to protected endpoints", async () => {
    const orgsRes = await app.inject({
      method: "GET",
      url: "/api/v1/organizations",
    });
    expect(orgsRes.statusCode).toBe(401);

    const domainsRes = await app.inject({
      method: "GET",
      url: "/api/v1/domains",
    });
    expect(domainsRes.statusCode).toBe(401);

    const mailboxesRes = await app.inject({
      method: "GET",
      url: "/api/v1/mailboxes",
    });
    expect(mailboxesRes.statusCode).toBe(401);
  });

  it("should reject WHMCS webhook calls without secret header", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/internal/v1/whmcs/provision",
      payload: {
        orderId: "123",
      },
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("should reject WHMCS webhook calls with invalid secret", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/internal/v1/whmcs/provision",
      headers: {
        "x-zegabytez-whmcs-secret": "wrong_secret_key",
      },
      payload: {
        orderId: "123",
      },
    });

    expect(res.statusCode).toBe(401);
  });

  it("should validate WHMCS payload when secret header is correct", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/internal/v1/whmcs/provision",
      headers: {
        "x-zegabytez-whmcs-secret": process.env.WHMCS_INTERNAL_WEBHOOK_SECRET || "super_secret_whmcs_webhook_token",
      },
      payload: {
        orderId: "123",
        // Missing required fields: whmcsClientId, clientEmail, etc.
      },
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.error).toBeDefined();
  });

  it("should reject developer /v1/emails requests with missing authorization", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/emails",
      payload: {
        from: "sales@zegabytez.com",
        to: ["customer@example.com"],
        subject: "Invoice",
      },
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.name).toBe("unauthorized");
  });

  it("should reject developer /v1/emails with invalid API key token", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/emails",
      headers: {
        authorization: "Bearer zgm_live_invalid_nonexistent_key_12345",
      },
      payload: {
        from: "sales@zegabytez.com",
        to: ["customer@example.com"],
        subject: "Invoice",
      },
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.name).toBe("invalid_api_key");
  });
});
